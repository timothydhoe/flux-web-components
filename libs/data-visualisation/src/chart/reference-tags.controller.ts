import type { ReactiveController, ReactiveElement } from 'lit';
import type { ChartReference } from '../layout/reference-lines';
import { readReferenceTags } from './vl-chart-reference.component';

/** De naam waaronder een wijziging in `changedProperties` staat, bv. om opnieuw te tekenen. */
export const REFERENCES_CHANGE = 'references';

/** Houdt de `vl-chart-reference`-tags in een element bij: leest ze bij het verbinden en opnieuw als een tag erbij
 *  komt, weggaat of een andere `value` of `label` krijgt. Een controller en geen gewone klasse: de observer moet
 *  starten en stoppen met het element (https://lit.dev/docs/composition/controllers/). */
export class ReferenceTagsController implements ReactiveController {
    /** De geldige referenties, in de volgorde van de tags. */
    references: ChartReference[] = [];

    /** Een Lit-element en niet elke controllerhost: alleen dat kent `requestUpdate(naam, oudeWaarde)`. */
    #host: ReactiveElement;
    #observer = new MutationObserver(() => this.#read());

    constructor(host: ReactiveElement) {
        this.#host = host;
        this.#host.addController(this);
    }

    hostConnected(): void {
        this.#read();
        this.#observer.observe(this.#host, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['value', 'label'],
        });
    }

    hostDisconnected(): void {
        this.#observer.disconnect();
    }

    /** Met de oude waarde erbij, zodat het element in `changedProperties` ziet dat de referenties veranderden. */
    #read(): void {
        const previous = this.references;
        this.references = readReferenceTags(this.#host);
        this.#host.requestUpdate(REFERENCES_CHANGE, previous);
    }
}
