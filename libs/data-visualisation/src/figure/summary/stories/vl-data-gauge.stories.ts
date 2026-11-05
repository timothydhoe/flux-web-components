import { registerWebComponents } from '@domg-wc/common';
import { story } from '@resources/utils-storybook';
import type { Meta } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { VlChartLine } from '../../../chart/line/vl-chart-line.component';
import { VlChartReference } from '../../../chart/vl-chart-reference.component';
import { ELF_SRC, elfHandlers } from '../../../source/stories/elf-story-data';
import { VlDataSource } from '../../../source/vl-data-source.component';
import { VlDataFigure } from '../../vl-data-figure.component';
import { VlDataGauge } from '../vl-data-gauge.component';
import { dataGaugeArgs, dataGaugeArgTypes } from './vl-data-gauge.stories-arg';
import dataGaugeDoc from './vl-data-gauge.stories-doc.mdx';

registerWebComponents([VlDataGauge, VlChartReference, VlDataSource, VlDataFigure, VlChartLine]);

export default {
    id: 'data-visualisation-data-gauge',
    title: 'Data visualisation/figuur/data-gauge',
    tags: ['autodocs'],
    args: dataGaugeArgs,
    argTypes: dataGaugeArgTypes,
    parameters: {
        docs: {
            page: dataGaugeDoc,
        },
        msw: { handlers: elfHandlers },
    },
} as Meta<typeof dataGaugeArgs>;

export const DataGaugeDefault = story(
    dataGaugeArgs,
    ({ customCSS, series, label, max, defaultSlot }) => html`
        <vl-data-source src=${ELF_SRC} period="24h">
            <vl-data-gauge
                style="max-width: 32rem;"
                custom-css=${customCSS}
                series=${series}
                label=${label}
                max=${max || nothing}
            >
                ${unsafeHTML(defaultSlot)}
            </vl-data-gauge>
        </vl-data-source>
    `,
);
DataGaugeDefault.storyName = 'vl-data-gauge - default';
DataGaugeDefault.args = {
    defaultSlot: '<vl-chart-reference value="0.4" label="Voorzorgswaarde"></vl-chart-reference>',
};

export const DataGaugeAsTile = story(
    dataGaugeArgs,
    () => html`
        <vl-data-source src=${ELF_SRC} period="24h">
            <div style="display: grid; grid-template-columns: 24rem 1fr; gap: 3.2rem; align-items: start;">
                <vl-data-gauge max="1">
                    <vl-chart-reference value="0.4" label="Voorzorgswaarde"></vl-chart-reference>
                </vl-data-gauge>
                <vl-data-figure>
                    <h3 slot="headline">Magnetische veldsterkte vandaag</h3>
                    <vl-chart-line>
                        <vl-chart-reference value="0.4" label="Voorzorgswaarde"></vl-chart-reference>
                    </vl-chart-line>
                </vl-data-figure>
            </div>
        </vl-data-source>
    `,
);
DataGaugeAsTile.storyName = 'vl-data-gauge - als tegel naast de figuur';
DataGaugeAsTile.parameters = { controls: { disable: true } };
