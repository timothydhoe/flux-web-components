import type { LayoutAxis } from 'plotly.js';
import type { ChartAxis } from '../models/chart.model';

/** Een x-waarde: een getal (op een tijdas: milliseconden sinds 1970) of een categorie. */
export type Position = number | string;

const padToTwoDigits = (value: number) => String(value).padStart(2, '0');

/** Lokale tijd als "2026-08-28 15:32:00". Plotly zet een getal op een datumas om als UTC en zou dus twee uur
 *  verschuiven; tekst toont het als lokale tijd. Ook de vorm in de CSV: Excel leest ze als datum. */
export function toLocalDateTime(milliseconds: number): string {
    const date = new Date(milliseconds);
    const day = `${date.getFullYear()}-${padToTwoDigits(date.getMonth() + 1)}-${padToTwoDigits(date.getDate())}`;
    return `${day} ${padToTwoDigits(date.getHours())}:${padToTwoDigits(date.getMinutes())}:${padToTwoDigits(date.getSeconds())}`;
}

/** Een x-waarde voor de lezer, bv. "28/08/2026 15:32" op een tijdas; anders de waarde zelf. Zelf opgebouwd in
 *  plaats van met Intl (dat zet een komma tussen datum en uur): zo is het overal gelijk aan de tooltip van Plotly
 *  (`hoverformat` van `timeAxis`). */
export function formatPosition(axis: ChartAxis, position: Position): string {
    if (axis.type !== 'time' || typeof position !== 'number') return String(position);
    const date = new Date(position);
    const day = `${padToTwoDigits(date.getDate())}/${padToTwoDigits(date.getMonth() + 1)}/${date.getFullYear()}`;
    return `${day} ${padToTwoDigits(date.getHours())}:${padToTwoDigits(date.getMinutes())}`;
}

/** De x-waarden zoals Plotly ze moet krijgen: op een tijdas lokale tijd als tekst, anders ongewijzigd. */
export function toPlotlyX(axis: ChartAxis, values: Float64Array | string[]): (number | string)[] {
    if (axis.type === 'time' && values instanceof Float64Array) return Array.from(values, toLocalDateTime);
    return Array.from<number | string>(values);
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** Een tijdas in Plotly. Getallen in plaats van maandnamen: Plotly kent alleen Engelse namen ("Aug").
 *  De vorm volgt de afstand tussen twee ticks: uren binnen een dag, dagen binnen een maand, anders maanden. */
export const timeAxis: Partial<LayoutAxis> = {
    type: 'date',
    hoverformat: '%d/%m/%Y %H:%M',
    // Plotly neemt de eerste stop waar de afstand tussen de ticks in valt, grenzen inbegrepen: ticks per dag horen
    // bij de dagen, dus de uren stoppen net onder een dag.
    tickformatstops: [
        { dtickrange: [null, DAY_IN_MS - 1], value: '%H:%M' },
        { dtickrange: [DAY_IN_MS, 'M1'], value: '%d/%m' },
        { dtickrange: ['M1', null], value: '%m/%Y' },
    ],
};
