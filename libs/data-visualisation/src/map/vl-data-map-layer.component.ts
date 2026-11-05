import { webComponent } from '@domg-wc/common';
import { VlMapFeaturesLayer, VlMapSelectAction } from '@domg-wc/map';
import type { FeatureLike } from 'ol/Feature';
import type { Style } from 'ol/style';
import { buildClassedScale, describeScaleClass, type ClassedScale } from '../layout/classed-scale';
import { countDecimalsInValue, formatValue } from '../layout/value-format';
import { buildWidthClasses, findWidth, type WidthClass } from '../layout/width-classes';
import { createDataMapSelectEvent, DATA_MAP_LEGEND_CHANGE_EVENT } from './data-map.events';
import { buildLineStyle, buildPointStyle, readMapSpec, type MapSpec } from './map-styles';

const NO_VALUE_LABEL = 'Geen waarde';

/** Wat de legende van een laag toont: een titel en per klasse een staaltje met tekst. */
export type DataMapLegend = {
    title: string;
    items: { swatch: 'dot' | 'hollow' | 'line'; color: string; width?: number; label: string }[];
};

type FeatureCollection = { type: 'FeatureCollection'; features: { properties?: Record<string, unknown> | null }[] };

/** Een kaartlaag met data, in een `vl-map`. De features komen uit `src` (GeoJSON, bv. een OGC API Features) of
 *  `.features`. Met `value-property` krijgt elk punt de kleur van zijn waarde (een schaal in klassen, licht naar
 *  donker); zonder is de laag context, bv. een net van lijnen, met `width-property` dikker naargelang een waarde.
 *  Met `selectable` toont aanwijzen of kiezen naam en waarde, en meldt de laag de keuze met `vl-data-map-select`.
 *  `vl-data-map-legend` in dezelfde kaart legt kleuren en diktes uit. */
@webComponent('vl-data-map-layer')
export class VlDataMapLayer extends VlMapFeaturesLayer {
    static get _observedAttributes(): string[] {
        return VlMapFeaturesLayer._observedAttributes.concat(['src']);
    }

    #scale: ClassedScale | null = null;
    #widthClasses: WidthClass[] = [];
    #spec: MapSpec | null = null;
    #decimals = 0;
    #requestId = 0;

    async connectedCallback(): Promise<void> {
        await super.connectedCallback();
        if (this.selectable) this.#addSelectAction();
        if (this.src) await this.#load(this.src);
        else this.#restyle();
    }

    // --- attributes
    /** Waar de GeoJSON vandaan komt. */
    get src(): string {
        return this.getAttribute('src') ?? '';
    }

    /** De eigenschap van een feature met de waarde die de kleur bepaalt, bv. `latest`. */
    get valueProperty(): string {
        return this.getAttribute('value-property') ?? '';
    }

    /** De eigenschap met de naam van een feature, voor het label bij aanwijzen. */
    get nameProperty(): string {
        return this.getAttribute('name-property') ?? 'name';
    }

    get unit(): string {
        return this.getAttribute('unit') ?? '';
    }

    /** De eigenschap die de dikte van een lijn bepaalt, bv. `voltage`. */
    get widthProperty(): string {
        return this.getAttribute('width-property') ?? '';
    }

    get widthUnit(): string {
        return this.getAttribute('width-unit') ?? '';
    }

    get selectable(): boolean {
        return this.hasAttribute('selectable');
    }

    _srcChangedCallback(oldValue: string, newValue: string): void {
        if (newValue && newValue !== oldValue && this.layer) this.#load(newValue);
    }

    // --- data
    /** Een nieuwe vraag maakt de vorige ongeldig: een traag antwoord overschrijft nooit een nieuwere bron. */
    async #load(src: string): Promise<void> {
        const requestId = ++this.#requestId;
        try {
            const response = await fetch(src);
            if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
            const collection = (await response.json()) as FeatureCollection;
            if (requestId !== this.#requestId) return;
            this.clearFeatures();
            this.addFeatureCollection(collection);
            this.#restyle();
        } catch (error) {
            console.warn(`<${this.localName}>: '${src}' kan niet geladen worden.`, error);
        }
    }

