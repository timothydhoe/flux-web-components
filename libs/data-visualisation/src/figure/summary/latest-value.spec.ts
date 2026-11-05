import type { ChartModel } from '../../models/chart.model';
import { findLatestValue } from './latest-value';

const model: ChartModel = {
    meta: { source: 'VMM', x: { type: 'number' }, y: { type: 'number', unit: 'µg/m³' } },
    series: [
        { name: 'Meetpunt Gent', x: Float64Array.from([2022, 2023, 2024]), y: Float64Array.from([11.2, 10.8, NaN]) },
        {
            name: 'Meetpunt Antwerpen',
            x: Float64Array.from([2022, 2023, 2024]),
            y: Float64Array.from([13, 12.6, 12.2]),
        },
    ],
};

describe('findLatestValue', () => {
    it('should take the last value of the first series, skipping a gap at the end', () => {
        expect(findLatestValue(model)).toEqual({
            seriesName: 'Meetpunt Gent',
            value: 10.8,
            valueLabel: '10,8',
            unit: 'µg/m³',
            positionLabel: '2023',
        });
    });

    it('should take the series with that name', () => {
        expect(findLatestValue(model, 'Meetpunt Antwerpen')?.valueLabel).toBe('12,2');
    });

    it('should read a time as a Belgian date and time', () => {
        const time = new Date(2026, 7, 28, 21, 50).getTime();
        const timeModel: ChartModel = {
            ...model,
            meta: { ...model.meta, x: { type: 'time' } },
            series: [
                { name: 'Temse', x: Float64Array.from([time - 600000, time]), y: Float64Array.from([0.24, 0.231]) },
            ],
        };

        expect(findLatestValue(timeModel)).toMatchObject({ valueLabel: '0,231', positionLabel: '28/08/2026 21:50' });
    });

    it('should give null for an unknown series', () => {
        expect(findLatestValue(model, 'Meetpunt Brugge')).toBeNull();
    });
});
