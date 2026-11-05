import type { ChartModel } from '../models/chart.model';
import { buildValueScale } from './axis-ranges';
import {
    buildReferenceLabels,
    buildReferenceShapes,
    describeReference,
    REFERENCE_ANNOTATION_NAME,
} from './reference-lines';

const model: ChartModel = {
    meta: { source: 'VMM', x: { type: 'number' }, y: { type: 'number', unit: 'µg/m³' } },
    series: [{ name: 'Meetpunt Gent', x: Float64Array.from([2020, 2021]), y: Float64Array.from([3.2, 3.6]) }],
};

describe('describeReference', () => {
    it('should give the label, the value with its own decimals and the unit', () => {
        expect(describeReference({ value: 5, label: 'WHO-advieswaarde' }, 'µg/m³')).toBe('WHO-advieswaarde: 5\u00A0µg/m³');
        expect(describeReference({ value: 0.4, label: 'Voorzorgswaarde' }, 'µT')).toBe('Voorzorgswaarde: 0,4\u00A0µT');
    });

    it('should give only the value without a label', () => {
        expect(describeReference({ value: 1250, label: '' })).toBe('1.250');
    });
});

describe('buildReferenceShapes', () => {
    it('should draw a dashed line across the plot, above the grid', () => {
        const [shape] = buildReferenceShapes([{ value: 5, label: 'WHO' }], '#4d535b');

        expect(shape).toMatchObject({ xref: 'paper', x0: 0, x1: 1, y0: 5, y1: 5, layer: 'above' });
        expect(shape.line).toEqual({ color: '#4d535b', width: 1, dash: 'dash' });
    });
});

describe('buildReferenceLabels', () => {
    it('should put the label left above the line, recognisable as a reference', () => {
        const [label] = buildReferenceLabels([{ value: 5, label: 'WHO' }], 'µg/m³', '#4d535b', '#fff');

        expect(label).toMatchObject({
            name: REFERENCE_ANNOTATION_NAME,
            x: 0,
            xanchor: 'left',
            y: 5,
            yanchor: 'bottom',
        });
        expect(label.text).toBe('WHO: 5\u00A0µg/m³');
    });
});

describe('buildValueScale - references', () => {
    it('should keep a reference above the data in view', () => {
        expect(buildValueScale(model, [5]).range).toEqual([0, 5]);
    });

    it('should not change without references', () => {
        expect(buildValueScale(model).range).toEqual([0, 4]);
    });
});
