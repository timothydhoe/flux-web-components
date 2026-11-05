import { calculateLabelShifts } from './spread-labels';

const SPACING = 18;

describe('calculateLabelShifts', () => {
    it('should not move labels that are far enough apart', () => {
        expect(
            calculateLabelShifts(
                [
                    { index: 0, y: 100 },
                    { index: 1, y: 200 },
                ],
                SPACING,
            ).size,
        ).toBe(0);
    });

    it('should not move a label that is exactly one spacing away', () => {
        expect(
            calculateLabelShifts(
                [
                    { index: 0, y: 100 },
                    { index: 1, y: 100 + SPACING },
                ],
                SPACING,
            ).size,
        ).toBe(0);
    });

    it('should spread two overlapping labels evenly around their middle', () => {
        const shifts = calculateLabelShifts(
            [
                { index: 0, y: 100 },
                { index: 1, y: 104 },
            ],
            SPACING,
        );

        // Midden 102: bovenste naar 93 (7 omhoog), onderste naar 111 (7 omlaag).
        expect(shifts).toEqual(
            new Map([
                [0, 7],
                [1, -7],
            ]),
        );
    });

    it('should keep the order of the labels', () => {
        const positions = [
            { index: 0, y: 120 },
            { index: 1, y: 110 },
            { index: 2, y: 115 },
        ];

        const shifts = calculateLabelShifts(positions, SPACING);
        const finalY = positions.map(({ index, y }) => y - (shifts.get(index) ?? 0));

        expect(finalY[1]).toBeLessThan(finalY[2]);
        expect(finalY[2]).toBeLessThan(finalY[0]);
    });

    it('should merge a group that runs into the next label', () => {
        // 0 en 1 vormen een groep die 2 raakt: alle drie komen in één groep, telkens SPACING uit elkaar.
        const positions = [
            { index: 0, y: 100 },
            { index: 1, y: 101 },
            { index: 2, y: 120 },
        ];

        const shifts = calculateLabelShifts(positions, SPACING);
        const finalY = positions.map(({ index, y }) => y - (shifts.get(index) ?? 0)).sort((a, b) => a - b);

        expect(finalY[1] - finalY[0]).toBe(SPACING);
        expect(finalY[2] - finalY[1]).toBe(SPACING);
    });

    it('should leave a single label alone', () => {
        expect(calculateLabelShifts([{ index: 0, y: 100 }], SPACING).size).toBe(0);
    });
});
