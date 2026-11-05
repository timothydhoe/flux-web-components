import { registerWebComponents } from '@domg-wc/common';
import { html } from 'lit';
import { VlChartLine } from '../../chart/line/vl-chart-line.component';
import type { ChartModel } from '../../models/chart.model';
import { VlDataSource } from '../../source/vl-data-source.component';
import { VlDataFigure } from '../vl-data-figure.component';
import { VlDataLatest } from './vl-data-latest.component';

registerWebComponents([VlDataFigure, VlDataLatest, VlDataSource, VlChartLine]);

const model: ChartModel = {
    meta: { source: 'VMM', x: { type: 'number' }, y: { type: 'number', unit: 'µg/m³' } },
    series: [
        { name: 'Meetpunt Gent', x: Float64Array.from([2022, 2023, 2024]), y: Float64Array.from([11.2, 10.8, 10.1]) },
        { name: 'Meetpunt Antwerpen', x: Float64Array.from([2022, 2023, 2024]), y: Float64Array.from([13, 12.6, NaN]) },
    ],
};

const latest = () => cy.get('vl-data-latest').shadow();

describe('cypress-component - data-visualisation - vl-data-latest', () => {
    it('should show the last value of the chart in its figure, with when and which series', () => {
        cy.mount(
            html`<vl-data-figure>
                <vl-data-latest></vl-data-latest>
                <vl-chart-line .data=${model}></vl-chart-line>
            </vl-data-figure>`,
        );

        latest().find('.label').should('have.text', 'Laatste meting · Meetpunt Gent');
        latest().find('.value').should('contain.text', '10,1').and('contain.text', 'µg/m³');
        latest().find('.position').should('have.text', '2024');
    });

    it('should take the series and the label of the author, and skip a gap at the end', () => {
        cy.mount(
            html`<vl-data-figure>
                <vl-data-latest series="Meetpunt Antwerpen" label="Laatste jaargemiddelde"></vl-data-latest>
                <vl-chart-line .data=${model}></vl-chart-line>
            </vl-data-figure>`,
        );

        latest().find('.label').should('have.text', 'Laatste jaargemiddelde · Meetpunt Antwerpen');
        latest().find('.value').should('contain.text', '12,6');
        latest().find('.position').should('have.text', '2023');
    });

    it('should read the data of the source when it stands outside a figure', () => {
        cy.intercept({ method: 'GET', pathname: '/api/latest' }, (request) => {
            request.reply({
                meta: { source: 'VMM', x: { type: 'number' }, y: { type: 'number', unit: 'µT' } },
                series: [{ name: 'Temse', x: [2023, 2024], y: [0.3, 0.31] }],
            });
        });
        cy.mount(
            html`<vl-data-source src="/api/latest">
                <vl-data-latest></vl-data-latest>
            </vl-data-source>`,
        );

        latest().find('.label').should('have.text', 'Laatste meting');
        latest().find('.value').should('contain.text', '0,31');
    });

    it('should keep its place while loading and hide when there is no data', () => {
        cy.intercept({ method: 'GET', pathname: '/api/latest' }, { statusCode: 503, delay: 300 });
        cy.mount(
            html`<vl-data-source src="/api/latest">
                <vl-data-latest></vl-data-latest>
            </vl-data-source>`,
        );

        latest().find('.waiting').should('exist');
        latest().find('.value').should('not.exist');
    });
});
