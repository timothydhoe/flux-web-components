import { BaseLitElement, registerWebComponents } from '@domg-wc/common';
import { VlIconComponent, VlLinkComponent, VlTextComponent } from '@domg-wc/components/atom';
import { VlAlert } from '@domg-wc/components/block';
import { CSSResult, html, nothing, PropertyValues, TemplateResult } from 'lit';
import { ContextConsumer } from '@lit/context';
import { createDataChangeEvent } from '../events/data-change.event';
import { sourceContext } from '../source/source-context';
import { findModel, type ChartModel, type DataState } from '../models/chart.model';
import { classifyDataState } from '../models/classify-data-state';
import { vlChartFluxStyles } from './vl-chart.flux-css';
import Plotly from 'plotly.js-basic-dist-min';
import type { Annotations, Layout, PlotData } from 'plotly.js';
// Laadt ook de aanvullingen op @types/plotly.js (ticklabelstandoff) als een tsconfig de map niet meeneemt.
import type {} from '../plotly-augment';
import { property, query, state } from 'lit/decorators.js';
import { chartDefaults, type ChartMargin } from './vl-chart.defaults';
import { readChartSpec, type ChartSpec } from './chart-spec';
import { buildPngWithFurniture, PNG_SCALE } from './png-export';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap, type StyleInfo } from 'lit/directives/style-map.js';
import { buildEdgeGridLines, buildPositionRange, buildValueScale, type ValueScale } from '../layout/axis-ranges';
import { findLabelSeriesIndex } from '../layout/direct-labels';
import { buildAxisTitle } from '../layout/axis-titles';
import { findTooltipHalf } from '../layout/hover-positions';
import {
    buildReferenceLabels,
    buildReferenceShapes,
    describeReference,
} from '../layout/reference-lines';
import { timeAxis, toLocalDateTime } from '../layout/time-format';
import { buildValueFormat, countDecimalsInData } from '../layout/value-format';
import { ChartInteractionController, HOVER_CHANGE, type HoverView } from './chart-interaction.controller';
import { ReferenceTagsController, REFERENCES_CHANGE } from './reference-tags.controller';
import { VlChartReference } from './vl-chart-reference.component';
import { categoricalPalette, contextColor, type PaletteColor } from './vl-chart.palette';

registerWebComponents([VlAlert, VlChartReference, VlIconComponent, VlLinkComponent, VlTextComponent]);

const LOADING_MESSAGE = 'Grafiek wordt geladen.';
const EMPTY_MESSAGE = 'Geen gegevens voor deze selectie.';
const ERROR_MESSAGE = 'Deze grafiek kan nu niet getoond worden.';
export const SOURCE_LABEL = 'Bron:';
export const OPEN_DATA_LABEL = 'Vlaamse Open Data';
export const OPEN_DATA_HREF = 'https://www.vlaanderen.be/digitaal-vlaanderen/onze-diensten-en-platformen/open-data';
const CHART_ROLE_DESCRIPTION = 'grafiek';
const KEYBOARD_HINT = 'Gebruik de pijltjestoetsen links en rechts om de waarden te lezen.';
const REFERENCE_DESCRIPTION_LABEL = 'Referentielijn';
/** Afstand in px tussen de verticale lijn van de hover en de tooltip. */
const TOOLTIP_GAP = 12;
/** Hoe doorzichtig de andere lijnen worden als de muis er één aanwijst. */
const FADED_OPACITY = 0.25;
/** Afstand in px tussen de tooltip en de boven- of onderrand van de grafiek, zodat hij de nullijn vrijlaat. */
const TOOLTIP_INSET = 8;

/** Wat Plotly na het tekenen op het element zet: de traces en de layout zoals getekend. */
type DrawnPlot = HTMLElement & { data?: { meta?: unknown }[]; layout?: { annotations?: Partial<Annotations>[] } };

/** Basislaag voor elk grafiektype. Hier wordt de data verwerkt, de state
 *  bepaald en toont wat bij die toestand hoort.
 *  Een grafiektype (bv. VlChartLine) erft dit en vult later alleen in wat eigen is aan dat type. */
export abstract class VlChart extends BaseLitElement {
    static get styles(): CSSResult[] {
        return [vlChartFluxStyles];
    }

    // --- properties
    /** Het model om te tekenen. Alleen via JavaScript (`.data=${model}`): een object past niet in een attribuut.
     *  Zonder `.data` tekent de grafiek de data van de dichtstbijzijnde `vl-data-source`. */
    @property({ attribute: false }) data?: ChartModel;

