/** Eén klasse van lijndiktes: alle waarden vanaf `from`, bv. 150 kV en meer. */
export type WidthClass = { from: number; width: number; isLowest: boolean };

/** Dikker naargelang de waarde, bv. de spanning van een lijn. Hoogstens drie diktes: meer zie je niet uit elkaar. */
export const LINE_WIDTHS = [3.5, 2, 1];

/** De grootste waarden krijgen elk hun eigen dikte; alles daaronder deelt de dunste. */
export function buildWidthClasses(values: Iterable<number>, widths: readonly number[] = LINE_WIDTHS): WidthClass[] {
    const distinct = [...new Set(Array.from(values).filter(Number.isFinite))].sort((a, b) => b - a);
    const count = Math.min(widths.length, distinct.length);
    return Array.from({ length: count }, (_, index) => {
        const isLowest = index === count - 1;
        // De dunste klasse begint bij de kleinste waarde, zodat ze ook alles onder de vorige klassen vangt.
        return { from: isLowest ? distinct[distinct.length - 1] : distinct[index], width: widths[index], isLowest };
    });
}

/** De dikte voor `value`: die van de eerste klasse waar ze bij hoort. Ligt ze onder elke klasse, dan de dunste van
 *  die klassen (ook als ze eigen diktes hebben); zonder klassen de dunste standaarddikte. */
export function findWidth(classes: readonly WidthClass[], value: number): number {
    const matchingClass = classes.find((widthClass) => value >= widthClass.from);
    if (matchingClass) return matchingClass.width;
    const thinnestClass = classes[classes.length - 1];
    if (thinnestClass) return thinnestClass.width;
    return LINE_WIDTHS[LINE_WIDTHS.length - 1];
}
