import { registerWebComponents } from '@domg-wc/common';
import { VlButtonComponent, VlLinkComponent } from '@domg-wc/components/atom';
import { VlTooltipComponent } from '@domg-wc/components/block';
import { html, TemplateResult } from 'lit';
import type { ControlVisibility } from './control-visibility';

registerWebComponents([VlButtonComponent, VlLinkComponent, VlTooltipComponent]);

/** Wat een knop van een control nodig heeft. `showsLabel`: de tekst naast het icoon, bv. "Download cijfers (CSV)"
 *  in de kop van de tabel; anders alleen het icoon. */
export type ControlButton = {
    icon: string;
    label: string;
    visibility: ControlVisibility;
    showsLabel: boolean;
    onClick: () => void;
};

/** Eén id per control: elk control heeft zijn eigen shadow root. */
const BUTTON_ID = 'control-button';

/** Een knop met alleen een icoon, zoals in de werkbalk van een grafiek: rustig naast de kop. De naam (`label`) is er
 *  voor de schermlezer; de tooltip toont dezelfde tekst bij hover en focus, want een icoon alleen is niet voor
 *  iedereen duidelijk. Met `showsLabel` een link met icoon en tekst. */
export function renderControlButton({ icon, label, visibility, showsLabel, onClick }: ControlButton): TemplateResult {
    if (showsLabel) {
        return html`<vl-link
            class=${visibility}
            ?inert=${visibility !== 'visible'}
            button-as-link
            small
            icon=${icon}
            @vl-click=${onClick}
            >${label}</vl-link
        >`;
    }
    return html`<vl-button
            id=${BUTTON_ID}
            class=${visibility}
            ?inert=${visibility !== 'visible'}
            ghost
            icon=${icon}
            label=${label}
            @vl-click=${onClick}
        ></vl-button>
        <vl-tooltip for=${BUTTON_ID} placement="top" type="label">${label}</vl-tooltip>`;
}
