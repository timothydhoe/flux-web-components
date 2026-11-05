import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { CATEGORIES, defaultArgs, defaultArgTypes, TYPES } from '@resources/utils-storybook';
import { action } from 'storybook/actions';
import type { ChartModel } from '../../../models/chart.model';

export const chartLineArgs = {
    ...defaultArgs,
    data: undefined as ChartModel | undefined,
    highlight: '',
    disableHoverFade: false,
    defaultSlot: '',
    onDataChange: action('vl-data-change'),
};

export const chartLineArgTypes: ArgTypes<typeof chartLineArgs> = {
    ...defaultArgTypes,
    data: {
        name: 'data',
        description:
            'Het model om te tekenen: `meta` (bron, assen met naam en eenheid) en `series` (naam, x, y).<br>' +
            'Alleen via JavaScript (`.data=${model}`). Zonder `data` tekent de grafiek de data van de ' +
            'dichtstbijzijnde `vl-data-source`.',
        control: false,
        table: {
            type: { summary: 'ChartModel' },
            category: CATEGORIES.PROPERTIES,
        },
    },
    highlight: {
        name: 'highlight',
        description: 'De naam van een reeks om uit te lichten: in kleur en dikker, de andere reeksen in grijs.',
        table: {
            type: { summary: TYPES.STRING },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: chartLineArgs.highlight },
        },
    },
    disableHoverFade: {
        name: 'disable-hover-fade',
        description: 'Laat de andere lijnen niet vervagen als de muis een lijn aanwijst.',
        table: {
            type: { summary: TYPES.BOOLEAN },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: String(chartLineArgs.disableHoverFade) },
        },
    },
    defaultSlot: {
        name: '[default]',
        description: 'Eén of meer `vl-chart-reference` tags: een referentielijn met waarde en label, bv. een norm.',
        table: {
            type: { summary: TYPES.HTML },
            category: CATEGORIES.SLOTS,
            defaultValue: { summary: chartLineArgs.defaultSlot },
        },
    },
    onDataChange: {
        name: 'vl-data-change',
        description:
            'Afgevuurd als de toestand van de grafiek verandert: laden, data, deels data (met gaten), geen data ' +
            'of fout.<br>Bubbelt tot buiten de shadow DOM; zo kent de figuur de toestand.',
        table: {
            type: { summary: "{ status: 'loading' | 'data' | 'partial' | 'empty' | 'error' }" },
            category: CATEGORIES.EVENTS,
        },
    },
};
