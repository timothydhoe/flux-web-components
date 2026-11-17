import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { VlChartLine } from '../../../chart/line/vl-chart-line.component';
import { twoSeriesModel } from '../../stories/figure-story-data';
import { VlDataFigure } from '../../vl-data-figure.component';
import { VlDataTable } from '../vl-data-table.component';
import { dataTableArgs, dataTableArgTypes } from './vl-data-table.stories-arg';
import dataTableDoc from './vl-data-table.stories-doc.mdx';

registerWebComponents([VlDataFigure, VlDataTable, VlChartLine]);

export default {
    id: 'data-visualisation-data-table',
    title: 'Data visualisation - Figure/data-table',
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
