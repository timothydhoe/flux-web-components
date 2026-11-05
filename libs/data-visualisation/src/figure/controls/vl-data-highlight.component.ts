import { BaseLitElement, registerWebComponents, webComponent } from '@domg-wc/common';
import { VlFormLabelComponent, VlSelectComponent, type SelectOption } from '@domg-wc/components/form';
import { ContextConsumer } from '@lit/context';
import { css, CSSResult, html, nothing, TemplateResult } from 'lit';
import { findModel } from '../../models/chart.model';
import { figureContext } from '../figure-context';
import { joinFigureZone } from '../figure-zones';
import { controlStyles, findControlVisibility } from './control-visibility';

registerWebComponents([VlFormLabelComponent, VlSelectComponent]);

const HIGHLIGHT_LABEL = 'Uitlichten';
const NONE_LABEL = 'Geen';

/** Kiest een reeks om uit te lichten in de visual van de figuur: die in kleur, de andere in grijs. Zo vertelt de
 *  lezer zelf het verhaal van één meetpunt, zonder dat de vergelijking met de andere verdwijnt. Alleen met twee of
 *  meer reeksen; met één valt er niets uit te lichten. */
@webComponent('vl-data-highlight')
export class VlDataHighlight extends BaseLitElement {
    static get styles(): CSSResult[] {
        return [
            controlStyles,
            css`
                .highlight {
                    display: flex;
                    align-items: baseline; /* de tekst van label en select op één lijn */
                    gap: var(--vl-spacing--xxsmall);
                }

                /* Naast de select in plaats van erboven: dan hoort de ruimte onder het label er niet. */
                vl-form-label {
                    --vl-form-label--margin-bottom: 0;
                    white-space: nowrap;
                }
            `,
        ];
    }

    // --- states and fields
    #figure = new ContextConsumer(this, { context: figureContext, subscribe: true });

    connectedCallback(): void {
        super.connectedCallback();
        joinFigureZone(this, 'controls');
    }

    render(): TemplateResult | typeof nothing {
        const figure = this.#figure.value;
        if (!figure) return nothing;
        const { dataState, visual } = figure;
        const visibility = findControlVisibility(dataState);
        const model = findModel(dataState);
        const names = model ? model.series.map((series) => series.name) : [];
        if (visibility === 'hidden' || (visibility === 'visible' && names.length < 2)) return nothing;
        const highlight = visual?.highlight ?? '';
        const options: SelectOption[] = [
            { value: '', label: NONE_LABEL, selected: highlight === '' },
            ...names.map((name) => ({ value: name, label: name, selected: name === highlight })),
        ];
        return html`<div class=${`highlight ${visibility}`} ?inert=${visibility === 'waiting'}>
            <vl-form-label for="highlight-select" label=${HIGHLIGHT_LABEL} light></vl-form-label>
            <vl-select
                id="highlight-select"
                label=${HIGHLIGHT_LABEL}
                not-deletable
                .options=${options}
                @vl-input=${this.#onInput}
            ></vl-select>
        </div>`;
    }

    #onInput(event: CustomEvent<{ value: string }>): void {
        const visual = this.#figure.value?.visual;
        if (visual) visual.highlight = event.detail.value;
    }
}
