import type { ChartModel } from './chart.model';

/** Zoveel kleuren heeft het categorisch palet; een zevende kleur is er niet. Meer reeksen vragen een andere
 *  vorm (uitlichten, kleine veelvouden), geen hergebruikte kleur. */
export const MAX_SERIES = 6;

/** Controleert of een model kan worden getekend. Geeft alle problemen terug
 in een lijst.
 * @returns problemen[]
 */
export function validateChartModel(model: ChartModel): string[] {
    if (!model?.meta?.x || !model.meta.y || !Array.isArray(model.series)) {
        return ['Het model heeft niet de vorm { meta: { x, y }, series: [] }.'];
    }
    const problems: string[] = [];
    if (!model.meta.source) {
        problems.push('De data heeft geen bron.');
    }
    if (model.series.length > MAX_SERIES) {
        problems.push(
            `Het model heeft ${model.series.length} reeksen; hoogstens ${MAX_SERIES} zijn leesbaar te kleuren.`,
        );
    }
    if (model.series.length > 0 && !model.meta.y.unit) {
        problems.push('De y-as heeft geen eenheid.');
    }

    for (const series of model.series) {
        if (series.x.some((value) => Number.isNaN(value))) {
            problems.push(`Reeks '${series.name}' heeft x-waarden die geen getal zijn.`);
        }
        if (series.x?.length !== series.y?.length) {
            problems.push(`Reeks '${series.name}': x en y zijn niet even lang.`);
        }
    }

    return problems;
}
