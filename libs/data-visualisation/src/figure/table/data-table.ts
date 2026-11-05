import { buildAxisTitle } from '../../layout/axis-titles';
import { collectPositions } from '../../layout/hover-positions';
import { formatPosition } from '../../layout/time-format';
import { countDecimalsInData, formatValue } from '../../layout/value-format';
import type { ChartModel } from '../../models/chart.model';
import { findValueAt } from '../../models/series';

/** De grafiek als tabel (WCAG 1.1.1): één rij per x, één kolom per reeks. Cellen zijn al opgemaakt zoals in de
 *  tooltip; een lege cel is een gat. */
export interface DataTable {
    /** Wat de waarden zijn, met eenheid, bv. "Concentratie (µg/m³)": het onderschrift van de tabel. */
    caption: string;
    /** Kop van de eerste kolom, bv. "Jaar". */
    rowHeaderTitle: string;
    columns: string[];
    rows: { header: string; cells: string[] }[];
    hasGaps: boolean;
}

const FALLBACK_CAPTION = 'Cijfers bij de grafiek';
/** Een gat in de tabel: een lege cel, uitgelegd in een zin boven de tabel. */
const GAP_CELL = '';

export function buildDataTable(model: ChartModel): DataTable {
    const decimals = countDecimalsInData(model);
    const rows = collectPositions(model).map((position) => ({
        header: formatPosition(model.meta.x, position),
        cells: model.series.map((series) => formatTableValue(findValueAt(series, position), decimals)),
    }));
    // Achteraf afgeleid uit de rijen, niet bijgehouden tijdens het opbouwen: dan kunnen ze niet uit elkaar lopen.
    const hasGaps = rows.some((row) => row.cells.includes(GAP_CELL));
    return {
        caption: buildAxisTitle(model.meta.y) ?? FALLBACK_CAPTION,
        rowHeaderTitle: buildAxisTitle(model.meta.x) ?? '',
        columns: model.series.map((series) => series.name),
        rows,
        hasGaps,
    };
}

function formatTableValue(value: number | null, decimals: number): string {
    if (value === null) return GAP_CELL;
    return formatValue(value, decimals);
}
