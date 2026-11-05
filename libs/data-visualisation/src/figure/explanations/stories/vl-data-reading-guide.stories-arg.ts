import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { CATEGORIES, defaultArgs, defaultArgTypes, TYPES } from '@resources/utils-storybook';

export const dataReadingGuideArgs = {
    ...defaultArgs,
    defaultSlot: '',
};

export const dataReadingGuideArgTypes: ArgTypes<typeof dataReadingGuideArgs> = {
    ...defaultArgTypes,
    defaultSlot: {
        name: '[default]',
        description: 'De uitleg, in gewone HTML. Zonder inhoud blijft het blok weg: er is geen standaardtekst.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataReadingGuideArgs.defaultSlot },
        },
    },
};
