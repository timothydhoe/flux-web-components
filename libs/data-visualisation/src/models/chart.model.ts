import { METADATA_CATALOGUE } from './metadata-catalogue';

// Het ChartModel is het contract tussen data en de benodigde data
// om de grafiek te tekenen. Elk grafiektype tekent vanuit dit model.

/** Eén as en bijhorende schaal van de grafiek */
export interface ChartAxis {
    type: 'number' | 'time' | 'category';
    title?: string;
    unit?: string;
    unitInfo?: string;
}

/** Eén bron van de data, zoals beschreven in de metadatacatalogus van Omgeving. Met een `metadataId` volstaat die
 *  sleutel: titel, eigenaar en licentie komen dan uit de record (zie metadata-catalogue.ts). */
export interface ChartSource {
    /** De sleutel (UUID) van de metadatarecord in de catalogus. */
    metadataId?: string;
    /** Uit de record; zelf meegeven alleen voor een bron zonder record. */
    title?: string;
    /** De link naar de beschrijving; zonder link maken we die uit `metadataId`. */
    href?: string;
    /** De organisatie met de rol `owner` in de record, bv. "Agentschap voor Natuur en Bos". Uit de record. */
    owner?: string;
    /** Onder welke voorwaarden de lezer de data mag hergebruiken. Uit de record. */
    license?: { title: string; href?: string };
    /** Waar de data zelf staat, bv. de Datastream in het sensorplatform: de lezer kan de cijfers nagaan. */
    dataHref?: string;
    /** Vrij toegankelijk met een open licentie. Uit de record; `undefined` als die het niet zegt. */
    isOpenData?: boolean;
}

/** Wat de lezer naast de cijfers moet weten om ze correct te kunnen
 *  interpreteren; waar komt de data vandaan, wat stellen de assen voor. */
// TODO: referentiedata
export interface ChartMeta {
    /** Minstens één; een grafiek kan data van meer dan één bron combineren. */
    sources: ChartSource[];
    /** Voor bronnen waarvan de record het niet zegt; zie `isOpenData`. */
    isOpenData?: boolean;
    x: ChartAxis;
    y: ChartAxis;
}

/** Eén volledige reeks: alle metingen van één object (bv. één meetpunt),
 *  getekend als één lijn. */
export interface ChartSeries {
    name: string;
    x: Float64Array | string[];
    y: Float64Array;
}

/** Het contract tussen data en grafiek en bevat alles wat een grafiektype nodig
 *  heeft om te kunnen tekenen. */
export interface ChartModel {
    meta: ChartMeta;
    series: ChartSeries[];
}

/** Wat de grafiek op elk moment kan tonen. Alleen 'data' en 'partial'
 *  hebben een model om te tekenen. */
// TODO: `partial` overbodig?
export type DataState =
    | { status: 'loading' }
    | { status: 'data'; model: ChartModel }
    | { status: 'partial'; model: ChartModel }
    | { status: 'empty' }
    | { status: 'error'; problems: string[] };

/** Het model om te tekenen, of `null` als er (nog) niets te tekenen valt.
 *
 * @example
 * const model = findModel(state)
 * if (!model) return;
 * draw(model); */
export function findModel(dataState: DataState | undefined): ChartModel | null {
    return dataState && 'model' in dataState ? dataState.model : null;
}

/** De pagina van een record in de catalogus, zoals de lezer haar opent. */
const RECORD_PAGE = `${METADATA_CATALOGUE}/srv/dut/catalog.search#/metadata/`;

/** Waar de lezer de beschrijving van een bron vindt: de eigen link, anders de record in de catalogus. `undefined`
 *  zonder beide. */
export function findSourceHref(source: ChartSource): string | undefined {
    if (source.href) return source.href;
    return source.metadataId ? `${RECORD_PAGE}${encodeURIComponent(source.metadataId)}` : undefined;
}

/** Hoe de lezer een bron ziet: haar titel, of zolang de record onderweg is (of niet binnenkomt) de sleutel. */
export function nameSource(source: ChartSource): string {
    return source.title || `Metadatarecord ${source.metadataId ?? ''}`.trim();
}

/** Of de figuur open data toont: elke bron moet het zijn. De records beslissen; is één bron volgens haar record geen
 *  open data, dan de figuur ook niet. Zegt een record het niet, of heeft een bron er geen, dan beslist `isOpenData`
 *  van de data. */
export function isOpenData(meta: ChartMeta): boolean {
    const fromRecords = meta.sources.map((source) => source.isOpenData);
    if (fromRecords.includes(false)) return false;
    if (fromRecords.every((value) => value === true)) return true;
    return meta.isOpenData ?? false;
}
