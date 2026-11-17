import type { Period } from '../source/period';

/** Een control (bv. `vl-data-period`) vraagt hiermee een andere periode. `vl-data-source` luistert en haalt de data
 *  van die periode op; het event loopt daarna verder, zodat een app het kan volgen (bv. om de URL bij te werken). */
export const PERIOD_CHANGE_EVENT = 'vl-period-change';

export function createPeriodChangeEvent(period: Period): CustomEvent<Period> {
    return new CustomEvent(PERIOD_CHANGE_EVENT, { detail: period, bubbles: true, composed: true });
}

declare global {
    interface HTMLElementEventMap {
        [PERIOD_CHANGE_EVENT]: CustomEvent<Period>;
    }
}
