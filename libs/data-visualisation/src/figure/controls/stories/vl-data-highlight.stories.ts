import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { VlChartLine } from '../../../chart/line/vl-chart-line.component';
import { fourSeriesModel } from '../../stories/figure-story-data';
import { VlDataFigure } from '../../vl-data-figure.component';
import { VlDataHighlight } from '../vl-data-highlight.component';
import { dataHighlightArgs, dataHighlightArgTypes } from './vl-data-highlight.stories-arg';
import dataHighlightDoc from './vl-data-highlight.stories-doc.mdx';

registerWebComponents([VlDataFigure, VlDataHighlight, VlChartLine]);

export default {
    id: 'data-visualisation-data-highlight',
    title: 'Data visualisation/figuur/data-highlight',
    tags: ['autodocs'],
    args: dataHighlightArgs,
    argTypes: dataHighlightArgTypes,
    parameters: {
        docs: {
            page: dataHighlightDoc,
        },
    },
} as Meta<typeof dataHighlightArgs>;

export const DataHighlightDefault = story(
    dataHighlightArgs,
    ({ customCSS }) => html`
        <vl-data-figure>
            <h3 slot="headline">Concentratie per meetpunt</h3>
            <p slot="subtitle">Jaargemiddelde per meetpunt, vier meetpunten, 2018-2024</p>
            <vl-data-highlight custom-css=${customCSS}></vl-data-highlight>
            <vl-chart-line .data=${fourSeriesModel}></vl-chart-line>
        </vl-data-figure>
    `,
);
DataHighlightDefault.storyName = 'vl-data-highlight - default';

export const DataHighlightPreset = story(
    dataHighlightArgs,
    () => html`
        <vl-data-figure>
            <h3 slot="headline">Alleen in Hasselt stijgt de concentratie</h3>
            <p slot="subtitle">Jaargemiddelde per meetpunt, vier meetpunten, 2018-2024</p>
            <vl-data-highlight></vl-data-highlight>
            <vl-chart-line .data=${fourSeriesModel} highlight="Meetpunt Hasselt"></vl-chart-line>
        </vl-data-figure>
    `,
);
DataHighlightPreset.storyName = 'vl-data-highlight - vooraf gekozen';
