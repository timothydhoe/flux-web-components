import type { PeriodRange } from './period';

/** Bouwt de URL voor de data van één periode. Een app met een andere API geeft `vl-data-source` haar eigen functie. */
export type RequestUrlBuilder = (src: string, range: PeriodRange) => string;

/** Standaard: `from` en `to` als ISO 8601-parameters op `src`, zoals de Waterinfo-API en de OSLO-observaties ze
 *  kennen. Bestaande parameters in `src` blijven staan. */
export const buildRequestUrl: RequestUrlBuilder = (src, { from, to }) => {
    const url = new URL(src, document.baseURI);
    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());
    return url.toString();
};
