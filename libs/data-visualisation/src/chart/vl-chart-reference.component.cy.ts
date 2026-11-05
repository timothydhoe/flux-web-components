import { registerWebComponents } from '@domg-wc/common';
import { html } from 'lit';
import type { ChartModel } from '../models/chart.model';
import { VlChartLine } from './line/vl-chart-line.component';
import { VlChartReference } from './vl-chart-reference.component';

registerWebComponents([VlChartLine, VlChartReference]);

const model: ChartModel = {
    meta: { source: 'VMM', x: { type: 'number' }, y: { type: 'number', unit: 'µg/m³' } },
    series: [
        { name: 'Meetpunt Gent', x: Float64Array.from([2022, 2023, 2024]), y: Float64Array.from([3.2, 3.4, 3.1]) },
        { name: 'Meetpunt Antwerpen', x: Float64Array.from([2022, 2023, 2024]), y: Float64Array.from([4, 4.2, 3.9]) },
    ],
};

type DrawnLayout = {
    shapes?: { y0: number; line: { dash: string } }[];
    annotations?: { text: string; name?: string }[];
    yaxis: { range: [number, number] };
};
/** De gestreepte referentielijnen, zonder de rasterlijn op de rand. */
const referenceLinesOf = (layout: DrawnLayout) => (layout.shapes ?? []).filter((shape) => shape.line.dash === 'dash');

/** Plotly zet na elk tekenen een nieuw `layout`-object op het element: lees het in de `should`, zodat Cypress het
 *  opnieuw leest tot het klopt. */
const shouldDraw = (assert: (layout: DrawnLayout) => void) =>
    cy
        .get('vl-chart-line')
        .shadow()
        .find('.plot')
        .should(($plot) => {
            const layout = ($plot[0] as HTMLElement & { layout?: DrawnLayout }).layout;
            expect(layout, 'getekend').to.not.equal(undefined);
            assert(layout!);
        });

describe('cypress-component - data-visualisation - vl-chart-reference', () => {
    it('should draw a dashed line with its label, and keep it in view', () => {
        cy.mount(
            html`<vl-chart-line .data=${model}>
                <vl-chart-reference value="10" label="EU-grenswaarde 2030"></vl-chart-reference>
            </vl-chart-line>`,
        );

        shouldDraw((layout) => {
            expect(referenceLinesOf(layout).map((shape) => [shape.y0, shape.line.dash])).to.deep.equal([[10, 'dash']]);
            expect(layout.annotations?.map((label) => label.text)).to.include('EU-grenswaarde 2030: 10\u00A0µg/m³');
            expect(layout.yaxis.range[1]).to.be.at.least(10);
        });
    });

    it('should draw again when a reference changes or is added', () => {
        cy.mount(
            html`<vl-chart-line .data=${model}>
                <vl-chart-reference value="10" label="EU"></vl-chart-reference>
            </vl-chart-line>`,
        );
        shouldDraw((layout) => expect(referenceLinesOf(layout)).to.have.length(1));

        cy.get('vl-chart-reference').invoke('attr', 'value', '5');
        shouldDraw((layout) => expect(referenceLinesOf(layout)[0].y0).to.equal(5));

        cy.get('vl-chart-line').then(($chart) => {
            const reference = document.createElement('vl-chart-reference');
            reference.setAttribute('value', '2');
            reference.setAttribute('label', 'WHO');
            $chart[0].append(reference);
        });
        shouldDraw((layout) => expect(referenceLinesOf(layout)).to.have.length(2));
    });

    it('should stop drawing a reference that is removed, and follow the tags again after moving the chart', () => {
        cy.mount(
            html`<div class="before"></div>
                <div class="after"></div>
                <vl-chart-line .data=${model}>
                    <vl-chart-reference value="10" label="EU"></vl-chart-reference>
                    <vl-chart-reference value="2" label="WHO"></vl-chart-reference>
                </vl-chart-line>`,
        );
        shouldDraw((layout) => expect(referenceLinesOf(layout)).to.have.length(2));

        cy.get('vl-chart-reference[label="WHO"]').invoke('remove');
        shouldDraw((layout) => expect(referenceLinesOf(layout).map((shape) => shape.y0)).to.deep.equal([10]));

        // Verplaatsen = loskoppelen en opnieuw verbinden: de observer moet daarna weer luisteren.
        cy.get('vl-chart-line').then(($chart) => document.querySelector('.after')!.append($chart[0]));
        cy.get('vl-chart-reference').invoke('attr', 'value', '7');
        shouldDraw((layout) => expect(referenceLinesOf(layout).map((shape) => shape.y0)).to.deep.equal([7]));
    });

    it('should leave the direct labels where they belong', () => {
        cy.mount(
            html`<vl-chart-line .data=${model}>
                <vl-chart-reference value="4.1" label="Streefwaarde"></vl-chart-reference>
            </vl-chart-line>`,
        );

        shouldDraw((layout) => {
            const directLabels = layout.annotations?.filter((label) => label.name !== 'reference');
            expect(directLabels?.map((label) => label.text?.split(' <b>')[0])).to.deep.equal([
                'Meetpunt Gent',
                'Meetpunt Antwerpen',
            ]);
        });
    });

    it('should describe the references for a screen reader', () => {
        cy.mount(
            html`<vl-chart-line .data=${model}>
                <vl-chart-reference value="10" label="EU-grenswaarde 2030"></vl-chart-reference>
            </vl-chart-line>`,
        );

        cy.get('vl-chart-line')
            .shadow()
            .find('.plot')
            .should('have.attr', 'aria-describedby', 'keyboard-hint references');
        cy.get('vl-chart-line')
            .shadow()
            .find('#references')
            .should('have.text', 'Referentielijn: EU-grenswaarde 2030: 10\u00A0µg/m³.');
    });

    it('should warn about a reference without a value and skip it', () => {
        cy.window().then((win) => cy.spy(win.console, 'warn').as('warn'));

        cy.mount(
            html`<vl-chart-line .data=${model}>
                <vl-chart-reference label="Zonder waarde"></vl-chart-reference>
            </vl-chart-line>`,
        );

        shouldDraw((layout) => expect(referenceLinesOf(layout)).to.have.length(0));
        cy.get('@warn').should('have.been.calledWithMatch', 'vl-chart-reference');
    });
});
