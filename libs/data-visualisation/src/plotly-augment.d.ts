// @types/plotly.js loopt achter op plotly.js 4; hier vullen we de opties aan die we gebruiken en die er nog niet in staan.
import 'plotly.js';

declare module 'plotly.js' {
    interface LayoutAxis {
        /** Afstand in px tussen de as en zijn labels (plotly.js ≥ 2.29). */
        ticklabelstandoff?: number;
    }

    interface PlotData {
        /** Vrije waarde die Plotly bij de trace bewaart en in events teruggeeft; bij ons de index van de reeks. */
        meta: unknown;
    }

    interface Annotations {
        /** Vrije naam; bij ons om referentielabels van de directe labels te onderscheiden. */
        name?: string;
    }
}
