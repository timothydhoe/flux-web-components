import { formatPosition, type Position } from '../../layout/time-format';
import { countDecimalsInData, formatValue } from '../../layout/value-format';
import type { ChartModel } from '../../models/chart.model';
import { findLastDataPointIndex, findSeriesIndex } from '../../models/series';

/** De laatste waarde van een reeks: het getal (`value`) en klaar om te tonen, bv. "0,231" (`valueLabel`) µT op
 *  "28/08/2026 21:50" (`positionLabel`). */
export type LatestValue = {
    seriesName: string;
    value: number;
    valueLabel: string;
    unit?: string;
    positionLabel: string;
};

/** De laatste waarde van de reeks `seriesName`, of van de eerste reeks zonder naam. `null` als die reeks niet bestaat
 *  of geen enkele waarde heeft. Met evenveel decimalen als de grafiek, zodat tegel en tooltip hetzelfde zeggen. */
export function findLatestValue(model: ChartModel, seriesName = ''): LatestValue | null {
    const seriesIndex = findSeriesIndex(model, seriesName);
    const series = model.series[seriesIndex];
    if (!series) return null;
    const index = findLastDataPointIndex(series, model.meta.x.type);
    if (index === -1) return null;
    return {
        seriesName: series.name,
        value: series.y[index],
        valueLabel: formatValue(series.y[index], countDecimalsInData(model)),
        unit: model.meta.y.unit,
        positionLabel: formatPosition(model.meta.x, series.x[index] as Position),
    };
}
