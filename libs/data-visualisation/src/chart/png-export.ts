import type { ChartSpec } from './chart-spec';

/** Wat rond de plot op de PNG komt. Een gedeelde afbeelding moet zonder de pagina te begrijpen zijn: met kop,
 *  eenheid en bron, net als de grafiek op de pagina. */
export interface PngFurniture {
    title: string;
    unit: string;
    source: string;
    /** Tekst van het open-datakenmerk rechts op de bronregel; leeg = geen kenmerk. */
    openDataLabel: string;
}

/** De plot als afbeelding, zoals `Plotly.toImage` hem levert, met zijn grootte in CSS-pixels. */
export interface PlotImage {
    url: string;
    width: number;
    height: number;
}

/** Pixels per CSS-pixel: scherp op hoge-resolutieschermen en in documenten. */
export const PNG_SCALE = 2;

// Maten in CSS-pixels, afgeleid van de Flux-tokens die de figuur op de pagina gebruikt.
const SPACING = 20; // --vl-spacing--normal
const TITLE_SIZE = 22; // Flux-h3 op een klein scherm
const TITLE_WEIGHT = 500;
const TITLE_LINE_HEIGHT = 28;
const TEXT_SIZE = 14; // --vl-font-size--small
const TEXT_LINE_HEIGHT = 20;
const ICON_GAP = 6;
// Leeuw van `vl-icon icon="vlaanderen"`: glyph U+F2BD in het lettertype van de Flux-iconen
// (bron: `.vl-icon--vlaanderen::before` in vl-icon-style-mapping.css.ts).
const LION_GLYPH = '';
const ICON_FONT = 'vlaanderen-icon';

/** Zet kop, eenheid, plot en bronregel onder elkaar op één canvas, zoals in de figuur op de pagina. */
export async function buildPngWithFurniture(
    plot: PlotImage,
    furniture: PngFurniture,
    spec: ChartSpec,
): Promise<Blob> {
    const titleFont = `${TITLE_WEIGHT} ${TITLE_SIZE}px ${spec.fontFamily}`;
    const textFont = `${TEXT_SIZE}px ${spec.fontFamily}`;
    // Een canvas wacht niet op webfonts: zonder dit valt de eerste export terug op een systeemlettertype.
    await Promise.all([document.fonts.load(titleFont), document.fonts.load(`${TEXT_SIZE}px ${ICON_FONT}`)]);

    const width = plot.width + 2 * SPACING;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D wordt niet ondersteund.');

    context.font = titleFont;
    const titleLines = furniture.title ? splitTextIntoLines(context, furniture.title, plot.width) : [];
    const titleHeight = titleLines.length > 0 ? titleLines.length * TITLE_LINE_HEIGHT + SPACING : 0;
    const unitHeight = furniture.unit ? TEXT_LINE_HEIGHT + SPACING / 2 : 0;
    const height = SPACING + titleHeight + unitHeight + plot.height + SPACING + TEXT_LINE_HEIGHT + SPACING;

    canvas.width = width * PNG_SCALE;
    canvas.height = height * PNG_SCALE;
    context.scale(PNG_SCALE, PNG_SCALE);
    context.fillStyle = spec.backgroundColor;
    context.fillRect(0, 0, width, height);
    context.textBaseline = 'top';

    let y = SPACING;
    context.font = titleFont;
    context.fillStyle = spec.textColor;
    for (const line of titleLines) {
        context.fillText(line, SPACING, y);
        y += TITLE_LINE_HEIGHT;
    }
    if (titleLines.length > 0) y += SPACING;

    context.font = textFont;
    context.fillStyle = spec.axisColor;
    if (furniture.unit) {
        context.fillText(furniture.unit, SPACING, y);
        y += TEXT_LINE_HEIGHT + SPACING / 2;
    }

    context.drawImage(await loadImage(plot.url), SPACING, y, plot.width, plot.height);
    y += plot.height + SPACING;

    context.fillText(furniture.source, SPACING, y);
    if (furniture.openDataLabel) drawOpenDataMark(context, furniture.openDataLabel, width - SPACING, y, textFont);

    return new Promise((resolve, reject) =>
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG maken mislukt.'))), 'image/png'),
    );
}

/** Leeuw + label, rechts uitgelijnd op `right`: zoals het open-datakenmerk op de pagina. */
function drawOpenDataMark(
    context: CanvasRenderingContext2D,
    label: string,
    right: number,
    y: number,
    textFont: string,
): void {
    context.font = textFont;
    const labelWidth = context.measureText(label).width;
    context.fillText(label, right - labelWidth, y);

    context.font = `${TEXT_SIZE}px ${ICON_FONT}`;
    const glyphWidth = context.measureText(LION_GLYPH).width;
    context.fillText(LION_GLYPH, right - labelWidth - ICON_GAP - glyphWidth, y);
}

/** Breekt tekst af op woorden zodat geen regel breder is dan `maxWidth`. */
function splitTextIntoLines(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && context.measureText(candidate).width > maxWidth) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function loadImage(url: string): Promise<HTMLImageElement> {
    const image = new Image();
    image.src = url;
    return image.decode().then(() => image);
}
