import { css, CSSResult } from 'lit';

/** Gedeeld door elk uitklapblok onder de visual (tabel, leeswijzer, over deze data): een lijn erboven scheidt ze
 *  van elkaar en van de bronregel. Op het blok zelf, niet op de host: een blok zonder inhoud rendert niets en mag
 *  dan ook geen lijn tonen. */
export const explanationStyles: CSSResult = css`
    :host {
        display: block;
    }

    .explanation {
        display: block;
        border-top: 1px solid var(--vl-color--border-default);
        padding-block: var(--vl-spacing--xsmall);
    }
`;
