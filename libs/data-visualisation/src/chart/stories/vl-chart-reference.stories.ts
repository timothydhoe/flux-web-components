import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { twoSeriesModel } from '../../figure/stories/figure-story-data';
import { VlChartLine } from '../line/vl-chart-line.component';
import { VlChartReference } from '../vl-chart-reference.component';
import { chartReferenceArgs, chartReferenceArgTypes } from './vl-chart-reference.stories-arg';
import chartReferenceDoc from './vl-chart-reference.stories-doc.mdx';

registerWebComponents([VlChartLine, VlChartReference]);

export default {
    id: 'data-visualisation-chart-reference',
    title: 'Data visualisation/grafiek/chart-reference',
    tags: ['autodocs'],
    args: chartReferenceArgs,
    argTypes: chartReferenceArgTypes,
    parameters: {
        docs: {
            page: chartReferenceDoc,
        },
    },
} as Meta<typeof chartReferenceArgs>;

export const ChartReferenceDefault = story(
    chartReferenceArgs,
    ({ customCSS, value, label }) => html`
        <vl-chart-line .data=${twoSeriesModel}>
            <vl-chart-reference custom-css=${customCSS} value=${value} label=${label}></vl-chart-reference>
        </vl-chart-line>
    `,
);
ChartReferenceDefault.storyName = 'vl-chart-reference - default';
ChartReferenceDefault.args = {
    value: 5,
    label: 'WHO-advieswaarde',
};

export const ChartReferenceMultiple = story(
    chartReferenceArgs,
    () => html`
        <vl-chart-line .data=${twoSeriesModel}>
            <vl-chart-reference value="10" label="EU-grenswaarde 2030"></vl-chart-reference>
            <vl-chart-reference value="5" label="WHO-advieswaarde"></vl-chart-reference>
        </vl-chart-line>
    `,
);
ChartReferenceMultiple.storyName = 'vl-chart-reference - meer dan één';
