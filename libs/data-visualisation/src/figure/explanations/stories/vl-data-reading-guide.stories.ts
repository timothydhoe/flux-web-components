import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { VlChartLine } from '../../../chart/line/vl-chart-line.component';
import type { ChartModel } from '../../../models/chart.model';
import { gapModel, twoSeriesModel } from '../../stories/figure-story-data';
import { VlDataFigure } from '../../vl-data-figure.component';
import { VlDataReadingGuide } from '../vl-data-reading-guide.component';
import { dataReadingGuideArgs, dataReadingGuideArgTypes } from './vl-data-reading-guide.stories-arg';
import dataReadingGuideDoc from './vl-data-reading-guide.stories-doc.mdx';

registerWebComponents([VlDataFigure, VlDataReadingGuide, VlChartLine]);

export default {
    id: 'data-visualisation-data-reading-guide',
    title: 'Data visualisation/figuur/data-reading-guide',
    tags: ['autodocs'],
    args: dataReadingGuideArgs,
    argTypes: dataReadingGuideArgTypes,
    parameters: {
        docs: {
            page: dataReadingGuideDoc,
        },
    },
} as Meta<typeof dataReadingGuideArgs>;

const renderFigure = (
    headline: string,
    data: ChartModel,
    { customCSS, defaultSlot }: typeof dataReadingGuideArgs,
) => html`
    <vl-data-figure>
        <h3 slot="headline">${headline}</h3>
        <vl-chart-line .data=${data}></vl-chart-line>
        <vl-data-reading-guide custom-css=${customCSS}>${unsafeHTML(defaultSlot)}</vl-data-reading-guide>
    </vl-data-figure>
`;

export const DataReadingGuideDefault = story(dataReadingGuideArgs, (args) =>
    renderFigure('In Gent en Antwerpen daalt de concentratie sinds 2020', twoSeriesModel, args),
);
DataReadingGuideDefault.storyName = 'vl-data-reading-guide - default';
DataReadingGuideDefault.args = {
    defaultSlot: '<p>Elke lijn is een meetpunt. Hoe hoger de lijn, hoe meer stof er dat jaar in de lucht zat.</p>',
};

export const DataReadingGuideWithGap = story(dataReadingGuideArgs, (args) =>
    renderFigure('In 2020 en 2021 mat Gent niet', gapModel, args),
);
DataReadingGuideWithGap.storyName = 'vl-data-reading-guide - uitleg bij een gat';
DataReadingGuideWithGap.args = {
    defaultSlot: '<p>Een onderbroken lijn betekent dat er dat jaar geen meting was.</p>',
};
