import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { ChartModel, ChartSeries } from '../../../models/chart.model';
import { VlChartReference } from '../../vl-chart-reference.component';
import { VlChartLine } from '../vl-chart-line.component';
import { chartLineArgs, chartLineArgTypes } from './vl-chart-line.stories-arg';
import chartLineDoc from './vl-chart-line.stories-doc.mdx';

registerWebComponents([VlChartLine, VlChartReference]);

const years = Float64Array.from([2018, 2019, 2020, 2021, 2022, 2023, 2024]);

const buildSeries = (name: string, y: number[]): ChartSeries => ({ name, x: years, y: Float64Array.from(y) });

const buildModel = (series: ChartSeries[], meta: Partial<ChartModel['meta']> = {}): ChartModel => ({
    meta: {
        source: 'Vlaamse Milieumaatschappij',
        sourceHref: 'https://www.vmm.be',
        isOpenData: true,
        x: { type: 'number', title: 'Jaar' },
        y: { type: 'number', title: 'Concentratie', unit: 'µg/m³' },
        ...meta,
    },
    series,
});

const gent = buildSeries('Meetpunt Gent', [12.5, 13.1, 12.8, 11.9, 11.2, 10.8, 10.1]);
const antwerpen = buildSeries('Meetpunt Antwerpen', [15.2, 14.7, 14.9, 13.8, 13.1, 12.6, 12.2]);
const fourSeries = [
    gent,
    buildSeries('Meetpunt Antwerpen', [15.2, 14.7, 14.9, 13.8, 13.1, 12.6, 10.3]),
    buildSeries('Meetpunt Brugge', [8.1, 8.6, 9.2, 9.5, 9.9, 10.0, 10.2]),
    buildSeries('Meetpunt Hasselt', [5.4, 5.9, 6.3, 7.1, 7.8, 8.4, 9.0]),
];

export default {
    id: 'data-visualisation-chart-line',
    title: 'Data visualisation/grafiek/chart-line',
    tags: ['autodocs'],
    args: chartLineArgs,
    argTypes: chartLineArgTypes,
    parameters: {
        docs: {
            page: chartLineDoc,
        },
    },
} as Meta<typeof chartLineArgs>;

const Template = story(
    chartLineArgs,
    ({ data, highlight, disableHoverFade, defaultSlot, onDataChange }) => html`
        <vl-chart-line
            .data=${data}
            highlight=${highlight}
            ?disable-hover-fade=${disableHoverFade}
            @vl-data-change=${(event: CustomEvent) => onDataChange(event.detail)}
        >
            ${unsafeHTML(defaultSlot)}
        </vl-chart-line>
    `,
);

export const ChartLineDefault = Template.bind({});
ChartLineDefault.storyName = 'vl-chart-line - default';
ChartLineDefault.args = {
    data: buildModel([gent, antwerpen]),
};

export const ChartLineHighlight = Template.bind({});
ChartLineHighlight.storyName = 'vl-chart-line - uitlichten';
ChartLineHighlight.args = {
    data: buildModel(fourSeries),
    highlight: 'Meetpunt Gent',
};

export const ChartLineReference = Template.bind({});
ChartLineReference.storyName = 'vl-chart-line - referentielijn';
ChartLineReference.args = {
    data: buildModel([gent, antwerpen]),
    defaultSlot: '<vl-chart-reference value="5" label="WHO-advieswaarde"></vl-chart-reference>',
};

/** Elke toestand naast elkaar, met het label dat de figuur erboven zou zetten. */
const states: { label: string; data?: ChartModel }[] = [
    { label: 'Laden: nog geen data', data: undefined },
    {
        label: 'Met een gat: de lijn wordt onderbroken',
        data: buildModel([buildSeries('Meetpunt Gent', [12.5, 13.1, NaN, NaN, 11.2, 10.8, 10.1])]),
    },
    { label: 'Geen gegevens', data: buildModel([]) },
    { label: 'Fout: de bron ontbreekt', data: buildModel([gent], { source: '' }) },
];

export const ChartLineStates = {
    name: 'vl-chart-line - toestanden',
    parameters: { controls: { disable: true } },
    render: () => html`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(32rem, 1fr)); gap: 3.2rem;">
            ${states.map(
                ({ label, data }) => html`
                    <div>
                        <p style="margin-bottom: 0.8rem; font-weight: 500;">${label}</p>
                        <vl-chart-line style="--vl-chart-height: 24rem;" .data=${data}></vl-chart-line>
                    </div>
                `,
            )}
        </div>
    `,
};
