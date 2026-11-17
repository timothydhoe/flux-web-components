import type { PlotData } from 'plotly.js';
import type { ChartAxis, ChartModel, ChartSeries } from '../models/chart.model';
import { findLastDataPointIndex } from '../models/series';
import { toPlotlyX } from './time-format';

/** Lijndikte en markers volgens het POIROT-thema: markers in de achtergrondkleur met een rand in de kleur van de
 *  reeks. De achtergrond komt uit de spec (`--vl-chart-background`), niet uit een vaste `#fff`: zo kloppen de markers
 *  ook op een gekleurde of donkere achtergrond. */
const LINE_WIDTH = 2;
const MARKER_SIZE = 7;

/** Een marker alleen waar hij iets zegt: op het laatste datapunt, waar het directe label staat, en op een punt
 *  zonder buren (tussen twee onderbrekingen), dat anders onzichtbaar is want een lijn heeft twee punten nodig. De andere
 *  punten toont de hover. Een ring op elk punt maakt de lijn druk, en bij veel punten een rups. Buren in de volgorde
 *  van de data: zo verbindt Plotly de punten. */
export function buildMarkerSizes(series: ChartSeries, xAxisType: ChartAxis['type']): number[] {
    const { y } = series;
    const hasValue = (index: number) => index >= 0 && index < y.length && !Number.isNaN(y[index]);
    const lastIndex = findLastDataPointIndex(series, xAxisType);
    return Array.from(y, (_, index) => {
        const isLast = index === lastIndex;
        const isAlone = hasValue(index) && !hasValue(index - 1) && !hasValue(index + 1);
        if (isLast || isAlone) return MARKER_SIZE;
        return 0;
    });
}

/** Eén lijn per reeks, zoals `selectAll().data(series).join('path')` in d3. Reeks i krijgt kleur i uit `colors`.
 *  Een onderbreking (NaN) wordt `null`, zodat Plotly de lijn daar onderbreekt in plaats van eroverheen te tekenen.
 *  `backgroundColor` vult de markers. Eén trace per reeks, in dezelfde volgorde: Plotly's `curveNumber` is de index
 *  van de reeks. */
export function buildLineTraces(
    model: ChartModel,
    colors: readonly string[],
    backgroundColor: string,
): Partial<PlotData>[] {
    return model.series.map((series, index): Partial<PlotData> => {
        const color = colors[index % colors.length];
        return {
            type: 'scatter',
            mode: 'lines+markers',
            name: series.name,
            x: toPlotlyX(model.meta.x, series.x),
            y: Array.from(series.y, (value) => (Number.isNaN(value) ? null : value)),
            connectgaps: false,
            // De positie-as loopt precies van eerste tot laatste x; zonder dit knipt Plotly de buitenste markers half af.
            cliponaxis: false,
            line: { color, width: LINE_WIDTH },
            marker: {
                size: buildMarkerSizes(series, model.meta.x.type),
                color: backgroundColor,
                line: { color, width: LINE_WIDTH },
            },
        };
    });
}
