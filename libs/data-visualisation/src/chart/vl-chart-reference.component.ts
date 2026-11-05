import { BaseLitElement, webComponent } from '@domg-wc/common';
import { css, CSSResult, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { ChartReference } from '../layout/reference-lines';

/** Een referentielijn in de grafiek waarin het staat, bv. een norm of streefwaarde:
 *  `<vl-chart-line><vl-chart-reference value="5" label="WHO-advieswaarde"></vl-chart-reference></vl-chart-line>`.
 *  Tekent zelf niets; de grafiek leest de attributen en tekent de lijn, ook als ze later veranderen. Een tag in
 *  plaats van een attribuut: zo kan een grafiek er meer dan één hebben, elk met een eigen label. */
/** De `vl-chart-reference`-tags die rechtstreeks in `host` staan. Een tag zonder geldige `value` telt niet mee en
 *  geeft een waarschuwing. */
export function readReferenceTags(host: Element): ChartReference[] {
    const references = Array.from(host.querySelectorAll(':scope > vl-chart-reference'), (element) => ({
        value: Number(element.getAttribute('value') ?? NaN),
        label: element.getAttribute('label') ?? '',
    }));
    const valid = references.filter((reference) => Number.isFinite(reference.value));
    if (valid.length < references.length) {
        console.warn(
            `<${host.localName}>: een vl-chart-reference zonder geldig attribuut 'value' wordt niet getekend.`,
        );
    }
    return valid;
}

@webComponent('vl-chart-reference')
export class VlChartReference extends BaseLitElement {
    static get styles(): CSSResult[] {
        return [
            css`
                :host {
                    display: none;
                }
            `,
        ];
    }

    // --- attributes
    /** De waarde op de waarde-as, in de eenheid van de data. */
    @property({ type: Number }) value?: number;
    /** Wat de waarde is, bv. "EU-limiet". */
    @property() label = '';

    render(): typeof nothing {
        return nothing;
    }
}
