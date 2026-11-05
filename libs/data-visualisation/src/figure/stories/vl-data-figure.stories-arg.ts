import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { CATEGORIES, defaultArgs, defaultArgTypes, TYPES } from '@resources/utils-storybook';

export const dataFigureArgs = {
    ...defaultArgs,
    headlineSlot: '',
    subtitleSlot: '',
    controlsSlot: '',
    defaultSlot: '',
    explanationsSlot: '',
};

export const dataFigureArgTypes: ArgTypes<typeof dataFigureArgs> = {
    ...defaultArgTypes,
    headlineSlot: {
        name: 'headline',
        description:
            'De kop: een heading van het niveau dat op de pagina past, bv. `<h3 slot="headline">`. Zeg erin wat ' +
            'de lezer moet zien, niet alleen wat de grafiek toont.<br>Staat ook als titel in de PNG en in de naam van ' +
            'de PNG en CSV.',
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
        description:
            'Controls naast de kop, bv. `vl-data-period` of `vl-data-highlight`. Onderdelen van Flux zetten ' +
            'zichzelf in dit slot. Ze staan vóór de standaardknoppen (PNG bewaren, vergroten); een eigen ' +
            '`vl-data-controls` vervangt die standaardknoppen.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataFigureArgs.controlsSlot },
        },
    },
    defaultSlot: {
        name: '[default]',
        description: 'De visual, bv. `vl-chart-line`, en wat er direct bij hoort, zoals `vl-data-latest`.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataFigureArgs.defaultSlot },
        },
    },
    explanationsSlot: {
        name: 'explanations',
        description:
            'Uitklapbare uitleg onder de visual: `vl-data-reading-guide`, `vl-data-about` of een eigen ' +
            '`vl-data-table`. Onderdelen van Flux zetten zichzelf in dit slot. De tabel staat er altijd; ' +
            '"Over deze data" alleen als het meer vertelt dan de bronregel.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataFigureArgs.explanationsSlot },
        },
    },
};
