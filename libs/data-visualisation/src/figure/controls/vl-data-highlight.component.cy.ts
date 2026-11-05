import { registerWebComponents } from '@domg-wc/common';
import { html } from 'lit';
import { VlChartLine } from '../../chart/line/vl-chart-line.component';
import type { ChartModel, ChartSeries } from '../../models/chart.model';
import { VlDataFigure } from '../vl-data-figure.component';
import { VlDataHighlight } from './vl-data-highlight.component';

registerWebComponents([VlDataFigure, VlDataHighlight, VlChartLine]);

const buildSeries = (name: string, y: number[]): ChartSeries => ({
    name,
    x: Float64Array.from([2020, 2021, 2022]),
    y: Float64Array.from(y),
});

const buildModel = (series: ChartSeries[]): ChartModel => ({
    meta: { source: 'Vlaamse Milieumaatschappij', x: { type: 'number' }, y: { type: 'number', unit: 'µT' } },
    series,
});

const threeSeriesModel = () =>
    buildModel([
        buildSeries('Obscurionweg 91', [0.66, 0.71, 0.6]),
        buildSeries('Obscurionweg 93', [0.32, 0.38, 0.35]),
        buildSeries('Obscurionweg 95', [0.1, 0.12, 0.11]),
    ]);

const plot = () => cy.get('vl-chart-line').shadow().find('.plot');
const labelOf = (name: string) =>
    plot()
        .find('g.annotation text')
        .filter((_, label) => label.textContent?.startsWith(`${name} `) === true); // na de naam de laatste waarde
/** De traces zoals Plotly ze tekende; `meta` is de index van de reeks, de halo heeft er geen. */
const drawnLines = () =>
    plot().then(($plot) =>
        ($plot[0] as HTMLElement & { data: { meta?: number; line: { width: number; color: string } }[] }).data.map(
            (trace) => ({ meta: trace.meta, width: trace.line.width, color: trace.line.color }),
        ),
    );

describe('cypress-component - data-visualisation - vl-chart-line - highlight', () => {
    it('should draw the highlighted series thick and on top, the others grey', () => {
        cy.mount(html`<vl-chart-line .data=${threeSeriesModel()} highlight="Obscurionweg 93"></vl-chart-line>`);

        drawnLines().should((lines) => {
            expect(lines.at(-1)).to.deep.include({ meta: 1, width: 3 });
            expect(lines.filter((line) => line.meta === 0 || line.meta === 2).map((line) => line.color)).to.deep.equal([
                '#a7b1bf',
                '#a7b1bf',
            ]);
        });
        labelOf('Obscurionweg 93').should('have.css', 'font-weight', '700');
    });

    it('should warn and highlight nothing for a series that does not exist', () => {
        cy.window().then((win) => cy.spy(win.console, 'warn').as('warn'));

        cy.mount(html`<vl-chart-line .data=${threeSeriesModel()} highlight="Obscurionweg 99"></vl-chart-line>`);

        drawnLines().should((lines) => expect(lines.map((line) => line.width)).to.deep.equal([2, 2, 2]));
        cy.get('@warn').should('have.been.calledWithMatch', "'Obscurionweg 99'");
    });
});

describe('cypress-component - data-visualisation - vl-chart-line - hover fade', () => {
    /** De muis precies op de lijn van een reeks, in 2021. */
    const hoverLine = (value: number) =>
        plot().then(($plot) => {
            const element = $plot[0] as HTMLElement & {
                _fullLayout: { xaxis: PlotlyAxis; yaxis: PlotlyAxis };
            };
            const { xaxis, yaxis } = element._fullLayout;
            cy.wrap($plot)
                .find('.nsewdrag')
                .then(($drag) => {
                    const plotBox = element.getBoundingClientRect();
                    const dragBox = $drag[0].getBoundingClientRect();
                    const x = plotBox.left + xaxis.d2p(2021) + xaxis._offset - dragBox.left;
                    const y = plotBox.top + yaxis.d2p(value) + yaxis._offset - dragBox.top;
                    cy.wrap($drag).trigger('mousemove', x, y);
                });
        });
    type PlotlyAxis = { d2p(value: number): number; _offset: number };
    const traceOpacities = () =>
        plot()
            .find('.scatterlayer .trace')
            .then(($traces) => $traces.toArray().map((trace) => (trace as SVGGElement).style.opacity));

    it('should fade the other lines when the mouse points at one', () => {
        cy.mount(html`<vl-chart-line .data=${threeSeriesModel()}></vl-chart-line>`);

        hoverLine(0.38);

        traceOpacities().should('deep.equal', ['0.25', '', '0.25']);
        cy.get('vl-chart-line').shadow().find('.tooltip tr.is-emphasized').should('contain.text', 'Obscurionweg 93');
    });

    it('should not fade with disable-hover-fade', () => {
        cy.mount(html`<vl-chart-line .data=${threeSeriesModel()} disable-hover-fade></vl-chart-line>`);

        hoverLine(0.38);

        cy.get('vl-chart-line').shadow().find('.tooltip').should('exist');
        traceOpacities().should('deep.equal', ['', '', '']);
    });

    it('should not fade while a series is highlighted', () => {
        cy.mount(html`<vl-chart-line .data=${threeSeriesModel()} highlight="Obscurionweg 91"></vl-chart-line>`);

        hoverLine(0.38);

        cy.get('vl-chart-line').shadow().find('.tooltip tr.is-emphasized').should('contain.text', 'Obscurionweg 91');
        traceOpacities().should('not.include', '0.25'); // de halo houdt de opacity die Plotly zette
    });
});

describe('cypress-component - data-visualisation - vl-data-highlight', () => {
    const select = () => cy.get('vl-data-highlight').shadow().find('vl-select').shadow().find('select');

    it('should highlight the series the reader picks, and nothing with "Geen"', () => {
        cy.mount(
            html`<vl-data-figure>
                <vl-data-highlight></vl-data-highlight>
                <vl-chart-line .data=${threeSeriesModel()}></vl-chart-line>
            </vl-data-figure>`,
        );

        select().select('Obscurionweg 95');
        cy.get('vl-chart-line').should('have.prop', 'highlight', 'Obscurionweg 95');

        select().select('Geen');
        cy.get('vl-chart-line').should('have.prop', 'highlight', '');
    });

    it('should start with the series the author highlighted', () => {
        cy.mount(
            html`<vl-data-figure>
                <vl-data-highlight></vl-data-highlight>
                <vl-chart-line .data=${threeSeriesModel()} highlight="Obscurionweg 93"></vl-chart-line>
            </vl-data-figure>`,
        );

        select().should('have.value', 'Obscurionweg 93');
    });

    it('should not be there with only one series', () => {
        cy.mount(
            html`<vl-data-figure>
                <vl-data-highlight></vl-data-highlight>
                <vl-chart-line .data=${buildModel([buildSeries('Obscurionweg 91', [1, 2, 3])])}></vl-chart-line>
            </vl-data-figure>`,
        );

        cy.get('vl-chart-line').shadow().find('.plot .main-svg').should('exist');
        cy.get('vl-data-highlight').shadow().find('vl-select').should('not.exist');
    });

    it('should join the controls of the figure', () => {
        cy.mount(
            html`<vl-data-figure>
                <vl-data-highlight></vl-data-highlight>
                <vl-chart-line .data=${threeSeriesModel()}></vl-chart-line>
            </vl-data-figure>`,
        );

        cy.get('vl-data-highlight').should('have.attr', 'slot', 'controls');
    });
});
