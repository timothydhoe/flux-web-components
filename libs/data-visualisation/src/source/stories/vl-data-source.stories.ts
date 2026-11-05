import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { VlChartLine } from '../../chart/line/vl-chart-line.component';
import { VlChartReference } from '../../chart/vl-chart-reference.component';
import { VlDataLatest } from '../../figure/summary/vl-data-latest.component';
import { VlDataFigure } from '../../figure/vl-data-figure.component';
import { VlDataPeriod } from '../vl-data-period.component';
import { VlDataSource } from '../vl-data-source.component';
import { ELF_BROKEN_SRC, ELF_SRC, elfHandlers } from './elf-story-data';
import { dataSourceArgs, dataSourceArgTypes } from './vl-data-source.stories-arg';
import dataSourceDoc from './vl-data-source.stories-doc.mdx';

registerWebComponents([VlDataSource, VlDataPeriod, VlDataFigure, VlChartLine, VlChartReference, VlDataLatest]);

export default {
    id: 'data-visualisation-data-source',
    title: 'Data visualisation/bron/data-source',
    tags: ['autodocs'],
    args: dataSourceArgs,
    argTypes: dataSourceArgTypes,
    parameters: {
        msw: { handlers: elfHandlers },
        docs: {
            page: dataSourceDoc,
        },
    },
} as Meta<typeof dataSourceArgs>;

// adapter en buildUrl blijven op hun standaard: de mock-API antwoordt met het ChartModel in JSON.
const Template = story(
    dataSourceArgs,
    ({ customCSS, src, period, end }) => html`
        <vl-data-source custom-css=${customCSS} src=${src} period=${period} end=${end}>
            <vl-data-period></vl-data-period>
            <vl-data-figure>
                <h3 slot="headline">Magnetische veldsterkte</h3>
                <p slot="subtitle">Temse, sensor ELF_L_0004, 380 kV</p>
                <vl-data-latest></vl-data-latest>
                <vl-chart-line>
                    <vl-chart-reference value="0.4" label="Voorzorgswaarde"></vl-chart-reference>
                </vl-chart-line>
            </vl-data-figure>
        </vl-data-source>
    `,
);

export const DataSourceDefault = Template.bind({});
DataSourceDefault.storyName = 'vl-data-source - default';
DataSourceDefault.args = { src: ELF_SRC };

export const DataSourceUnavailable = Template.bind({});
DataSourceUnavailable.storyName = 'vl-data-source - bron niet bereikbaar';
DataSourceUnavailable.args = { src: ELF_BROKEN_SRC };
