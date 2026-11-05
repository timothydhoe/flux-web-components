import type { ChartAxis, ChartMeta, ChartModel } from '../models/chart.model';

/** Zet het antwoord van een bron om naar het ChartModel. Gooit een fout als het antwoord niet de verwachte vorm
 *  heeft. Een app met een andere bron (bv. OSLO-observaties, Waterinfo) geeft `vl-data-source` haar eigen adapter. */
export type InputAdapter = (input: unknown) => ChartModel;

/** De vorm die `vl-data-source` standaard verwacht: het ChartModel in JSON. JSON kent geen `Float64Array` en geen
 *  `NaN`: een gat is `null`, en een tijd is ISO 8601-tekst ("2026-08-28T15:30:00+02:00") of milliseconden. */
export interface ChartJson {
    meta: ChartMeta;
    series: { name: string; x: (number | string)[]; y: (number | null)[] }[];
}

export const adaptChartJson: InputAdapter = (input) => {
    if (!isChartJson(input)) throw new Error('Het antwoord van de bron heeft niet de vorm { meta, series: [] }.');
    return {
        meta: input.meta,
        series: input.series.map((series) => ({
            name: series.name,
            x: parsePositions(input.meta.x, series.x),
            y: Float64Array.from(series.y, (value) => value ?? NaN),
        })),
    };
};

function isChartJson(input: unknown): input is ChartJson {
    const candidate = input as ChartJson | null;
    return typeof candidate?.meta?.x === 'object' && Array.isArray(candidate.series);
}

function parsePositions(axis: ChartAxis, values: (number | string)[]): Float64Array | string[] {
    if (axis.type === 'category') return values.map(String);
    if (axis.type === 'time') {
        return Float64Array.from(values, (value) => (typeof value === 'number' ? value : Date.parse(value)));
    }
    return Float64Array.from(values, Number);
}
