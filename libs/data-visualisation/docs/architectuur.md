# Architectuur van vl-chart

De grafieken worden opgebouwd via het principe uit d3.js, maar we gebruiken plotly.js door de eenvoud en de mogelijkheid om snel te prototypen; hover en export zijn built-in.

| d3                                   | vl-chart                                             |
|--------------------------------------|---------------------------------------------------|
| `load-data.js` (laden, autoType)     | `.data` → `classifyDataState()` → `dataState`     |
| `shared-constants.js` (margin)       | `vl-chart.defaults.ts`                            |
| svg + `innerChart.translate(margin)` | `Plotly.react(...)` met `width`, `height`, `margin` |
| scales (`domain`)                    | `layout/axis-ranges.ts` → `xaxis.range`, `yaxis.range` |
| `selectAll().data().join()`          | `buildTraces()` → `layout/line-traces.ts`         |


---
## Klassen

- `VlChart` (abstract): alles wat voor elk grafiektype gelijk is. `#draw()` is het vaste recept
  (Template Method): meten → beslissen → traces → marge → assen → `Plotly.react` → bijsturen.
- `VlChartLine`: vult alleen de hooks in die eigen zijn aan een lijn.
- `ChartInteractionController`: waarden lezen met muis, toetsenbord of tik (tooltip en wat de schermlezer
  voorleest). `VlChart` tekent de tooltip; de controller beslist wat erin staat.
- `ReferenceTagsController`: houdt de `vl-chart-reference`-tags bij, voor grafiek en meter.

---
## Hooks voor grafiektypes
- `beforeLayout(model, spec)`: de enige plek waar een type state verandert voor de layout; standaard niets.
  `VlChartLine` beslist hier of er een legende komt in plaats van directe labels. De `build…`-hooks hieronder
  lezen die beslissing alleen en veranderen zelf niets.
- `buildMargin(model, spec)`: ruimte rond de inner chart; standaard `chartDefaults.margin`.
  `VlChartLine` maakt rechts plaats voor de directe labels (gemeten met `measureTextWidth`).
- `buildChartLayout(model, spec)`: wat het type aan de Plotly-layout toevoegt; standaard niets.
  `VlChartLine` → directe labels, geen legende.
- `afterDraw(plotElement, spec)`: na `Plotly.react`, als er pixelposities zijn; stuurt alleen bij op wat gemeten is.
  `VlChartLine` zet overlappende labels uit elkaar (`layout/spread-labels.ts`) met één `Plotly.relayout`.
- `buildTraces(model)` (verplicht): wat het type tekent. `VlChartLine` → één lijn per reeks.

---
## Afspraken
- De waarde-as bevat altijd de nullijn.
- Een gat (NaN) onderbreekt de lijn; we tekenen er nooit overheen.
- Een astitel is naam + eenheid (`layout/axis-titles.ts`); zonder beide geen titel.
- Onder elke getekende grafiek staat de bron (`meta.source`), met link en open-data-vermelding als die er zijn.
- De plot blijft in de DOM (alleen `hidden`); alleen de visual wisselt per toestand.
- `models/` beschrijft wat de data is (contract, validatie, toestand); `layout/` rekent uit hoe ze getekend
  wordt (assen, traces, labels). Beide zonder DOM, met een Jest-spec.
- Plotly zet zijn CSS in `document.head`; wat de grafiek nodig heeft staat daarom gekopieerd in `vl-chart.flux-css.ts`.
- Ontbrekende Plotly-types vullen we aan in `src/plotly-augment.d.ts`, niet met `as any`.
- De waarde-as rondt af naar een ronde stap, zoals d3 `.nice()` (`layout/axis-ranges.ts`).
- `chartDefaults.margin` is een minimum; `automargin` vergroot de marge als labels of titels meer ruimte vragen.

---
## Kleuren en spec
- Reekskleuren: categorisch palet "provincies" v4 (`vl-chart.palette.ts`, bron: poirot `spec/colors.json`).
  Vaste volgorde, reeks 1 = De Schelde; nooit statuskleuren. Meer dan zes reeksen (`MAX_SERIES`) is een fout:
  `validateChartModel` meldt het en de grafiek toont de fouttoestand.
