import { BaseLitElement, webComponent } from '@domg-wc/common';
import { ContextProvider } from '@lit/context';
import { CSSResult, html, PropertyValues, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { PERIOD_CHANGE_EVENT } from '../events/period-change.event';
import type { DataState } from '../models/chart.model';
import { classifyDataState } from '../models/classify-data-state';
import { adaptChartJson, type InputAdapter } from './chart-json.adapter';
import { parsePeriodDuration, parsePeriodEnd, toPeriodRange, type Period } from './period';
import { buildRequestUrl, type RequestUrlBuilder } from './request-url';
import { sourceContext, type SourceState } from './source-context';
import { vlDataSourceFluxStyles } from './vl-data-source.flux-css';

/** Haalt de data van één bron op, voor één periode, en deelt ze met alle visuals en controls erin: zo tonen een
 *  grafiek en de tegels ernaast altijd dezelfde periode. Een visual zonder eigen `.data` tekent de data van de
 *  dichtstbijzijnde bron. Tekent zelf niets. */
@webComponent('vl-data-source')
export class VlDataSource extends BaseLitElement {
    static get styles(): CSSResult[] {
        return [vlDataSourceFluxStyles];
    }

    // --- attributes
    @property() src = '';
    /** De lengte van de periode: `24h`, `7d`, `30d` of `1y`. */
    @property() period = '24h';
    /** De laatste dag van de periode, als "2026-08-28"; standaard vandaag. */
    @property() end = '';

    // --- properties (alleen via JavaScript)
    /** Zet het antwoord van de bron om naar het ChartModel; standaard het ChartModel in JSON (`adaptChartJson`). */
    @property({ attribute: false }) adapter: InputAdapter = adaptChartJson;
    /** Bouwt de URL voor een periode; standaard `from` en `to` als parameters op `src` (`buildRequestUrl`). */
    @property({ attribute: false }) buildUrl: RequestUrlBuilder = buildRequestUrl;

    // --- states and fields
    #provider = new ContextProvider(this, {
        context: sourceContext,
        initialValue: { dataState: { status: 'loading' }, period: this.#readPeriod() },
    });
    /** Een nieuwe vraag breekt de vorige af: zo overschrijft een traag antwoord nooit een nieuwere periode. */
    #request: AbortController | null = null;

    constructor() {
        super();
        this.addEventListener(PERIOD_CHANGE_EVENT, (event) => this.#load(event.detail));
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.#request?.abort();
    }

    protected updated(changed: PropertyValues<this>): void {
        if (changed.has('period') || changed.has('end')) {
            this.#load(this.#readPeriod());
        } else if (changed.has('src') || changed.has('adapter') || changed.has('buildUrl')) {
            this.#load(this.#provider.value.period);
        }
    }

    render(): TemplateResult {
        return html`<slot></slot>`;
    }

    #readPeriod(): Period {
        return { duration: parsePeriodDuration(this.period), end: parsePeriodEnd(this.end, new Date()) };
    }

    async #load(period: Period): Promise<void> {
        this.#request?.abort();
        if (!this.src) return;
        const request = new AbortController();
        this.#request = request;
        this.#shareSourceState({ dataState: { status: 'loading' }, period });
        try {
            const response = await fetch(this.buildUrl(this.src, toPeriodRange(period)), { signal: request.signal });
            if (!response.ok) throw new Error(`De bron antwoordde met status ${response.status}.`);
            const model = this.adapter(await response.json());
            if (!request.signal.aborted) this.#shareSourceState({ dataState: classifyDataState(model), period });
        } catch (error) {
            if (request.signal.aborted) return;
            const problem = error instanceof Error ? error.message : String(error);
            this.#shareSourceState({ dataState: { status: 'error', problems: [problem] } satisfies DataState, period });
        }
    }

    #shareSourceState(state: SourceState): void {
        this.#provider.setValue(state);
    }
}
