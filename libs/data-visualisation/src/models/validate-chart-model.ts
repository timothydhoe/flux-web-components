import type { ChartModel } from './chart.model';

/** Valideert de bron, eenheid van de y-as en de waarde van de x-as.
 * @Returns De mogelijke oorzaak van het probleem (string) */
export function validateChartModel(model: ChartModel): string[] {
    if (!model?.meta?.x || !model.meta.y || !Array.isArray(model.series)) {
        return ['Het model heeft niet de vorm { meta: { x, y }, series: [] }.'];
    }
    const problems: string[] = [];
    if (!model.meta.source) {
        problems.push('De data heeft geen bron.');
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
