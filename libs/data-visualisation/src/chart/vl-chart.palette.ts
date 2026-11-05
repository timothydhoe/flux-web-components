/** Eén plaats in het categorisch palet: de lijnkleur en de kleur voor tekst (direct label) van dezelfde familie. */
export type PaletteColor = {
    /** Lijnen en markers; graad 500 (Omgevingsgroen 600), ≥ 3:1 op wit. */
    line: string;
    /** Tekst moet 4,5:1 halen (WCAG 1.4.3); daarom graad 600 of donkerder. */
    label: string;
};

/** Categorisch palet "provincies" (v4). Bron: poirot `spec/colors.json` → `categorical.provincies`.
 *  Vaste volgorde: reeks 1 krijgt altijd De Schelde. Statuskleuren (rood, oranje, groen) horen hier nooit in. */
/** Voor de andere reeksen als er één uitgelicht is: grijs, zodat alleen de uitgelichte kleur heeft.
 *  Lijn Flux grey-500 (context, hoeft geen 3:1), label grey-800 (4,5:1 op wit). */
export const contextColor: PaletteColor = { line: '#a7b1bf', label: '#687483' };

export const categoricalPalette: readonly PaletteColor[] = [
    { line: '#387ffc', label: '#2667d8' }, // antwerpen, De Schelde
    { line: '#968807', label: '#7b7005' }, // brussel, Gele Iris
    { line: '#e0417f', label: '#bd2b67' }, // oost-vlaanderen, Gentse Azalea
    { line: '#447a6d', label: '#447a6d' }, // omgeving, Omgevingsgroen (lijn al op 600)
    { line: '#8d7dac', label: '#746590' }, // limburg, Struikheide
    { line: '#b67359', label: '#995c45' }, // vlaams-brabant, Geuze
];
