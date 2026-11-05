import { buildWidthClasses, findWidth } from './width-classes';

describe('buildWidthClasses', () => {
    it('should give each value its own width, the largest the thickest', () => {
        expect(buildWidthClasses([150, 380, 70, 380])).toEqual([
            { from: 380, width: 3.5, isLowest: false },
            { from: 150, width: 2, isLowest: false },
            { from: 70, width: 1, isLowest: true },
        ]);
    });

    it('should put every smaller value in the thinnest class', () => {
        const classes = buildWidthClasses([380, 220, 150, 70, 36]);

        expect(classes.map(({ from }) => from)).toEqual([380, 220, 36]);
        expect(findWidth(classes, 150)).toBe(1);
        expect(findWidth(classes, 70)).toBe(1);
    });

    it('should skip values that are not numbers', () => {
        expect(buildWidthClasses([380, NaN])).toEqual([{ from: 380, width: 3.5, isLowest: true }]);
    });
});

describe('findWidth', () => {
    it('should give a value below every class the thinnest width of those classes, also custom widths', () => {
        const classes = buildWidthClasses([380, 150], [6, 4]);

        expect(findWidth(classes, 10)).toBe(4);
    });

    it('should give the thinnest default width without classes', () => {
        expect(findWidth([], 10)).toBe(1);
    });
});
