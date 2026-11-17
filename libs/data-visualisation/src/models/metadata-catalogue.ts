import type { ChartSource } from './chart.model';

// De metadatacatalogus van Omgeving (GeoNetwork): elke bron is er een record, in ISO 19139. De data geeft enkel de
// `metadataId`; titel, eigenaar en licentie lezen we uit de record zelf. Zo staan ze op één plek, en volgt de grafiek
// als de eigenaar zijn record aanpast.

export const METADATA_CATALOGUE = 'https://metadata.omgeving.vlaanderen.be';

const GMD = 'http://www.isotc211.org/2005/gmd';
const GMX = 'http://www.isotc211.org/2005/gmx';
const XLINK = 'http://www.w3.org/1999/xlink';

/** Licenties die we bij naam kennen, op hun huidige adres. Een record zegt welke licentie geldt met een link, en die
 *  link is soms verouderd: de Modellicentie stuurt van haar oude adres door naar een algemene pagina. */
const KNOWN_LICENSES = [
    {
        match: /modellicentie[-_]gratis[-_]hergebruik/i,
        title: 'Modellicentie gratis hergebruik',
        isOpen: true,
        href: 'https://www.vlaanderen.be/digitaal-vlaanderen/onze-diensten-en-platformen/open-data/voorwaarden-voor-het-hergebruik-van-overheidsinformatie/modellicentie-gratis-hergebruik',
    },
];

type KnownLicense = (typeof KNOWN_LICENSES)[number];

/** Een record geeft de publieke toegang als link naar een INSPIRE-code, bv. `…/LimitationsOnPublicAccess/noLimitations`.
 *  `noLimitations` is de enige code zonder beperking. */
const PUBLIC_ACCESS = 'LimitationsOnPublicAccess/';
const NO_LIMITATIONS = `${PUBLIC_ACCESS}noLimitations`;

/** De velden die een record kan invullen. Wat de record niet vermeldt, blijft weg: dan geldt wat de data zegt. */
export type RecordFields = Pick<ChartSource, 'title' | 'owner' | 'license' | 'isOpenData'>;

/** De record als ISO 19139-XML, de standaardvorm van elke GeoNetwork. */
export function buildRecordUrl(metadataId: string): string {
    return `${METADATA_CATALOGUE}/srv/api/records/${encodeURIComponent(metadataId)}/formatters/xml`;
}

/** Leest titel, eigenaar (de organisatie met rol `owner`), licentie en of het open data is uit een record. */
export function readRecord(xml: string): RecordFields {
    const record = new DOMParser().parseFromString(xml, 'application/xml');
    const identification = record.getElementsByTagNameNS(GMD, 'identificationInfo')[0];
    if (!identification) throw new Error('Het antwoord van de catalogus is geen ISO 19139-record.');
    const fields: RecordFields = {};
    const title = readText(identification.getElementsByTagNameNS(GMD, 'title')[0]);
    if (title) fields.title = title;
    const owner = findOwner(identification);
    if (owner) fields.owner = owner;
    const license = findKnownLicense(identification);
    if (license) fields.license = { title: license.title, href: license.href };
    const isOpenData = readOpenData(identification, license);
    if (isOpenData !== undefined) fields.isOpenData = isOpenData;
    return fields;
}

/** Open data is vrij toegankelijk (INSPIRE `noLimitations`) én heeft een open licentie. Beperkte toegang is nooit open
 *  data. Zegt de record niet genoeg, bv. een licentie die we niet kennen, dan `undefined`: dan geldt `isOpenData` uit
 *  de data. */
function readOpenData(identification: Element, license: KnownLicense | undefined): boolean | undefined {
    const access = readLinks(identification).filter((link) => link.includes(PUBLIC_ACCESS));
    if (access.some((link) => !link.endsWith(NO_LIMITATIONS))) return false;
    if (access.length > 0 && license) return license.isOpen;
    return undefined;
}

