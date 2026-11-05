import { BaseLitElement, webComponent } from '@domg-wc/common';
import { CSSResult, html, TemplateResult } from 'lit';
import { joinFigureZone } from '../figure-zones';
import { vlDataControlsFluxStyles } from './vl-data-controls.flux-css';

/** De rij met controls van een figuur: zet de controls naast elkaar, rechts, en laat ze op een smal scherm
 *  doorlopen naar de volgende regel. Doet zelf niets met de data; dat doet elk control. */
@webComponent('vl-data-controls')
export class VlDataControls extends BaseLitElement {
    static get styles(): CSSResult[] {
        return [vlDataControlsFluxStyles];
    }

    connectedCallback(): void {
        super.connectedCallback();
        joinFigureZone(this, 'controls');
    }

    render(): TemplateResult {
        return html`<slot></slot>`;
    }
}
