import { ArgTypes } from '@storybook/web-components-vite';
// de import is bewust op deze manier om voor de web-types.generator 'binnen' de monorepo geen side-effect te geven
import { CATEGORIES, defaultArgs, defaultArgTypes } from '@resources/utils-storybook';
import { action } from 'storybook/actions';

export const dataPeriodArgs = {
    ...defaultArgs,
    onPeriodChange: action('vl-period-change'),
};

export const dataPeriodArgTypes: ArgTypes<typeof dataPeriodArgs> = {
    ...defaultArgTypes,
    onPeriodChange: {
        name: 'vl-period-change',
        description:
            'Afgevuurd als de lezer een andere periode kiest. `vl-data-source` luistert en haalt de data op; het ' +
            'event loopt verder, zodat een app het kan volgen, bv. om de periode in de URL te zetten.',
        table: {
            type: { summary: "{ duration: '24h' | '7d' | '30d' | '1y', end: Date }" },
            category: CATEGORIES.EVENTS,
        },
    },
};
