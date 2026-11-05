import { registerWebComponents } from '@domg-wc/common';
import { html } from 'lit';
import { VlChartLine } from '../chart/line/vl-chart-line.component';
import { VlDataFigure } from '../figure/vl-data-figure.component';
import type { ChartJson } from './chart-json.adapter';
import { describePeriod, startOfDay } from './period';
import { VlDataPeriod } from './vl-data-period.component';
import { VlDataSource } from './vl-data-source.component';

registerWebComponents([VlDataSource, VlDataPeriod, VlDataFigure, VlChartLine]);

const SRC = '/api/elf/sensors/ELF_L_0004';

/** Een antwoord met twee metingen in de gevraagde periode; de naam van de reeks zegt welke periode het was. */
const buildAnswer = (from: string, to: string, name = `${from} - ${to}`): ChartJson => ({
    meta: { source: 'Departement Omgeving', x: { type: 'time' }, y: { type: 'number', unit: 'µT' } },
    series: [{ name, x: [from, to], y: [0.28, 0.31] }],
});

const answerWithPeriod = () =>
    cy
        .intercept({ method: 'GET', pathname: SRC }, (request) => {
            const { from, to } = request.query as { from: string; to: string };
            request.reply(buildAnswer(from, to));
        })
        .as('source');

const period = () => cy.get('vl-data-period').shadow();
const chart = () => cy.get('vl-chart-line').shadow();
const day = (year: number, month: number, date: number) => new Date(year, month - 1, date);

describe('cypress-component - data-visualisation - vl-data-source', () => {
    it('should fetch the period and give the data to the chart without data of its own', () => {
        answerWithPeriod();
        cy.mount(
            html`<vl-data-source src=${SRC} period="7d" end="2026-08-28">
                <vl-chart-line></vl-chart-line>
            </vl-data-source>`,
        );

        cy.wait('@source').then(({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('from')).to.equal(day(2026, 8, 22).toISOString());
            expect(url.searchParams.get('to')).to.equal(day(2026, 8, 29).toISOString());
        });
        chart().find('.plot .main-svg').should('exist');
    });

    it('should keep the data of the chart itself', () => {
        answerWithPeriod();
        const ownData = {
            meta: { source: 'Eigen', x: { type: 'number' as const }, y: { type: 'number' as const, unit: 'µT' } },
            series: [{ name: 'Eigen reeks', x: Float64Array.from([1, 2]), y: Float64Array.from([3, 4]) }],
        };
        cy.mount(
            html`<vl-data-source src=${SRC}>
                <vl-chart-line .data=${ownData}></vl-chart-line>
            </vl-data-source>`,
        );

        cy.wait('@source');
        chart().find('.plot').should('contain.text', 'Eigen reeks');
    });

    it('should show an error in the chart when the source does not answer', () => {
        cy.intercept({ method: 'GET', pathname: SRC }, { statusCode: 503 }).as('source');
        cy.mount(
            html`<vl-data-source src=${SRC}>
                <vl-chart-line></vl-chart-line>
            </vl-data-source>`,
        );

        cy.wait('@source');
        chart().find('vl-alert[type="error"]').should('exist');
    });

    it('should hide the controls without an error when the source does not answer', () => {
        // Een fout in disconnectedCallback (bv. van vl-tooltip) meldt de browser als 'error' op window.
        const errors: string[] = [];
        cy.window().then((win) => win.addEventListener('error', (event) => errors.push(event.message)));
        cy.intercept({ method: 'GET', pathname: SRC }, { statusCode: 503, delay: 300 }).as('source');
        cy.mount(
            html`<vl-data-source src=${SRC}>
                <vl-data-figure>
                    <vl-chart-line></vl-chart-line>
                </vl-data-figure>
            </vl-data-source>`,
        );

        cy.wait('@source');
        cy.get('vl-data-figure').shadow().find('vl-data-download').shadow().find('vl-button').should('not.be.visible');
        cy.wrap(errors).should('be.empty');
    });

    it('should keep the drawn chart dimmed while another period loads', () => {
        let requests = 0;
        cy.intercept({ method: 'GET', pathname: SRC }, (request) => {
            requests += 1;
            const { from, to } = request.query as { from: string; to: string };
            request.reply({
                body: buildAnswer(from, to, requests === 1 ? 'Eerst' : 'Nieuw'),
                delay: requests === 1 ? 0 : 800,
            });
        }).as('source');
        cy.mount(
            html`<vl-data-source src=${SRC} period="24h" end="2026-08-28">
                <vl-data-period></vl-data-period>
                <vl-chart-line></vl-chart-line>
            </vl-data-source>`,
        );
        chart().find('.plot').should('contain.text', 'Eerst');

        period().contains('label', '7 dagen').click();

        chart().find('.plot-frame').should('have.class', 'is-reloading');
        chart().find('.plot').should('be.visible').and('have.attr', 'aria-busy', 'true');
        chart().find('.skeleton').should('not.exist');
        chart().find('.unit').should('exist');
        chart().find('.plot').should('contain.text', 'Nieuw').and('not.have.attr', 'aria-busy');
        chart().find('.plot-frame').should('not.have.class', 'is-reloading');
    });

    it('should never let a slow answer overwrite a newer period', () => {
        let requests = 0;
        cy.intercept({ method: 'GET', pathname: SRC }, (request) => {
            requests += 1;
            const { from, to } = request.query as { from: string; to: string };
            const isFirst = requests === 1;
            request.reply({ body: buildAnswer(from, to, isFirst ? 'Traag' : 'Nieuw'), delay: isFirst ? 1500 : 0 });
        }).as('source');
        cy.mount(
            html`<vl-data-source src=${SRC} period="24h" end="2026-08-28">
                <vl-data-period></vl-data-period>
                <vl-chart-line></vl-chart-line>
            </vl-data-source>`,
        );

        period().contains('label', '7 dagen').click();
        chart().find('.plot').should('contain.text', 'Nieuw');
        cy.wait(1600);
        chart().find('.plot').should('contain.text', 'Nieuw').and('not.contain.text', 'Traag');
    });
});

