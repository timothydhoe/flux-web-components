import { webComponent } from '@domg-wc/common';
import { html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import Plotly from 'plotly.js-basic-dist-min';
import type { Layout, PlotData } from 'plotly.js';
import type { ChartModel } from '../../models/chart.model';
import {
    buildDirectLabels,
    buildDirectLabelText,
    DIRECT_LABEL_OFFSET,
    HIGHLIGHTED_LABEL_WEIGHT,
    isTooWideForDirectLabels,
} from '../../layout/direct-labels';
import { buildLineTraces } from '../../layout/line-traces';
import { countDecimalsInData } from '../../layout/value-format';
import { REFERENCE_ANNOTATION_NAME } from '../../layout/reference-lines';
import { calculateLabelShifts, type LabelPosition } from '../../layout/spread-labels';
import { measureTextWidth } from '../measure-text';
import { VlChart } from '../vl-chart.component';
import { chartDefaults, type ChartMargin } from '../vl-chart.defaults';
import type { ChartSpec } from '../chart-spec';

/** Witruimte tussen de vakken van twee directe labels; elk vak heeft zelf al wat binnenmarge rond de tekst. */
const LABEL_GAP = 2;

/** Lijngrafiek: één lijn per reeks, met de naam rechts aan het einde van de lijn in plaats van een legende.
 *  De rest (toestand, marge, assen) komt uit VlChart. */
@webComponent('vl-chart-line')
export class VlChartLine extends VlChart {
    /** Een legende boven de grafiek in plaats van labels naast de lijnen; per tekening bepaald in beforeLayout. */
    @state() private isLegendShown = false;

    protected buildTraces(model: ChartModel, spec: ChartSpec): Partial<PlotData>[] {
        return buildLineTraces(
            model,
            this.#colorsOf(model, (index) => this.seriesColor(index)),
            spec.backgroundColor,
            this.highlightedIndex,
        );
    }

    #colorsOf(model: ChartModel, colorOf: (index: number) => string): string[] {
        return model.series.map((_, index) => colorOf(index));
    }

    /** Eén taak: beslissen of er een legende komt in plaats van directe labels. De state verandert hier en nergens
     *  anders; de bouwers hieronder lezen ze alleen. */
    protected beforeLayout(model: ChartModel, spec: ChartSpec): void {
        this.isLegendShown = this.#areDirectLabelsTooWide(model, spec);
    }

    /** Nemen de labels te veel van de breedte van de plot in, dan passen ze niet naast de lijnen. */
    #areDirectLabelsTooWide(model: ChartModel, spec: ChartSpec): boolean {
        const labelsWidth = DIRECT_LABEL_OFFSET + this.#measureWidestDirectLabel(model, spec);
        return isTooWideForDirectLabels(labelsWidth, this.plotWidth);
    }

    /** Met een legende de standaardmarge; anders rechts zoveel ruimte als het breedste label vraagt. */
    protected buildMargin(model: ChartModel, spec: ChartSpec): ChartMargin {
        if (this.isLegendShown) return chartDefaults.margin;
        const widest = Math.ceil(this.#measureWidestDirectLabel(model, spec));
        const right = DIRECT_LABEL_OFFSET + widest + chartDefaults.margin.right;
        return { ...chartDefaults.margin, right };
    }

    /** De breedte in px van het breedste directe label: naam, spatie en de vette laatste waarde. Het uitgelichte
     *  label is helemaal vet en dus breder. 0 als geen enkele reeks een label heeft. */
    #measureWidestDirectLabel(model: ChartModel, spec: ChartSpec): number {
        const decimals = countDecimalsInData(model);
        const widths = model.series.map((series, index) => {
            const label = buildDirectLabelText(series, model.meta.x.type, decimals);
            if (!label) return 0;
            const isHighlighted = index === this.highlightedIndex;
            const nameWeight = isHighlighted ? HIGHLIGHTED_LABEL_WEIGHT : undefined;
            const nameWidth = measureTextWidth(`${label.name} `, spec, nameWeight);
            const valueWidth = measureTextWidth(label.value, spec, HIGHLIGHTED_LABEL_WEIGHT);
            return nameWidth + valueWidth;
        });
        return Math.max(0, ...widths);
    }

    protected buildChartLayout(model: ChartModel): Partial<Layout> {
        const labelColors = this.#colorsOf(model, (index) => this.seriesLabelColor(index));
        return {
            showlegend: false,
            annotations: this.isLegendShown
                ? []
                : buildDirectLabels(model, labelColors, countDecimalsInData(model), this.highlightedIndex),
        };
    }

    /** Dezelfde inhoud als de directe labels: per reeks haar kleur, naam en vette laatste waarde. */
    protected renderLegend(): TemplateResult | typeof nothing {
        const model = this.shownModel; // blijft staan tijdens herladen, net als de tekening
        if (!this.isLegendShown || !model) return nothing;
        const decimals = countDecimalsInData(model);
        return html`<ul class="legend">
            ${model.series.map((series, index) => {
                const label = buildDirectLabelText(series, model.meta.x.type, decimals);
                return html`<li class=${classMap({ 'is-highlighted': index === this.highlightedIndex })}>
                    <span class="swatch" style=${styleMap({ backgroundColor: this.seriesColor(index) })}></span
                    >${series.name}${label ? html` <b>${label.value}</b>` : nothing}
                </li>`;
            })}
        </ul>`;
    }

    /** Labels van lijnen die dicht bij elkaar eindigen, overlappen; zet ze uit elkaar in één relayout. */
    protected afterDraw(plotElement: HTMLElement): void {
        const labels = this.#measureLabels(plotElement);
        if (labels.length < 2) return;
        // Gemeten i.p.v. afgeleid van de lettergrootte: het vak van een annotatie is hoger dan de tekst.
        const spacing = Math.max(...labels.map((label) => label.height)) + LABEL_GAP;
        const shifts = calculateLabelShifts(labels, spacing);
        if (shifts.size === 0) return;
        Plotly.relayout(plotElement, this.#buildLabelShiftUpdate(shifts));
    }

    /** Plotly verwacht één sleutel per gewijzigde annotatie, bv. `annotations[2].yshift`. */
    #buildLabelShiftUpdate(shifts: Map<number, number>): Record<string, number> {
        const update: Record<string, number> = {};
        for (const [index, shift] of shifts) {
            update[`annotations[${index}].yshift`] = shift;
        }
        return update;
    }

    /** Waar het midden van elk label nu staat (in px vanaf de bovenkant van de plot) en hoe hoog het is.
     *  Plotly zet de index van de annotatie in `data-index`. */
    #measureLabels(plotElement: HTMLElement): (LabelPosition & { height: number })[] {
        const plotTop = plotElement.getBoundingClientRect().top;
        const annotations = (plotElement as HTMLElement & { layout?: Partial<Layout> }).layout?.annotations ?? [];
        const directLabels = Array.from(plotElement.querySelectorAll<SVGGElement>('g.annotation')).filter(
            (label) => annotations[Number(label.dataset.index)]?.name !== REFERENCE_ANNOTATION_NAME,
        );
        return directLabels.map((label) => {
            const { top, height } = label.getBoundingClientRect();
            return { index: Number(label.dataset.index), y: top + height / 2 - plotTop, height };
        });
    }
}
