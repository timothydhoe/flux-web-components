import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { CATEGORIES, CONTROLS, defaultArgs, defaultArgTypes, TYPES } from '@resources/utils-storybook';

export const chartReferenceArgs = {
    ...defaultArgs,
    value: undefined as number | undefined,
    label: '',
};

export const chartReferenceArgTypes: ArgTypes<typeof chartReferenceArgs> = {
    ...defaultArgTypes,
    value: {
        name: 'value',
        description:
            'De waarde op de waarde-as, in de eenheid van de data, bv. `5` voor 5 µg/m³.<br>' +
            'Zonder geldige waarde tekent de grafiek geen lijn en meldt ze dat in de console.',
        control: { type: CONTROLS.NUMBER },
        table: {
            type: { summary: TYPES.NUMBER },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: '' },
        },
    },
    label: {
        name: 'label',
        description: 'Wat de waarde is, bv. "EU-grenswaarde 2030". Staat links boven de lijn, met de waarde erbij.',
        table: {
            type: { summary: TYPES.STRING },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: chartReferenceArgs.label },
        },
    },
};
