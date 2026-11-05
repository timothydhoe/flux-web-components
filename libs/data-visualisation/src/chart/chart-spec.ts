/** De Flux-waarden die Plotly nodig heeft. Plotly zet kleuren en fonts als attributen op de svg en kent geen `var()`;
 *  daarom lezen we de berekende waarden uit de CSS van `.plot` (zie vl-chart.flux-css.ts). */
export type ChartSpec = {
    fontFamily: string;
    fontSize: number;
    textColor: string;
    /** Rasterlijnen van de waarde-as. */
    gridColor: string;
    /** Nullijn, ticks en ticklabels. */
    axisColor: string;
    backgroundColor: string;
    /** Referentielijnen en hun labels. */
    referenceColor: string;
};

export function readChartSpec(plotElement: HTMLElement): ChartSpec {
    const style = getComputedStyle(plotElement);
    return {
        fontFamily: style.fontFamily,
        fontSize: parseFloat(style.fontSize),
        textColor: style.color,
        gridColor: style.getPropertyValue('--vl-chart-grid-color').trim(),
        axisColor: style.getPropertyValue('--vl-chart-axis-color').trim(),
        backgroundColor: style.getPropertyValue('--vl-chart-background').trim(),
        referenceColor: style.getPropertyValue('--vl-chart-reference-color').trim(),
    };
}
