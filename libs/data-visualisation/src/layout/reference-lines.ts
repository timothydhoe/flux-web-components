import type { Annotations, Shape } from 'plotly.js';
import type { ChartModel } from '../models/chart.model';
import { buildValueScale, type ValueScale } from './axis-ranges';
import { countDecimalsInValue, formatValue } from './value-format';

/** Een waarde om de data aan af te meten, bv. een norm of streefwaarde. `isInView`: de waarde-as rekt uit tot de lijn
 *  in beeld is. Zonder valt een lijn ver van de data buiten de grafiek, en staat ze als notitie boven de grafiek. */
export type ChartReference = { value: number; label: string; isInView: boolean };

/** Boven of onder de grafiek: een referentielijn buiten het bereik van de waarde-as. */
const OUT_OF_RANGE_ARROWS = { above: '↑', below: '↓' };

/** De waarde-as met de referentielijnen erop verdeeld: wat erbinnen valt wordt een lijn, de rest een notitie. */
export type PlacedReferences = {
    valueScale: ValueScale;
    inRange: ChartReference[];
    outOfRange: ChartReference[];
};

/** De waarde-as rekt uit tot de referentielijnen met `in-view`. Wat daarna binnen het bereik valt, wordt een lijn;
 *  de rest een notitie boven de grafiek. Eén plek, zodat de tekening en de notities het eens zijn. */
export function placeReferences(model: ChartModel, references: readonly ChartReference[]): PlacedReferences {
    const inViewValues = references.filter((reference) => reference.isInView).map((reference) => reference.value);
    const valueScale = buildValueScale(model, inViewValues);
    const inRange = references.filter((reference) => isReferenceInRange(reference, valueScale.range));
    const outOfRange = references.filter((reference) => !inRange.includes(reference));
    return { valueScale, inRange, outOfRange };
}

/** Aan welke kant van de waarde-as een referentielijn buiten het bereik ligt. */
export function findOutOfRangeArrow(reference: ChartReference, valueScale: ValueScale): string {
    return reference.value > valueScale.range[1] ? OUT_OF_RANGE_ARROWS.above : OUT_OF_RANGE_ARROWS.below;
}

/** De notities boven de grafiek als tekst, met hun pijl, bv. "↑ EU-referentieniveau: 100 µT". */
export function describeOutOfRangeReferences(placed: PlacedReferences, unit?: string): string[] {
    return placed.outOfRange.map(
        (reference) => `${findOutOfRangeArrow(reference, placed.valueScale)} ${describeReference(reference, unit)}`,
    );
}

/** Wat bij de lijn staat, bv. "Vlaamse streefwaarde: 0,4 µT": de waarde met haar eigen decimalen, want een norm van
 *  100 is geen 100,000. */
export function describeReference(reference: ChartReference, unit?: string): string {
    const value = formatValue(reference.value, countDecimalsInValue(reference.value), unit);
    return reference.label ? `${reference.label}: ${value}` : value;
}

/** Of de lijn binnen het bereik van de waarde-as valt en dus getekend wordt. */
export function isReferenceInRange(reference: ChartReference, range: readonly [number, number]): boolean {
    return reference.value >= range[0] && reference.value <= range[1];
}

/** Een dunne gestreepte lijn over de hele breedte. Boven alles ('above'): onder het raster ('below', en in onze
 *  shadow DOM ook 'between') verdwijnt ze onder een rasterlijn op dezelfde hoogte. Dun en gestreept, zodat de
 *  dikkere lijnen van de data erdoor zichtbaar blijven. */
export function buildReferenceShapes(references: readonly ChartReference[], color: string): Partial<Shape>[] {
    return references.map((reference) => ({
        type: 'line',
        layer: 'above',
        xref: 'paper',
        x0: 0,
        x1: 1,
        yref: 'y',
        y0: reference.value,
        y1: reference.value,
        line: { color, width: 1, dash: 'dash' },
    }));
}

/** Het label links boven de lijn, waar de directe labels (rechts) het niet raken. Met een achtergrond, zodat het
 *  leesbaar blijft als een datalijn erdoor loopt. */
export function buildReferenceLabels(
    references: readonly ChartReference[],
    unit: string | undefined,
    color: string,
    backgroundColor: string,
): Partial<Annotations>[] {
    return references.map((reference) => ({
        xref: 'paper',
        x: 0,
        xanchor: 'left',
        y: reference.value,
        yanchor: 'bottom',
        yshift: 2,
        text: describeReference(reference, unit),
        showarrow: false,
        bgcolor: backgroundColor,
        borderpad: 2,
        font: { color },
    }));
}
