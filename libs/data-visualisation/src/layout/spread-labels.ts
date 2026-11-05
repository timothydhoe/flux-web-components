/** Een label: welke annotatie (index) en waar haar midden staat, in px vanaf de bovenkant van de plot. */
export type LabelPosition = { index: number; y: number };

type LabelGroup = { members: LabelPosition[]; top: number };

/** Hoeveel px elk label naar boven moet (Plotly `yshift`: positief = omhoog) zodat er minstens `spacing` px
 *  tussen de middens van twee labels zit. Labels die elkaar raken vormen een groep, gecentreerd rond hun
 *  gemiddelde hoogte; de volgorde blijft die van de lijnen. Labels die niet bewegen staan niet in het resultaat.
 *  Overgenomen uit POIROT `direct-labels.utils.ts`. */
export function calculateLabelShifts(positions: LabelPosition[], spacing: number): Map<number, number> {
    const shifts = new Map<number, number>();
    for (const { members, top } of groupOverlappingLabels(positions, spacing)) {
        members.forEach(({ index, y }, order) => {
            const target = top + order * spacing;
            if (target !== y) shifts.set(index, y - target);
        });
    }
    return shifts;
}

function groupOverlappingLabels(positions: LabelPosition[], spacing: number): LabelGroup[] {
    const sorted = [...positions].sort((a, b) => a.y - b.y);
    const groups: LabelGroup[] = [];
    for (const label of sorted) {
        groups.push({ members: [label], top: label.y });
        // Een nieuwe groep kan de vorige raken; voeg samen tot er niets meer overlapt.
        while (groups.length > 1) {
            const last = groups[groups.length - 1];
            const above = groups[groups.length - 2];
            if (above.top + above.members.length * spacing <= last.top) break;
            const members = [...above.members, ...last.members];
            groups.splice(-2, 2, { members, top: findCentredGroupTop(members, spacing) });
        }
    }
    return groups;
}

/** De bovenkant van een groep, zodat de groep rond de gemiddelde hoogte van haar leden staat. */
function findCentredGroupTop(members: LabelPosition[], spacing: number): number {
    const mean = members.reduce((sum, member) => sum + member.y, 0) / members.length;
    return mean - ((members.length - 1) * spacing) / 2;
}
