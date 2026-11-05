import { buildAxisTitle } from '../../layout/axis-titles';
import { collectPositions } from '../../layout/hover-positions';
import { toLocalDateTime } from '../../layout/time-format';
import type { ChartModel } from '../../models/chart.model';
import { findValueAt } from '../../models/series';

/** Excel leest de tekens in een eenheid (µ, ³) zonder dit merkteken niet als UTF-8. */
const BYTE_ORDER_MARK = '\uFEFF';

/** De data als CSV (RFC 4180) om verder mee te rekenen: komma tussen velden, punt als decimaalteken, onafgeronde
 *  waarden, tekst tussen aanhalingstekens. Een lege cel is een gat. De eenheid staat in de kop van elke reekskolom,
 *  want een CSV heeft geen onderschrift. */
export function buildCsv(model: ChartModel): string {
    const unit = model.meta.y.unit;
    const header = [
        buildAxisTitle(model.meta.x) ?? '',
        ...model.series.map((series) => (unit ? `${series.name} (${unit})` : series.name)),
    ].map(quoteCsvField);
    const rows = collectPositions(model).map((position) => [
        formatCsvPosition(model, position),
        ...model.series.map((series) => formatCsvValue(findValueAt(series, position))),
    ]);
    return BYTE_ORDER_MARK + [header, ...rows].map((fields) => fields.join(',')).join('\r\n');
}

/** Een tijd als lokale datum en uur (Excel leest dat als datum), een getal zoals het is, een categorie als tekst. */
function formatCsvPosition(model: ChartModel, position: number | string): string {
    if (typeof position === 'string') return quoteCsvField(position);
    return model.meta.x.type === 'time' ? toLocalDateTime(position) : String(position);
}

/** Onafgerond, met een punt als decimaalteken; een gat is een lege cel. */
function formatCsvValue(value: number | null): string {
    if (value === null) return '';
    return String(value);
}

function quoteCsvField(text: string): string {
    return `"${text.replace(/"/g, '""')}"`;
}
