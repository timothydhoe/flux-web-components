import { webComponent } from '@domg-wc/common';
import { VlMapBaseLayerGRBGray } from '@domg-wc/map';
import Attribution from 'ol/control/Attribution';

/** Verplichte bronvermelding bij gebruik van GRB, zie de gebruiksvoorwaarden:
 *  https://www.vlaanderen.be/digitaal-vlaanderen/onze-oplossingen/geografische-webdiensten/gebruiksvoorwaarden */
export const GRB_SOURCE = 'Bron: Grootschalig Referentie Bestand Vlaanderen, Digitaal Vlaanderen';

/** Genoeg om je te oriënteren, zwak genoeg om de data niet te overstemmen. */
export const DIMMED_OPACITY = 0.45;

/** De grijze GRB-basiskaart onder data: gedimd en met bronvermelding. Flux' `vl-map` kent geen `opacity` op een
 *  basiskaart en toont zelf geen bronvermelding; we breiden daarom uit in plaats van Flux aan te passen. */
@webComponent('vl-data-map-base-layer')
export class VlDataMapBaseLayer extends VlMapBaseLayerGRBGray {
    // --- attributes
    /** Hoe sterk de basiskaart doorschijnt, van 0 tot 1. */
    get opacity(): number {
        const opacity = parseFloat(this.getAttribute('opacity') ?? '');
        return Number.isNaN(opacity) ? DIMMED_OPACITY : opacity;
    }

    // --- hooks van VlMapBaseLayer
    _createWMTSSource() {
        const source = super._createWMTSSource();
        source.setAttributions(GRB_SOURCE);
        return source;
    }

    _createBaseLayer() {
        const group = super._createBaseLayer();
        group?.setOpacity(this.opacity);
        return group;
    }

    _configureMap() {
        super._configureMap();
        if (!this._map || this.#hasAttribution) return;
        this._map.addControl(new Attribution({ collapsible: false }));
    }

    get #hasAttribution(): boolean {
        return this._map.getControls().getArray().some((control: unknown) => control instanceof Attribution);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'vl-data-map-base-layer': VlDataMapBaseLayer;
    }
}
