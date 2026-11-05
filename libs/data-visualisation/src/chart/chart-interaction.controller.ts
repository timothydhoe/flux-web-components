import type { ReactiveController, ReactiveElement } from 'lit';
import {
    buildHoverSummary,
    collectPositions,
    describePosition,
    findNearestPositionIndex,
    toPlotlyPosition,
    type HoverSummary,
    type Position,
} from '../layout/hover-positions';
import { countDecimalsInData } from '../layout/value-format';
import type { ChartModel } from '../models/chart.model';
import { readPlotPixels, type PlotArea, type PlotPixels } from './plot-pixels';

/** De naam waaronder een nieuwe tooltip in `changedProperties` staat, bv. om de andere lijnen te laten vervagen. */
export const HOVER_CHANGE = 'hover';

/** Zo dicht (px, verticaal) moet de muis bij een lijn zijn om de andere lijnen te laten vervagen; verder weg wijst
 *  de muis alleen een x aan. */
const FADE_DISTANCE = 32;
/** Hoever een vinger mag bewegen (px) om nog een tik te zijn en geen veeg. */
const TAP_DISTANCE = 10;

/** Eén stip op de verticale lijn van de hover, waar een reeks die x kruist. */
export type HoverDot = { y: number; color: string; seriesIndex: number };

/** Wat de hover tekent: de tooltip, een verticale lijn op de x en een stip op elke lijn. In px vanaf de
 *  linkerbovenhoek van de grafiek. De tooltip staat aan de kant van de x waar het meeste plaats is, en in de helft
 *  van de grafiek met de minste punten (findTooltipHalf), zodat hij de lijnen zo weinig mogelijk bedekt. */
export type HoverView = HoverSummary & {
    x: number;
    area: PlotArea;
    plotSize: { width: number; height: number };
    dots: HoverDot[];
    /** De reeks die de muis aanwijst of die uitgelicht is: vet in de tooltip; -1 als er geen is. */
    emphasizedSeriesIndex: number;
    isLeftOfX: boolean;
    isInLowerHalf: boolean;
};

/** Wat de tooltip op zijn plaats houdt als de muis weggaat: niets (de tooltip volgt de muis), het toetsenbord of een
 *  tik op een touchscherm, elk met de x die het toont. Eén veld in plaats van twee indexen die elkaar kunnen
 *  tegenspreken. */
type TooltipHold = { by: 'nothing' } | { by: 'keyboard'; index: number } | { by: 'touch'; index: number };

/** Wat de controller van de grafiek leest. Functies en geen waarden: hij heeft altijd de toestand van nu nodig. */
export type InteractiveChart = {
    readModel(): ChartModel | null;
    readPlotElement(): HTMLElement;
    readSeriesColor(seriesIndex: number): string;
    /** De uitgelichte reeks, of -1. */
    readHighlightedIndex(): number;
    isHoverFadeDisabled(): boolean;
};

/** `data.meta` is de index van de reeks (buildLineTraces): de volgorde van de traces volgt het model niet altijd. */
type PlotlyHoverEvent = {
    points?: { curveNumber: number; pointNumber: number; data?: { meta?: unknown } }[];
    event?: MouseEvent;
};
type PlotlyEventElement = HTMLElement & { on(event: string, handler: (event: PlotlyHoverEvent) => void): void };

/** Waarden lezen zonder de weergave te veranderen: met de muis, het toetsenbord of een tik. Houdt bij wat de tooltip
 *  toont en wat de schermlezer voorleest; de grafiek tekent ze. Een controller: de tik buiten de grafiek luistert op
 *  `document` en moet met het element starten en stoppen (https://lit.dev/docs/composition/controllers/). */
export class ChartInteractionController implements ReactiveController {
    /** Wat de tooltip nu toont; `null` als de muis, het toetsenbord of een tik niets aanwijst. */
    hover: HoverView | null = null;
    /** Wat de schermlezer voorleest terwijl je met de pijltjes door de grafiek gaat. */
    announcement = '';

    #host: ReactiveElement;
    #chart: InteractiveChart;
    #hold: TooltipHold = { by: 'nothing' };
    #tapStart: { x: number; y: number } | null = null;
    /** Waar de tooltip staat; per tekening bepaald, zodat hij niet op en neer springt (findTooltipHalf). */
    #tooltipHalf: 'top' | 'bottom' = 'top';
    /** Plotly bewaart zijn listeners op het element; één keer binden per element (tot `Plotly.purge`). */
    #isBoundToPlot = false;

    /** Een Lit-element en niet elke controllerhost: alleen dat kent `requestUpdate(naam, oudeWaarde)`. */
    constructor(host: ReactiveElement, chart: InteractiveChart) {
        this.#host = host;
        this.#chart = chart;
        this.#host.addController(this);
    }

