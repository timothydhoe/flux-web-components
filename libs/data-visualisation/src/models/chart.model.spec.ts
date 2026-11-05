import { findModel, type ChartModel } from './chart.model';

const MODEL: ChartModel = {
    meta: {
        source: 'Vlaamse Milieumaatschappij',
        x: { type: 'number' },
        y: { type: 'number', unit: 'µg/m³' },
    },
    series: [{ name: 'Gent', x: Float64Array.from([2020, 2021]), y: Float64Array.from([10, 12]) }],
};

describe('findModel', () => {
    it('should return the model for data', () => {
        expect(findModel({ status: 'data', model: MODEL })).toBe(MODEL);
    });

    it('should return the model for partial data', () => {
        expect(findModel({ status: 'partial', model: MODEL })).toBe(MODEL);
    });

    it('should return null while loading, when empty and on an error', () => {
        expect(findModel({ status: 'loading' })).toBeNull();
        expect(findModel({ status: 'empty' })).toBeNull();
        expect(findModel({ status: 'error', problems: ['De bron antwoordde niet.'] })).toBeNull();
    });

    it('should return null without a data state', () => {
        expect(findModel(undefined)).toBeNull();
    });
});