function findOwner(identification: Element): string | undefined {
    const parties = Array.from(identification.getElementsByTagNameNS(GMD, 'CI_ResponsibleParty'));
    const owner = parties.find(
        (party) => party.getElementsByTagNameNS(GMD, 'CI_RoleCode')[0]?.getAttribute('codeListValue') === 'owner',
    );
    return owner && readText(owner.getElementsByTagNameNS(GMD, 'organisationName')[0]);
}

/** De eerste licentie die we kennen; de andere voorwaarden (bv. de besluiten voor overheden) zijn geen licentie. */
function findKnownLicense(identification: Element): KnownLicense | undefined {
    for (const link of readLinks(identification)) {
        const license = KNOWN_LICENSES.find(({ match }) => match.test(link));
        if (license) return license;
    }
    return undefined;
}

/** De links in de voorwaarden van de record: toegang, licentie, besluiten. */
function readLinks(identification: Element): string[] {
    return Array.from(identification.getElementsByTagNameNS(GMX, 'Anchor')).map(
        (anchor) => anchor.getAttributeNS(XLINK, 'href') ?? '',
    );
}

function readText(element: Element | undefined): string | undefined {
    return element?.textContent?.replace(/\s+/g, ' ').trim() || undefined;
}

/** Haalt de tekst van een record op; zo kan een test of story de catalogus vervangen. */
export type FetchRecordText = (url: string) => Promise<string>;

async function fetchCatalogueText(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`De catalogus antwoordde met status ${response.status}.`);
    return response.text();
}

/** Vraagt records op bij de catalogus en onthoudt ze, zodat elke record één keer gevraagd wordt.
 *  Een klasse en geen closure: de methodes staan één keer op het prototype, en elke instantie heeft haar eigen cache in
 *  private velden. Zo kan een test een eigen catalogus maken, met een eigen `fetchText`.
 *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties */
export class MetadataCatalogue {
    #fetchText: FetchRecordText;
    /** De lopende of geslaagde vraag per record. Vragen meer grafieken tegelijk dezelfde record, dan delen ze die. */
    #requests = new Map<string, Promise<RecordFields>>();
    /** De records die al binnen zijn, zodat een nieuwe periode meteen de titel toont en niet eerst de `metadataId`. */
    #answers = new Map<string, RecordFields>();

    constructor(fetchText: FetchRecordText = fetchCatalogueText) {
        this.#fetchText = fetchText;
    }

    /** De bronnen aangevuld met wat al uit de catalogus binnen is. Wat de record zegt, gaat voor op wat de data zegt. */
    completeSourcesFromCache(sources: ChartSource[]): ChartSource[] {
        return sources.map((source) => {
            const fields = source.metadataId && this.#answers.get(source.metadataId);
            return fields ? { ...source, ...fields } : source;
        });
    }

    /** De bronnen aangevuld uit hun record. Een record die niet binnenkomt, laat zijn bron zoals ze was: die toont dan
     *  haar link naar de catalogus. */
    async completeSources(sources: ChartSource[]): Promise<ChartSource[]> {
        await Promise.all(
            sources
                .filter((source) => source.metadataId)
                .map((source) => this.#fetchRecord(source.metadataId!).catch(() => undefined)),
        );
        return this.completeSourcesFromCache(sources);
    }

    #fetchRecord(metadataId: string): Promise<RecordFields> {
        let request = this.#requests.get(metadataId);
        if (!request) {
            request = this.#fetchText(buildRecordUrl(metadataId)).then(readRecord);
            this.#requests.set(metadataId, request);
            request.then(
                (fields) => this.#answers.set(metadataId, fields),
                // Mislukt het, dan probeert de volgende grafiek opnieuw.
                () => this.#requests.delete(metadataId),
            );
        }
        return request;
    }
}

/** Eén catalogus voor alle grafieken op de pagina: elke record wordt één keer gevraagd. */
export const metadataCatalogue = new MetadataCatalogue();
