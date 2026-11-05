import type { Shape } from 'plotly.js';
import type { ChartModel } from '../models/chart.model';
import { removeFloatNoise } from './value-format';

/** Hoogstens zoveel stappen tussen de rasterlijnen: genoeg om af te lezen, weinig genoeg om rustig te blijven.
 *  Met 0 erbij zijn dat hoogstens 7 labels; de EU-gids raadt 5 tot 10 labels aan. */
const MAX_TICK_STEPS = 6;
/** Ronde stappen: 1, 2 of 5 maal een macht van 10. */
const NICE_FACTORS = [1, 2, 5, 10];

/** Het bereik en de stap tussen de rasterlijnen van de waarde-as. */
export type ValueScale = { range: [number, number]; step: number };

/** De kleinste ronde stap waarmee het afgeronde bereik in hoogstens MAX_TICK_STEPS stappen past. Geteld op het
 *  afgeronde bereik, want afronden aan beide kanten kan er een stap bij maken. */
function findNiceScale(lowest: number, highest: number): ValueScale {
    const powerOfTen = 10 ** Math.floor(Math.log10((highest - lowest) / MAX_TICK_STEPS));
    for (const factor of NICE_FACTORS) {
        const step = removeFloatNoise(factor * powerOfTen);
        const range: [number, number] = [
            removeFloatNoise(Math.floor(lowest / step) * step),
            removeFloatNoise(Math.ceil(highest / step) * step),
        ];
        if (Math.round((range[1] - range[0]) / step) <= MAX_TICK_STEPS) return { range, step };
    }
    const step = 10 * powerOfTen;
    return { range: [Math.floor(lowest / step) * step, Math.ceil(highest / step) * step], step };
}

/** Waarde-as: altijd met 0 erin, zodat de hoogte van een lijn of staaf eerlijk te vergelijken is.
 *  De uiteinden worden afgerond naar een ronde stap (zoals d3 `.nice()`), zodat de hoogste waarde de rand niet raakt.
 *  `extraValues` moeten ook in beeld, bv. referentielijnen: een norm buiten beeld vertelt niets. */
export function buildValueScale(model: ChartModel, extraValues: readonly number[] = []): ValueScale {
    return buildNiceScale(allValuesOf(model, extraValues));
}

function* allValuesOf(model: ChartModel, extraValues: readonly number[]): Iterable<number> {
    yield* extraValues;
    for (const series of model.series) yield* series.y;
}

/** Een ronde schaal met 0 en alle `values` erin, bv. voor een meter. Een gat (`NaN`) telt niet mee. */
export function buildNiceScale(values: Iterable<number>): ValueScale {
    let lowest = 0;
    let highest = 0;
    for (const value of values) {
        if (Number.isNaN(value)) continue;
        lowest = Math.min(lowest, value);
        highest = Math.max(highest, value);
    }
    if (lowest === highest) return { range: [lowest, highest], step: 1 }; // alles 0: niets om af te ronden
    return findNiceScale(lowest, highest);
}

/** Positie-as: van de eerste tot de laatste x. Categorieën (tekst) hebben geen bereik; die laat Plotly zelf staan. */
export function buildPositionRange(model: ChartModel): [number, number] | undefined {
    const numericPositions = model.series.flatMap((series) => (series.x instanceof Float64Array ? Array.from(series.x) : []));
    return numericPositions.length > 0 ? [Math.min(...numericPositions), Math.max(...numericPositions)] : undefined;
}

/** De rasterlijnen op de rand van de waarde-as. Plotly tekent daar geen rasterlijn, waardoor de bovenste stap open
 *  lijkt. Niet op 0: daar staat de nullijn al. */
export function buildEdgeGridLines(range: readonly [number, number], color: string): Partial<Shape>[] {
    return range
        .filter((value) => value !== 0)
        .map((value) => ({
            type: 'line',
            layer: 'below',
            xref: 'paper',
            x0: 0,
            x1: 1,
            yref: 'y',
            y0: value,
            y1: value,
            line: { color, width: 1 },
        }));
}
