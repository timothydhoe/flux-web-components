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

    /* Elke bron een eigen groep, en de figuur als laatste: een lijn ertussen, zodat twee bronnen niet als één lezen. */
    dl + dl {
        border-top: 1px solid var(--vl-color--border-default);
        padding-top: var(--vl-spacing--xsmall);
    }

    /* De sleutel is een lange UUID: klein, en mag overal breken zodat hij op een smal scherm niet uitsteekt. */
    .subtle {
        color: var(--vl-color--text-subtle);
        font-size: var(--vl-font-size--xsmall);
        overflow-wrap: anywhere;
    }
`;
