import { delay, http, HttpResponse } from 'msw';
import type { ChartJson } from '../chart-json.adapter';

// Voorbeelddata voor de stories van de bron: een gesimuleerde ELF-sensor (magnetisch veld langs een
// hoogspanningslijn), zoals in de PoC. De mock-API antwoordt op `from` en `to`, zoals een echte bron.

export const ELF_SRC = 'api/elf/sensors/ELF_L_0004';
export const ELF_BROKEN_SRC = 'api/elf/sensors/ELF_L_9999';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Hoe lang de periode, hoe minder punten per uur: een lijn van 50.000 punten leest niemand. */
function pickStep(span: number): number {
    if (span <= DAY) return 10 * MINUTE;
    if (span <= 7 * DAY) return HOUR;
    if (span <= 31 * DAY) return 4 * HOUR;
    return DAY;
}

/** Een veld dat met het verbruik meegaat: hoger overdag, lager 's nachts, met wat ruis. Altijd dezelfde waarde voor
 *  hetzelfde tijdstip, zodat de story bij elke keer laden hetzelfde toont. */
export function fieldAt(time: number, level = 0.3): number {
    const hours = new Date(time).getHours() + new Date(time).getMinutes() / 60;
    const daily = 0.12 * Math.sin(((hours - 9) / 24) * 2 * Math.PI);
    const noise = 0.02 * Math.sin(time / (7 * MINUTE)) + 0.015 * Math.sin(time / (53 * MINUTE));
    return Math.round((level + (daily + noise) * (level / 0.3)) * 1000) / 1000;
}

/** Een sensor van de voorbeelddata: zijn naam in de reeks en rond welk niveau zijn veld schommelt (µT). */
export type ElfSensorLevel = { name: string; level: number };

const TEMSE: ElfSensorLevel = { name: 'Temse', level: 0.3 };

export function buildElfJson(from: number, to: number, { name, level }: ElfSensorLevel = TEMSE): ChartJson {
    const step = pickStep(to - from);
    const end = Math.min(to, Date.now()); // geen metingen in de toekomst
    const x: string[] = [];
    const y: number[] = [];
    for (let time = from; time < end; time += step) {
        x.push(new Date(time).toISOString());
        y.push(fieldAt(time, level));
    }
    return {
        meta: {
            source: 'Departement Omgeving (voorbeelddata)',
            isOpenData: true,
            x: { type: 'time' },
            y: {
                type: 'number',
                title: 'Magnetische veldsterkte',
                unit: 'µT',
                unitInfo: 'microtesla, de sterkte van het magnetisch veld. De EU-limiet voor de bevolking is 100 µT.',
            },
        },
        series: [{ name, x, y }],
    };
}

export const elfHandlers = [
    http.get(`*/${ELF_SRC}`, async ({ request }) => {
        const params = new URL(request.url).searchParams;
        await delay(300); // zoals een echte bron: even laden
        return HttpResponse.json(
            buildElfJson(Date.parse(params.get('from') ?? ''), Date.parse(params.get('to') ?? '')),
        );
    }),
    http.get(`*/${ELF_BROKEN_SRC}`, () => new HttpResponse(null, { status: 503 })),
];
