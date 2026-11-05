import { registerWebComponents } from '@domg-wc/common';
import { html } from 'lit';
import { VlChartLine } from '../../chart/line/vl-chart-line.component';
import type { ChartModel } from '../../models/chart.model';
import { VlDataFigure } from '../vl-data-figure.component';
import { VlDataStat } from './vl-data-stat.component';

registerWebComponents([VlDataFigure, VlDataStat, VlChartLine]);

const model: ChartModel = {
    meta: { source: 'VMM', x: { type: 'number' }, y: { type: 'number', unit: 'µg/m³' } },
    series: [
        { name: 'Meetpunt Gent', x: Float64Array.from([2022, 2023, 2024]), y: Float64Array.from([11.2, 12.5, 10.1]) },
        { name: 'Meetpunt Antwerpen', x: Float64Array.from([2022, 2023, 2024]), y: Float64Array.from([13, 12.6, NaN]) },
    ],
};

const stat = () => cy.get('vl-data-stat').shadow();

const mountStat = (attributes: string) => {
    const figure = document.createElement('div');
    figure.innerHTML = `<vl-data-figure><vl-data-stat ${attributes}></vl-data-stat><vl-chart-line></vl-chart-line></vl-data-figure>`;
    cy.mount(html`${figure.firstElementChild}`);
    cy.get('vl-chart-line').then(($chart) => {
        ($chart[0] as VlChartLine).data = model;
    });
};

describe('cypress-component - data-visualisation - vl-data-stat', () => {
    it('should show the highest value of the first series and when it was measured', () => {
        mountStat('');

        stat().find('.label').should('have.text', 'Hoogste waarde · Meetpunt Gent');
        stat().find('.value').should('contain.text', '12,5').and('contain.text', 'µg/m³');
        stat().find('.position').should('have.text', '2023');
    });

    it('should show the lowest value', () => {
        mountStat('statistic="min"');

        stat().find('.label').should('have.text', 'Laagste waarde · Meetpunt Gent');
        stat().find('.value').should('contain.text', '10,1');
        stat().find('.position').should('have.text', '2024');
    });

    it('should show the mean of a series over the period it covers, skipping a gap', () => {
        mountStat('statistic="mean" series="Meetpunt Antwerpen" label="Gemiddeld jaargemiddelde"');

        stat().find('.label').should('have.text', 'Gemiddeld jaargemiddelde · Meetpunt Antwerpen');
        stat().find('.value').should('contain.text', '12,8');
        stat().find('.position').should('have.text', '2022 - 2023');
    });

    it('should show nothing and warn for an unknown statistic', () => {
        cy.window().then((win) => cy.spy(win.console, 'warn').as('warn'));
        mountStat('statistic="median"');

        cy.get('@warn').should('have.been.calledWithMatch', "statistic 'median' bestaat niet");
        stat().find('.value').should('not.exist');
    });
});
