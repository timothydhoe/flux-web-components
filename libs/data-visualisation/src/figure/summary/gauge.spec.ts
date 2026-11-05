import { buildGaugeView } from './gauge';

const precaution = { value: 0.4, label: 'Voorzorgswaarde' };

describe('buildGaugeView', () => {
    it('should run from 0 to a round number above the value and the references', () => {
        const view = buildGaugeView(0.23, [precaution]);

        expect(view.range).toEqual([0, 0.4]);
        expect(view.valueShare).toBeCloseTo(0.575);
        expect(view.references[0]).toMatchObject({ share: 1, comparison: 'below' });
    });

    it('should run to the max of the author', () => {
        const view = buildGaugeView(0.5, [precaution], 1);

        expect(view.range).toEqual([0, 1]);
        expect(view.valueShare).toBe(0.5);
        expect(view.references[0]).toMatchObject({ share: 0.4, comparison: 'above' });
    });

    it('should fill the whole meter for a value above the max', () => {
        expect(buildGaugeView(1.5, [], 1).valueShare).toBe(1);
    });

    it('should say when the value equals a reference', () => {
        expect(buildGaugeView(0.4, [precaution]).references[0].comparison).toBe('equal');
    });

    it('should keep an empty meter for 0 without references', () => {
        expect(buildGaugeView(0, [])).toMatchObject({ range: [0, 0], valueShare: 0 });
    });
});
