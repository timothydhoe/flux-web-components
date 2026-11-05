import type { ChartSpec } from './chart-spec';

let context: CanvasRenderingContext2D | null | undefined;

/** Breedte van een tekst in px, in het font van de grafiek. Plotly geeft annotaties geen automargin, dus de ruimte
 *  voor directe labels meten we zelf. https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText */
export function measureTextWidth(text: string, spec: ChartSpec, fontWeight = 400): number {
    context ??= document.createElement('canvas').getContext('2d');
    if (!context) return text.length * spec.fontSize; // ruwe schatting zonder canvas
    context.font = `${fontWeight} ${spec.fontSize}px ${spec.fontFamily}`;
    return context.measureText(text).width;
}
