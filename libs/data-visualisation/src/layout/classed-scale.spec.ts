import { buildClassedScale, describeScaleClass } from './classed-scale';

const ramp = ['#1', '#2', '#3', '#4', '#5', '#6', '#7'];

describe('buildClassedScale', () => {
    it('should make classes with the round bounds of a value axis', () => {
        const { classes } = buildClassedScale([0.39, 0.55, 0.72, 0.85], ramp);

        expect(classes.map(({ from, to }) => [from, to])).toEqual([
            [0, 0.2],
            [0.2, 0.4],
            [0.4, 0.6],
            [0.6, 0.8],
            [0.8, 1],
        ]);
    });

    it('should spread the colors of the ramp from light to dark', () => {
        const { classes } = buildClassedScale([0.39, 0.55, 0.72, 0.85], ramp);

        expect(classes.map((scaleClass) => scaleClass.color)).toEqual(['#1', '#3', '#4', '#6', '#7']);
    });

    it('should give the color of the class a value falls in, the top bound included', () => {
        const scale = buildClassedScale([0.39, 0.55, 0.72, 0.85], ramp);

        expect(scale.colorOf(0.39)).toBe('#3');
        expect(scale.colorOf(0.4)).toBe('#4');
        expect(scale.colorOf(1)).toBe('#7');
    });

    it('should keep one class, in the darkest color, when every value is 0', () => {
        const scale = buildClassedScale([0, 0], ramp);

        expect(scale.classes).toEqual([{ from: 0, to: 1, color: '#7' }]);
        expect(scale.colorOf(0)).toBe('#7');
    });
});

describe('describeScaleClass', () => {
    it('should write each bound with its own decimals and the unit once', () => {
        expect(describeScaleClass({ from: 0, to: 0.2, color: '#1' }, 'µT')).toBe('0 - 0,2\u00A0µT');
    });
});
