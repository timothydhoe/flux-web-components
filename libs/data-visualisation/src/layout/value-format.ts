import type { ChartModel } from '../models/chart.model';

/** Meer cijfers na de komma leest niemand nog in een grafiek. */
const MAX_DECIMALS = 3;

/** Haalt afrondingsruis van kommagetallen weg: 0.1 + 0.2 = 0.30000000000000004 wordt 0.3. Twaalf beduidende
 *  cijfers: ruim meer dan een meting heeft, en minder dan de 15 à 17 waar de ruis begint. */
export function removeFloatNoise(value: number): number {
    return Number(value.toPrecision(12));
}

/** Hoeveel cijfers na de komma één waarde heeft, bv. 0 voor 100 en 1 voor 0,4. Hoogstens MAX_DECIMALS. */
export function countDecimalsInValue(value: number): number {
    // Zonder ruis: 0.1 + 0.2 heeft anders 17 decimalen.
    const [, fraction = ''] = String(removeFloatNoise(value)).split('.');
    return Math.min(fraction.length, MAX_DECIMALS);
}

/** Hoeveel cijfers na de komma de data nodig heeft: het meeste van alle waarden, zodat 12,5 en 13 als 12,5 en 13,0
 *  naast elkaar staan en kolommen in de tooltip uitlijnen. Gaten (NaN) tellen niet mee. */
export function countDecimalsInData(model: ChartModel): number {
    let decimals = 0;
    for (const series of model.series) {
        for (const value of series.y) {
            if (!Number.isNaN(value)) decimals = Math.max(decimals, countDecimalsInValue(value));
        }
    }
    return decimals;
}

/** Dezelfde notatie als `formatValue`, maar als d3-format voor Plotly. Plotly vertaalt `,` en `.` via
 *  `layout.separators` naar het Nederlandse duizendtal en decimaalteken. */
export function buildValueFormat(decimals: number): string {
    return `,.${decimals}f`;
}

/** Tussen getal en eenheid: een harde spatie, zodat "13,0" en "µg/m³" nooit over twee regels breken. */
export const UNIT_SEPARATOR = '\u00A0';

/** `valueLabel` met de eenheid erachter, of alleen `valueLabel` zonder eenheid. */
export function appendUnit(valueLabel: string, unit?: string): string {
    if (!unit) return valueLabel;
    return `${valueLabel}${UNIT_SEPARATOR}${unit}`;
}

/** Een waarde zoals op de as en in de tooltip, bv. "1.250,5 µg/m³", voor tekst buiten Plotly (schermlezer). */
export function formatValue(value: number, decimals: number, unit?: string): string {
    const number = new Intl.NumberFormat('nl-BE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
    return appendUnit(number, unit);
}
