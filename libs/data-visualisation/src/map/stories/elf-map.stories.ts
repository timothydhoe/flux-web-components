import { registerWebComponents } from '@domg-wc/common';
import { VlMap, VlMapSelectAction } from '@domg-wc/map';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { VlChartLine } from '../../chart/line/vl-chart-line.component';
import { VlChartReference } from '../../chart/vl-chart-reference.component';
import { VlDataFigure } from '../../figure/vl-data-figure.component';
import { VlDataGauge } from '../../figure/summary/vl-data-gauge.component';
import { VlDataStat } from '../../figure/summary/vl-data-stat.component';
import { VlDataPeriod } from '../../source/vl-data-period.component';
import { VlDataSource } from '../../source/vl-data-source.component';
import type { DataMapSelection } from '../data-map.events';
import { VlDataMapBaseLayer } from '../vl-data-map-base-layer.component';
import { VlDataMapLayer } from '../vl-data-map-layer.component';
import { VlDataMapLegend } from '../vl-data-map-legend.component';
import { ELF_LINES_SRC, ELF_SENSORS, ELF_SENSORS_SRC, elfMapHandlers } from './elf-map-story-data';

registerWebComponents([
    VlMap,
    VlDataMapBaseLayer,
    VlMapSelectAction,
    VlDataMapLayer,
    VlDataMapLegend,
    VlDataSource,
    VlDataPeriod,
    VlDataFigure,
    VlDataGauge,
    VlDataStat,
    VlChartLine,
    VlChartReference,
]);

// Spike: data op een kaart van Flux met `vl-data-map-layer` en `vl-data-map-legend`. Een klik op een sensor
// wisselt de data van de figuur ernaast.

export default {
    id: 'data-visualisation-map-spike',
    title: 'Data visualisation/kaart/spike',
    parameters: { msw: { handlers: elfMapHandlers }, layout: 'fullscreen' },
} as Meta;

/** De gekozen sensor wordt de bron van de figuur; meter, tegel en grafiek volgen vanzelf. */
const showSensor = (event: CustomEvent<DataMapSelection>) => {
    const sensor = ELF_SENSORS.find((candidate) => candidate.id === event.detail?.id);
    const panel = (event.currentTarget as Element).closest('.elf-map')?.querySelector('.panel');
    if (!sensor || !panel) return;
    (panel.querySelector('vl-data-source') as VlDataSource).src = `${ELF_SENSORS_SRC}/${sensor.id}`;
    panel.querySelector('[slot="headline"]')!.textContent = sensor.name;
    panel.querySelector('[slot="subtitle"]')!.textContent = `Sensor ${sensor.id}, ${sensor.voltage} kV`;
};

const initialSensor = ELF_SENSORS[1];

export const MapSpike = {
    name: 'spike - sensoren en lijnen',
    render: () => html`
        <div
            class="elf-map"
            style="display: grid; grid-template-columns: 1fr minmax(32rem, 44rem); gap: 2.4rem; padding: 1.6rem; align-items: start;"
        >
            <vl-map lambert2008 style="height: 72rem;" @vl-data-map-select=${showSensor}>
                <vl-data-map-base-layer></vl-data-map-base-layer>
                <vl-data-map-layer
                    name="Hoogspanningslijn"
                    src=${ELF_LINES_SRC}
                    projection-code="EPSG:31370"
                    width-property="voltage"
                    width-unit="kV"
                ></vl-data-map-layer>
                <vl-data-map-layer
                    name="Laatste meting"
                    src=${ELF_SENSORS_SRC}
                    projection-code="EPSG:31370"
                    z-index="2"
                    value-property="latest"
                    unit="µT"
                    selectable
                ></vl-data-map-layer>
                <vl-data-map-legend></vl-data-map-legend>
            </vl-map>
            <div class="panel">
                <vl-data-source src=${`${ELF_SENSORS_SRC}/${initialSensor.id}`} period="24h">
                    <vl-data-figure>
                        <h3 slot="headline">${initialSensor.name}</h3>
                        <p slot="subtitle">Sensor ${initialSensor.id}, ${initialSensor.voltage} kV</p>
                        <vl-data-period></vl-data-period>
                        <div style="display: flex; flex-wrap: wrap; gap: 2.4rem;">
                            <vl-data-gauge style="flex: 1 1 16rem;">
                                <vl-chart-reference value="0.4" label="Voorzorgswaarde"></vl-chart-reference>
                            </vl-data-gauge>
                            <vl-data-stat statistic="max"></vl-data-stat>
                        </div>
                        <vl-chart-line style="--vl-chart-height: 28rem;">
                            <vl-chart-reference value="0.4" label="Voorzorgswaarde"></vl-chart-reference>
                        </vl-chart-line>
                    </vl-data-figure>
                </vl-data-source>
            </div>
        </div>
    `,
};