    // --- attributes
    /** De naam van een reeks om uit te lichten: in kleur en dikker, de andere in grijs. */
    @property() highlight = '';
    /** Zonder dit vervagen de andere lijnen als de muis een lijn aanwijst. */
    @property({ type: Boolean, attribute: 'disable-hover-fade' }) disableHoverFade = false;

    // --- states and fields
    /** Wat de grafiek nu kan tonen. Begint op 'loading': zolang er geen data is wachten we. */
    @state() protected dataState: DataState = { status: 'loading' };
    @query('.plot') private plotElement!: HTMLDivElement;
    /** Het model dat Plotly nu toont; blijft staan tijdens herladen (isReloading). */
    #drawnModel: ChartModel | null = null;
    /** De data van de dichtstbijzijnde `vl-data-source`, voor als de grafiek geen eigen `.data` krijgt. */
    #source = new ContextConsumer(this, { context: sourceContext, subscribe: true });
    /** Tekent opnieuw als de container van maat verandert; Plotly krijgt een vaste breedte en volgt niet vanzelf. */
    #resizeObserver = new ResizeObserver(() => this.#draw());
    /** De referentielijnen uit de `vl-chart-reference`-tags in de grafiek. */
    #referenceTags = new ReferenceTagsController(this);
    /** Waarden lezen met muis, toetsenbord of tik: de tooltip en wat de schermlezer voorleest. */
    #interaction = new ChartInteractionController(this, {
        readModel: () => this.model,
        readPlotElement: () => this.plotElement,
        readSeriesColor: (seriesIndex) => this.seriesColor(seriesIndex),
        readHighlightedIndex: () => this.highlightedIndex,
        isHoverFadeDisabled: () => this.disableHoverFade,
    });

    connectedCallback(): void {
        super.connectedCallback();
        // Bij de eerste keer bestaat .plot pas na de eerste render.
        this.updateComplete.then(() => this.#resizeObserver.observe(this.plotElement));
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.#resizeObserver.disconnect();
        Plotly.purge(this.plotElement); // ruimt de listeners en het geheugen van Plotly op
        this.#drawnModel = null;
    }

    // Lit roept willUpdate op vóór render: de plek om afgeleide waarden te berekenen, zonder extra rendercyclus.
    // https://lit.dev/docs/components/lifecycle/#willupdate
    protected willUpdate(changed: PropertyValues<this>): void {
        const sourceState = this.#source.value?.dataState;
        if (changed.has('data') && this.data) {
            this.#showDataState(classifyDataState(this.data));
        } else if (!this.data && sourceState && sourceState !== this.dataState) {
            // De bron heeft de toestand al bepaald (laden, fout, ...); de grafiek neemt ze over.
            this.#showDataState(sourceState);
        }
    }

    #showDataState(dataState: DataState): void {
        this.dataState = dataState;
        this.#interaction.reset();
    }

    /** Het model als er iets te tekenen valt. */
    protected get model(): ChartModel | null {
        return findModel(this.dataState);
    }

    /** Laadt er nieuwe data terwijl er al iets getekend is (bv. een andere periode), dan blijft de oude tekening
     *  gedimd staan: geen lege plek die de pagina doet verspringen. */
    protected get isReloading(): boolean {
        return this.dataState.status === 'loading' && this.#drawnModel !== null;
    }

    /** Wat eenheid en bron tonen: het model, of tijdens herladen dat van de tekening die blijft staan. */
    protected get shownModel(): ChartModel | null {
        return this.model ?? (this.isReloading ? this.#drawnModel : null);
    }

    // updated loopt ná render.
    protected updated(changed: PropertyValues): void {
        if (changed.has('dataState') && this.dataState.status === 'error') {
            console.warn(`<${this.localName}>: ${this.dataState.problems.join(' ')}`);
        }
        if (changed.has('dataState') || changed.has('highlight') || changed.has(REFERENCES_CHANGE)) {
            this.#draw();
            this.#warnAboutUnknownHighlight();
        }
        if (changed.has('dataState')) {
            this.dispatchEvent(createDataChangeEvent(this.dataState));
        }
        if (changed.has(HOVER_CHANGE)) {
            this.#fadeOtherSeries(this.#findFocusedSeriesIndex());
        }
    }

    /** De index van de uitgelichte reeks, of -1 (niets uitgelicht, of geen reeks met die naam). */
    protected get highlightedIndex(): number {
        if (!this.highlight || !this.model) return -1;
        return this.model.series.findIndex((series) => series.name === this.highlight);
    }

    #warnAboutUnknownHighlight(): void {
        if (this.highlight && this.model && this.highlightedIndex === -1) {
            console.warn(`<${this.localName}>: reeks '${this.highlight}' om uit te lichten bestaat niet.`);
        }
    }

    /** De reeks waar de andere lijnen voor vervagen, of -1. Uitlichten wint: dan vervaagt er niets. */
    #findFocusedSeriesIndex(): number {
        if (this.highlightedIndex !== -1) return -1;
        const hover = this.#interaction.hover;
        if (!hover) return -1;
        return hover.emphasizedSeriesIndex;
    }

    /** De andere lijnen en hun labels doorzichtig, zodat de aangewezen lijn eruit springt (POIROT). Rechtstreeks op de
     *  svg en niet via `Plotly.restyle`: dat tekent alles opnieuw, bij elke beweging van de muis. Plotly zet de
     *  traces in de volgorde van `data`, en de labels met hun index in `data-index`. */
    #fadeOtherSeries(focused: number): void {
        const plot = this.plotElement as DrawnPlot;
        const opacityOf = (seriesIndex: number) =>
            focused === -1 || seriesIndex === focused ? '' : String(FADED_OPACITY);
        plot.querySelectorAll<SVGGElement>('.scatterlayer .trace').forEach((trace, index) => {
            const seriesIndex = plot.data?.[index]?.meta;
            if (typeof seriesIndex === 'number') trace.style.opacity = opacityOf(seriesIndex);
        });
        plot.querySelectorAll<SVGGElement>('g.annotation').forEach((label) => {
            const seriesIndex = findLabelSeriesIndex(plot.layout?.annotations?.[Number(label.dataset.index)]);
            if (seriesIndex !== -1) label.style.opacity = opacityOf(seriesIndex); // een referentielabel blijft
        });
    }

    render(): TemplateResult {
        return html`
            ${this.#renderStateMessage()} ${this.#renderUnit()} ${this.renderLegend()}
            <div class=${classMap({ 'plot-frame': true, 'is-reloading': this.isReloading })}>
                <div
                    class="plot"
                    ?hidden=${!this.hasSomethingToDraw && !this.isReloading}
                    aria-busy=${this.isReloading ? 'true' : nothing}
                    tabindex=${this.hasSomethingToDraw ? 0 : nothing}
                    role="group"
                    aria-roledescription=${CHART_ROLE_DESCRIPTION}
                    aria-label=${(this.model && buildAxisTitle(this.model.meta.y)) || nothing}
                    aria-describedby=${this.#referenceTags.references.length > 0 ? 'keyboard-hint references' : 'keyboard-hint'}
                    @keydown=${this.#interaction.onKeydown}
                    @pointerdown=${this.#interaction.onPointerDown}
                    @pointerup=${this.#interaction.onPointerUp}
                    @blur=${this.#interaction.onBlur}
                ></div>
                ${this.#renderHover()}
            </div>
            <p id="keyboard-hint" hidden>${KEYBOARD_HINT}</p>
            ${this.#renderReferenceDescription()}
            <p class="visually-hidden" aria-live="polite">${this.#interaction.announcement}</p>
            ${this.#renderSource()}
        `;
    }

    /** Wat de waarden betekenen, horizontaal boven de grafiek (zoals Datawrapper en POIROT): leest makkelijker
     *  dan een gedraaide astitel. */
    #renderUnit(): TemplateResult | typeof nothing {
        const model = this.shownModel;
        const unit = model && buildAxisTitle(model.meta.y);
        return unit ? html`<p class="unit">${unit}</p>` : nothing;
    }

    /** Waar de data vandaan komt, onder de grafiek: de bron links, het open-datakenmerk rechts (zoals POIROT).
     *  Alleen als er iets getekend is. */
    #renderSource(): TemplateResult | typeof nothing {
        const meta = this.shownModel?.meta;
        if (!meta) return nothing;
        const source = meta.sourceHref
            ? html`<vl-link href=${meta.sourceHref} external small>${meta.source}</vl-link>`
            : meta.source;
        return html`<div class="source-row">
            <p class="source"><vl-text annotation small>${SOURCE_LABEL} ${source}</vl-text></p>
            ${meta.isOpenData ? this.#renderOpenDataMark() : nothing}
        </div>`;
    }

    /** Gewone <a>: vl-link heeft geen grijze variant zonder linkstijl. */
    #renderOpenDataMark(): TemplateResult {
        return html`<p class="open-data-mark">
            <a href=${OPEN_DATA_HREF}>
                <vl-text annotation small><vl-icon icon="vlaanderen" right-margin></vl-icon>${OPEN_DATA_LABEL}</vl-text>
            </a>
        </p>`;
    }

    /** Boven de grafiek, in HTML: Plotly's eigen tooltip laat zich niet uitlijnen of plaatsen. Verborgen voor de
     *  schermlezer, die dezelfde waarden hoort via `announcement`. Laat de muis door naar Plotly. */
    #renderHover(): TemplateResult | typeof nothing {
        const hover = this.#interaction.hover;
        if (!hover) return nothing;
        const { x, area } = hover;
        return html`<div class="hover" aria-hidden="true">
            <span
                class="crosshair"
                style=${styleMap({ left: `${x}px`, top: `${area.top}px`, height: `${area.height}px` })}
            ></span>
            ${hover.dots.map(
                (dot) =>
                    html`<span
                        class=${this.#isFaded(hover, dot.seriesIndex) ? 'hover-dot is-faded' : 'hover-dot'}
                        style=${styleMap({ left: `${x}px`, top: `${dot.y}px`, backgroundColor: dot.color })}
                    ></span>`,
            )}
            <div class="tooltip" style=${styleMap(this.#buildTooltipPosition(hover))}>
                <p class="tooltip-title">
                    <strong>${hover.title}</strong>
                    ${hover.unit ? html`<span class="tooltip-unit">${hover.unit}</span>` : nothing}
                </p>
                <table>
                    ${hover.rows.map(
                        (row) =>
                            html`<tr
                                class=${classMap({
                                    'no-value': row.value === null,
                                    'is-emphasized': row.seriesIndex === hover.emphasizedSeriesIndex,
                                })}
                            >
                                <td>
                                    <span
                                        class="swatch"
                                        style=${styleMap({ backgroundColor: this.seriesColor(row.seriesIndex) })}
                                    ></span
                                    >${row.name}
                                </td>
                                <td class="tooltip-value">${row.label}</td>
                            </tr>`,
                    )}
                </table>
            </div>
        </div>`;
    }

    /** De tooltip naast de verticale lijn, aan de kant met de meeste plaats, en boven- of onderaan de inner chart.
     *  Gemeten vanaf de rand waar hij tegenaan staat, zodat zijn eigen breedte en hoogte er niet toe doen. */
    #buildTooltipPosition(hover: HoverView): StyleInfo {
        const { x, area, plotSize } = hover;
        const position: StyleInfo = {};

        if (hover.isLeftOfX) {
            position.right = `${plotSize.width - x + TOOLTIP_GAP}px`;
        } else {
            position.left = `${x + TOOLTIP_GAP}px`;
        }

        if (hover.isInLowerHalf) {
            const innerChartBottom = area.top + area.height;
            position.bottom = `${plotSize.height - innerChartBottom + TOOLTIP_INSET}px`;
        } else {
            position.top = `${area.top + TOOLTIP_INSET}px`;
        }

        return position;
    }

    #isFaded(hover: HoverView, seriesIndex: number): boolean {
        const focused = hover.emphasizedSeriesIndex;
        return this.highlightedIndex === -1 && focused !== -1 && seriesIndex !== focused;
    }

    /** De referentielijnen als tekst, voor wie de grafiek niet ziet: "Referentielijn: WHO-advieswaarde: 5 µg/m³." */
    #renderReferenceDescription(): TemplateResult | typeof nothing {
        const references = this.#referenceTags.references;
        if (references.length === 0) return nothing;
        const unit = this.model?.meta.y.unit;
        const lines = references.map((reference) => describeReference(reference, unit));
        return html`<p id="references" hidden>${REFERENCE_DESCRIPTION_LABEL}: ${lines.join('; ')}.</p>`;
    }

    /** Alleen met 'data' of 'partial' valt er iets te tekenen. */
    protected get hasSomethingToDraw(): boolean {
        return this.model !== null;
    }

    #renderStateMessage(): TemplateResult | typeof nothing {
        switch (this.dataState.status) {
            case 'loading':
                return html`<div class="state-message" role="status">
                    ${this.isReloading ? nothing : html`<div class="skeleton" aria-hidden="true"></div>`}
                    <span class="visually-hidden">${LOADING_MESSAGE}</span>
                </div>`;
            case 'empty':
                return html`<div class="state-message"><vl-alert type="info">${EMPTY_MESSAGE}</vl-alert></div>`;
            case 'error':
                return html`<div class="state-message"><vl-alert type="error">${ERROR_MESSAGE}</vl-alert></div>`;
            default:
                return nothing;
        }
    }

    // --- alternatives
    /** De grafiek als PNG, met kop, eenheid en bron erbij, zodat ze ook los van de pagina te begrijpen is.
     *  `null` als er niets getekend is. */
    async buildPng(title = ''): Promise<Blob | null> {
        const model = this.model;
        if (!model) return null;
        const { clientWidth: width, clientHeight: height } = this.plotElement;
        const url = await Plotly.toImage(this.plotElement, { format: 'png', width, height, scale: PNG_SCALE });
        return buildPngWithFurniture(
            { url, width, height },
            {
                title,
                unit: buildAxisTitle(model.meta.y) ?? '',
                source: `${SOURCE_LABEL} ${model.meta.source}`,
                openDataLabel: model.meta.isOpenData ? OPEN_DATA_LABEL : '',
            },
            readChartSpec(this.plotElement),
        );
    }

    // --- hooks for chart types
    /** Een grafiektype mag een legende boven de grafiek zetten, bv. als er naast de lijnen geen plaats is voor labels.
     *  Standaard geen. */
    protected renderLegend(): TemplateResult | typeof nothing {
        return nothing;
    }

    /** De breedte van de plot in px, om een layout op de beschikbare ruimte af te stemmen. */
    protected get plotWidth(): number {
        return this.plotElement.clientWidth;
    }

    /** Draait vóór de layout gebouwd wordt, met de maat van de plot al bekend: de plek om te beslissen wat de layout
     *  nodig heeft, bv. directe labels of een legende. Zo blijven `buildMargin` en `buildChartLayout` zuivere
     *  bouwers die niets veranderen. Standaard niets. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- de parameters zijn het contract van de hook
    protected beforeLayout(_model: ChartModel, _spec: ChartSpec): void {}

    /** Een grafiektype mag de marge aanpassen, bv. meer ruimte rechts voor directe labels. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- de parameters zijn het contract van de hook
    protected buildMargin(_model: ChartModel, _spec: ChartSpec): ChartMargin {
        return chartDefaults.margin;
    }

    /** Wat een grafiektype aan de layout toevoegt, bv. directe labels. Standaard niets. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- de parameters zijn het contract van de hook
    protected buildChartLayout(_model: ChartModel, _spec: ChartSpec): Partial<Layout> {
        return {};
    }

    /** Draait nadat Plotly getekend heeft, als er pixelposities bestaan (zoals Lit's `updated()` na `render()`).
     *  Mag de tekening alleen bijsturen op basis van wat gemeten is, bv. labels uit elkaar zetten. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- de parameters zijn het contract van de hook
    protected afterDraw(_plotElement: HTMLElement, _spec: ChartSpec): void {}

    /** De kleur van de lijn van reeks `seriesIndex`, ook voor de stippen en staaltjes van de hover. */
    protected seriesColor(seriesIndex: number): string {
        return this.#paletteColorOf(seriesIndex).line;
    }

    /** De kleur van tekst over reeks `seriesIndex`, bv. het directe label. */
    protected seriesLabelColor(seriesIndex: number): string {
        return this.#paletteColorOf(seriesIndex).label;
    }

    /** De kleur op de plaats (slot) van de reeks in het palet: reeks i krijgt kleur i, in de volgorde van de data.
     *  Grijs (context) als er een andere reeks uitgelicht is. */
    #paletteColorOf(slot: number): PaletteColor {
        const highlightedIndex = this.highlightedIndex;
        const isContext = highlightedIndex !== -1 && slot !== highlightedIndex;
        if (isContext) return contextColor;
        return categoricalPalette[slot % categoricalPalette.length];
    }

    /** Wat het grafiektype tekent: lijnen, staven, ... Elk type moet dit invullen. */
    protected abstract buildTraces(model: ChartModel, spec: ChartSpec): Partial<PlotData>[];

    // --- drawing
    /** Vaste volgorde voor elk grafiektype (Template Method): meten, spec, beslissen, traces, marge, assen, eigen layout,
     *  tekenen, bijsturen.
     *  Zoals in d3: svg op de maat van de container, inner chart verschoven met de marge. */
    #draw(): void {
        const model = this.model;
        if (!model) return;
        this.#drawnModel = model;
        const spec = readChartSpec(this.plotElement);
        this.beforeLayout(model, spec);
        const traces = this.buildTraces(model, spec);
        const valueScale = this.#buildValueScale(model);
        const layout = this.#buildLayout(model, spec, valueScale);
        this.#interaction.startNewDrawing(findTooltipHalf(model, valueScale.range));
        Plotly.react(this.plotElement, traces, layout, { displayModeBar: false }).then(() => {
            this.#interaction.bindToPlot();
            this.afterDraw(this.plotElement, spec);
        });
    }

    /** Bereik en stap van de waarde-as: de data en de referentielijnen moeten erin passen. */
    #buildValueScale(model: ChartModel): ValueScale {
        const referenceValues = this.#referenceTags.references.map((reference) => reference.value);
        return buildValueScale(model, referenceValues);
    }

    /** De volledige Plotly-layout: maat, marge, font, beide assen en wat het grafiektype toevoegt. */
    #buildLayout(model: ChartModel, spec: ChartSpec, valueScale: ValueScale): Partial<Layout> {
        const margin = this.buildMargin(model, spec);
        const chartLayout = this.buildChartLayout(model, spec);
        const references = this.#referenceTags.references;
        return {
            width: this.plotElement.clientWidth,
            height: this.plotElement.clientHeight,
            margin: { t: margin.top, r: margin.right, b: margin.bottom, l: margin.left },
            font: { family: spec.fontFamily, size: spec.fontSize, color: spec.textColor },
            // De muis kiest de dichtstbijzijnde x, waar ze ook staat (-1: geen maximumafstand); de tooltip toont alle
            // reeksen op die x (ChartInteractionController).
            hovermode: 'x',
            hoverdistance: -1,
            separators: chartDefaults.separators,
            xaxis: this.#buildPositionAxis(model, spec),
            yaxis: this.#buildValueAxis(model, spec, valueScale),
            ...chartLayout,
            // Na de annotaties van het grafiektype: hun index (bv. directe labels) blijft dezelfde.
            annotations: [
                ...(chartLayout.annotations ?? []),
                ...buildReferenceLabels(references, model.meta.y.unit, spec.referenceColor, spec.backgroundColor),
            ],
            shapes: [
                ...buildEdgeGridLines(valueScale.range, spec.gridColor),
                ...(chartLayout.shapes ?? []),
                ...buildReferenceShapes(references, spec.referenceColor),
            ],
        };
    }

    /** Positie-as: geen raster, korte ticks buiten de grafiek. De titel klein en grijs zoals de ticks, en niet op een
     *  tijdas: daar zeggen de datums zelf al wat de as is. */
    #buildPositionAxis(model: ChartModel, spec: ChartSpec): Partial<Layout['xaxis']> {
        const range = buildPositionRange(model);
        const isTime = model.meta.x.type === 'time';
        return {
            ...(isTime ? timeAxis : {}),
            // Op een tijdas in dezelfde lokale tijd als de traces (zie toPlotlyX).
            range: isTime && range ? range.map(toLocalDateTime) : range,
            automargin: true,
            showgrid: false,
            showline: false,
            zeroline: false,
            ticks: 'outside',
            ticklen: chartDefaults.tickLength,
            tickcolor: spec.axisColor,
            tickfont: { color: spec.axisColor },
            ticklabelstandoff: chartDefaults.positionTickLabelStandoff,
            title: {
                text: isTime ? undefined : buildAxisTitle(model.meta.x),
                font: { size: spec.fontSize, color: spec.axisColor },
                standoff: chartDefaults.positionTitleStandoff,
            },
        };
    }

    /** Waarde-as: raster en een nadrukkelijke nullijn; getallen voluit met duizendtal (1.250, niet 1250 of 1.25k).
     *  De stap tussen de rasterlijnen kiezen we zelf (buildValueScale): Plotly neemt er anders tot tien. */
    #buildValueAxis(model: ChartModel, spec: ChartSpec, { range, step }: ValueScale): Partial<Layout['yaxis']> {
        return {
            range,
            tick0: 0,
            dtick: step,
            automargin: true,
            showline: false,
            gridcolor: spec.gridColor,
            zeroline: true,
            zerolinecolor: spec.axisColor,
            zerolinewidth: chartDefaults.zeroLineWidth,
            exponentformat: 'none',
            separatethousands: true,
            hoverformat: buildValueFormat(countDecimalsInData(model)),
            tickfont: { color: spec.axisColor },
            ticklabelstandoff: chartDefaults.valueTickLabelStandoff,
        };
    }
}
