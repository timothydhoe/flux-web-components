import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { CATEGORIES, defaultArgs, defaultArgTypes, TYPES } from '@resources/utils-storybook';

export const dataFullscreenArgs = {
    ...defaultArgs,
    showLabel: false,
};

export const dataFullscreenArgTypes: ArgTypes<typeof dataFullscreenArgs> = {
    ...defaultArgTypes,
    showLabel: {
        name: 'show-label',
        description: 'Toont de tekst naast het icoon. Zonder dit alleen het icoon, met de tekst in een tooltip.',
        table: {
            type: { summary: TYPES.BOOLEAN },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: String(dataFullscreenArgs.showLabel) },
        },
    },
};
