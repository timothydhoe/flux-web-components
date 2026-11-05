import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { CATEGORIES, defaultArgs, defaultArgTypes, TYPES } from '@resources/utils-storybook';

export const dataControlsArgs = {
    ...defaultArgs,
    defaultSlot: '',
};

export const dataControlsArgTypes: ArgTypes<typeof dataControlsArgs> = {
    ...defaultArgTypes,
    defaultSlot: {
        name: '[default]',
        description:
            'De controls, in de volgorde waarin ze moeten staan: `vl-data-download`, `vl-data-fullscreen`, ' +
            '`vl-data-highlight` of een eigen control.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataControlsArgs.defaultSlot },
        },
    },
};
