import type { ChartModel } from '../models/chart.model';
import { findValueAt } from '../models/series';
import { formatPosition, toLocalDateTime, type Position } from './time-format';
import { formatValue } from './value-format';

const NO_VALUE_LABEL = 'geen gegevens';

export type { Position };

/** Alle x-waarden van de grafiek, één keer, in de volgorde van de as: getallen oplopend, categorieën zoals ze
 *  het eerst voorkomen. Dit zijn de stappen die je met de pijltjestoetsen doorloopt. */
export function collectPositions(model: ChartModel): Position[] {
    const positions = new Set<Position>();
    for (const series of model.series) {
        for (const x of series.x) positions.add(x);
    }
    const ordered = [...positions];
    return model.meta.x.type === 'category' ? ordered : ordered.sort((a, b) => Number(a) - Number(b));
}

/** Een x zoals Plotly ze op de as kent, om er de pixel van op te vragen: op een tijdas in dezelfde lokale tijd als
 *  de traces (zie toPlotlyX), anders de x zelf. */
export function toPlotlyPosition(model: ChartModel, position: Position): number | string {
    return model.meta.x.type === 'time' && typeof position === 'number' ? toLocalDateTime(position) : position;
}

/** Eén reeks in de tooltip; `value` is `null` bij een gat. */
export type HoverRow = { seriesIndex: number; name: string; value: number | null; label: string };
/** Wat de tooltip op één x toont: de x als titel, de eenheid één keer, en een regel per reeks. */
export type HoverSummary = { title: string; unit?: string; rows: HoverRow[] };

/** De tooltip op één x. De regels van hoog naar laag, zoals de lijnen boven elkaar liggen; reeksen zonder waarde
 *  achteraan. De eenheid staat één keer bovenaan in plaats van achter elke waarde. */
export function buildHoverSummary(model: ChartModel, position: Position, decimals: number): HoverSummary {
    const rows = model.series.map((series, seriesIndex): HoverRow => {
        const value = findValueAt(series, position);
        return {
            seriesIndex,
            name: series.name,
            value,
            label: value === null ? NO_VALUE_LABEL : formatValue(value, decimals),
        };
    });
    // Een gat telt als lager dan elke waarde; twee gaten blijven in hun volgorde (-Infinity - -Infinity is NaN).
    rows.sort((a, b) => (a.value === b.value ? 0 : (b.value ?? -Infinity) - (a.value ?? -Infinity)));
    return { title: formatPosition(model.meta.x, position), unit: model.meta.y.unit, rows };
}

/** Wat de tooltip op één x toont, als zin voor een schermlezer, bv.
 *  "2021: Meetpunt Gent 11,9 µg/m³, Meetpunt Antwerpen 13,8 µg/m³". */
export function describePosition(model: ChartModel, position: Position, decimals: number): string {
    const unit = model.meta.y.unit;
    const values = model.series.map((series) => {
        const value = findValueAt(series, position);
        const valueText = value === null ? NO_VALUE_LABEL : formatValue(value, decimals, unit);
        return `${series.name} ${valueText}`;
    });
    return `${formatPosition(model.meta.x, position)}: ${values.join(', ')}`;
}

/** De index van de x die het dichtst bij `x` getekend is (alles in px), of -1 zonder x'en. Voor een tik op een
 *  touchscherm, waar Plotly geen hover meldt. */
export function findNearestPositionIndex(pixelXs: readonly number[], x: number): number {
    let nearest = { index: -1, distance: Infinity };
    pixelXs.forEach((pixelX, index) => {
        const distance = Math.abs(pixelX - x);
        if (distance < nearest.distance) nearest = { index, distance };
    });
    return nearest.index;
}

/** In welke helft van de waarde-as de tooltip staat: die met de minste punten, zodat hij de lijnen zo weinig mogelijk
 *  bedekt. Eén keer per grafiek, niet per x: anders springt de tooltip op en neer terwijl de muis beweegt. Bij
 *  evenveel punten bovenaan, waar het oog begint. */
export function findTooltipHalf(model: ChartModel, valueRange: readonly [number, number]): 'top' | 'bottom' {
    const middle = (valueRange[0] + valueRange[1]) / 2;
    let upper = 0;
    let lower = 0;
    for (const series of model.series) {
        for (const value of series.y) {
            if (Number.isNaN(value)) continue;
            if (value > middle) upper += 1;
            else lower += 1;
        }
    }
    return upper > lower ? 'bottom' : 'top';
}
