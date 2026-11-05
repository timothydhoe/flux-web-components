import type { ChartAxis } from '../models/chart.model';

/** Titel van een as: naam en eenheid samen, bv. "Concentratie (µg/m³)".
 *  Alleen een eenheid wordt "µT"; zonder naam en eenheid krijgt de as geen titel. */
export function buildAxisTitle(axis: ChartAxis): string | undefined {
    if (axis.title && axis.unit) return `${axis.title} (${axis.unit})`;
    return axis.title || axis.unit || undefined;
}
