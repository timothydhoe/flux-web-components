/** Een `vl-data-map-layer` meldt dat de lezer een punt koos (of de keuze ongedaan maakte: `detail` is dan `null`). */
export const DATA_MAP_SELECT_EVENT = 'vl-data-map-select';

export type DataMapSelection = { id: string | number; properties: Record<string, unknown> } | null;

export function createDataMapSelectEvent(selection: DataMapSelection): CustomEvent<DataMapSelection> {
    return new CustomEvent(DATA_MAP_SELECT_EVENT, { detail: selection, bubbles: true, composed: true });
}

/** Een laag meldt dat haar legende veranderde, bv. na nieuwe data; `vl-data-map-legend` tekent zich dan opnieuw. */
export const DATA_MAP_LEGEND_CHANGE_EVENT = 'vl-data-map-legend-change';
