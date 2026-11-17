import type { DataState } from '../models/chart.model';

/** Een visual meldt hiermee elke nieuwe toestand van zijn data, zodat de figuur (en wie nog luistert) weet wat er
 *  getoond wordt. `composed`: het event gaat door shadow roots heen, ook als de visual in een andere component staat. */
export const DATA_CHANGE_EVENT = 'vl-data-change';

export function createDataChangeEvent(dataState: DataState): CustomEvent<DataState> {
    return new CustomEvent(DATA_CHANGE_EVENT, { detail: dataState, bubbles: true, composed: true });
}

declare global {
    interface HTMLElementEventMap {
        [DATA_CHANGE_EVENT]: CustomEvent<DataState>;
    }
}