- Neutrale kleuren en font komen uit Flux-tokens in `vl-chart.flux-css.ts`; `readChartSpec()` leest de
  berekende waarden, want Plotly kent geen `var()`.
- Directe labels i.p.v. een legende: naam rechts op de hoogte van de laatste waarde, in de labelkleur (graad ≥ 600,
  4,5:1). Plotly geeft annotaties geen automargin; daarom meten we de breedte zelf. Labels die elkaar raken,
  schuiven als groep uit elkaar rond hun gemiddelde hoogte; de volgorde blijft die van de lijnen.
- De eenheid staat horizontaal boven de grafiek, niet als gedraaide titel van de waarde-as.
- Lijnen 2 px; een witte marker alleen op het laatste punt (waar het label staat) en op een punt tussen twee gaten
  (`buildMarkerSizes`). Getallen in het Nederlands (`1.250,5`), voluit (geen `125k`).
- Rustig raster: hoogstens zes stappen op de waarde-as, ronde stap 1, 2 of 5 (`buildValueScale`). De titel van de
  positie-as klein en grijs, en weg op een tijdas.
- **Hover in HTML, niet van Plotly.** Plotly meldt alleen welk punt de muis aanwijst (`hovermode: 'x'`,
  `hoverdistance: -1`); zijn eigen labels zijn verborgen (`.hoverlayer`), want die laten zich niet uitlijnen of
  plaatsen. Boven de grafiek tekenen we een haarlijn, een stip per lijn en een tooltip: de x vet, de eenheid één keer,
  reeksen van hoog naar laag met de waarden rechts uitgelijnd (`buildHoverSummary`). De tooltip staat aan de kant
  van de x met de meeste plaats, en in de helft van de hoogte waar de waarden niet staan. Pixels via Plotly's
  interne `d2p` (`plot-pixels.ts`), zoals POIROT. Met `hoverinfo: 'none'` stuurt Plotly 3 in deze modus geen events.
- **Vervagen bij hover**: wijst de muis een lijn aan (binnen 32 px), dan worden de andere lijnen en hun labels
  doorzichtig, en die reeks staat vet in de tooltip. Rechtstreeks op de svg, niet met `Plotly.restyle` (dat tekent
  alles opnieuw bij elke beweging). Uit met `disable-hover-fade`; nooit met één reeks of tijdens uitlichten.
- **Uitlichten**: `highlight="<naam>"` op de grafiek, of de lezer kiest met `vl-data-highlight` (een control in de
  figuur). De uitgelichte reeks in kleur, 3 px, bovenop met een witte rand; de andere in grijs (`contextColor`) en
  1,5 px; het label vet. Een onbekende naam geeft een waarschuwing en licht niets uit. `meta` op elke trace is de
  index van de reeks, want de volgorde van de traces volgt het model dan niet meer.

---
## Figuur en meubilair

> Vastgelegd 2026-11-04 (Timothy). Begrippen uit poirot-2 `docs/herbouw/terminologie.md`; het ontwerp komt uit
> de PoC van de ELF-sensoren (magnetische velden langs hoogspanningslijnen) en `vl-data-figure` uit poirot.

### De lagen

| Laag | Wat | Waar |
|---|---|---|
| **Visual** | Wat getekend wordt, plus eenheid en bron: zonder die twee is een grafiek niet eerlijk, ook niet los of als PNG | `vl-chart-line`, later `vl-data-stat`, `vl-data-gauge` |
| **Meubilair** (chart furniture) | Wat rond de visual uitlegt: kop en ondertitel | `vl-data-figure` (slots `headline`, `subtitle`) |
| **Controls** | Waarmee de lezer de weergave verandert | `vl-data-controls` met o.a. `vl-data-download`, `vl-data-fullscreen`, `vl-data-period` |
| **Alternatieven** | Dezelfde data in een andere vorm | `vl-data-table` (verplicht), CSV, PNG |
| **Uitleggen** | Uitklapbare tekst onder de visual | `vl-data-reading-guide`, `vl-data-about` |
| **Figuur** | Altijd de HTML-betekenis: houdt één visual en zijn meubilair, controls en alternatieven samen | `vl-data-figure` |
| **Bron** | Haalt de data op en deelt ze, met de periode, met meerdere visuals | `vl-data-source` |

