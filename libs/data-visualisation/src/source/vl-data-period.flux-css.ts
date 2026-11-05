import { vlFocusOutlineMixin, vlVisuallyHiddenMixin } from '@domg-wc/styles';
import { css, CSSResult } from 'lit';

export const vlDataPeriodFluxStyles: CSSResult = css`
    :host {
        display: block;
        font-size: var(--vl-font-size--small);
    }

    /* Buiten een figuur, boven de visuals van de bron: wat ruimte tot wat volgt. In een figuur zorgt die daarvoor. */
    :host(:not([slot])) {
        margin-bottom: var(--vl-spacing--normal);
    }

    /* Lengte links, dagen rechts; op een smal scherm onder elkaar. */
    .period {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: var(--vl-spacing--xsmall) var(--vl-spacing--normal);
    }

    .durations {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--vl-spacing--xxsmall);
        margin: 0;
        padding: 0;
        border: 0;
    }

    legend {
        float: left;
        margin-right: var(--vl-spacing--xxsmall);
        padding: 0;
    }

    /* Elke lengte is een radioknop in de vorm van een pil: de knop zelf blijft voor toetsenbord en schermlezer. */
    .duration input {
        ${vlVisuallyHiddenMixin()};
    }

    .duration span,
    .step,
    .today {
        display: inline-flex;
        align-items: center;
        min-height: 3.2rem;
        padding: 0 var(--vl-spacing--xsmall);
        border: 1px solid var(--vl-color--border-default);
        border-radius: 999px;
        background-color: var(--vl-color--background-default);
        color: var(--vl-color--text-default);
        font: inherit;
        cursor: pointer;
    }

    .duration input:checked + span {
        border-color: var(--vl-color--border-action);
        background-color: var(--vl-color--background-action);
        color: var(--vl-color--text-on-action);
    }

    .duration input:focus-visible + span,
    .step:focus-visible,
    .today:focus-visible {
        ${vlFocusOutlineMixin()};
    }

    .duration span:hover,
    .step:not(:disabled):hover,
    .today:not(:disabled):hover {
        border-color: var(--vl-color--border-action);
    }

    .days {
        display: flex;
        align-items: center;
        gap: var(--vl-spacing--xxsmall);
    }

    .step {
        justify-content: center;
        width: 3.2rem;
        padding: 0;
    }

    .current {
        min-width: 12rem;
        text-align: center;
    }

    .step:disabled,
    .today:disabled {
        cursor: default;
        color: var(--vl-color--text-subtle);
        border-color: var(--vl-color--border-disabled);
    }
`;
