import type { ChartMeta } from '../../models/chart.model';

/** Eén regel van "Over deze data": wat (term) en de uitleg, met een link als die er is. */
export type AboutEntry = { term: string; description: string; href?: string };

const OPEN_DATA_DESCRIPTION = 'De bron publiceert deze cijfers als Vlaamse Open Data.';

/** Wat het datacontract zelf over de data vertelt, zodat de auteur het niet overtypt: de bron, wat de eenheid
 *  betekent en of het open data is. */
export function buildAboutEntries(meta: ChartMeta, openDataHref: string): AboutEntry[] {
    const entries: AboutEntry[] = [{ term: 'Bron', description: meta.source, href: meta.sourceHref }];
    const unitDescription = describeUnit(meta.y.unit, meta.y.unitInfo);
    if (unitDescription) entries.push({ term: 'Eenheid', description: unitDescription });
    if (meta.isOpenData) entries.push({ term: 'Open data', description: OPEN_DATA_DESCRIPTION, href: openDataHref });
    return entries;
}

/** De eenheid met haar uitleg, bv. "µT: microtesla, de sterkte van het magnetisch veld"; leeg zonder beide. */
function describeUnit(unit?: string, unitInfo?: string): string {
    if (unit && unitInfo) return `${unit}: ${unitInfo}`;
    return unit || unitInfo || '';
}

/** Of "Over deze data" meer vertelt dan de bronregel onder de grafiek al toont. Zo niet, dan laat de figuur het
 *  standaardblok weg: het zou alleen herhalen. */
export function hasAboutDetails(meta: ChartMeta): boolean {
    return Boolean(meta.y.unitInfo);
}
