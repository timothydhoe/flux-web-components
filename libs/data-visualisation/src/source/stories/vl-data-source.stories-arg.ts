import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import {
    CATEGORIES,
    CONTROLS,
    defaultArgs,
    defaultArgTypes,
    getSelectControlOptions,
    TYPES,
} from '@resources/utils-storybook';
import { PERIOD_DURATIONS } from '../period';

export const dataSourceArgs = {
    ...defaultArgs,
    src: '',
    period: '24h',
    end: '',
    adapter: undefined,
    buildUrl: undefined,
};

export const dataSourceArgTypes: ArgTypes<typeof dataSourceArgs> = {
    ...defaultArgTypes,
    src: {
        name: 'src',
        description:
            'De URL van de bron. Per periode komen er `from` en `to` bij als ISO 8601-parameters, bv. ' +
            '`?from=2026-11-04T00:00:00.000Z&to=2026-11-05T00:00:00.000Z`.',
        table: {
            type: { summary: TYPES.URL },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: dataSourceArgs.src },
        },
    },
    period: {
        name: 'period',
        description: 'De lengte van de periode waarmee de pagina opent.',
        control: { type: CONTROLS.SELECT },
        options: [...PERIOD_DURATIONS],
        table: {
            type: { summary: getSelectControlOptions([...PERIOD_DURATIONS]) },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: dataSourceArgs.period },
        },
    },
    end: {
        name: 'end',
        description: 'De laatste dag van de periode, als "2026-08-28". Standaard vandaag.',
        table: {
            type: { summary: TYPES.STRING },
            category: CATEGORIES.ATTRIBUTES,
            defaultValue: { summary: dataSourceArgs.end },
        },
    },
    adapter: {
        name: 'adapter',
        description:
            'Zet het antwoord van de bron om naar het `ChartModel`. Standaard `adaptChartJson`: het ChartModel in ' +
            'JSON. Geef een eigen functie voor een bron met een andere vorm.',
        control: false,
        table: {
            type: { summary: '(input: unknown) => ChartModel' },
            category: CATEGORIES.PROPERTIES,
        },
    },
    buildUrl: {
        name: 'buildUrl',
        description:
            'Bouwt de URL voor een periode. Standaard `from` en `to` als parameters op `src`. Geef een eigen ' +
            'functie voor een API die de periode anders vraagt.',
        control: false,
        table: {
            type: { summary: '(src: string, range: { from: Date; to: Date }) => string' },
            category: CATEGORIES.PROPERTIES,
        },
    },
};
