import { registerWebComponents } from '@domg-wc/common';
import { html } from 'lit';
import { VlChartReference } from '../../chart/vl-chart-reference.component';
import { VlDataSource } from '../../source/vl-data-source.component';
import { VlDataGauge } from './vl-data-gauge.component';

registerWebComponents([VlDataGauge, VlChartReference, VlDataSource]);

const SRC = '/api/gauge';

const answer = (values: number[]) => ({
    meta: { source: 'Departement Omgeving', x: { type: 'number' }, y: { type: 'number', unit: 'µT' } },
    series: [{ name: 'Temse', x: values.map((_, index) => 2020 + index), y: values }],
});

const gauge = () => cy.get('vl-data-gauge').shadow();
const meter = () => gauge().find('[role="meter"]');

describe('cypress-component - data-visualisation - vl-data-gauge', () => {
    it('should show the last value as a meter against the norm, in words too', () => {
        cy.intercept({ method: 'GET', pathname: SRC }, answer([0.3, 0.23]));
        cy.mount(
            html`<vl-data-source src=${SRC}>
                <vl-data-gauge>
                    <vl-chart-reference value="0.4" label="Voorzorgswaarde"></vl-chart-reference>
                </vl-data-gauge>
            </vl-data-source>`,
        );

        gauge().find('.label').should('have.text', 'Laatste meting');
        gauge().find('.value').should('contain.text', '0,23').and('contain.text', 'µT');
        meter()
            .should('have.attr', 'aria-valuemin', '0')
            .and('have.attr', 'aria-valuemax', '0.4')
            .and('have.attr', 'aria-valuenow', '0.23')
            .and('have.attr', 'aria-valuetext', '0,23\u00A0µT')
            .and('have.attr', 'aria-labelledby', 'label');
        gauge()
            .find('.fill')
            .should(($fill) => {
                const share = $fill[0].getBoundingClientRect().width / $fill.parent()[0].getBoundingClientRect().width;
                expect(share).to.be.closeTo(0.575, 0.01);
            });
        gauge().find('.reference').should('have.length', 1);
        gauge()
            .find('.comparisons li')
            .invoke('text')
            .then((text) => expect(text.replace(/\s+/g, ' ').trim()).to.equal('Onder Voorzorgswaarde (0,4 µT)'));
    });

    it('should run to the max of the author and say when the value is above the norm', () => {
        cy.intercept({ method: 'GET', pathname: SRC }, answer([0.3, 0.5]));
        cy.mount(
            html`<vl-data-source src=${SRC}>
                <vl-data-gauge max="1">
                    <vl-chart-reference value="0.4" label="Voorzorgswaarde"></vl-chart-reference>
                </vl-data-gauge>
            </vl-data-source>`,
        );

        meter().should('have.attr', 'aria-valuemax', '1');
        gauge().find('.reference').should('have.attr', 'style').and('contain', 'left:40%');
        gauge().find('.comparisons li').should('contain.text', 'Boven Voorzorgswaarde');
    });

    it('should follow a norm that changes', () => {
        cy.intercept({ method: 'GET', pathname: SRC }, answer([0.3, 0.5]));
        cy.mount(
            html`<vl-data-source src=${SRC}>
                <vl-data-gauge max="1">
                    <vl-chart-reference value="0.4" label="Voorzorgswaarde"></vl-chart-reference>
                </vl-data-gauge>
            </vl-data-source>`,
        );
        gauge().find('.comparisons li').should('contain.text', 'Boven');

        cy.get('vl-chart-reference').invoke('attr', 'value', '0.6');

        gauge().find('.comparisons li').should('contain.text', 'Onder').and('contain.text', '0,6');
    });

    it('should show only the meter without a norm', () => {
        cy.intercept({ method: 'GET', pathname: SRC }, answer([0.3, 0.23]));
        cy.mount(html`<vl-data-source src=${SRC}><vl-data-gauge></vl-data-gauge></vl-data-source>`);

        meter().should('exist');
        gauge().find('.comparisons').should('not.exist');
    });
});
