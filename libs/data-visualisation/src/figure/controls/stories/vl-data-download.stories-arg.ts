import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import {
    CATEGORIES,
    CONTROLS,
    defaultArgs,
    defaultArgTypes,
    getSelectControlOptions,
    TYPES,
} from '@resources/utils-storybook';
import type { DownloadFormat } from '../vl-data-download.component';

const FORMATS: DownloadFormat[] = ['png', 'csv'];

export const dataDownloadArgs = {
    ...defaultArgs,
    format: 'png' as DownloadFormat,
    showLabel: false,
};

export const dataDownloadArgTypes: ArgTypes<typeof dataDownloadArgs> = {
    ...defaultArgTypes,
    format: {
        name: 'format',
        description:
            '`png`: de grafiek met kop, eenheid en bron, om te delen.<br>' +
            '`csv`: de onafgeronde cijfers, om verder mee te rekenen.',
        control: { type: CONTROLS.INLINE_RADIO },
        options: FORMATS,
        table: {
            type: { summary: getSelectControlOptions(FORMATS) },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: dataDownloadArgs.format },
        },
    },
    showLabel: {
        name: 'show-label',
        description: 'Toont de tekst naast het icoon. Zonder dit alleen het icoon, met de tekst in een tooltip.',
        table: {
            type: { summary: TYPES.BOOLEAN },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: String(dataDownloadArgs.showLabel) },
        },
    },
};