### Principes

1. **Tekst in native HTML, de stijl van ons.** De auteur kiest de betekenis (`<h2>` of `<h3>`, `<p>`) en schrijft
   de tekst, met links of `<abbr>` als dat nodig is. De figuur geeft die elementen de Flux-stijl via `::slotted()`:
   het niveau klopt voor de pagina, het uitzicht is overal gelijk. Kop en ondertitel krijgen elk een eigen slot;
   geen `<hgroup>`, want vanuit de shadow DOM bereikt `::slotted()` alleen het element zelf, niet de `<p>` erin.
2. **Vaste zones, standaardonderdelen, de volgorde van de auteur.** Elke figuur heeft dezelfde opbouw, van boven
   naar onder: onderschrift, controls, visual, uitleggen. Een onderdeel van Flux (`vl-data-*`) zet zichzelf in
   zijn zone (`joinFigureZone`, via het `slot`-attribuut), zodat de auteur dat niet hoeft te schrijven; binnen
   een zone telt de volgorde van de auteur. De figuur toont zelf de standaardonderdelen; een eigen onderdeel
   vervangt alleen dát standaardonderdeel.
   *Bijgesteld 2026-11-04 (stap 3):* eerst stond een eigen onderdeel waar de auteur het zette. Met drie
   uitklapblokken raakten de uitleggen dan verspreid tussen grafiek en standaardtabel, en verloor de figuur haar
   vaste opbouw: precies de UX die we willen bieden.
3. **De tabel is verplicht.** Ze is het tekstalternatief van de grafiek (WCAG 1.1.1). Een eigen
   `<vl-data-table>` verandert alleen haar plaats; weglaten kan niet.
4. **Data via context, niet via de figuur.** De visual meldt zijn toestand met het event `vl-data-change`
   (`bubbles`, `composed`, detail = `DataState`). De figuur biedt die toestand aan via `figureContext`
   (`@lit/context`) en de onderdelen lezen ze zelf. Zo kennen de onderdelen elkaar niet, maakt de volgorde niet
   uit, en kan een app een eigen onderdeel bouwen dat dezelfde context leest zonder dat Flux het kent.
5. **Gedeelde data in een buitenste element.** Een periode verandert de grafiek én de tegels ernaast; daarom
   hoort ze niet bij één figuur. `vl-data-source` haalt de data op en houdt de periode bij; een visual zonder
   eigen data leest van de dichtstbijzijnde bron. Contexts nesten: de bron deelt de data, de figuur wat bij de
   figuur hoort (toestand, kop).
6. **Referentiewaarden als tag in de visual.** Een norm (EU-limiet) of streefwaarde (0,4 µT) is
   `<vl-chart-reference value="0.4" label="Voorzorgswaarde">` in de grafiek: zichtbaar in de HTML, meer dan één
   mogelijk, elk met een eigen label. _Bijgesteld 2026-11-04 (was `meta.references` in het datacontract): de auteur
   kiest welke norm het verhaal draagt. Komt er een bron die normen meelevert, dan kan `meta` ze later aanvullen._
7. **Namen zeggen wat iets is of bevat**, niet waar het staat of hoe algemeen het is. Daarom geen
   `vl-chart-template`: Flux heeft al `vl-template` en HTML `<template>`.

### Voorbeeld

```html
<vl-data-source src="api/sensors/ELF_L_0004" period="24h">
    <vl-data-period></vl-data-period>
    <vl-data-stat statistic="max"></vl-data-stat>
    <vl-data-figure>
        <h3 slot="headline">Magnetische veldsterkte</h3>
        <p slot="subtitle">Temse, laatste 24 uur</p>
        <vl-chart-line></vl-chart-line>
        <vl-data-reading-guide><p>Elke lijn is een meetpunt.</p></vl-data-reading-guide>
    </vl-data-figure>
</vl-data-source>
```

### Controls (stap 2)

