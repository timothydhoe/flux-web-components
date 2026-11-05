import { buildNiceScale } from './axis-ranges';
import { countDecimalsInValue, formatValue, removeFloatNoise } from './value-format';

/** Eén klasse van een schaal: van `from` tot `to`, in één kleur. */
export type ScaleClass = { from: number; to: number; color: string };

/** Een schaal in klassen: hoe hoger de waarde, hoe donkerder. Klassen in plaats van een vloeiend verloop, zodat de
 *  lezer een kleur op de kaart in de legende terugvindt. */
export type ClassedScale = { classes: ScaleClass[]; colorOf(value: number): string };

/** Klassen met ronde grenzen, dezelfde als de waarde-as van een grafiek met die waarden (vanaf 0, hoogstens zes
 *  stappen). De kleuren komen evenredig verdeeld uit `ramp`, van licht naar donker. */
export function buildClassedScale(values: Iterable<number>, ramp: readonly string[]): ClassedScale {
    const { range, step } = buildNiceScale(values);
    const count = Math.max(1, Math.round((range[1] - range[0]) / step));
    const classes = Array.from({ length: count }, (_, index) => ({
        from: removeFloatNoise(range[0] + index * step),
        to: removeFloatNoise(range[0] + (index + 1) * step),
        color: findRampColor(ramp, index, count),
    }));
    return {
        classes,
        colorOf: (value) => {
            const index = Math.floor((value - range[0]) / step);
            const clampedIndex = Math.min(count - 1, Math.max(0, index));
            return classes[clampedIndex].color;
        },
    };
}

/** De kleur van klasse `index` van `count`: evenredig verdeeld van de lichtste tot de donkerste van `ramp`. Eén klasse
 *  krijgt de donkerste, zodat ze goed zichtbaar is. */
function findRampColor(ramp: readonly string[], index: number, count: number): string {
    const darkestIndex = ramp.length - 1;
    if (count === 1) return ramp[darkestIndex];
    const rampIndex = Math.round((index * darkestIndex) / (count - 1));
    return ramp[rampIndex];
}

/** Wat de legende bij een klasse zet, bv. "0 - 0,2 µT": elke grens met haar eigen decimalen, zoals de ticks van een
 *  as, en de eenheid één keer. */
export function describeScaleClass({ from, to }: ScaleClass, unit?: string): string {
    return `${formatValue(from, countDecimalsInValue(from))} - ${formatValue(to, countDecimalsInValue(to), unit)}`;
}
