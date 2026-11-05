// Het ChartModel is het contract tussen data en grafiek. Elk grafiektype
// tekent alleen vanuit dit model.

/** Eén as van de grafiek; bevat waarden, naam van de as, eenheid en korte
 *  uitleg bij de eenheid
 */
export interface ChartAxis {
    type: 'number' | 'time' | 'category';
    title?: string;
    unit?: string;
    unitInfo?: string;
}

/** Referentiedata; wat de lezer over de data moet weten om ze te goed te
 *  kunnen lezen en begrijpen.
 */
export interface ChartMeta {
    source: string;
    sourceHref?: string;
    /** De bron publiceert deze data als Vlaamse open data. */
    isOpenData?: boolean;
    x: ChartAxis;
    y: ChartAxis;
}

/** Eén reeks: alle waarnemingen van één object (bvb. 1 meetput) getekend
 * als één lijn of een groep.
 */
export interface ChartSeries {
    name: string;
    x: Float64Array | string[];
    y: Float64Array;
}

/** De grafiek bestaat uit twee delen: Referentiedata en reeksen. */
export interface ChartModel {
    meta: ChartMeta;
    series: ChartSeries[];
}

/** De grafiek heeft op elk moment een state. Het ChartModel wordt alleen
 * opgeroepen als er iets te tekenen valt.
 */
export type DataState =
    | { status: 'loading' }
    | { status: 'data'; model: ChartModel }
    | { status: 'partial'; model: ChartModel }
    | { status: 'empty' }
    | { status: 'error'; problems: string[] };

/** Het model als er iets te tekenen valt ('data' of 'partial'), anders `null`. Eén plek voor die vraag, zodat
 *  geen enkel onderdeel zelf in de toestand hoeft te kijken. Zonder toestand (nog niets gemeld) ook `null`. */
export function findModel(dataState: DataState | undefined): ChartModel | null {
    if (dataState === undefined) return null;
    if (!('model' in dataState)) return null;
    return dataState.model;
}
