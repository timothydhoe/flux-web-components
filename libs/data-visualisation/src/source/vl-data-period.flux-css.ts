import { vlFocusOutlineMixin, vlVisuallyHiddenMixin } from '@domg-wc/styles';
import { css, CSSResult } from 'lit';

export const vlDataPeriodFluxStyles: CSSResult = css`
    /* Container: de indeling volgt de breedte van de figuur, niet die van het scherm. Een figuur staat vaak in een
       zijpaneel of kolom. */
    :host {
        display: block;
        container-type: inline-size;
        font-size: var(--vl-font-size--xsmall);
    }

    /* Buiten een figuur, boven de visuals van de bron: wat ruimte tot wat volgt. In een figuur zorgt die daarvoor. */
    :host(:not([slot])) {
        margin-bottom: var(--vl-spacing--normal);
    }

    /* Lengte links, dagen rechts; past het niet, dan komen de dagen eronder, links uitgelijnd. */
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
        gap: 0.4rem;
        margin: 0;
        padding: 0;
        border: 0;
    }

    /* Zichtbaar: zo is meteen duidelijk wat de knoppen kiezen. */
    legend {
        float: left;
        margin-right: 0.4rem;
        padding: 0;
        color: var(--vl-color--text-subtle);
    }

    .duration input {
        ${vlVisuallyHiddenMixin()};
    }

    /* Alle knoppen dezelfde kleine pil: zelfde hoogte, rand en ronding. Zo horen lengtes en dagen bij elkaar.
       24 px hoog: het minimum van WCAG 2.5.8. */
    .duration span,
    .step,
    .today {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        min-height: 2.4rem;
        padding: 0 0.8rem;
        border: 1px solid var(--vl-color--border-default);
        border-radius: 999px;
        background-color: var(--vl-color--background-default);
        color: var(--vl-color--text-default);
        font: inherit;
        white-space: nowrap;
        cursor: pointer;
    }

    .duration span:hover,
    .step:not(:disabled):hover,
    .today:hover {
        border-color: var(--vl-color--border-action);
    }

    /* Gekozen: gevuld in de actiekleur, het enige accent in de rij. */
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

    /* De dagen: ‹ datum › en "Vandaag", alleen als je niet bij vandaag bent. */
    .days,
    .stepper {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    .step {
        width: 2.4rem;
        padding: 0;
    }

    /* Wat ruimte rond de datum, zodat de focusrand van de pijlen er niet over valt. */
    .current {
        padding: 0 0.4rem;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
    }

    .step:disabled {
        cursor: default;
        border-color: var(--vl-color--border-disabled);
        color: var(--vl-color--text-disabled);
    }

    /* Heel smal: het label alleen voor de schermlezer, zodat de vier lengtes op één regel blijven. */
    @container (max-width: 34rem) {
        legend {
            ${vlVisuallyHiddenMixin()};
        }
    }
`;
