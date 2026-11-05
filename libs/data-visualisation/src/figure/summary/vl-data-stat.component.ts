import { webComponent } from '@domg-wc/common';
import { nothing, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import type { ChartModel } from '../../models/chart.model';
import { findStatistic, STATISTICS, type Statistic } from './statistic';
import { VlDataSummary } from './vl-data-summary';

const DEFAULT_LABELS: Record<Statistic, string> = {
    max: 'Hoogste waarde',
    min: 'Laagste waarde',
    mean: 'Gemiddelde',
};

/** De hoogste, laagste of gemiddelde waarde van een reeks groot, met wanneer of over welke periode: het getal
 *  waar de tekst bij de grafiek over gaat, bv. "Hoogste waarde vandaag: 0,31 µT om 14:20". */
@webComponent('vl-data-stat')
export class VlDataStat extends VlDataSummary {
    /** Welke waarde: `max`, `min` of `mean`. */
    @property() statistic: Statistic = 'max';

    protected renderSummary(model: ChartModel): TemplateResult | typeof nothing {
        if (!STATISTICS.includes(this.statistic)) {
            console.warn(
                `<${this.localName}>: statistic '${this.statistic}' bestaat niet; kies uit ${STATISTICS.join(', ')}.`,
            );
            return nothing;
        }
        const statisticValue = findStatistic(model, this.statistic, this.series);
        if (!statisticValue) return nothing;
        return this.renderTile({
            label: this.buildTileLabel(model, this.label || DEFAULT_LABELS[this.statistic], statisticValue.seriesName),
            valueLabel: statisticValue.valueLabel,
            unit: statisticValue.unit,
            positionLabel: statisticValue.positionLabel,
        });
    }
}
