import type { ChartModel, ChartSeries } from '../../models/chart.model';

// Voorbeelddata voor de stories van de figuur en haar onderdelen: elk onderdeel leest de data van de grafiek in
// zijn figuur, dus elke story toont een figuur.

const years = Float64Array.from([2018, 2019, 2020, 2021, 2022, 2023, 2024]);

const buildSeries = (name: string, y: number[]): ChartSeries => ({ name, x: years, y: Float64Array.from(y) });

const buildModel = (series: ChartSeries[]): ChartModel => ({
    meta: {
        source: 'Vlaamse Milieumaatschappij',
        sourceHref: 'https://www.vmm.be',
        isOpenData: true,
        x: { type: 'number', title: 'Jaar' },
        y: { type: 'number', title: 'Concentratie', unit: 'µg/m³' },
    },
    series,
});

export const twoSeriesModel = buildModel([
    buildSeries('Meetpunt Gent', [12.5, 13.1, 12.8, 11.9, 11.2, 10.8, 10.1]),
    buildSeries('Meetpunt Antwerpen', [15.2, 14.7, 14.9, 13.8, 13.1, 12.6, 12.2]),
]);

/** Vier meetpunten: genoeg om er één uit te lichten tegen de rest. */
export const fourSeriesModel = buildModel([
    buildSeries('Meetpunt Gent', [12.5, 13.1, 12.8, 11.9, 11.2, 10.8, 10.1]),
    buildSeries('Meetpunt Antwerpen', [15.2, 14.7, 14.9, 13.8, 13.1, 12.6, 12.2]),
    buildSeries('Meetpunt Brugge', [10.1, 10.4, 9.6, 9.9, 9.2, 8.8, 8.7]),
    buildSeries('Meetpunt Hasselt', [11.4, 11.0, 11.6, 12.3, 12.9, 13.4, 13.9]),
]);

export const gapModel = buildModel([buildSeries('Meetpunt Gent', [12.5, 13.1, NaN, NaN, 11.2, 10.8, 10.1])]);

/** Met uitleg bij de eenheid: dan vertelt "Over deze data" meer dan de bronregel en toont de figuur het standaard. */
export const unitInfoModel: ChartModel = {
    ...twoSeriesModel,
    meta: {
        ...twoSeriesModel.meta,
        y: { ...twoSeriesModel.meta.y, unitInfo: 'microgram per kubieke meter lucht, gemiddeld over het jaar' },
    },
};
