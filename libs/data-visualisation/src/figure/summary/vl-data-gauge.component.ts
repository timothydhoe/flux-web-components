import { registerWebComponents, webComponent } from '@domg-wc/common';
import { css, CSSResult, html, nothing, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ReferenceTagsController } from '../../chart/reference-tags.controller';
import { VlChartReference } from '../../chart/vl-chart-reference.component';
import { appendUnit, countDecimalsInValue, formatValue } from '../../layout/value-format';
import type { ChartModel } from '../../models/chart.model';
import { buildGaugeView, type Comparison, type GaugeReference } from './gauge';
import { findLatestValue } from './latest-value';
import { VlDataSummary } from './vl-data-summary';

registerWebComponents([VlChartReference]);

const DEFAULT_LABEL = 'Laatste meting';
const COMPARISON_LABELS: Record<Comparison, string> = { above: 'Boven', below: 'Onder', equal: 'Gelijk aan' };

/** In woorden, bv. "Onder Voorzorgswaarde (0,4 µT)". */
const describeComparison = (reference: GaugeReference, unit?: string) => {
    const name = reference.label ? `${reference.label} ` : '';
    return `${COMPARISON_LABELS[reference.comparison]} ${name}(${formatOwnDecimals(reference.value, unit)})`;
};

/** Een waarde met haar eigen decimalen, bv. de rand van de meter of een norm: 100 is geen 100,000. */
const formatOwnDecimals = (value: number, unit?: string) => formatValue(value, countDecimalsInValue(value), unit);

/** De laatste waarde als tegel, met een meter die toont hoe ze zich verhoudt tot een norm of streefwaarde:
 *  `<vl-data-gauge><vl-chart-reference value="0.4" label="Voorzorgswaarde"></vl-chart-reference></vl-data-gauge>`.
 *  Of de waarde boven of onder de norm ligt, staat er in woorden bij; de kleur alleen zegt het nooit. */
@webComponent('vl-data-gauge')
export class VlDataGauge extends VlDataSummary {
    static get styles(): CSSResult[] {
        return [
            ...super.styles,
            css`
                .meter {
                    margin-top: var(--vl-spacing--xsmall);
                }

                /* Gevuld en leeg uit dezelfde kleur, zodat de hele balk als één meter leest. */
                .track {
                    position: relative;
                    height: 0.8rem;
                    border-radius: 0.4rem;
                    background-color: var(--vl-color--action-200);
                }

                .fill {
                    height: 100%;
                    border-radius: inherit;
                    background-color: var(--vl-color--action);
                }

                /* De norm: een streep over de balk heen, zichtbaar op gevuld en leeg. */
                .reference {
                    position: absolute;
                    top: -0.4rem;
                    bottom: -0.4rem;
                    width: 2px;
                    transform: translateX(-1px);
                    background-color: var(--vl-color--grey-900);
                }

                .scale {
                    display: flex;
                    justify-content: space-between;
                    margin-top: var(--vl-spacing--xxsmall);
                    font-size: var(--vl-font-size--xsmall);
                    color: var(--vl-color--text-subtle);
                }

                .comparisons {
                    margin: var(--vl-spacing--xxsmall) 0 0;
                    padding: 0;
                    list-style: none;
                    font-size: var(--vl-font-size--xsmall);
                }
            `,
        ];
    }

    // --- attributes
    /** Waar de meter eindigt, in de eenheid van de data. Zonder: een rond getal boven de waarde en de referenties. */
    @property({ type: Number }) max?: number;

    // --- states and fields
    /** De normen uit de `vl-chart-reference`-tags in de meter. */
    #referenceTags = new ReferenceTagsController(this);

    protected renderSummary(model: ChartModel): TemplateResult | typeof nothing {
        const latest = findLatestValue(model, this.series);
        if (!latest) return nothing;
        const { range, valueShare, references } = buildGaugeView(latest.value, this.#referenceTags.references, this.max);
        const unit = latest.unit;
        return html`${this.renderTile({
                label: this.buildTileLabel(model, this.label || DEFAULT_LABEL, latest.seriesName),
                valueLabel: latest.valueLabel,
                unit,
                positionLabel: latest.positionLabel,
            })}
            <div
                class="meter"
                role="meter"
                aria-labelledby="label"
                aria-valuemin=${range[0]}
                aria-valuemax=${range[1]}
                aria-valuenow=${Math.min(range[1], Math.max(range[0], latest.value))}
                aria-valuetext=${appendUnit(latest.valueLabel, unit)}
            >
                <div class="track">
                    <div class="fill" style=${styleMap({ width: `${valueShare * 100}%` })}></div>
                    ${references.map(
                        (reference) =>
                            html`<span
                                class="reference"
                                style=${styleMap({ left: `${reference.share * 100}%` })}
                            ></span>`,
                    )}
                </div>
                <div class="scale" aria-hidden="true">
                    <span>${formatOwnDecimals(range[0])}</span><span>${formatOwnDecimals(range[1])}</span>
                </div>
            </div>
            ${references.length > 0
                ? html`<ul class="comparisons">
                      ${references.map((reference) => html`<li>${describeComparison(reference, unit)}</li>`)}
                  </ul>`
                : nothing}`;
    }
}
