import { vlHeading3 } from '@domg-wc/components/atom';
import { css, CSSResult } from 'lit';

export const vlDataFigureFluxStyles: CSSResult = css`
    :host {
        display: block;
    }

    figure {
        margin: 0;
        display: flex;
        flex-direction: column;
        /* Eén ritme tussen kop, controls en grafiek: dicht genoeg om als één blok te lezen. */
        gap: var(--vl-spacing--small);
    }

    /* Kop links, controls rechts bovenaan, zoals de werkbalk van een grafiek; op een smal scherm of bij een lange kop
       schuiven de controls onder de kop, nog altijd rechts. */
    .header {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: var(--vl-spacing--xsmall) var(--vl-spacing--normal);
    }

    .header figcaption {
        flex: 1 1 32rem;
    }

    .controls {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
        gap: var(--vl-spacing--xsmall);
        margin-left: auto;
    }

    figcaption {
        display: flex;
        flex-direction: column;
        gap: var(--vl-spacing--xxsmall);
    }

    figcaption[hidden] {
        display: none;
    }

    /* De uitklapblokken onder elkaar, zonder ruimte ertussen: elk blok heeft een lijn erboven (explanationStyles). */
    .explanations {
        display: flex;
        flex-direction: column;
    }

    /* Schermvullend: de hele figuur met haar uitleg, en de grafiek krijgt de hoogte van het scherm. De hoogte gaat
       als custom property naar de grafiek: die erft door de slot heen tot in de shadow DOM van de grafiek. */
    :host(:fullscreen) {
        overflow: auto;
        padding: var(--vl-spacing--medium);
        background-color: var(--vl-color--background-default);
        --vl-chart-height: 70vh;
    }

    /* De auteur kiest het niveau (h2, h3, ...) voor de pagina; het uitzicht is altijd dat van een Flux-h3.
       Op de slot en niet met ::slotted(): de globale reset van Flux (h3 { font: inherit }) wint van ::slotted(),
       maar een element in een slot erft van die slot. Een slot heeft geen box; marge en padding doen er niets. */
    slot[name='headline'] {
        ${vlHeading3};
    }

    slot[name='subtitle'] {
        color: var(--vl-color--text-subtle);
    }
`;
