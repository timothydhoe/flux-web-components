import { webComponent } from '@domg-wc/common';
import { nothing, TemplateResult } from 'lit';
import type { ChartModel } from '../../models/chart.model';
import { findLatestValue } from './latest-value';
import { VlDataSummary } from './vl-data-summary';

const DEFAULT_LABEL = 'Laatste meting';

/** De laatste waarde groot, met wanneer ze gemeten is: bij live data de eerste vraag van de lezer ("hoe is het nu,
 *  en hoe oud is dat?"). */
@webComponent('vl-data-latest')
export class VlDataLatest extends VlDataSummary {
    protected renderSummary(model: ChartModel): TemplateResult | typeof nothing {
        const latest = findLatestValue(model, this.series);
        if (!latest) return nothing;
        return this.renderTile({
            label: this.buildTileLabel(model, this.label || DEFAULT_LABEL, latest.seriesName),
            valueLabel: latest.valueLabel,
            unit: latest.unit,
            positionLabel: latest.positionLabel,
        });
    }
}
