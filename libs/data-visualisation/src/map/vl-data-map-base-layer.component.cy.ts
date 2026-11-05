import { registerWebComponents } from '@domg-wc/common';
import { VlMap } from '@domg-wc/map';
import { html } from 'lit';
import { DIMMED_OPACITY, GRB_SOURCE, VlDataMapBaseLayer } from './vl-data-map-base-layer.component';

registerWebComponents([VlMap, VlDataMapBaseLayer]);

const mountMap = (baseLayer = html`<vl-data-map-base-layer></vl-data-map-base-layer>`) => {
    // geen echte tegels nodig; enkel de opbouw van de kaart telt
    cy.intercept('GET', 'https://geo.api.vlaanderen.be/GRB/wmts*', { statusCode: 204 });
    cy.mount(html`<vl-map lambert2008 style="height: 400px; width: 600px;">${baseLayer}</vl-map>`);
};

/** De opaciteit van de eerste basiskaart, zodra de kaart klaar is. `item(0)` van de kaart is Flux' groep rond alle
 *  basiskaarten; `baseLayers` zijn de groepen die elke basiskaart zelf maakt. */
const baseMapOpacity = () =>
    cy.get<VlMap>('vl-map').then(async ($map) => {
        await $map[0].ready;
        return $map[0].map.baseLayers[0].getOpacity();
    });

describe('cypress-component - data-visualisation - vl-data-map-base-layer', () => {
    it('should dim the base map by default', () => {
        mountMap();
        baseMapOpacity().should('equal', DIMMED_OPACITY);
    });

    it('should use the opacity from the attribute', () => {
        mountMap(html`<vl-data-map-base-layer opacity="0.8"></vl-data-map-base-layer>`);
        baseMapOpacity().should('equal', 0.8);
    });

    it('should name GRB as the source on the map', () => {
        mountMap();
        cy.get('vl-map').shadow().find('.ol-attribution').should('contain.text', GRB_SOURCE);
    });

    it('should name GRB as the source only once with two base layers', () => {
        mountMap(html`
            <vl-data-map-base-layer></vl-data-map-base-layer>
            <vl-data-map-base-layer></vl-data-map-base-layer>
        `);
        cy.get('vl-map').shadow().find('.ol-attribution').should('have.length', 1);
    });
});
