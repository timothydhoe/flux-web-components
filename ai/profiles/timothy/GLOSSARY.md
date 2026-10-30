# Data visualisation

The building blocks of a figure in the Flux data-visualisation library, for readers without prior knowledge.

## Language

### The frame

**Figure** (figuur):
A chart together with everything a reader needs to read it: title, unit, source, explanation and toolbar.
_Avoid_: card, widget, panel

**Unit** (eenheid):
What the values are measured in. A figure without a unit is invalid.
_Avoid_: measure, dimension

**Source** (bron):
Who produced the data, with a link where possible. A figure without a source is invalid.
_Avoid_: credit, attribution

**Explanation** (duiding):
Neutral text that helps the reader read the chart without telling them what to conclude.
_Avoid_: data story, insight, conclusion

**Toolbar** (werkbalk):
The actions on a figure, such as downloading the data or the image.
_Avoid_: menu, controls

### The chart

**Chart**:
The drawn area of a figure: axes, gridlines and series.
_Avoid_: graph, plot, visualisation

**Series**:
One set of values drawn together, as one line or one group of bars.
_Avoid_: trace, dataset, line (for the data itself)

**Data point**:
One value in a series at one position on the axis.
_Avoid_: point (on its own), sample, record

**Baseline**:
The line where the value axis is 0. It is always visible.
_Avoid_: x-axis, floor

**Reference line**:
A horizontal line at a fixed value from outside the data, such as a norm or threshold.
_Avoid_: target, limit line

**Chart furniture**:
Everything in a chart that isn't data: axes, tick labels, gridlines, labels.
_Avoid_: decoration, chrome

**Direct label**:
The name of a series written next to its line or bar, in place of a separate legend.
_Avoid_: inline legend, annotation

**Legend**:
A separate key that matches colours to series names; only used where direct labels don't fit.

### Look and behaviour

**Theme**:
The single place that sets the look of every chart: palettes, type and spacing.
_Avoid_: style, skin, template

**Palette**:
An ordered set of colours from the theme, either categorical (series that differ in kind) or sequential (values that differ in amount).
_Avoid_: colour scheme, colour family

**Highlight**:
Emphasising one series by fading the others.
_Avoid_: focus, select, active

**Tooltip**:
The small box that shows the exact value of a data point on hover or keyboard focus.
_Avoid_: hover label, popup

**Empty state**:
What a figure shows when there is no data for the selection.

**Error state**:
What a figure shows when its data can't be loaded or the figure is invalid.

## Relationships

- A **figure** has exactly one **chart**, one **unit** and one **source**.
- A **chart** has one or more **series**; each series has a **direct label** or an entry in the **legend**.
- A **figure** is in exactly one state: loading, **empty state**, **error state** or ready.