- **Standaardrij** naast de kop, rechts: `vl-data-download format="png"` en `vl-data-fullscreen`. De CSV staat bij de
  cijfers: in het menu van `vl-data-table`. Een eigen `<vl-data-controls>` vervangt de rij; een lege rij = geen
  controls. Past het niet naast de kop, dan schuiven de controls eronder, nog altijd rechts. De controls van de
  auteur (periode, uitlichten) staan eerst, de standaardknoppen helemaal rechts.
- **Iconen** (`renderControlButton`): een knop bewaart of vergroot iets en hoort rustig te zijn naast de kop, dus
  een Flux `vl-button ghost` met alleen een icoon. Zijn `label` is de naam voor de schermlezer; een Flux
  `vl-tooltip` toont dezelfde tekst bij hover en focus. Met `show-label` een link met icoon en tekst, zoals de CSV in
  de kop van de tabel. _Bijgesteld 2026-11-04: eerst links met tekst in een eigen rij boven de grafiek._
- **Zichtbaarheid** (`findControlVisibility`): tijdens het laden houdt een control zijn plaats maar is het
  onzichtbaar en `inert`, zodat de pagina niet verspringt; zonder data (leeg, fout) is het er niet. Buiten een
  figuur toont een control niets.
- **PNG** (`VlChart.buildPng(title)` → `chart/png-export.ts`): kop, eenheid, plot, bronregel en het
  open-datakenmerk op één canvas, in de kleuren en het font van de spec. Een gedeelde afbeelding moet zonder de
  pagina te begrijpen zijn.
- **CSV** (`figure/controls/csv.ts`): RFC 4180, punt als decimaalteken, onafgeronde waarden, eenheid in de kop
  van elke reekskolom, BOM voor Excel. Om verder mee te rekenen, niet om te lezen; daarvoor is de tabel.
- **Bestandsnaam**: de kop van de figuur (`buildFileName`), anders "grafiek".
- **Schermvullend**: de hele figuur, niet alleen de grafiek. De hoogte gaat als `--vl-chart-height` naar de
  grafiek: een custom property erft door de slot heen tot in haar shadow DOM.
- **Bronregel**: bron links, het open-datakenmerk (leeuw + "Vlaamse Open Data", link naar de open-datapagina)
  rechts, zoals in POIROT; op een smal scherm onder elkaar. De PNG tekent het op dezelfde manier.
- **Stories**: elk onderdeel heeft een eigen story onder `Data visualisation/data-figure/…`, telkens in een kleine
  figuur, want een onderdeel leest zijn data uit de figuur.

### Uitleggen (stap 3)

- **Zone** onder de visual, in deze volgorde: de standaardtabel, de uitleggen van de auteur in zijn volgorde,
  het standaardblok "Over deze data". Elk blok heeft een lijn erboven (`explanationStyles`).
- **`vl-data-reading-guide`** ("Hoe lees je deze grafiek?"): alleen tekst van de auteur. Geen standaardtekst,
  want alleen de auteur weet wat de lezer moet weten; zonder inhoud geen blok.
- **`vl-data-about`** ("Over deze data"): bron (met link), eenheid met haar uitleg (`meta.y.unitInfo`) en open data
  komen uit `meta` (`buildAboutEntries`); de tekst van de auteur komt eronder. Zo typt niemand de bron over.
- **Standaard "Over deze data"** alleen als `meta` meer vertelt dan de bronregel (`hasAboutDetails`: nu een
  uitleg bij de eenheid). Anders herhaalt het blok alleen wat er al onder de grafiek staat.
- Zonder getekende grafiek tonen de uitleggen niets: uitleg bij een grafiek die er niet is, helpt niemand.

### Bron en periode (stap 4)

```html
<vl-data-source src="/api/elf/sensors/ELF_L_0004" period="7d">
    <vl-data-period></vl-data-period>
    <vl-data-figure>
        <h3 slot="headline">Magnetische veldsterkte</h3>
        <vl-chart-line></vl-chart-line>
    </vl-data-figure>
</vl-data-source>
```

- **`vl-data-source`** haalt de data op en deelt ze via `sourceContext` (toestand en periode). Tekent zelf niets.
  Een visual zonder eigen `.data` tekent de data van de dichtstbijzijnde bron; met `.data` wint die.
