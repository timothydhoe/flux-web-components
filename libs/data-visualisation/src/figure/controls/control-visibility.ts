import { css, CSSResult } from 'lit';
import { findModel, type DataState } from '../../models/chart.model';

/** Een control doet alleen iets met data. Tijdens het laden houdt het zijn plaats (de rij verspringt niet), maar is
 *  het onzichtbaar en onbereikbaar; zonder data (leeg of fout) is het verborgen. Verborgen, niet weggelaten: Flux'
 *  `vl-tooltip` gooit een fout als hij uit een shadow root verdwijnt (hij zoekt zijn knop opnieuw op en vindt null). */
export type ControlVisibility = 'visible' | 'waiting' | 'hidden';

export function findControlVisibility(dataState: DataState): ControlVisibility {
    if (findModel(dataState)) return 'visible';
    return dataState.status === 'loading' ? 'waiting' : 'hidden';
}

export const controlStyles: CSSResult = css`
    :host {
        display: inline-block;
    }

    .waiting {
        visibility: hidden;
    }

    .hidden {
        display: none;
    }

    vl-link {
        white-space: nowrap;
    }

    /* De tooltip zit naast de knop in de shadow root; zonder dit neemt zijn host plaats in de rij in. */
    vl-tooltip {
        position: absolute;
    }
`;