    #valuesOf(property: string): number[] {
        return (this.features as FeatureLike[])
            .map((feature) => feature.get(property))
            .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
    }

    // --- style
    /** Schaal en diktes uit de data, dan de stijlen; de legende volgt via een event. */
    #restyle(): void {
        if (!this.mapElement) return;
        this.#spec = readMapSpec(this.mapElement);
        const values = this.valueProperty ? this.#valuesOf(this.valueProperty) : [];
        this.#scale = this.valueProperty ? buildClassedScale(values, this.#spec.ramp) : null;
        this.#decimals = Math.max(0, ...values.map(countDecimalsInValue));
        this.#widthClasses = this.widthProperty ? buildWidthClasses(this.#valuesOf(this.widthProperty)) : [];
        // @ts-expect-error: de kaartlaag gebruikt `style` voor haar OpenLayers-stijl
        this.style = (feature: FeatureLike) => this.#buildStyle(feature, false);
        const select = this.querySelector('vl-map-select-action') as VlMapSelectAction | null;
        if (select) select.style = (feature: FeatureLike) => this.#buildStyle(feature, true);
        this.dispatchEvent(new CustomEvent(DATA_MAP_LEGEND_CHANGE_EVENT, { bubbles: true, composed: true }));
    }

    #buildStyle(feature: FeatureLike, isEmphasized: boolean): Style | Style[] {
        const spec = this.#spec!;
        const type = feature.getGeometry()?.getType();
        if (type === 'LineString' || type === 'MultiLineString') {
            const width = this.widthProperty
                ? findWidth(this.#widthClasses, Number(feature.get(this.widthProperty)))
                : 2;
            return buildLineStyle(spec, width);
        }
        const value = this.#readValue(feature);
        return buildPointStyle(spec, {
            color: this.#findPointColor(value),
            label: this.#describe(feature, value),
            isEmphasized,
        });
    }

    /** De waarde van een feature, als die een eindig getal is; anders `undefined` (geen waarde). */
    #readValue(feature: FeatureLike): number | undefined {
        if (!this.valueProperty) return undefined;
        const value = feature.get(this.valueProperty);
        if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
        return value;
    }

    /** Zonder schaal is de laag context: één rustige kleur. Met schaal de kleur van de klasse; zonder waarde geen
     *  kleur, zodat het punt hol getekend wordt. */
    #findPointColor(value: number | undefined): string | undefined {
        const spec = this.#spec!;
        if (!this.#scale) return spec.contextColor;
        if (value === undefined) return undefined;
        return this.#scale.colorOf(value);
    }

    /** Wat er bij aanwijzen staat, bv. "Aalst  0,844 µT". */
    #describe(feature: FeatureLike, value?: number): string {
        const name = String(feature.get(this.nameProperty) ?? '');
        if (!this.valueProperty) return name;
        const text = value === undefined ? NO_VALUE_LABEL : formatValue(value, this.#decimals, this.unit || undefined);
        return name ? `${name}  ${text}` : text;
    }

    // --- selection
    #addSelectAction(): void {
        const select = document.createElement('vl-map-select-action') as VlMapSelectAction;
        select.setAttribute('default-active', '');
        this.append(select);
        customElements.whenDefined('vl-map-select-action').then(() =>
            select.onSelect((feature?: FeatureLike) => {
                this.dispatchEvent(
                    createDataMapSelectEvent(
                        feature ? { id: feature.getId()!, properties: feature.getProperties() } : null,
                    ),
                );
            }),
        );
    }

    // --- legend
    /** Voor `vl-data-map-legend`: de klassen van hoog naar laag, of de diktes, met de naam van de laag als titel. */
    get legend(): DataMapLegend | null {
        const spec = this.#spec;
        if (!spec) return null;
        const title = this.getAttribute('name') ?? '';
        if (this.#scale) {
            const items: DataMapLegend['items'] = [...this.#scale.classes].reverse().map((scaleClass) => ({
                swatch: 'dot',
                color: scaleClass.color,
                label: describeScaleClass(scaleClass, this.unit || undefined),
            }));
            const hasNoValue = this.#valuesOf(this.valueProperty).length < this.features.length;
            if (hasNoValue) items.push({ swatch: 'hollow', color: spec.noValueColor, label: NO_VALUE_LABEL });
            return { title, items };
        }
        if (this.#widthClasses.length > 0) {
            return {
                title,
                items: this.#widthClasses.map((widthClass) => ({
                    swatch: 'line',
                    color: spec.contextColor,
                    width: widthClass.width,
                    label: this.#describeWidthClass(widthClass),
                })),
            };
        }
        return null;
    }

    /** Wat de legende bij een dikte zet, bv. "380 kV". De dunste klasse vangt ook alles eronder: "70 kV en minder",
     *  tenzij ze de enige is. */
    #describeWidthClass({ from, isLowest }: WidthClass): string {
        const value = formatValue(from, countDecimalsInValue(from), this.widthUnit || undefined);
        const isOneOfSeveral = this.#widthClasses.length > 1;
        if (isLowest && isOneOfSeveral) return `${value} en minder`;
        return value;
    }

}
