import type { ChartModel } from '../../models/chart.model';
import { findStatistic } from './statistic';

const model: ChartModel = {
    meta: { source: 'VMM', x: { type: 'number' }, y: { type: 'number', unit: 'µg/m³' } },
    series: [
        {
            name: 'Meetpunt Gent',
            x: Float64Array.from([2021, 2022, 2023, 2024]),
            y: Float64Array.from([11.9, NaN, 12.5, 10.1]),
        },
        { name: 'Meetpunt Antwerpen', x: Float64Array.from([2023, 2024]), y: Float64Array.from([12.6, 12.6]) },
    ],
};

describe('findStatistic', () => {
    it('should give the highest value of the first series and when it was measured', () => {
        expect(findStatistic(model, 'max')).toEqual({
            seriesName: 'Meetpunt Gent',
            value: 12.5,
            valueLabel: '12,5',
            unit: 'µg/m³',
            positionLabel: '2023',
        });
    });

    it('should give the lowest value', () => {
        expect(findStatistic(model, 'min')).toMatchObject({ valueLabel: '10,1', positionLabel: '2024' });
    });

    it('should give the mean over the values, skipping a gap, with the period it covers', () => {
        expect(findStatistic(model, 'mean')).toMatchObject({ valueLabel: '11,5', positionLabel: '2021 - 2024' });
    });

    it('should take the first of equal values', () => {
        expect(findStatistic(model, 'max', 'Meetpunt Antwerpen')).toMatchObject({ valueLabel: '12,6', positionLabel: '2023' });
    });

    it('should give null for an unknown series or a series without values', () => {
        expect(findStatistic(model, 'max', 'Meetpunt Brugge')).toBeNull();
        const empty = { ...model, series: [{ ...model.series[0], y: Float64Array.from([NaN, NaN, NaN, NaN]) }] };
        expect(findStatistic(empty, 'mean')).toBeNull();
    });
});
