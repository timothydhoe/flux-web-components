import { createContext } from '@lit/context';
import type { VlChart } from '../chart/vl-chart.component';
import type { DataState } from '../models/chart.model';

/** Wat `vl-data-figure` deelt met zijn onderdelen (tabel, controls, uitleg) en met eigen onderdelen van een app.
 *  Een onderdeel leest dit met een `ContextConsumer`; het hoeft de visual niet te kennen. */
export type FigureState = {
    /** De toestand van de visual in de figuur, zoals die het laatst met `vl-data-change` meldde. */
    dataState: DataState;
    /** De visual die het laatst meldde, bv. om er een PNG van te maken; `null` tot de eerste melding. */
    visual: VlChart | null;
    /** De tekst van de kop, bv. voor de bestandsnaam van een download; leeg zonder kop. */
    headline: string;
    /** De figuur zelf, bv. om ze schermvullend te maken. */
    element: HTMLElement;
    isFullscreen: boolean;
};

export const figureContext = createContext<FigureState>(Symbol('vl-data-figure'));
