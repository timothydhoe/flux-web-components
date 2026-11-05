import { BaseLitElement, registerWebComponents, webComponent } from '@domg-wc/common';
import { VlIconComponent } from '@domg-wc/components/atom';
import { ContextConsumer } from '@lit/context';
import { CSSResult, html, nothing, TemplateResult } from 'lit';
import { createPeriodChangeEvent } from '../events/period-change.event';
import { joinFigureZone } from '../figure/figure-zones';
import {
    describePeriod,
    isLatestPeriod,
    PERIOD_DURATION_LABELS,
    PERIOD_DURATIONS,
    shiftPeriod,
    startOfDay,
    type Period,
    type PeriodDuration,
} from './period';
import { sourceContext } from './source-context';
import { vlDataPeriodFluxStyles } from './vl-data-period.flux-css';

registerWebComponents([VlIconComponent]);

const LEGEND = 'Periode';
const PREVIOUS_LABEL = 'Vorige periode';
const NEXT_LABEL = 'Volgende periode';
const TODAY_LABEL = 'Vandaag';

/** Kiest de periode van de dichtstbijzijnde `vl-data-source`: de lengte (24 uur, 7 dagen, ...) en welke dagen,
 *  met vorige, volgende en vandaag. Verandert de weergave, dus een control; in een figuur staat het bij de controls.
 *  De lengtes zijn radioknoppen: één keuze uit vier, met de pijltjestoetsen te doorlopen zoals elke radiogroep. */
@webComponent('vl-data-period')
export class VlDataPeriod extends BaseLitElement {
    static get styles(): CSSResult[] {
        return [vlDataPeriodFluxStyles];
    }

    // --- states and fields
    #source = new ContextConsumer(this, { context: sourceContext, subscribe: true });

    connectedCallback(): void {
        super.connectedCallback();
        joinFigureZone(this, 'controls');
    }

    render(): TemplateResult | typeof nothing {
        const period = this.#source.value?.period;
        if (!period) return nothing;
        const isLatest = isLatestPeriod(period, new Date());
        return html`<div class="period">
            <fieldset class="durations">
                <legend>${LEGEND}:</legend>
                ${PERIOD_DURATIONS.map((duration) => this.#renderDuration(duration, period))}
            </fieldset>
            <div class="days">
                <button type="button" class="step" aria-label=${PREVIOUS_LABEL} @click=${() => this.#shift(-1)}>
                    <vl-icon icon="nav-left"></vl-icon>
                </button>
                <span class="current" aria-live="polite">${describePeriod(period)}</span>
                <button
                    type="button"
                    class="step"
                    aria-label=${NEXT_LABEL}
                    ?disabled=${isLatest}
                    @click=${() => this.#shift(1)}
                >
                    <vl-icon icon="nav-right"></vl-icon>
                </button>
                <button type="button" class="today" ?disabled=${isLatest} @click=${this.#goToToday}>
                    ${TODAY_LABEL}
                </button>
            </div>
        </div>`;
    }

    #renderDuration(duration: PeriodDuration, period: Period): TemplateResult {
        return html`<label class="duration">
            <input
                type="radio"
                name="duration"
                value=${duration}
                .checked=${duration === period.duration}
                @change=${() => this.#requestPeriod({ duration, end: period.end })}
            />
            <span>${PERIOD_DURATION_LABELS[duration]}</span>
        </label>`;
    }

    #shift(steps: number): void {
        const period = this.#source.value?.period;
        if (period) this.#requestPeriod(shiftPeriod(period, steps, new Date()));
    }

    #goToToday(): void {
        const period = this.#source.value?.period;
        if (period) this.#requestPeriod({ duration: period.duration, end: startOfDay(new Date()) });
    }

    #requestPeriod(period: Period): void {
        this.dispatchEvent(createPeriodChangeEvent(period));
    }
}
