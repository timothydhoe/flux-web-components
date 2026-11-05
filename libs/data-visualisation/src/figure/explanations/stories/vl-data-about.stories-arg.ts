import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { CATEGORIES, defaultArgs, defaultArgTypes, TYPES } from '@resources/utils-storybook';

export const dataAboutArgs = {
    ...defaultArgs,
    defaultSlot: '',
};

export const dataAboutArgTypes: ArgTypes<typeof dataAboutArgs> = {
    ...defaultArgTypes,
    defaultSlot: {
        name: '[default]',
        description: 'Eigen uitleg, onder wat het datacontract (`meta`) al vertelt, bv. hoe of waar er gemeten is.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataAboutArgs.defaultSlot },
        },
    },
};
