import type { Annotations } from 'plotly.js';
import type { ChartAxis, ChartModel, ChartSeries } from '../models/chart.model';
import { findLastDataPointIndex } from '../models/series';
import type {} from '../plotly-augment';
import { formatValue } from './value-format';

/** Ruimte tussen het einde van de inner chart en het label, in px. */
export const DIRECT_LABEL_OFFSET = 12;
/** Het label van een uitgelichte reeks is vet (POIROT), net als de laatste waarde in elk label. */
export const HIGHLIGHTED_LABEL_WEIGHT = 700;

/** De waarde van het laatste datapunt op de as; daar, aan het einde van de lijn, hoort het label van de reeks.
 *  Dezelfde als in de tegel `vl-data-latest` (findLastDataPointIndex). */
export function findLastValue(series: ChartSeries, xAxisType: ChartAxis['type']): number | undefined {
    const index = findLastDataPointIndex(series, xAxisType);
    if (index === -1) return undefined;
    return series.y[index];
}

/** Zo herkent het vervagen bij hover bij welke reeks een label hoort: de tekst kan dat niet meer, want daar staat ook
 *  de waarde in. */
const SERIES_LABEL_NAME_PREFIX = 'series-';

/** De index van de reeks van een direct label, of -1 voor een andere annotatie (bv. een referentielabel). */
export function findLabelSeriesIndex(annotation: Partial<Annotations> | undefined): number {
    const name = annotation?.name ?? '';
    return name.startsWith(SERIES_LABEL_NAME_PREFIX) ? Number(name.slice(SERIES_LABEL_NAME_PREFIX.length)) : -1;
}

/** Wat in het label van een reeks staat: de naam en de laatste waarde, zoals in de tooltip (zelfde decimalen, zonder
 *  eenheid: die staat al boven de grafiek). Apart, omdat de waarde vet is en de marge ze elk apart meet. */
export type DirectLabelText = { name: string; value: string };

/** Hoeveel van de breedte de directe labels hoogstens mogen innemen; anders blijft er te weinig over voor de lijnen
 *  (bv. op een smal scherm of met lange namen), en komt er een legende boven de grafiek. */
export const MAX_LABEL_SHARE = 0.5;

export function isTooWideForDirectLabels(labelWidth: number, plotWidth: number): boolean {
    return labelWidth > plotWidth * MAX_LABEL_SHARE;
}

export function buildDirectLabelText(
    series: ChartSeries,
    xAxisType: ChartAxis['type'],
    decimals: number,
): DirectLabelText | undefined {
    const lastValue = findLastValue(series, xAxisType);
    if (lastValue === undefined) return undefined;
    return { name: series.name, value: formatValue(lastValue, decimals) };
}

/** Plotly leest de tekst van een annotatie als eenvoudige HTML; een naam als "A<B" mag geen tag worden. */
function escapeLabelText(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Een label per reeks rechts van de inner chart, op de hoogte van haar laatste waarde, met die waarde vet erachter:
 *  zo leest de lezer naam en stand af zonder heen en weer te kijken naar een legende of te hoveren. Een reeks
 *  zonder enige waarde krijgt geen label. Het label van de uitgelichte reeks (`highlightedIndex`, of -1) is helemaal vet. */
export function buildDirectLabels(
    model: ChartModel,
    labelColors: readonly string[],
    decimals: number,
    highlightedIndex = -1,
): Partial<Annotations>[] {
    const labels: Partial<Annotations>[] = [];
    model.series.forEach((series, index) => {
        const lastValue = findLastValue(series, model.meta.x.type);
        if (lastValue === undefined) return; // alleen gaten: geen label
        const name = escapeLabelText(series.name);
        const value = formatValue(lastValue, decimals);
        const font: Partial<Annotations['font']> = { color: labelColors[index % labelColors.length] };
        if (index === highlightedIndex) font.weight = HIGHLIGHTED_LABEL_WEIGHT;
        labels.push({
            name: `${SERIES_LABEL_NAME_PREFIX}${index}`,
            xref: 'paper',
            x: 1,
            y: lastValue,
            text: `${name} <b>${value}</b>`,
            showarrow: false,
            xanchor: 'left',
            // Links in het vak: Plotly centreert anders binnen een breedte die het na een wissel van vet naar
            // normaal niet altijd opnieuw meet, en dan staan de labels niet meer onder elkaar.
            align: 'left',
            xshift: DIRECT_LABEL_OFFSET,
            font,
        });
    });
    return labels;
}
