import { delay, http, HttpResponse } from 'msw';
import { buildElfJson, fieldAt } from '../../source/stories/elf-story-data';

// Voorbeelddata voor de spike met de kaart: ELF-sensoren en een schets van het hoogspanningsnet in Lambert 72
// (EPSG:31370). De plaatsen zijn bij benadering; de lijnen zijn geen echte tracés.

export const ELF_SENSORS_SRC = 'api/elf/sensors';
export const ELF_LINES_SRC = 'api/elf/lines';

const TEN_MINUTES = 10 * 60 * 1000;

/** De tijd van de laatste meting: elke 10 minuten, zoals de reeks van een sensor, zodat kaart en grafiek hetzelfde
 *  getal tonen. */
const lastMeasurementTime = (now: number) => now - (now % TEN_MINUTES || TEN_MINUTES);

export type SensorStatus = 'online' | 'offline';

export type ElfSensor = {
    id: string;
    name: string;
    voltage: number;
    status: SensorStatus;
    /** Rond welk niveau het veld schommelt (µT). */
    level: number;
    coordinates: [number, number];
};

export const ELF_SENSORS: ElfSensor[] = [
    { id: 'ELF_L_0001', name: 'Maldegem', voltage: 380, status: 'online', level: 0.42, coordinates: [88000, 208000] },
    { id: 'ELF_L_0004', name: 'Temse', voltage: 380, status: 'online', level: 0.3, coordinates: [137000, 205000] },
    { id: 'ELF_L_0007', name: 'Aalst', voltage: 150, status: 'online', level: 0.65, coordinates: [128000, 176000] },
    { id: 'ELF_L_0009', name: 'Ninove', voltage: 150, status: 'online', level: 0.55, coordinates: [124000, 162000] },
    { id: 'ELF_L_0012', name: 'Kortrijk', voltage: 380, status: 'offline', level: 0.2, coordinates: [73000, 170000] },
];

/** De sensoren als GeoJSON, met hun laatste meting erbij: wat de kaart toont zonder elke reeks op te halen. */
export function buildSensorFeatures(now = Date.now()) {
    const time = lastMeasurementTime(now);
    return {
        type: 'FeatureCollection',
        features: ELF_SENSORS.map((sensor) => ({
            type: 'Feature',
            id: sensor.id,
            geometry: { type: 'Point', coordinates: sensor.coordinates },
            properties: {
                name: sensor.name,
                voltage: sensor.voltage,
                status: sensor.status,
                latest: sensor.status === 'online' ? fieldAt(time, sensor.level) : null,
            },
        })),
    };
}

const line = (voltage: number, coordinates: [number, number][]) => ({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates },
    properties: { voltage },
});

/** Een schets van het net: genoeg om te zien hoe lijnen en sensoren samen op de kaart staan. */
export const POWER_LINE_FEATURES = {
    type: 'FeatureCollection',
    features: [
        line(380, [
            [69000, 211000],
            [88000, 208000],
            [105000, 198000],
            [137000, 205000],
            [152000, 212000],
        ]),
        line(380, [
            [73000, 170000],
            [80000, 185000],
            [105000, 198000],
        ]),
        line(150, [
            [137000, 205000],
            [131000, 190000],
            [128000, 176000],
            [124000, 162000],
        ]),
        line(70, [
            [105000, 198000],
            [112000, 180000],
            [128000, 176000],
        ]),
    ],
};

export const elfMapHandlers = [
    http.get(`*/${ELF_SENSORS_SRC}`, async () => {
        await delay(200);
        return HttpResponse.json(buildSensorFeatures());
    }),
    http.get(`*/${ELF_LINES_SRC}`, () => HttpResponse.json(POWER_LINE_FEATURES)),
    http.get(`*/${ELF_SENSORS_SRC}/:id`, async ({ request, params }) => {
        const sensor = ELF_SENSORS.find((candidate) => candidate.id === params.id);
        await delay(300);
        if (!sensor || sensor.status === 'offline') return new HttpResponse(null, { status: 503 });
        const search = new URL(request.url).searchParams;
        return HttpResponse.json(
            buildElfJson(Date.parse(search.get('from') ?? ''), Date.parse(search.get('to') ?? ''), sensor),
        );
    }),
];
