import { buildNiceScale } from '../../layout/axis-ranges';
import type { ChartReference } from '../../layout/reference-lines';

/** Hoe een waarde zich verhoudt tot een referentie. */
export type Comparison = 'above' | 'below' | 'equal';

/** Een referentie op de meter: waar haar streep staat (0 tot 1 van de breedte) en of de waarde erboven ligt. */
export type GaugeReference = ChartReference & { share: number; comparison: Comparison };

/** Wat de meter tekent: van waar tot waar hij loopt, tot waar hij gevuld is, en de referenties erop. */
export type GaugeView = { range: [number, number]; valueShare: number; references: GaugeReference[] };

/** De schaal loopt vanaf 0 (of de laagste waarde, als die negatief is) tot `max`; zonder `max` tot een rond getal
 *  boven de waarde en alle referenties, zoals de waarde-as van een grafiek: een norm buiten de meter vertelt niets. */
export function buildGaugeView(value: number, references: readonly ChartReference[], max?: number): GaugeView {
    const values = [value, ...references.map((reference) => reference.value)];
    const lowest = Math.min(0, ...values);
    let range: [number, number];
    if (isUsableMax(max, lowest)) {
        range = [lowest, max];
    } else {
        range = buildNiceScale(values).range;
    }
    const shareOf = (amount: number) => {
        const length = range[1] - range[0];
        return length === 0 ? 0 : Math.min(1, Math.max(0, (amount - range[0]) / length));
    };
    return {
        range,
        valueShare: shareOf(value),
        references: references.map((reference) => ({
            ...reference,
            share: shareOf(reference.value),
            comparison: compare(value, reference.value),
        })),
    };
}

/** Een `max` van de auteur telt alleen als het een getal boven het begin van de meter is. */
function isUsableMax(max: number | undefined, lowest: number): max is number {
    if (max === undefined) return false;
    if (!Number.isFinite(max)) return false;
    return max > lowest;
}

function compare(value: number, reference: number): Comparison {
    if (value === reference) return 'equal';
    return value > reference ? 'above' : 'below';
}
