import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { defaultArgs, defaultArgTypes } from '@resources/utils-storybook';

export const dataHighlightArgs = {
    ...defaultArgs,
};

export const dataHighlightArgTypes: ArgTypes<typeof dataHighlightArgs> = {
    ...defaultArgTypes,
};
