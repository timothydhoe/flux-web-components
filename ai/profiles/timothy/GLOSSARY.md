# Data visualisation

The building blocks of a figure in the Flux data-visualisation library, for readers without prior knowledge.

## Language

### The frame

**Figure** (figuur):
Always the HTML meaning: the element that holds chart furniture, controls, the visual and its alternatives.
_Avoid_: card, widget, panel; "figure" for Plotly's object (that is the **Plotly spec**)

**Chart furniture**:
The text around the visual that explains it: headline, subtitle and caveat.
_Avoid_: decoration, chrome; furniture for axes or gridlines

**Headline** (kop):
A checkable fact the chart shows, not a topic.
_Avoid_: title (on its own)

**Caveat** (kanttekening):
A short note on what limits the reading, such as a gap or partial data.
_Avoid_: disclaimer, footnote

**Controls**:
What the reader uses to change the view, such as the highlight select. Interaction reads; controls change.
_Avoid_: toolbar, actions, menu

**Alternatives** (alternatieven):
The same data in another form: table, PNG, CSV.
_Avoid_: export, fallback

**Explanations** (uitleggen):
The collapsible blocks under the visual: the numbers, how to read the chart, and about the data.
_Avoid_: data story, insight, conclusion

**Source row** (bronregel):
The line under the visual with the source and, where it applies, the "Vlaamse Open Data" mark.
_Avoid_: credit, attribution, footer

### The chart

**Visual**:
What is drawn for the data: the lines, bars or points, with their direct labels, unit and source.
_Avoid_: chart (on its own), graph, visualisation

**Plot**:
The whole drawing of one visual, axes included.
_Avoid_: canvas, figure

**Inner chart**:
The area inside the plot where the data is drawn; the plot minus the margin.
_Avoid_: graph frame, chart area, plot area

**Margin**:
The space between the plot's edge and the inner chart, for axes and direct labels.
_Avoid_: padding

**Series** (reeks):
All observations of one observed object, drawn as one line, one group of bars or one cloud of points.
_Avoid_: trace, dataset, line (for the data itself)

**Data point**:
One value in a series at one position on the axis.
_Avoid_: point (on its own), sample, record

**Gap** (gat):
A missing value in a series. Never interpolated; the line breaks and the text names it.
_Avoid_: null, hole, missing data (on its own)

**Unit** (eenheid):
What the values are measured in; it comes with the data. A visual without a unit is invalid.
_Avoid_: measure, dimension

**Source** (bron):
Who produced the data, with a link where possible; it comes with the data. A visual without a source is
invalid.
_Avoid_: credit, attribution

**Baseline**:
The line where the value axis is 0. It is always visible.
_Avoid_: x-axis, floor

**Reference line**:
A horizontal line at a fixed value from outside the data, such as a norm or threshold.
_Avoid_: target, limit line

**Direct label**:
The name of a series written next to its line or bar, in place of a legend.
_Avoid_: inline legend, annotation

**Legend**:
A separate key that matches colour to meaning, such as shade to year; only where direct labels don't fit.

### Look and behaviour

**Spec**:
The shared look every chart follows, whatever language draws it: palettes, type and spacing.
_Avoid_: theme, style, skin, template

**Palette**:
An ordered set of colours from the spec, one colour per series.
_Avoid_: colour scheme; colour family (that is one colour in shades)

**Slot**:
Position *i* in a palette; it gives series *i*, in data order, its colour.
_Avoid_: index, colour number

**Colour family**:
One colour in ten shades, for example years in a bar chart.
_Avoid_: ladder, ramp, gradient

**Highlight** (uitlichten):
One series in colour, the rest as context. Chosen by the author or by the reader.
_Avoid_: accent, focus, select, active

**Context**:
The series that aren't highlighted: grey, thin, without markers.
_Avoid_: background, other, muted

**Halo**:
The white edge around the highlighted series, so crossing lines stop before it.
_Avoid_: outline, stroke, glow

**Interaction**:
Reading values without changing the view, such as hover and the tooltip. Controls change the view; interaction
only reads.
_Avoid_: controls (for reading)

**Tooltip**:
The small box that shows the exact value of a data point on hover. It can be hovered itself and closes with
Escape.
_Avoid_: hover label, popup

**Data state**:
What the figure can show: data, partial (with gaps), empty, error or loading.
_Avoid_: status (on its own), ready

## Relationships

- A **figure** holds **chart furniture**, **controls**, one **visual**, its **alternatives**, **explanations**
  and a **source row**.
- A **visual** has one **unit** and one **source**, and one or more **series**.
- Each **series** has a **direct label** or an entry in the **legend**.
- A **series** has one **slot** in the **palette**, or one shade of a **colour family**.
- When something is highlighted, every **series** is either the **highlight** or **context**.
- A **figure** is in exactly one **data state** at a time.
