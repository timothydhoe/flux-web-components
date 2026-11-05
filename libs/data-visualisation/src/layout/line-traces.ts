import type { PlotData } from 'plotly.js';
import type { ChartAxis, ChartModel, ChartSeries } from '../models/chart.model';
import { findLastDataPointIndex } from '../models/series';
import { toPlotlyX } from './time-format';
// `meta` op een trace staat niet in @types/plotly.js; ook laden als een tsconfig de map niet meeneemt.
import type {} from '../plotly-augment';

/** Lijndikte en markers volgens het POIROT-thema: markers in de achtergrondkleur met een rand in de kleur van de
 *  reeks. De achtergrond komt uit de spec (`--vl-chart-background`), niet uit een vaste `#fff`: zo kloppen markers en
 *  halo ook op een gekleurde of donkere achtergrond. */
const LINE_WIDTH = 2;
const MARKER_SIZE = 7;

/** Wat een reeks is als er één uitgelicht wordt: de uitgelichte, of context. Zonder uitlichting is elke reeks
 *  'default'. */
export type SeriesRole = 'default' | 'highlight' | 'context';

const LINE_WIDTH_BY_ROLE: Record<SeriesRole, number> = { default: LINE_WIDTH, highlight: 3, context: 1.5 };
/** Een rand in de achtergrondkleur rond de uitgelichte lijn, zodat ze los komt van de grijze lijnen die ze kruist (POIROT). */
const HALO_EDGE = 2;

/** De rol van reeks `index`; `highlightedIndex` is de index van de uitgelichte reeks, of -1. */
export function findSeriesRole(index: number, highlightedIndex: number): SeriesRole {
    if (highlightedIndex === -1) return 'default';
    return index === highlightedIndex ? 'highlight' : 'context';
}

/** Een marker alleen waar hij iets zegt: op het laatste datapunt, waar het directe label staat, en op een punt
 *  zonder buren (tussen twee gaten), dat anders onzichtbaar is want een lijn heeft twee punten nodig. De andere
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
 *  Een gat (NaN) wordt `null`, zodat Plotly de lijn daar onderbreekt in plaats van eroverheen te tekenen.
 *  `backgroundColor` vult de markers en kleurt de halo. Een uitgelichte reeks (`highlightedIndex`) is dikker, krijgt
 *  een halo en ligt bovenop. `meta` is de index van
 *  de reeks: de volgorde van de traces is dan niet meer die van het model. */
export function buildLineTraces(
    model: ChartModel,
    colors: readonly string[],
    backgroundColor: string,
    highlightedIndex = -1,
): Partial<PlotData>[] {
    const traces = model.series.map((series, index): Partial<PlotData> => {
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
            line: { color, width: LINE_WIDTH_BY_ROLE[findSeriesRole(index, highlightedIndex)] },
            meta: index,
            marker: { size: buildMarkerSizes(series, model.meta.x.type), color: backgroundColor, line: { color, width: LINE_WIDTH } },
        };
    });
    if (highlightedIndex === -1 || !traces[highlightedIndex]) return traces;
    const highlightedTrace = traces[highlightedIndex];
    const halo: Partial<PlotData> = {
        type: 'scatter',
        mode: 'lines',
        x: highlightedTrace.x,
        y: highlightedTrace.y,
        connectgaps: false,
        line: { color: backgroundColor, width: LINE_WIDTH_BY_ROLE.highlight + 2 * HALO_EDGE },
        hoverinfo: 'skip', // geen reeks: de muis wijst de lijn zelf aan
    };
    return [...traces.filter((_, index) => index !== highlightedIndex), halo, highlightedTrace];
}
