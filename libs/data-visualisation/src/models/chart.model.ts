export interface ChartAxis {
    type: 'number' | 'time' | 'category';
    title?: string;
    unit?: string;
    unitInfo?: string;
}

export interface ChartMeta {
    source: string;
    sourceHref?: string;
    /** De bron publiceert deze data als Vlaamse open data. */
    isOpenData?: boolean;
    x: ChartAxis;
    y: ChartAxis;
}

export interface ChartSeries {
    name: string;
    x: Float64Array | string[];
    y: Float64Array;
}

export interface ChartModel {
    meta: ChartMeta;
    series: ChartSeries[];
}
