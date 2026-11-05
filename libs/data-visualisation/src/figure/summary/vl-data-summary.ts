import { BaseLitElement } from '@domg-wc/common';
import { ContextConsumer } from '@lit/context';
import { css, CSSResult, html, nothing, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { UNIT_SEPARATOR } from '../../layout/value-format';
import { findModel, type ChartModel, type DataState } from '../../models/chart.model';
import { sourceContext } from '../../source/source-context';
import { findControlVisibility, type ControlVisibility } from '../controls/control-visibility';
import { figureContext } from '../figure-context';

/** Wat een tegel toont: een label, een waarde groot met haar eenheid, en waar die waarde over gaat (wanneer of over
 *  welke periode). */
export type SummaryTile = { label: string; valueLabel: string; unit?: string; positionLabel: string };

/** Eén waarde uit de data, groot, als tegel: `vl-data-latest`, `vl-data-stat`, `vl-data-gauge`. Leest de data van
 *  de figuur waarin de tegel staat, anders van de dichtstbijzijnde `vl-data-source`; zo kan een tegel ook naast een
 *  grafiek staan. Tijdens het laden houdt de tegel zijn plaats; zonder data is hij er niet. */
export abstract class VlDataSummary extends BaseLitElement {
    static get styles(): CSSResult[] {
        return [
            css`
                :host {
                    display: block;
                }

                p {
                    margin: 0;
                }

                .label,
                .position {
                    font-size: var(--vl-font-size--xsmall);
                    color: var(--vl-color--text-subtle);
                }

                .value {
                    font-size: var(--vl-font-size--xxlarge);
                    font-weight: 500;
                    line-height: 1.2;
                }

                .unit {
                    font-size: var(--vl-font-size--small);
                    font-weight: normal;
                    color: var(--vl-color--text-subtle);
                }

                /* Tijdens het laden houdt de tegel zijn plaats, zodat de pagina niet verspringt. */
                .waiting {
                    visibility: hidden;
                }
            `,
        ];
    }

    // --- attributes
    /** De reeks om samen te vatten; standaard de eerste. */
    @property() series = '';
    /** Wat er boven de waarde staat; elke tegel heeft een eigen standaard. */
    @property() label = '';

    // --- states and fields
    #figure = new ContextConsumer(this, { context: figureContext, subscribe: true });
    #source = new ContextConsumer(this, { context: sourceContext, subscribe: true });

    render(): TemplateResult | typeof nothing {
        switch (this.#visibility) {
            case 'hidden':
                return nothing;
            case 'waiting':
                return this.#renderWaitingTile();
            case 'visible':
                return this.#renderSummaryOfModel();
        }
    }

    /** De toestand van de figuur waarin de tegel staat, anders van de dichtstbijzijnde bron. */
    get #dataState(): DataState | undefined {
        return this.#figure.value?.dataState ?? this.#source.value?.dataState;
    }

    /** Zonder figuur of bron is er niets om samen te vatten. */
    get #visibility(): ControlVisibility {
        const dataState = this.#dataState;
        if (!dataState) return 'hidden';
        return findControlVisibility(dataState);
    }

    /** Tijdens het laden een onzichtbare tegel met dezelfde maat, zodat de pagina niet verspringt. */
    #renderWaitingTile(): TemplateResult {
        const emptyLine = '\u00a0'; // een lege regel die toch hoogte heeft
        return html`<div class="waiting" aria-hidden="true">
            ${this.renderTile({ label: this.label || emptyLine, valueLabel: '0', positionLabel: emptyLine })}
        </div>`;
    }

    #renderSummaryOfModel(): TemplateResult | typeof nothing {
        const model = findModel(this.#dataState);
        if (!model) return nothing;
        return this.renderSummary(model);
    }

    /** De tegel voor dit model; `nothing` als er niets samen te vatten valt, bv. een reeks zonder waarden. */
    protected abstract renderSummary(model: ChartModel): TemplateResult | typeof nothing;

    /** Met meer dan één reeks zegt het label over welke reeks het gaat. */
    protected buildTileLabel(model: ChartModel, label: string, seriesName: string): string {
        return model.series.length > 1 ? `${label} · ${seriesName}` : label;
    }

    protected renderTile({ label, valueLabel, unit, positionLabel }: SummaryTile): TemplateResult {
        return html`<p class="label" id="label">${label}</p>
            <p class="value">${valueLabel}${unit ? html`${UNIT_SEPARATOR}<span class="unit">${unit}</span>` : nothing}</p>
            <p class="position">${positionLabel}</p>`;
    }
}
