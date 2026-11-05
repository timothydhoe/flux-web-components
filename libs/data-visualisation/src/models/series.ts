import type { ChartAxis, ChartModel, ChartSeries } from './chart.model';

// Vragen aan één reeks, op één plek: tabel, CSV, tooltip, directe labels en tegels moeten hetzelfde antwoord geven.

/** De waarde van de reeks op x `position`; `null` als de reeks die x niet heeft of er een gat heeft. */
export function findValueAt(series: ChartSeries, position: number | string): number | null {
    // `indexOf` van een gewone array, omdat `x` ook een Float64Array kan zijn die geen tekst kent.
    const index = Array.prototype.indexOf.call(series.x, position);
    if (index === -1) return null;
    const value = series.y[index];
    if (Number.isNaN(value)) return null;
    return value;
}

/** Het laatste datapunt van de reeks (geen gat), zoals de lezer het op de as ziet: bij getallen en tijd de grootste x,
 *  ook als de data niet gesorteerd is; bij categorieën het laatste in de data. -1 als de reeks alleen gaten heeft. */
export function findLastDataPointIndex(series: ChartSeries, xAxisType: ChartAxis['type']): number {
    let lastIndex = -1;
    for (let index = 0; index < series.y.length; index++) {
        if (Number.isNaN(series.y[index])) continue;
        const isFirstDataPoint = lastIndex === -1;
        // Categorieën staan op de as in de volgorde van de data: een later datapunt staat ook verder.
        const isFurtherOnAxis =
            xAxisType === 'category' || Number(series.x[index]) > Number(series.x[lastIndex]);
        if (isFirstDataPoint || isFurtherOnAxis) lastIndex = index;
    }
    return lastIndex;
}

/** De index van de reeks `seriesName`, of 0 (de eerste) zonder naam; -1 als die naam niet bestaat. */
export function findSeriesIndex(model: ChartModel, seriesName = ''): number {
    if (!seriesName) return 0;
    return model.series.findIndex((series) => series.name === seriesName);
}