    hostConnected(): void {
        document.addEventListener('pointerdown', this.#onDocumentPointerDown);
    }

    /** De grafiek ruimt Plotly op (`Plotly.purge`), en daarmee ook de listeners: daarna opnieuw binden. */
    hostDisconnected(): void {
        document.removeEventListener('pointerdown', this.#onDocumentPointerDown);
        this.#isBoundToPlot = false;
    }

    // --- wat de grafiek vraagt
    /** Nieuwe data: niets aangewezen, niets voorgelezen. */
    reset(): void {
        this.#hold = { by: 'nothing' };
        this.announcement = '';
        this.#showHover(null);
    }

    /** De grafiek tekent opnieuw: de pixels van de tooltip kloppen niet meer. Een tik laat los; de plaats van het
     *  toetsenbord blijft, zodat de volgende pijl verder loopt. */
    startNewDrawing(tooltipHalf: 'top' | 'bottom'): void {
        this.#tooltipHalf = tooltipHalf;
        if (this.#hold.by === 'touch') this.#hold = { by: 'nothing' };
        this.#showHover(null);
    }

    /** Na het tekenen: Plotly meldt welk punt de muis aanwijst. */
    bindToPlot(): void {
        if (this.#isBoundToPlot) return;
        this.#isBoundToPlot = true;
        const plotElement = this.#chart.readPlotElement() as PlotlyEventElement;
        plotElement.on('plotly_hover', (event) => this.#onPlotlyHover(event));
        plotElement.on('plotly_unhover', () => this.#onPlotlyUnhover());
    }

    // --- muis
    /** De tooltip toont alle reeksen op de x van het punt dat de muis aanwijst. */
    #onPlotlyHover(event: PlotlyHoverEvent): void {
        // Na een tik bootst de browser muisevents na; die mogen de vastgezette tooltip niet verplaatsen.
        if (this.#hold.by === 'touch') return;
        const model = this.#chart.readModel();
        const point = event.points?.[0];
        if (!model || !point) return;
        const seriesIndex = typeof point.data?.meta === 'number' ? point.data.meta : point.curveNumber;
        const position = model.series[seriesIndex]?.x[point.pointNumber];
        const positions = collectPositions(model);
        const index = positions.indexOf(position);
        if (index === -1) return;
        const pointerY = event.event ? this.#distanceFromPlotTop(event.event.clientY) : undefined;
        this.#showHover(this.#buildHoverView(model, positions[index], pointerY));
    }

    /** Het toetsenbord en een tik houden de tooltip vast; alleen een tooltip van de muis gaat weg. */
    #onPlotlyUnhover(): void {
        if (this.#hold.by === 'nothing') this.#showHover(null);
    }

    // --- toetsenbord
    /** De muis toont een tooltip per x; met het toetsenbord loop je dezelfde x'en af. */
    onKeydown = (event: KeyboardEvent): void => {
        const model = this.#chart.readModel();
        if (!model) return;
        if (event.key === 'Escape') {
            this.#release();
            return;
        }
        const positions = collectPositions(model);
        const index = this.#findNextIndex(event.key, positions.length);
        if (index === undefined) return;
        event.preventDefault(); // anders scrollt de pagina mee
        this.#hold = { by: 'keyboard', index };
        this.#showHover(this.#buildHoverView(model, positions[index]));
        this.announcement = describePosition(model, positions[index], countDecimalsInData(model));
    };

    /** Wie de grafiek verlaat, laat de tooltip van het toetsenbord los. */
    onBlur = (): void => {
        if (this.#hold.by === 'keyboard') this.#release();
    };

    /** De eerste pijl begint aan het begin; daarna stap je één x verder, tot aan de rand. */
    #findNextIndex(key: string, count: number): number | undefined {
        const isFirstStep = this.#hold.by !== 'keyboard';
        const current = this.#hold.by === 'keyboard' ? this.#hold.index : 0;
        switch (key) {
            case 'ArrowRight':
                return isFirstStep ? 0 : Math.min(current + 1, count - 1);
            case 'ArrowLeft':
                return isFirstStep ? 0 : Math.max(current - 1, 0);
            case 'Home':
                return 0;
            case 'End':
                return count - 1;
            default:
                return undefined;
        }
    }

    // --- touch
    /** Op een touchscherm is er geen muis die hovert: een tik zet de tooltip vast op de dichtste x. Een tik op
     *  dezelfde x, buiten de grafiek of `Escape` haalt hem weg. */
    onPointerDown = (event: PointerEvent): void => {
        if (event.pointerType === 'touch') {
            this.#tapStart = { x: event.clientX, y: event.clientY };
        } else {
            this.#tapStart = null;
        }
    };

    onPointerUp = (event: PointerEvent): void => {
        const start = this.#tapStart;
        this.#tapStart = null;
        if (event.pointerType !== 'touch' || !start) return;
        const isSwipe = Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_DISTANCE;
        if (isSwipe) return;
        const model = this.#chart.readModel();
        const pixels = readPlotPixels(this.#chart.readPlotElement());
        if (!model || !pixels) return;
        const positions = collectPositions(model);
        const index = this.#findTappedIndex(model, positions, pixels, event.clientX);
        const isSameAsPinned = this.#hold.by === 'touch' && this.#hold.index === index;
        if (index === -1 || isSameAsPinned) {
            this.#release();
            return;
        }
        this.#hold = { by: 'touch', index };
        const pointerY = this.#distanceFromPlotTop(event.clientY);
        this.#showHover(this.#buildHoverView(model, positions[index], pointerY));
    };

    /** De x die het dichtst bij de tik getekend is, of -1. */
    #findTappedIndex(model: ChartModel, positions: Position[], pixels: PlotPixels, clientX: number): number {
        const plotLeft = this.#chart.readPlotElement().getBoundingClientRect().left;
        const pixelXs = positions.map((position) => pixels.toX(toPlotlyPosition(model, position)));
        return findNearestPositionIndex(pixelXs, clientX - plotLeft);
    }

    /** Een tik buiten de grafiek haalt een vastgezette tooltip weg. */
    #onDocumentPointerDown = (event: PointerEvent): void => {
        const isOutsideChart = !event.composedPath().includes(this.#host);
        if (isOutsideChart && this.#hold.by === 'touch') this.#release();
    };

    // --- tooltip
    /** Niets houdt de tooltip nog vast: weg ermee, en niets meer voor te lezen. */
    #release(): void {
        if (this.#hold.by === 'nothing') return;
        this.#hold = { by: 'nothing' };
        this.announcement = '';
        this.#showHover(null);
    }

    /** Met de oude waarde erbij, zodat de grafiek in `changedProperties` ziet dat de tooltip veranderde. */
    #showHover(hover: HoverView | null): void {
        const previous = this.hover;
        this.hover = hover;
        this.#host.requestUpdate(HOVER_CHANGE, previous);
    }

    /** `pointerY` (px vanaf de bovenkant) alleen bij de muis of een tik: de lijn het dichtst erbij springt eruit.
     *  `null` zolang Plotly niet getekend heeft. */
    #buildHoverView(model: ChartModel, position: Position, pointerY?: number): HoverView | null {
        const plotElement = this.#chart.readPlotElement();
        const pixels = readPlotPixels(plotElement);
        if (!pixels) return null;
        const summary = buildHoverSummary(model, position, countDecimalsInData(model));
        const x = pixels.toX(toPlotlyPosition(model, position));
        const dots = this.#buildDots(summary, pixels);
        const { area } = pixels;
        return {
            ...summary,
            x,
            area,
            plotSize: { width: plotElement.clientWidth, height: plotElement.clientHeight },
            dots,
            isLeftOfX: x > area.left + area.width / 2,
            isInLowerHalf: this.#tooltipHalf === 'bottom',
            emphasizedSeriesIndex: this.#findEmphasizedSeriesIndex(model, dots, pointerY),
        };
    }

    /** Een stip per reeks met een waarde op deze x; een gat krijgt geen stip. */
    #buildDots(summary: HoverSummary, pixels: PlotPixels): HoverDot[] {
        const dots: HoverDot[] = [];
        for (const row of summary.rows) {
            if (row.value === null) continue;
            dots.push({
                y: pixels.toY(row.value),
                color: this.#chart.readSeriesColor(row.seriesIndex),
                seriesIndex: row.seriesIndex,
            });
        }
        return dots;
    }

    /** De uitgelichte reeks; anders de lijn het dichtst bij de muis, als die dichtbij genoeg is. Met één reeks valt er
     *  niets te vergelijken, en met `disable-hover-fade` wil de auteur het niet. */
    #findEmphasizedSeriesIndex(model: ChartModel, dots: HoverDot[], pointerY?: number): number {
        const highlightedIndex = this.#chart.readHighlightedIndex();
        if (highlightedIndex !== -1) return highlightedIndex;
        if (pointerY === undefined) return -1;
        if (this.#chart.isHoverFadeDisabled()) return -1;
        if (model.series.length < 2) return -1;
        let nearest = { seriesIndex: -1, distance: FADE_DISTANCE };
        for (const dot of dots) {
            const distance = Math.abs(dot.y - pointerY);
            if (distance <= nearest.distance) nearest = { seriesIndex: dot.seriesIndex, distance };
        }
        return nearest.seriesIndex;
    }

    #distanceFromPlotTop(clientY: number): number {
        return clientY - this.#chart.readPlotElement().getBoundingClientRect().top;
    }
}
