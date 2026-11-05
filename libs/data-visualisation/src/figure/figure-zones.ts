/** De vaste zones van `vl-data-figure`, van boven naar onder: onderschrift, controls, visual, uitleggen. De zones
 *  geven elke figuur dezelfde opbouw; binnen een zone telt de volgorde van de auteur. */
export type FigureZone = 'controls' | 'explanations';

/** Een onderdeel van Flux zet zichzelf in zijn zone, zodat de auteur geen `slot`-attribuut hoeft te schrijven.
 *  Alleen als kind van een figuur, en nooit over een slot heen dat de auteur zelf koos. */
export function joinFigureZone(part: HTMLElement, zone: FigureZone): void {
    if (part.hasAttribute('slot') || part.parentElement?.localName !== 'vl-data-figure') return;
    part.slot = zone;
}
