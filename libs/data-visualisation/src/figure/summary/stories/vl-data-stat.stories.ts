import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { VlChartLine } from '../../../chart/line/vl-chart-line.component';
import { ELF_SRC, elfHandlers } from '../../../source/stories/elf-story-data';
import { VlDataPeriod } from '../../../source/vl-data-period.component';
import { VlDataSource } from '../../../source/vl-data-source.component';
import { twoSeriesModel } from '../../stories/figure-story-data';
import { VlDataFigure } from '../../vl-data-figure.component';
import { VlDataLatest } from '../vl-data-latest.component';
import { VlDataStat } from '../vl-data-stat.component';
import { dataStatArgs, dataStatArgTypes } from './vl-data-stat.stories-arg';
import dataStatDoc from './vl-data-stat.stories-doc.mdx';

registerWebComponents([VlDataFigure, VlDataStat, VlDataLatest, VlDataSource, VlDataPeriod, VlChartLine]);

export default {
    id: 'data-visualisation-data-stat',
    title: 'Data visualisation/figuur/data-stat',
    tags: ['autodocs'],
    args: dataStatArgs,
    argTypes: dataStatArgTypes,
    parameters: {
        docs: {
            page: dataStatDoc,
        },
    },
} as Meta<typeof dataStatArgs>;

export const DataStatDefault = story(
    dataStatArgs,
    ({ customCSS, statistic, series, label }) => html`
        <vl-data-figure>
            <h3 slot="headline">In 2019 lag de concentratie in Gent het hoogst</h3>
            <vl-data-stat custom-css=${customCSS} statistic=${statistic} series=${series} label=${label}></vl-data-stat>
            <vl-chart-line .data=${twoSeriesModel}></vl-chart-line>
        </vl-data-figure>
    `,
);
DataStatDefault.storyName = 'vl-data-stat - default';
DataStatDefault.args = {
    series: 'Meetpunt Gent',
};

export const DataStatRow = story(
    dataStatArgs,
    () => html`
        <vl-data-source src=${ELF_SRC} period="24h">
            <vl-data-period></vl-data-period>
            <div style="display: flex; flex-wrap: wrap; gap: 3.2rem; margin: 2.4rem 0;">
                <vl-data-latest></vl-data-latest>
                <vl-data-stat statistic="max"></vl-data-stat>
                <vl-data-stat statistic="mean"></vl-data-stat>
            </div>
            <vl-data-figure>
                <h3 slot="headline">Magnetische veldsterkte</h3>
                <vl-chart-line></vl-chart-line>
            </vl-data-figure>
        </vl-data-source>
    `,
);
DataStatRow.storyName = 'vl-data-stat - rij boven de figuur';
DataStatRow.parameters = { controls: { disable: true }, msw: { handlers: elfHandlers } };
