import { BaseLitElement, registerWebComponents, webComponent } from '@domg-wc/common';
import { VlLinkComponent } from '@domg-wc/components/atom';
import { VlAccordionComponent } from '@domg-wc/components/block';
import { ContextConsumer } from '@lit/context';
import { CSSResult, html, nothing, TemplateResult } from 'lit';
import { OPEN_DATA_HREF } from '../../chart/vl-chart.component';
import { findModel } from '../../models/chart.model';
import { figureContext } from '../figure-context';
import { joinFigureZone } from '../figure-zones';
import { buildAboutEntries, type AboutEntry } from './about-data';
import { explanationStyles } from './explanation.flux-css';
import { vlDataAboutFluxStyles } from './vl-data-about.flux-css';

registerWebComponents([VlAccordionComponent, VlLinkComponent]);

const TOGGLE_TEXT = 'Over deze data';

/** Wat de lezer over de data moet weten, uitklapbaar onder de visual. Bron, eenheid en open data komen uit het
 *  datacontract (`meta`); wat de auteur in het element schrijft, komt eronder als extra uitleg.
 *  De figuur toont er standaard één als `meta` meer vertelt dan de bronregel (een uitleg bij de eenheid). */
@webComponent('vl-data-about')
export class VlDataAbout extends BaseLitElement {
    static get styles(): CSSResult[] {
        return [explanationStyles, vlDataAboutFluxStyles];
    }

    // --- states and fields
    #figure = new ContextConsumer(this, { context: figureContext, subscribe: true });

    connectedCallback(): void {
        super.connectedCallback();
        joinFigureZone(this, 'explanations');
    }

    render(): TemplateResult | typeof nothing {
        const model = findModel(this.#figure.value?.dataState);
        if (!model) return nothing;
        const entries = buildAboutEntries(model.meta, OPEN_DATA_HREF);
        return html`<vl-accordion class="explanation" toggle-text=${TOGGLE_TEXT}>
            <dl>
                ${entries.map(
                    (entry) =>
                        html`<dt>${entry.term}</dt>
                            <dd>${this.#renderDescription(entry)}</dd>`,
                )}
            </dl>
            <slot></slot>
        </vl-accordion>`;
    }

    #renderDescription(entry: AboutEntry): TemplateResult | string {
        return entry.href
            ? html`<vl-link href=${entry.href} external>${entry.description}</vl-link>`
            : entry.description;
    }
}
