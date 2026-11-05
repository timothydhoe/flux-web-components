import { vlFocusOutlineMixin, vlVisuallyHiddenMixin } from '@domg-wc/styles';
import { css, CSSResult } from 'lit';

export const vlChartFluxStyles: CSSResult = css`
    :host {
        display: block;
    }

    /* Font en kleuren voor Plotly; readChartSpec() leest ze hier uit. */
    .plot {
        --vl-chart-grid-color: var(--vl-color--grey-300);
        --vl-chart-axis-color: var(--vl-color--grey-800);
        --vl-chart-background: var(--vl-color--background-default);
        --vl-chart-reference-color: var(--vl-color--grey-900);
        height: var(--vl-chart-height, 40rem);
        font-family: var(--vl-font);
        font-size: var(--vl-font-size--xsmall);
        color: var(--vl-color--text-default);
    }

    /* Zolang er nog niets getekend is: een vlak met rasterlijnen op de plaats en hoogte van de grafiek, zodat de
       pagina niet verspringt als de data er is. */
    .skeleton {
        height: var(--vl-chart-height, 40rem);
        border-radius: var(--vl-border--radius, 0.4rem);
        background: repeating-linear-gradient(
            to bottom,
            var(--vl-color--grey-100) 0 calc(20% - 1px),
            var(--vl-color--grey-300) calc(20% - 1px) 20%
        );
        animation: vl-chart-pulse 1.6s ease-in-out infinite;
    }

    @keyframes vl-chart-pulse {
        50% {
            opacity: 0.5;
        }
    }

    /* De grafiek komt zacht in beeld; tijdens herladen blijft de oude gedimd staan. De dimming wacht even, zodat
       een snel antwoord niet flikkert. */
    .plot {
        transition: opacity 200ms ease-out;
    }

    .plot:not([hidden]) {
        animation: vl-chart-fade-in 200ms ease-out;
    }

    .is-reloading .plot {
        opacity: 0.4;
        transition-delay: 150ms;
    }

    @keyframes vl-chart-fade-in {
        from {
            opacity: 0;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .skeleton,
        .plot:not([hidden]) {
            animation: none;
        }

        .plot {
            transition: none;
        }
    }

    /* De hover (tooltip, lijn, stippen) ligt in HTML boven de grafiek van Plotly. */
    .plot-frame {
        position: relative;
    }

    .hover {
        position: absolute;
        inset: 0;
        pointer-events: none; /* de muis blijft bij Plotly, die meldt welk punt ze aanwijst */
    }

    /* Een haarlijn binnen de assen: wijst de x aan zonder zwaarder te zijn dan de lijnen zelf. */
    .crosshair {
        position: absolute;
        width: 1px;
        transform: translateX(-0.5px);
        background-color: var(--vl-color--grey-500);
    }

    /* De stip op elke lijn, zoals in POIROT: in de kleur van de reeks met een witte rand, ook over een andere lijn. */
    .hover-dot {
        position: absolute;
        width: 1.2rem;
        height: 1.2rem;
        box-sizing: border-box;
        border: 2px solid var(--vl-color--background-default);
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }

    .tooltip {
        position: absolute;
        min-width: 14rem;
        max-width: 28rem;
        padding: var(--vl-spacing--xxsmall) var(--vl-spacing--xsmall);
        border-radius: var(--vl-border--radius, 0.4rem);
        background-color: var(--vl-color--background-default);
        box-shadow:
            0 1px 2px rgb(51 51 50 / 12%),
            0 4px 16px rgb(51 51 50 / 12%);
        font-family: var(--vl-font);
        font-size: var(--vl-font-size--xsmall);
        color: var(--vl-color--text-default);
    }

    /* De x vet links, de eenheid één keer rechts boven de waarden. */
    .tooltip-title {
        display: flex;
        justify-content: space-between;
        gap: var(--vl-spacing--xsmall);
        margin: 0 0 var(--vl-spacing--xxsmall);
    }

    .tooltip-unit {
        color: var(--vl-color--grey-800);
    }

    .tooltip table {
        width: 100%;
        border-collapse: collapse;
    }

    .tooltip td {
        padding: 0.2rem 0;
        vertical-align: baseline;
    }

    .tooltip .swatch {
        display: inline-block;
        width: 0.8rem;
        height: 0.8rem;
        margin-right: 0.6rem;
        border-radius: 50%;
    }

    /* Waarden rechts uitgelijnd, zodat de komma's onder elkaar staan (zelfde aantal decimalen, countDecimalsInData). */
    .tooltip td.tooltip-value {
        padding-left: var(--vl-spacing--xsmall);
        text-align: right;
        font-weight: 500;
        white-space: nowrap;
    }

    .tooltip .is-emphasized td {
        font-weight: 700;
    }

    /* De andere lijnen vervagen zacht als de muis een lijn aanwijst (#fadeOtherSeries); de stip mee. */
    .plot .scatterlayer .trace,
    .plot g.annotation,
    .hover-dot {
        transition: opacity 150ms ease-out;
    }

    .hover-dot.is-faded {
        opacity: 0.25;
    }

    @media (prefers-reduced-motion: reduce) {
        .plot .scatterlayer .trace,
        .plot g.annotation,
        .hover-dot {
            transition: none;
        }
    }

    .tooltip .no-value {
        color: var(--vl-color--text-subtle);
    }

    .tooltip .no-value .tooltip-value {
        font-weight: normal;
    }

    /* Met het toetsenbord doorloop je de waarden; de focus hoort dan rond de hele grafiek. */
    .plot:focus-visible {
        ${vlFocusOutlineMixin()};
    }

    /* Plotly zet deze regels in document.head; daar kunnen ze de shadow DOM niet bereiken.
       Zonder 'position: absolute' staan de svg-lagen (lijnen, titels, legende) onder elkaar in plaats van op elkaar. */
    .plot .main-svg {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
    }

    .plot .main-svg .draglayer {
        pointer-events: all;
    }

    .plot .crisp {
        shape-rendering: crispEdges;
    }

    /* De tooltip is van ons (.tooltip); Plotly meldt alleen welk punt de muis aanwijst. Met hoverinfo 'none' stuurt
       Plotly 3 in hovermode 'x' geen hover-events meer, dus verbergen we zijn eigen labels hier. */
    .plot .hoverlayer {
        display: none;
    }

    .plot .user-select-none {
        user-select: none;
    }

    /* Hoort bij de waarde-as: zelfde grootte en kleur als de ticklabels. */
    .unit {
        margin: 0 0 var(--vl-spacing--xxsmall);
        font-size: var(--vl-font-size--xsmall);
        color: var(--vl-color--grey-800);
    }

    /* Als er naast de lijnen geen plaats is voor labels (VlChartLine): dezelfde namen en waarden boven de grafiek. */
    .legend {
        display: flex;
        flex-wrap: wrap;
        gap: var(--vl-spacing--xxsmall) var(--vl-spacing--small);
        margin: 0 0 var(--vl-spacing--xsmall);
        padding: 0;
        list-style: none;
        font-size: var(--vl-font-size--xsmall);
    }

    .legend .swatch {
        display: inline-block;
        width: 1.2rem;
        height: 0.3rem;
        margin-right: 0.6rem;
        vertical-align: middle;
        border-radius: 0.2rem;
    }

    .legend .is-highlighted {
        font-weight: 700;
    }

    /* Leest voor wat de tooltip toont, als je met de pijltjes door de grafiek gaat. */
    .visually-hidden {
        ${vlVisuallyHiddenMixin()};
    }

    /* Bron links, open-datakenmerk rechts; op een smal scherm onder elkaar. */
    .source-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: baseline;
        gap: var(--vl-spacing--xsmall);
        margin-top: var(--vl-spacing--xsmall);
    }

    .source,
    .open-data-mark {
        margin: 0;
    }

    .open-data-mark a {
        text-decoration: none;
    }

    .open-data-mark a:hover,
    .open-data-mark a:focus-visible {
        text-decoration: underline;
    }
`;
