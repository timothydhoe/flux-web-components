import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { VlChartLine } from '../../../chart/line/vl-chart-line.component';
import { VlDataReadingGuide } from '../../explanations/vl-data-reading-guide.component';
import { gapModel, twoSeriesModel } from '../../stories/figure-story-data';
import { VlDataFigure } from '../../vl-data-figure.component';
import { VlDataTable } from '../vl-data-table.component';
import { dataTableArgs, dataTableArgTypes } from './vl-data-table.stories-arg';
import dataTableDoc from './vl-data-table.stories-doc.mdx';

registerWebComponents([VlDataFigure, VlDataTable, VlDataReadingGuide, VlChartLine]);

export default {
    id: 'data-visualisation-data-table',
    title: 'Data visualisation/figuur/data-table',
    tags: ['autodocs'],
    args: dataTableArgs,
    argTypes: dataTableArgTypes,
    parameters: {
        docs: {
            page: dataTableDoc,
        },
    },
} as Meta<typeof dataTableArgs>;

export const DataTableDefault = story(
    dataTableArgs,
    ({ customCSS }) => html`
        <vl-data-figure>
            <vl-chart-line .data=${twoSeriesModel}></vl-chart-line>
            <vl-data-table custom-css=${customCSS}></vl-data-table>
        </vl-data-figure>
    `,
);
DataTableDefault.storyName = 'vl-data-table - default';

export const DataTableWithGap = story(
    dataTableArgs,
    () => html`
        <vl-data-figure>
            <vl-chart-line .data=${gapModel}></vl-chart-line>
        </vl-data-figure>
    `,
);
DataTableWithGap.storyName = 'vl-data-table - met gat';

export const DataTableOwnOrder = story(
    dataTableArgs,
    () => html`
        <vl-data-figure>
            <h3 slot="headline">Eerst de leeswijzer, dan de cijfers</h3>
            <vl-chart-line .data=${twoSeriesModel}></vl-chart-line>
            <vl-data-reading-guide>
                <p>Elke lijn is een meetpunt. Hoe hoger de lijn, hoe hoger de concentratie.</p>
            </vl-data-reading-guide>
            <vl-data-table></vl-data-table>
        </vl-data-figure>
    `,
);
DataTableOwnOrder.storyName = 'vl-data-table - eigen volgorde';
