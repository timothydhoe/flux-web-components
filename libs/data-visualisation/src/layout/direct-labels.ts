import type { Annotations } from 'plotly.js';
import type { ChartAxis, ChartModel, ChartSeries } from '../models/chart.model';
import { findLastDataPointIndex } from '../models/series';
import { formatValue } from './value-format';

/** Ruimte tussen het einde van de inner chart en het label, in px. */
export const DIRECT_LABEL_OFFSET = 12;
/** De laatste waarde in elk label is vet (POIROT): `<b>` in de tekst van de annotatie. */
export const LABEL_VALUE_WEIGHT = 700;

/** De waarde van het laatste datapunt op de as; daar, aan het einde van de lijn, hoort het label van de reeks. */
export function findLastValue(series: ChartSeries, xAxisType: ChartAxis['type']): number | undefined {
    const index = findLastDataPointIndex(series, xAxisType);
    if (index === -1) return undefined;
    return series.y[index];
}

/** Wat in het label van een reeks staat: de naam en de laatste waarde, zoals in de tooltip (zelfde decimalen, zonder
 *  eenheid: die staat al boven de grafiek). Apart, omdat de waarde vet is en de marge ze elk apart meet. `lastValue`
 *  is de hoogte van het label. */
export type DirectLabelText = { name: string; value: string; lastValue: number };

/** Hoeveel van de breedte de directe labels hoogstens mogen innemen; anders blijft er te weinig over voor de lijnen
 *  (bv. op een smal scherm of met lange namen), en komt er een legende boven de grafiek. Een kwart: in een figuur van
 *  zo'n 500 px breed neemt één label als "Beringen 0,315" dat al in, en dan krijgen de lijnen beter de volle breedte. */
export const MAX_LABEL_SHARE = 0.25;

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
    return { name: series.name, value: formatValue(lastValue, decimals), lastValue };
}

/** Plotly leest de tekst van een annotatie als eenvoudige HTML; een naam als "A<B" mag geen tag worden. */
function escapeLabelText(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Een label per reeks rechts van de inner chart, op de hoogte van haar laatste waarde, met die waarde vet erachter:
 *  zo leest de lezer naam en stand af zonder heen en weer te kijken naar een legende of te hoveren. Een reeks
 *  zonder enige waarde krijgt geen label. */
export function buildDirectLabels(
    model: ChartModel,
    labelColors: readonly string[],
    decimals: number,
): Partial<Annotations>[] {
    return model.series.flatMap((series, index): Partial<Annotations>[] => {
        const label = buildDirectLabelText(series, model.meta.x.type, decimals);
        if (!label) return []; // alleen onderbrekingen: geen label
        return [
            {
                xref: 'paper',
                x: 1,
                y: label.lastValue,
                text: `${escapeLabelText(label.name)} <b>${label.value}</b>`,
                showarrow: false,
                xanchor: 'left',
                // Links in het vak: Plotly centreert anders binnen een breedte die het na een wissel van vet naar
                // normaal niet altijd opnieuw meet, en dan staan de labels niet meer onder elkaar.
                align: 'left',
                xshift: DIRECT_LABEL_OFFSET,
                font: { color: labelColors[index % labelColors.length] },
            },
        ];
    });
}
