import { BaseLitElement, registerWebComponents, webComponent } from '@domg-wc/common';
import { VlAccordionComponent, VlTableComponent } from '@domg-wc/components/block';
import { ContextConsumer } from '@lit/context';
import { CSSResult, html, nothing, TemplateResult } from 'lit';
import { VlDataDownload } from '../controls/vl-data-download.component';
import { explanationStyles } from '../explanations/explanation.flux-css';
import { findModel } from '../../models/chart.model';
import { figureContext } from '../figure-context';
import { joinFigureZone } from '../figure-zones';
import { buildDataTable, type DataTable } from './data-table';
import { vlDataTableFluxStyles } from './vl-data-table.flux-css';

registerWebComponents([VlAccordionComponent, VlDataDownload, VlTableComponent]);

const TOGGLE_TEXT = 'Bekijk de cijfers';
const GAP_NOTE = 'Een lege cel betekent: geen gegevens.';

/** De cijfers achter de visual van de figuur, uitklapbaar onder de grafiek. Elke figuur toont er standaard één,
 *  als eerste uitleg; zet je er zelf een in de figuur, dan staat die tussen de uitleggen in jouw volgorde en laat
 *  de figuur de standaardtabel weg. */
@webComponent('vl-data-table')
export class VlDataTable extends BaseLitElement {
    static get styles(): CSSResult[] {
        return [explanationStyles, vlDataTableFluxStyles];
    }

    // --- states and fields
    /** Leest de toestand van de visual uit de figuur; tekent opnieuw bij elke nieuwe toestand. */
    #figure = new ContextConsumer(this, { context: figureContext, subscribe: true });

    connectedCallback(): void {
        super.connectedCallback();
        joinFigureZone(this, 'explanations');
    }

    render(): TemplateResult | typeof nothing {
        const model = findModel(this.#figure.value?.dataState);
        if (!model) return nothing;
        const table = buildDataTable(model);
        return html`<vl-accordion class="explanation" toggle-text=${TOGGLE_TEXT} content-padding="none">
            <vl-data-download slot="menu" format="csv" show-label></vl-data-download>
            ${table.hasGaps ? html`<p class="gap-note">${GAP_NOTE}</p>` : nothing} ${this.#renderTable(table)}
        </vl-accordion>`;
    }

    #renderTable(table: DataTable): TemplateResult {
        return html`<vl-table matrix>
            <table>
                <caption>
                    ${table.caption}
                </caption>
                <thead>
                    <tr>
                        <th scope="col">${table.rowHeaderTitle}</th>
                        ${table.columns.map((name) => html`<th scope="col" class="numeric">${name}</th>`)}
                    </tr>
                </thead>
                <tbody>
                    ${table.rows.map(
                        (row) =>
                            html`<tr>
                                <th scope="row">${row.header}</th>
                                ${row.cells.map((cell) => html`<td class="numeric">${cell}</td>`)}
                            </tr>`,
                    )}
                </tbody>
            </table>
        </vl-table>`;
    }
}
