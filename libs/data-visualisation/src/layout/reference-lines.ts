import type { Annotations, Shape } from 'plotly.js';
import { countDecimalsInValue, formatValue } from './value-format';

/** Een waarde om de data aan af te meten, bv. een norm (EU-limiet) of een streefwaarde. */
export type ChartReference = { value: number; label: string };

/** Zo herkennen de directe labels en het vervagen de labels van referentielijnen tussen de annotaties. */
export const REFERENCE_ANNOTATION_NAME = 'reference';

/** Wat bij de lijn staat, bv. "WHO-advieswaarde: 5 µg/m³": de waarde met haar eigen decimalen, want een norm van
 *  100 is geen 100,000. */
export function describeReference(reference: ChartReference, unit?: string): string {
    const value = formatValue(reference.value, countDecimalsInValue(reference.value), unit);
    return reference.label ? `${reference.label}: ${value}` : value;
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
        name: REFERENCE_ANNOTATION_NAME,
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
