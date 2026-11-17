import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { VlChartLine } from '../../chart/line/vl-chart-line.component';
import { VlDataFigure } from '../vl-data-figure.component';
import { unitInfoModel } from './figure-story-data';
import { dataFigureArgs, dataFigureArgTypes } from './vl-data-figure.stories-arg';
import dataFigureDoc from './vl-data-figure.stories-doc.mdx';

registerWebComponents([VlDataFigure, VlChartLine]);

export default {
    id: 'data-visualisation-data-figure',
    title: 'Data visualisation - Figure/data-figure',
    tags: ['autodocs'],
    args: dataFigureArgs,
    argTypes: dataFigureArgTypes,
    parameters: {
        docs: {
            page: dataFigureDoc,
        },
    },
} as Meta<typeof dataFigureArgs>;

export const DataFigureDefault = story(
    dataFigureArgs,
    ({ headlineSlot, subtitleSlot, controlsSlot, defaultSlot, explanationsSlot }) => html`
        <vl-data-figure>
            ${unsafeHTML(headlineSlot)}${unsafeHTML(subtitleSlot)}${unsafeHTML(controlsSlot)}${unsafeHTML(defaultSlot)}
            <vl-chart-line .data=${unitInfoModel}></vl-chart-line>
            ${unsafeHTML(explanationsSlot)}
        </vl-data-figure>
    `,
);
DataFigureDefault.storyName = 'vl-data-figure - default';
DataFigureDefault.args = {
    headlineSlot: '<h3 slot="headline">Sinds 2019 daalt de concentratie in Gent elk jaar</h3>',
    subtitleSlot: '<p slot="subtitle">Jaargemiddelde per meetpunt, twee meetpunten, 2018-2024</p>',
    explanationsSlot:
        '<vl-data-reading-guide><p>Elke lijn is een meetpunt. Hoe hoger de lijn, hoe meer stof er dat jaar in de ' +
        'lucht zat.</p></vl-data-reading-guide>',
};
