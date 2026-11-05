import { formatPosition, type Position } from '../../layout/time-format';
import { countDecimalsInData, formatValue } from '../../layout/value-format';
import type { ChartModel, ChartSeries } from '../../models/chart.model';
import { findSeriesIndex } from '../../models/series';

/** Welke waarde een tegel samenvat: de hoogste, de laagste of het gemiddelde van een reeks. */
export type Statistic = 'max' | 'min' | 'mean';

export const STATISTICS: readonly Statistic[] = ['max', 'min', 'mean'];

/** Een samengevatte waarde: het getal (`value`) en klaar om te tonen (`valueLabel`). `positionLabel` zegt waar ze
 *  over gaat: bij de hoogste en laagste wanneer ze gemeten is, bij het gemiddelde over welke periode, bv.
 *  "2018 - 2024". */
export type StatisticValue = {
    seriesName: string;
    value: number;
    valueLabel: string;
    unit?: string;
    positionLabel: string;
};

/** `statistic` van de reeks `seriesName` (of de eerste), met evenveel decimalen als de grafiek. Gaten tellen niet
 *  mee; bij een gelijke stand telt de eerste. `null` als die reeks niet bestaat of geen enkele waarde heeft. */
export function findStatistic(model: ChartModel, statistic: Statistic, seriesName = ''): StatisticValue | null {
    const series = model.series[findSeriesIndex(model, seriesName)];
    if (!series) return null;
    const valueIndexes = findValueIndexes(series);
    if (valueIndexes.length === 0) return null;
    if (statistic === 'mean') return buildMean(model, series, valueIndexes);
    return buildExtreme(model, series, valueIndexes, statistic);
}

/** Het gemiddelde, met de periode van het eerste tot het laatste datapunt. */
function buildMean(model: ChartModel, series: ChartSeries, valueIndexes: number[]): StatisticValue {
    let sum = 0;
    for (const index of valueIndexes) sum += series.y[index];
    const mean = sum / valueIndexes.length;

    const first = describePosition(model, series, valueIndexes[0]);
    const last = describePosition(model, series, valueIndexes[valueIndexes.length - 1]);
    const period = first === last ? first : `${first} - ${last}`;

    return {
        seriesName: series.name,
        value: mean,
        valueLabel: formatValue(mean, countDecimalsInData(model)),
        unit: model.meta.y.unit,
        positionLabel: period,
    };
}

/** De hoogste of laagste waarde, met wanneer ze gemeten is. */
function buildExtreme(
    model: ChartModel,
    series: ChartSeries,
    valueIndexes: number[],
    statistic: 'max' | 'min',
): StatisticValue {
    const extremeIndex = findExtremeIndex(series, valueIndexes, statistic);
    const extreme = series.y[extremeIndex];
    return {
        seriesName: series.name,
        value: extreme,
        valueLabel: formatValue(extreme, countDecimalsInData(model)),
        unit: model.meta.y.unit,
        positionLabel: describePosition(model, series, extremeIndex),
    };
}

/** De index van de hoogste (`max`) of laagste (`min`) waarde. Alleen strikt hoger of lager vervangt: bij een gelijke
 *  stand blijft de eerste. */
function findExtremeIndex(series: ChartSeries, valueIndexes: number[], statistic: 'max' | 'min'): number {
    let extremeIndex = valueIndexes[0];
    for (const index of valueIndexes) {
        const value = series.y[index];
        const extreme = series.y[extremeIndex];
        const isMoreExtreme = statistic === 'max' ? value > extreme : value < extreme;
        if (isMoreExtreme) extremeIndex = index;
    }
    return extremeIndex;
}

/** De indexen van de datapunten met een waarde; gaten (NaN) vallen weg. */
function findValueIndexes(series: ChartSeries): number[] {
    const indexes: number[] = [];
    for (let index = 0; index < series.y.length; index++) {
        if (!Number.isNaN(series.y[index])) indexes.push(index);
    }
    return indexes;
}

function describePosition(model: ChartModel, series: ChartSeries, index: number): string {
    return formatPosition(model.meta.x, series.x[index] as Position);
}