- **Periode** = zoveel volle kalenderdagen tot en met `end` (standaard vandaag), in lokale tijd: `24h` is één dag
  van middernacht tot middernacht. Zo vergelijk je dag met dag en stappen vorige/volgende per hele periode. Nooit
  voorbij vandaag.
- **Vraag**: standaard `from` en `to` (ISO 8601) als parameters op `src` (`buildRequestUrl`); het antwoord is het
  ChartModel in JSON (`adaptChartJson`: `null` wordt een gat, tijden ISO of ms). Een andere API geeft eigen
  functies via de properties `buildUrl` en `adapter`.
- **Een nieuwe vraag breekt de vorige af** (`AbortController`): een traag antwoord overschrijft nooit een nieuwere
  periode. Een fout van de bron wordt de toestand `error` van de visuals.
- **`vl-data-period`**: de lengtes als radioknoppen in de vorm van pillen (één keuze, pijltjestoetsen), de dagen
  met vorige, volgende en "Vandaag". Meldt `vl-period-change` aan de bron. In een figuur gaat het naar de controls.
- **Tijd-as**: Plotly leest getallen op een datum-as als UTC; we geven daarom lokale tijd als tekst
  (`toLocalDateTime`). Ticks in uren, dagen of maanden naargelang de afstand (`timeAxis`).

### Referentielijnen en laatste meting (stap 5, deel 1)

- **`vl-chart-reference`** tekent niets zelf; de grafiek leest `value` en `label` van haar eigen kinderen en volgt
  wijzigingen (`MutationObserver`). Een dunne gestreepte lijn boven het raster (`layer: 'above'`; eronder verdwijnt
  ze onder een rasterlijn op dezelfde hoogte), het label links boven de lijn met een achtergrond, waar de directe
  labels het niet raken. De waarde-as neemt de waarde altijd mee: een norm buiten beeld vertelt niets. Voor de
  schermlezer een beschrijving via `aria-describedby` ("Referentielijn: …"). Zonder geldige `value`: een
  waarschuwing en geen lijn.
- **`vl-data-latest`**: de laatste waarde groot, met de eenheid en wanneer (`findLatestValue`, zelfde decimalen als
  de grafiek). Leest de figuur waarin het staat, anders de dichtstbijzijnde bron: zo kan het ook als tegel naast de
  figuur. `series` kiest de reeks (standaard de eerste), `label` de tekst erboven ("Laatste meting"). Tijdens het
  laden houdt het zijn plaats; zonder data is het er niet.
- **Tegels** (`VlDataSummary`): `vl-data-latest`, `vl-data-stat` en `vl-data-gauge` delen het lezen van de data
  (figuur, anders bron), de plaats tijdens het laden en het uitzicht (label, waarde, eenheid, context).
- **`vl-data-stat`**: `statistic` `max`, `min` of `mean` (`findStatistic`); eronder wanneer (hoogste, laagste) of
  over welke periode (gemiddelde). Gaten tellen niet mee.
- **`vl-data-gauge`**: de laatste waarde met een meter (`role="meter"`) tegen dezelfde `vl-chart-reference`-tags
  als de grafiek (`readReferenceTags`). Schaal van 0 tot `max`, anders rond boven waarde en normen
  (`buildNiceScale`, zoals de waarde-as). Boven of onder staat er in woorden; de kleur verandert niet, want niet elke
  norm is een grens die je niet mag overschrijden.

### Stappen

1. `vl-data-figure` met kop, ondertitel en `figureContext`; `vl-chart` meldt `vl-data-change`; de verplichte
   `vl-data-table`. ✓
2. Controls: `vl-data-controls` met `vl-data-download` (PNG, CSV) en `vl-data-fullscreen`, als standaardrij. ✓
3. Uitleggen: `vl-data-reading-guide`, `vl-data-about` (bron en eenheid uit `meta`, aangevuld door de auteur). ✓
4. `vl-data-source` en `vl-data-period`. ✓
5. `vl-chart-reference`, `vl-data-latest`, `vl-data-stat` en `vl-data-gauge` ✓.