describe('cypress-component - data-visualisation - vl-data-period', () => {
    it('should fetch again when the reader picks another length', () => {
        answerWithPeriod();
        cy.mount(
            html`<vl-data-source src=${SRC} period="24h" end="2026-08-28">
                <vl-data-period></vl-data-period>
                <vl-chart-line></vl-chart-line>
            </vl-data-source>`,
        );
        cy.wait('@source');

        period().contains('label', '30 dagen').click();

        cy.wait('@source')
            .its('request.query.from')
            .should('equal', day(2026, 7, 30).toISOString());
        period().find('input[value="30d"]').should('be.checked');
        period()
            .find('.current')
            .should('have.text', describePeriod({ duration: '30d', end: day(2026, 8, 28) }));
    });

    it('should step a whole period back and forward', () => {
        answerWithPeriod();
        cy.mount(
            html`<vl-data-source src=${SRC} period="7d" end="2026-08-28">
                <vl-data-period></vl-data-period>
            </vl-data-source>`,
        );
        cy.wait('@source');

        period().find('button[aria-label="Vorige periode"]').click();
        cy.wait('@source')
            .its('request.query.to')
            .should('equal', day(2026, 8, 22).toISOString());
        period()
            .find('.current')
            .should('have.text', describePeriod({ duration: '7d', end: day(2026, 8, 21) }));

        period().find('button[aria-label="Volgende periode"]').click();
        cy.wait('@source')
            .its('request.query.to')
            .should('equal', day(2026, 8, 29).toISOString());
    });

    it('should not go past today', () => {
        answerWithPeriod();
        cy.mount(
            html`<vl-data-source src=${SRC} period="24h">
                <vl-data-period></vl-data-period>
            </vl-data-source>`,
        );
        cy.wait('@source');

        period().find('button[aria-label="Volgende periode"]').should('be.disabled');
        period().contains('button', 'Vandaag').should('be.disabled');

        period().find('button[aria-label="Vorige periode"]').click();
        cy.wait('@source');
        period().contains('button', 'Vandaag').should('not.be.disabled').click();

        const tomorrow = new Date(startOfDay(new Date()).getTime());
        tomorrow.setDate(tomorrow.getDate() + 1);
        cy.wait('@source').its('request.query.to').should('equal', tomorrow.toISOString());
        period().contains('button', 'Vandaag').should('be.disabled');
    });

    it('should join the controls of the figure', () => {
        answerWithPeriod();
        cy.mount(
            html`<vl-data-source src=${SRC}>
                <vl-data-figure>
                    <vl-data-period></vl-data-period>
                    <vl-chart-line></vl-chart-line>
                </vl-data-figure>
            </vl-data-source>`,
        );

        cy.get('vl-data-period').should('have.attr', 'slot', 'controls');
    });
});
