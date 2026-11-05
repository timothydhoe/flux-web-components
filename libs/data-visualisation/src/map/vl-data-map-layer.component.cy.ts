import { registerWebComponents } from '@domg-wc/common';
import { VlMap, VlMapSelectAction } from '@domg-wc/map';
import { html } from 'lit';
import { DATA_MAP_SELECT_EVENT } from './data-map.events';
import { VlDataMapLayer } from './vl-data-map-layer.component';
import { VlDataMapLegend } from './vl-data-map-legend.component';

registerWebComponents([VlMap, VlMapSelectAction, VlDataMapLayer, VlDataMapLegend]);

const point = (id: string, name: string, coordinates: [number, number], latest: number | null) => ({
    type: 'Feature',
    id,
    geometry: { type: 'Point', coordinates },
    properties: { name, latest },
});

const SENSORS = {
    type: 'FeatureCollection',
    features: [
        point('A', 'Temse', [137000, 205000], 0.39),
        point('B', 'Aalst', [128000, 176000], 0.85),
        point('C', 'Kortrijk', [73000, 170000], null),
    ],
};

const LINES = {
    type: 'FeatureCollection',
    features: [380, 150, 70].map((voltage, index) => ({
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [
                [80000, 180000 + index * 10000],
                [140000, 180000 + index * 10000],
            ],
        },
        properties: { voltage },
    })),
};

/** De teksten van de legende, opnieuw gelezen tot de assertie slaagt. */
const shouldShowLegend = (assert: (items: string[]) => void) =>
    cy
        .get('vl-data-map-legend')
        .shadow()
        .find('li')
        .should(($items) => assert($items.toArray().map((item) => item.textContent?.trim() ?? '')));

const mountMap = () => {
    cy.intercept('GET', '/api/sensors', SENSORS);
    cy.intercept('GET', '/api/lines', LINES);
    cy.mount(html`
        <vl-map lambert2008 style="height: 400px; width: 600px;">
            <vl-data-map-layer
                name="Hoogspanningslijn"
                src="/api/lines"
                projection-code="EPSG:31370"
                width-property="voltage"
                width-unit="kV"
            ></vl-data-map-layer>
            <vl-data-map-layer
                name="Laatste meting"
                src="/api/sensors"
                projection-code="EPSG:31370"
                value-property="latest"
                unit="µT"
                selectable
            ></vl-data-map-layer>
            <vl-data-map-legend></vl-data-map-legend>
        </vl-map>
    `);
};

describe('cypress-component - data-visualisation - vl-data-map-layer', () => {
    it('should explain the classes of the values, high to low, and the points without a value', () => {
        mountMap();

        shouldShowLegend((items) =>
            expect(items).to.deep.equal([
                '0,8 - 1\u00A0µT',
                '0,6 - 0,8\u00A0µT',
                '0,4 - 0,6\u00A0µT',
                '0,2 - 0,4\u00A0µT',
                '0 - 0,2\u00A0µT',
                'Geen waarde',
                '380\u00A0kV',
                '150\u00A0kV',
                '70\u00A0kV en minder',
            ]),
        );
        cy.get('vl-data-map-legend')
            .shadow()
            .find('h3')
            .should('have.length', 2)
            .first()
            .should('have.text', 'Laatste meting');
    });

    it('should report the point the reader picks', () => {
        const selections: unknown[] = [];
        mountMap();
        cy.get('vl-map').then(($map) =>
            $map[0].addEventListener(DATA_MAP_SELECT_EVENT, (event) => selections.push((event as CustomEvent).detail)),
        );
        shouldShowLegend((items) => expect(items).to.have.length(9)); // de data is er

        // Kiezen zoals een klik het doet; OpenLayers reageert niet op de nagebootste klik van Cypress op het canvas.
        cy.get('vl-data-map-layer[name="Laatste meting"]').then(($layer) => {
            const layer = $layer[0] as VlDataMapLayer;
            (layer.querySelector('vl-map-select-action') as VlMapSelectAction).select(layer.getFeature('B'));
        });

        cy.wrap(selections).should('have.length', 1).its(0).should('deep.include', { id: 'B' });
        cy.wrap(selections).its(0).its('properties').should('include', { name: 'Aalst', latest: 0.85 });
    });

    it('should load again when the source changes', () => {
        mountMap();
        shouldShowLegend((items) => expect(items).to.have.length(9));
        cy.intercept('GET', '/api/sensors-2', {
            type: 'FeatureCollection',
            features: [point('D', 'Gent', [105000, 194000], 2.5)],
        });

        cy.get('vl-data-map-layer[name="Laatste meting"]').invoke('attr', 'src', '/api/sensors-2');

        shouldShowLegend((items) => expect(items).to.include('2 - 2,5\u00A0µT').and.not.include('Geen waarde'));
    });
});
