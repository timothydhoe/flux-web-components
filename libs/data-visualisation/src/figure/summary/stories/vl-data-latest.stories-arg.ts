import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { CATEGORIES, defaultArgs, defaultArgTypes, TYPES } from '@resources/utils-storybook';

export const dataLatestArgs = {
    ...defaultArgs,
    series: '',
    label: 'Laatste meting',
};

export const dataLatestArgTypes: ArgTypes<typeof dataLatestArgs> = {
    ...defaultArgTypes,
    series: {
        name: 'series',
        description: 'De naam van de reeks om te tonen. Standaard de eerste reeks.',
        table: {
            type: { summary: TYPES.STRING },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: dataLatestArgs.series },
        },
    },
    label: {
        name: 'label',
        description:
            'Wat er boven de waarde staat, bv. "Laatste jaargemiddelde". Met meer dan één reeks komt de naam van ' +
            'de reeks erachter.',
        table: {
            type: { summary: TYPES.STRING },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: dataLatestArgs.label },
        },
    },
};
