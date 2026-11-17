import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { CATEGORIES, defaultArgs, defaultArgTypes, TYPES } from '@resources/utils-storybook';

export const dataFigureArgs = {
    ...defaultArgs,
    headlineSlot: '',
    subtitleSlot: '',
    controlsSlot: '',
    filtersSlot: '',
    defaultSlot: '',
    explanationsSlot: '',
};

export const dataFigureArgTypes: ArgTypes<typeof dataFigureArgs> = {
    ...defaultArgTypes,
    headlineSlot: {
        name: 'headline',
        description:
            'De kop van de figuur, bv. `<h3 slot="headline">`. Beschrijf wat de gebruiker in de grafiek moet zien.<br>De kop wordt ook gebruikt als bestandsnaam van de PNG en CSV, en als titel op de PNG.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataFigureArgs.headlineSlot },
        },
    },
    subtitleSlot: {
        name: 'subtitle',
        description: 'De ondertitel: wat, waar en wanneer, bv. `<p slot="subtitle">Jaargemiddelde, 2018-2024</p>`.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataFigureArgs.subtitleSlot },
        },
    },
    controlsSlot: {
        name: 'controls',
        description: 'Extra controls naast de kop. Ze worden vóór de standaardknoppen getoond.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataFigureArgs.controlsSlot },
        },
    },
    filtersSlot: {
        name: 'filters',
        description:
            'De componenten die bepalen welke data de grafiek toont, bv. `vl-data-period`.<br>Ze worden onder de kop getoond.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataFigureArgs.filtersSlot },
        },
    },
    defaultSlot: {
        name: '[default]',
        description: 'De grafiek.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataFigureArgs.defaultSlot },
        },
    },
    explanationsSlot: {
        name: 'explanations',
        description:
            'De uitleg onder de grafiek, bv. `vl-data-reading-guide`, `vl-data-about` of een eigen `vl-data-table`.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataFigureArgs.explanationsSlot },
        },
    },
};
