import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { VlChartLine } from '../../../chart/line/vl-chart-line.component';
import { ELF_SRC, elfHandlers } from '../../../source/stories/elf-story-data';
import { VlDataSource } from '../../../source/vl-data-source.component';
import { twoSeriesModel } from '../../stories/figure-story-data';
import { VlDataFigure } from '../../vl-data-figure.component';
import { VlDataLatest } from '../vl-data-latest.component';
import { dataLatestArgs, dataLatestArgTypes } from './vl-data-latest.stories-arg';
import dataLatestDoc from './vl-data-latest.stories-doc.mdx';

registerWebComponents([VlDataFigure, VlDataLatest, VlDataSource, VlChartLine]);

export default {
    id: 'data-visualisation-data-latest',
    title: 'Data visualisation/figuur/data-latest',
    tags: ['autodocs'],
    args: dataLatestArgs,
    argTypes: dataLatestArgTypes,
    parameters: {
        docs: {
            page: dataLatestDoc,
        },
    },
} as Meta<typeof dataLatestArgs>;

export const DataLatestDefault = story(
    dataLatestArgs,
    ({ customCSS, series, label }) => html`
        <vl-data-figure>
            <h3 slot="headline">In Gent en Antwerpen daalt de concentratie sinds 2020</h3>
            <vl-data-latest custom-css=${customCSS} series=${series} label=${label}></vl-data-latest>
            <vl-chart-line .data=${twoSeriesModel}></vl-chart-line>
        </vl-data-figure>
    `,
);
DataLatestDefault.storyName = 'vl-data-latest - default';
DataLatestDefault.args = {
    series: 'Meetpunt Gent',
    label: 'Laatste jaargemiddelde',
};

export const DataLatestAsTile = story(
    dataLatestArgs,
    () => html`
        <vl-data-source src=${ELF_SRC} period="24h">
            <div style="display: grid; grid-template-columns: 16rem 1fr; gap: 3.2rem; align-items: start;">
                <vl-data-latest></vl-data-latest>
                <vl-data-figure>
                    <h3 slot="headline">Magnetische veldsterkte vandaag</h3>
                    <vl-chart-line></vl-chart-line>
                </vl-data-figure>
            </div>
        </vl-data-source>
    `,
);
DataLatestAsTile.storyName = 'vl-data-latest - als tegel naast de figuur';
DataLatestAsTile.parameters = { msw: { handlers: elfHandlers } };
