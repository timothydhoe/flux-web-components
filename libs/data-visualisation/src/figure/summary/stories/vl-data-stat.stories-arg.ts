import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { CATEGORIES, CONTROLS, defaultArgs, defaultArgTypes, TYPES } from '@resources/utils-storybook';
import { STATISTICS } from '../statistic';

export const dataStatArgs = {
    ...defaultArgs,
    statistic: 'max',
    series: '',
    label: '',
};

export const dataStatArgTypes: ArgTypes<typeof dataStatArgs> = {
    ...defaultArgTypes,
    statistic: {
        name: 'statistic',
        description: 'Welke waarde: de hoogste (`max`), de laagste (`min`) of het gemiddelde (`mean`).',
        control: { type: CONTROLS.INLINE_RADIO },
        options: [...STATISTICS],
        table: {
            type: { summary: STATISTICS.join(' | ') },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: dataStatArgs.statistic },
        },
    },
    series: {
        name: 'series',
        description: 'De naam van de reeks om samen te vatten. Standaard de eerste reeks.',
        table: {
            type: { summary: TYPES.STRING },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: dataStatArgs.series },
        },
    },
    label: {
        name: 'label',
        description:
            'Wat er boven de waarde staat. Standaard "Hoogste waarde", "Laagste waarde" of "Gemiddelde". Met meer ' +
            'dan één reeks komt de naam van de reeks erachter.',
        table: {
            type: { summary: TYPES.STRING },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: dataStatArgs.label },
        },
    },
};
