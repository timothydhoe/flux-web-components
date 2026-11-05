import { Circle, Fill, Stroke, Style, Text } from 'ol/style';

// Stijlen voor data op een kaart van Flux (vl-map, OpenLayers). OpenLayers tekent op een canvas en kent geen
// CSS-variabelen; daarom leest readMapSpec de Flux-kleuren uit de CSS.

/** De Flux-waarden die een kaartstijl nodig heeft. */
export type MapSpec = {
    /** Van licht naar donker, voor een waarde (buildClassedScale). */
    ramp: string[];
    /** Lijnen die context geven, bv. een net: rustig, zodat de punten met data opvallen. */
    contextColor: string;
    textColor: string;
    backgroundColor: string;
    /** Een punt zonder waarde, bv. een sensor die offline is. */
    noValueColor: string;
    fontFamily: string;
};

/** Graden van Flux-blauw die ongeveer even ver uit elkaar liggen in lichtheid (OKLab L 0,76 0,65 0,56 0,49 0,38 0,28):
 *  700 tot 900 liggen te dicht bij elkaar om klassen te onderscheiden. 300 als lichtste: lichter verdwijnt op de
 *  basiskaart. */
const RAMP_STEPS = [300, 400, 500, 600, 800, 1000];

export function readMapSpec(element: Element): MapSpec {
    const style = getComputedStyle(element);
    const token = (name: string) => style.getPropertyValue(`--vl-color--${name}`).trim();
    return {
        ramp: RAMP_STEPS.map((step) => token(`action-${step}`)),
        contextColor: token('grey-600'),
        textColor: token('text-default') || token('grey-1000'),
        // Terugval zonder Flux-tokens (bv. een losse test): OpenLayers tekent op canvas en heeft een echte kleur nodig.
        backgroundColor: token('background-default') || '#ffffff',
        noValueColor: token('grey-600'),
        fontFamily: style.getPropertyValue('--vl-font').trim() || 'sans-serif',
    };
}

/** Een punt met data. Zonder `color` is het hol: er is geen waarde. Een rand in de achtergrondkleur houdt punten
 *  uit elkaar die elkaar raken. Het `label` (naam en waarde) staat er alleen als het punt aangewezen of gekozen is,
 *  zodat de kaart niet vol getallen staat. */
export function buildPointStyle(
    spec: MapSpec,
    { color, label, isEmphasized = false }: { color?: string; label?: string; isEmphasized?: boolean },
): Style[] {
    const radius = isEmphasized ? 9 : 7;
    const point = new Style({
        image: new Circle({
            radius,
            fill: new Fill({ color: color ?? spec.backgroundColor }),
            stroke: new Stroke({ color: color ? spec.backgroundColor : spec.noValueColor, width: 2 }),
        }),
        zIndex: isEmphasized ? 2 : 1,
    });
    if (!isEmphasized) return [point];
    // Een ring rond het gekozen punt: groter alleen valt niet genoeg op.
    const ring = new Style({
        image: new Circle({ radius: radius + 4, stroke: new Stroke({ color: spec.textColor, width: 2 }) }),
        zIndex: 2,
    });
    const text = new Style({
        text: new Text({
            text: label,
            font: `500 13px ${spec.fontFamily}`,
            offsetY: -(radius + 18),
            fill: new Fill({ color: spec.textColor }),
            backgroundFill: new Fill({ color: spec.backgroundColor }),
            padding: [3, 6, 3, 6],
        }),
        zIndex: 3,
    });
    return [ring, point, text];
}

/** Een lijn als context, bv. een hoogspanningslijn: in één rustige kleur, dikker naargelang `width`. */
export function buildLineStyle(spec: MapSpec, width: number): Style {
    return new Style({ stroke: new Stroke({ color: spec.contextColor, width, lineCap: 'round' }) });
}
