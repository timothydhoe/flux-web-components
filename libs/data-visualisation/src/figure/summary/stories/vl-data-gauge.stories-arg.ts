import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { CATEGORIES, defaultArgs, defaultArgTypes, TYPES } from '@resources/utils-storybook';

export const dataGaugeArgs = {
    ...defaultArgs,
    series: '',
    label: '',
    max: '',
    defaultSlot: '',
};

export const dataGaugeArgTypes: ArgTypes<typeof dataGaugeArgs> = {
    ...defaultArgTypes,
    series: {
        name: 'series',
        description: 'De naam van de reeks om te tonen. Standaard de eerste reeks.',
        table: {
            type: { summary: TYPES.STRING },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: dataGaugeArgs.series },
        },
    },
    label: {
        name: 'label',
        description:
            'Wat er boven de waarde staat. Standaard "Laatste meting". Met meer dan één reeks komt de naam van de ' +
            'reeks erachter.',
        table: {
            type: { summary: TYPES.STRING },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: dataGaugeArgs.label },
        },
    },
    max: {
        name: 'max',
        description:
            'Waar de meter eindigt, in de eenheid van de data. Zonder: een rond getal boven de waarde en de normen.',
        table: {
            type: { summary: TYPES.NUMBER },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: dataGaugeArgs.max },
        },
    },
    defaultSlot: {
        name: '[default]',
        description:
            'Eén of meer `vl-chart-reference`-tags: de normen of streefwaarden om de waarde aan af te meten, elk met ' +
            'een streep op de meter en een zin eronder.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: dataGaugeArgs.defaultSlot },
        },
    },
};
