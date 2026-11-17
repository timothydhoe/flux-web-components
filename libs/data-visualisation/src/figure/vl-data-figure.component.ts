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

/** Creëert één visual uit verschillende componenten. In volgorde verschijnt:
 *  titel en ondertitel, controls, visual, tabel, leeswijzer, en over deze
 *  data.
 *  De componenten hier lezen de toestand van de visual/grafiek via `figureContext`. */
@webComponent('vl-data-figure')
export class VlDataFigure extends BaseLitElement {
    static get styles(): CSSResult[] {
        return [vlDataFigureFluxStyles];
    }

    // --- states and fields
    @state() private hasCaption = false;
    @state() private hasSubtitle = false;
    @state() private hasOwnControls = false;
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
        return html`<figure>
            <div class="header">
                <figcaption ?hidden=${!this.hasCaption}>
                    <slot name="headline" @slotchange=${this.#onCaptionChange}></slot>
                    <slot name="subtitle" ?hidden=${!this.hasSubtitle} @slotchange=${this.#onCaptionChange}></slot>
                </figcaption>
                <div class="controls">
                    <slot name="controls" @slotchange=${this.#onContentChange}></slot>
                    ${this.hasOwnControls ? nothing : this.#renderDefaultControls()}
                </div>
            </div>
            <slot name="filters"></slot>
            <slot @slotchange=${this.#onContentChange}></slot>
            <div class="explanations">
                ${this.hasOwnTable ? nothing : html`<vl-data-table></vl-data-table>`}
                <slot name="explanations" @slotchange=${this.#onContentChange}></slot>
                ${this.#showsDefaultAbout ? html`<vl-data-about></vl-data-about>` : nothing}
            </div>
        </figure>`;
    }

    get #showsDefaultAbout(): boolean {
        const model = findModel(this.#provider.value.dataState);
        return !this.hasOwnAbout && model !== null && hasAboutDetails(model.meta);
    }

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
        this.hasSubtitle = this.querySelector(':scope > [slot="subtitle"]') !== null;
        const headline = this.querySelector(':scope > [slot="headline"]')?.textContent ?? '';
        this.#shareFigureState({ headline: headline.replace(/\s+/g, ' ').trim() });
    }
}
