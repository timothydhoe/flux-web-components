import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { VlChartLine } from '../../chart/line/vl-chart-line.component';
import type { ChartModel } from '../../models/chart.model';
import { VlDataHighlight } from '../controls/vl-data-highlight.component';
import { VlDataLatest } from '../summary/vl-data-latest.component';
import { VlDataFigure } from '../vl-data-figure.component';
import { twoSeriesModel, unitInfoModel } from './figure-story-data';
import { dataFigureArgs, dataFigureArgTypes } from './vl-data-figure.stories-arg';
import dataFigureDoc from './vl-data-figure.stories-doc.mdx';

registerWebComponents([VlDataFigure, VlChartLine, VlDataHighlight, VlDataLatest]);

export default {
    id: 'data-visualisation-data-figure',
    title: 'Data visualisation/figuur/data-figure',
    tags: ['autodocs'],
    args: dataFigureArgs,
    argTypes: dataFigureArgTypes,
    parameters: {
        docs: {
            page: dataFigureDoc,
        },
    },
} as Meta<typeof dataFigureArgs>;

/** De grafiek krijgt haar data via JavaScript; de slots zijn HTML, zoals een auteur ze schrijft. */
const renderFigure = (
    data: ChartModel,
    { headlineSlot, subtitleSlot, controlsSlot, defaultSlot, explanationsSlot }: typeof dataFigureArgs,
) => html`
    <vl-data-figure>
        ${unsafeHTML(headlineSlot)}${unsafeHTML(subtitleSlot)}${unsafeHTML(controlsSlot)}${unsafeHTML(defaultSlot)}
        <vl-chart-line .data=${data}></vl-chart-line>
        ${unsafeHTML(explanationsSlot)}
    </vl-data-figure>
`;

const headline = '<h3 slot="headline">In Gent en Antwerpen daalt de concentratie sinds 2020</h3>';
const subtitle = '<p slot="subtitle">Jaargemiddelde per meetpunt, twee meetpunten, 2018-2024</p>';

export const DataFigureDefault = story(dataFigureArgs, (args) => renderFigure(twoSeriesModel, args));
DataFigureDefault.storyName = 'vl-data-figure - default';
DataFigureDefault.args = {
    headlineSlot: headline,
    subtitleSlot: subtitle,
};

export const DataFigureComplete = story(dataFigureArgs, (args) => renderFigure(unitInfoModel, args));
DataFigureComplete.storyName = 'vl-data-figure - volledig';
DataFigureComplete.args = {
    headlineSlot: '<h3 slot="headline">Sinds 2019 daalt de concentratie in Gent elk jaar</h3>',
    subtitleSlot: subtitle,
    controlsSlot: '<vl-data-highlight></vl-data-highlight>',
    defaultSlot: '<vl-data-latest series="Meetpunt Gent" label="Laatste jaargemiddelde"></vl-data-latest>',
    explanationsSlot:
        '<vl-data-reading-guide><p>Elke lijn is een meetpunt. Hoe hoger de lijn, hoe meer stof er dat jaar in de ' +
        'lucht zat.</p></vl-data-reading-guide>',
};

export const DataFigureWithoutCaption = story(dataFigureArgs, (args) => renderFigure(twoSeriesModel, args));
DataFigureWithoutCaption.storyName = 'vl-data-figure - zonder kop';
