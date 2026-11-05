/** Ruimte rond de inner chart, uitgedrukt in px. Een minimum: Plotly vergroot de marge (automargin) als labels
 *  of titels meer ruimte vragen, bv. bij brede getallen als 125.000. */
export type ChartMargin = { top: number; right: number; bottom: number; left: number };

export const chartDefaults = {
    margin: { top: 12, right: 16, bottom: 40, left: 56 } as ChartMargin,
    /** Afstand tussen de positie-as en zijn labels, in px. Plotly centreert het label "0" van de waarde-as op de as;
     *  zonder deze ruimte overlapt het met het eerste label van de positie-as. */
    positionTickLabelStandoff: 8,
    /** Afstand tussen de getallen van de waarde-as en de grafiek, in px. Zonder plakken ze tegen de rasterlijnen. */
    valueTickLabelStandoff: 8,
    /** Decimaalteken en duizendtal zoals in het Nederlands: 1.250,5. */
    separators: ',.',
    /** Afstand tussen de ticklabels en de titel van de positie-as, in px. */
    positionTitleStandoff: 8,
    tickLength: 4,
    zeroLineWidth: 1.5,
};
