import { css, CSSResult } from 'lit';

export const vlDataAboutFluxStyles: CSSResult = css`
    /* Term en uitleg naast elkaar; op een smal scherm loopt de uitleg gewoon door onder de term. */
    dl {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: var(--vl-spacing--xxsmall) var(--vl-spacing--small);
        margin: 0 0 var(--vl-spacing--xsmall);
    }

    dt {
        font-weight: 500;
    }

    dd {
        margin: 0;
    }
`;
