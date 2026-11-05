import { BaseLitElement, webComponent } from '@domg-wc/common';
import { css, CSSResult, html, nothing, TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { DATA_MAP_LEGEND_CHANGE_EVENT } from './data-map.events';
import type { DataMapLegend, VlDataMapLayer } from './vl-data-map-layer.component';

type LegendItem = DataMapLegend['items'][number];

/** Legt uit wat kleuren en diktes op de kaart betekenen, in tekst: voor elke `vl-data-map-layer` in dezelfde
 *  `vl-map` haar klassen. Zet ze in de kaart: `<vl-map>…<vl-data-map-legend></vl-data-map-legend></vl-map>`. */
@webComponent('vl-data-map-legend')
export class VlDataMapLegend extends BaseLitElement {
    static get styles(): CSSResult[] {
        return [
            css`
                :host {
                    position: absolute;
                    top: var(--vl-spacing--small);
                    left: var(--vl-spacing--small);
                    z-index: 1;
                    display: block;
                    padding: var(--vl-spacing--xsmall) var(--vl-spacing--small);
                    border-radius: var(--vl-border--radius, 0.4rem);
                    background-color: var(--vl-color--background-default);
                    box-shadow:
                        0 1px 2px rgb(51 51 50 / 12%),
                        0 4px 16px rgb(51 51 50 / 12%);
                    font-family: var(--vl-font);
                    font-size: var(--vl-font-size--xsmall);
                    color: var(--vl-color--text-default);
                }

                :host([hidden]),
                :host(:not(:has(*))) {
                    display: none;
                }

                h3 {
                    margin: 0 0 var(--vl-spacing--xxsmall);
                    font-size: inherit;
                    font-weight: 500;
                }

                ul {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                section + section {
                    margin-top: var(--vl-spacing--xsmall);
                }

                li {
                    display: flex;
                    align-items: center;
                    gap: var(--vl-spacing--xxsmall);
                    line-height: 2rem;
                }

                .dot {
                    width: 1.2rem;
                    height: 1.2rem;
                    box-sizing: border-box;
                    border-radius: 50%;
                }

                .hollow {
                    border: 2px solid;
                }

                .line {
                    width: 2.4rem;
                    border-radius: 1rem;
                }
            `,
        ];
    }

    @state() private legends: DataMapLegend[] = [];
    #map: Element | null = null;
    #onLegendChange = () => this.#readLegends();

    connectedCallback(): void {
        super.connectedCallback();
        this.#map = this.closest('vl-map');
        this.#map?.addEventListener(DATA_MAP_LEGEND_CHANGE_EVENT, this.#onLegendChange);
        this.#readLegends();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.#map?.removeEventListener(DATA_MAP_LEGEND_CHANGE_EVENT, this.#onLegendChange);
    }

    #readLegends(): void {
        const layers = Array.from(this.#map?.querySelectorAll<VlDataMapLayer>(':scope > vl-data-map-layer') ?? []);
        // De bovenste laag eerst, zoals ze op de kaart liggen: meestal de data, dan de context.
        this.legends = layers.reverse().flatMap((layer) => layer.legend ?? []);
    }

    render(): TemplateResult | typeof nothing {
        if (this.legends.length === 0) return nothing;
        return html`${this.legends.map(
            ({ title, items }) =>
                html`<section>
                    ${title ? html`<h3>${title}</h3>` : nothing}
                    <ul>
                        ${items.map((item) => html`<li>${this.#renderSwatch(item)}${item.label}</li>`)}
                    </ul>
                </section>`,
        )}`;
    }

    /** Het staaltje vóór de tekst: een gevulde stip (een waarde), een holle stip (geen waarde) of een lijn (een dikte). */
    #renderSwatch(item: LegendItem): TemplateResult {
        switch (item.swatch) {
            case 'line':
                return html`<span
                    class="line"
                    style=${styleMap({ height: `${item.width}px`, backgroundColor: item.color })}
                ></span>`;
            case 'hollow':
                return html`<span class="dot hollow" style=${styleMap({ borderColor: item.color })}></span>`;
            case 'dot':
                return html`<span class="dot" style=${styleMap({ backgroundColor: item.color })}></span>`;
        }
    }

}
