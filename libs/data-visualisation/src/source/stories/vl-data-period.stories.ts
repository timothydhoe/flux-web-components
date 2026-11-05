import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { VlChartLine } from '../../chart/line/vl-chart-line.component';
import { VlDataFigure } from '../../figure/vl-data-figure.component';
import { VlDataPeriod } from '../vl-data-period.component';
import { VlDataSource } from '../vl-data-source.component';
import { ELF_SRC, elfHandlers } from './elf-story-data';
import { dataPeriodArgs, dataPeriodArgTypes } from './vl-data-period.stories-arg';
import dataPeriodDoc from './vl-data-period.stories-doc.mdx';

registerWebComponents([VlDataSource, VlDataPeriod, VlDataFigure, VlChartLine]);

export default {
    id: 'data-visualisation-data-period',
    title: 'Data visualisation/bron/data-period',
    tags: ['autodocs'],
    args: dataPeriodArgs,
    argTypes: dataPeriodArgTypes,
    parameters: {
        msw: { handlers: elfHandlers },
        docs: {
            page: dataPeriodDoc,
        },
    },
} as Meta<typeof dataPeriodArgs>;

export const DataPeriodDefault = story(
    dataPeriodArgs,
    ({ customCSS, onPeriodChange }) => html`
        <vl-data-source src=${ELF_SRC} period="24h">
            <vl-data-period
                custom-css=${customCSS}
                @vl-period-change=${(event: CustomEvent) => onPeriodChange(event.detail)}
            ></vl-data-period>
            <vl-data-figure>
                <h3 slot="headline">Magnetische veldsterkte</h3>
                <vl-chart-line></vl-chart-line>
            </vl-data-figure>
        </vl-data-source>
    `,
);
DataPeriodDefault.storyName = 'vl-data-period - default';

export const DataPeriodInFigure = story(
    dataPeriodArgs,
    () => html`
        <vl-data-source src=${ELF_SRC} period="7d">
            <vl-data-figure>
                <h3 slot="headline">Magnetische veldsterkte, per uur</h3>
                <vl-data-period></vl-data-period>
                <vl-chart-line></vl-chart-line>
            </vl-data-figure>
        </vl-data-source>
    `,
);
DataPeriodInFigure.storyName = 'vl-data-period - in de figuur';
