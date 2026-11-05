import { BaseLitElement, registerWebComponents, webComponent } from '@domg-wc/common';
import { ContextProvider } from '@lit/context';
import { CSSResult, html, nothing, TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { VlChart } from '../chart/vl-chart.component';
import { DATA_CHANGE_EVENT } from '../events/data-change.event';
import { findModel } from '../models/chart.model';
import { VlDataControls } from './controls/vl-data-controls.component';
import { VlDataDownload } from './controls/vl-data-download.component';
import { VlDataFullscreen } from './controls/vl-data-fullscreen.component';
import { hasAboutDetails } from './explanations/about-data';
import { VlDataAbout } from './explanations/vl-data-about.component';
import { VlDataReadingGuide } from './explanations/vl-data-reading-guide.component';
import { figureContext, type FigureState } from './figure-context';
import { VlDataTable } from './table/vl-data-table.component';
import { vlDataFigureFluxStyles } from './vl-data-figure.flux-css';

registerWebComponents([VlDataAbout, VlDataControls, VlDataDownload, VlDataFullscreen, VlDataReadingGuide, VlDataTable]);

/** Houdt één visual samen met wat erbij hoort, in vaste zones van boven naar onder: onderschrift (kop en
 *  ondertitel), controls, visual, uitleggen (tabel, leeswijzer, over deze data).
 *  Kop en ondertitel zijn gewone HTML van de auteur (`<h3 slot="headline">`, `<p slot="subtitle">`); de figuur geeft
 *  ze de Flux-stijl. Onderdelen van Flux zetten zichzelf in hun zone (`joinFigureZone`); binnen een zone telt de
 *  volgorde van de auteur. Een eigen `vl-data-controls`, `vl-data-table` of `vl-data-about` vervangt het
 *  standaardonderdeel. Onderdelen lezen de toestand van de visual via `figureContext`, niet via de figuur. */
@webComponent('vl-data-figure')
export class VlDataFigure extends BaseLitElement {
    static get styles(): CSSResult[] {
        return [vlDataFigureFluxStyles];
    }

    // --- states and fields
    /** Zonder kop en ondertitel blijft het onderschrift weg, anders neemt het lege ruimte in. */
    @state() private hasCaption = false;
    @state() private hasOwnControls = false;
    /** De tabel is verplicht: de figuur toont er zelf een, tenzij de auteur er een op een eigen plaats zette. */
    @state() private hasOwnTable = false;
    @state() private hasOwnAbout = false;
    #provider = new ContextProvider(this, {
        context: figureContext,
        initialValue: {
            dataState: { status: 'loading' },
            visual: null,
            headline: '',
            element: this,
            isFullscreen: false,
        },
    });
    #onFullscreenChange = () => this.#shareFigureState({ isFullscreen: document.fullscreenElement === this });

    constructor() {
        super();
        // De visual meldt elke toestand; de figuur geeft ze door aan wie de context leest.
        this.addEventListener(DATA_CHANGE_EVENT, (event) => {
            this.#shareFigureState({ dataState: event.detail, visual: event.target as VlChart });
            this.requestUpdate(); // of "Over deze data" er standaard staat, hangt af van de data
        });
    }

    connectedCallback(): void {
        super.connectedCallback();
        document.addEventListener('fullscreenchange', this.#onFullscreenChange);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        document.removeEventListener('fullscreenchange', this.#onFullscreenChange);
    }

    render(): TemplateResult {
        // Kop en controls op één rij, de controls rechts; past het niet, dan schuiven de controls eronder. De controls
        // van de auteur (periode, uitlichten) eerst, de standaardknoppen (bewaren, vergroten) helemaal rechts.
        return html`<figure>
            <div class="header">
                <figcaption ?hidden=${!this.hasCaption}>
                    <slot name="headline" @slotchange=${this.#onCaptionChange}></slot>
                    <slot name="subtitle" @slotchange=${this.#onCaptionChange}></slot>
                </figcaption>
                <div class="controls">
                    <slot name="controls" @slotchange=${this.#onContentChange}></slot>
                    ${this.hasOwnControls ? nothing : this.#renderDefaultControls()}
                </div>
            </div>
            <slot @slotchange=${this.#onContentChange}></slot>
            <div class="explanations">
                ${this.hasOwnTable ? nothing : html`<vl-data-table></vl-data-table>`}
                <slot name="explanations" @slotchange=${this.#onContentChange}></slot>
                ${this.#showsDefaultAbout ? html`<vl-data-about></vl-data-about>` : nothing}
            </div>
        </figure>`;
    }

    /** "Over deze data" staat er standaard alleen als het meer vertelt dan de bronregel onder de grafiek. */
    get #showsDefaultAbout(): boolean {
        if (this.hasOwnAbout) return false;
        const model = findModel(this.#provider.value.dataState);
        if (!model) return false;
        return hasAboutDetails(model.meta);
    }

    /** De standaardrij: de grafiek bewaren en schermvullend maken. De CSV staat bij de tabel, bij de cijfers. */
    #renderDefaultControls(): TemplateResult {
        return html`<vl-data-controls>
            <vl-data-download format="png"></vl-data-download>
            <vl-data-fullscreen></vl-data-fullscreen>
        </vl-data-controls>`;
    }

    #shareFigureState(update: Partial<FigureState>): void {
        this.#provider.setValue({ ...this.#provider.value, ...update });
    }

    #onContentChange(): void {
        this.hasOwnControls = this.querySelector(':scope > vl-data-controls') !== null;
        this.hasOwnTable = this.querySelector(':scope > vl-data-table') !== null;
        this.hasOwnAbout = this.querySelector(':scope > vl-data-about') !== null;
    }

    #onCaptionChange(): void {
        this.hasCaption = this.querySelector(':scope > [slot="headline"], :scope > [slot="subtitle"]') !== null;
        const headline = this.querySelector(':scope > [slot="headline"]')?.textContent ?? '';
        this.#shareFigureState({ headline: headline.replace(/\s+/g, ' ').trim() });
    }
}
