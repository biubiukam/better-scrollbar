# API Reference

`better-scrollbar` is a monorepo providing framework-specific virtual scrollbar
components built on a shared core. This document covers the full API for all
packages.

## Table of Contents

- [Packages Overview](#packages-overview)
- [React — `@better-scrollbar/react`](#react--better-scrollbarreact)
    - [Basic Usage](#basic-usage)
    - [100 Million Rows](#100-million-rows)
    - [Custom Scrollbar](#custom-scrollbar)
    - [Props](#react-props)
    - [Ref API](#react-ref-api)
    - [Exported Types](#react-exported-types)
- [Vue 3 — `@better-scrollbar/vue`](#vue-3--better-scrollbarvue)
    - [Basic Usage (Vue)](#basic-usage-vue)
    - [Props](#vue-props)
    - [Events](#vue-events)
    - [Slots](#vue-slots)
    - [Exposed Methods](#vue-exposed-methods)
    - [Composables](#vue-composables)
    - [Exported Types](#vue-exported-types)
- [Core — `@better-scrollbar/core`](#core--better-scrollbarcore)
    - [Virtual Height Index](#virtual-height-index)
    - [Utility Functions](#utility-functions)
- [Shared Types](#shared-types)
- [Performance Notes](#performance-notes)

---

## Packages Overview

| Package                   | Install                                                   | Description                              |
| ------------------------- | --------------------------------------------------------- | ---------------------------------------- |
| `@better-scrollbar/core`  | `pnpm add @better-scrollbar/core`                         | Framework-neutral algorithms and types   |
| `@better-scrollbar/react` | `pnpm add @better-scrollbar/react @better-scrollbar/core` | React component & hooks                  |
| `@better-scrollbar/vue`   | `pnpm add @better-scrollbar/vue @better-scrollbar/core`   | Vue 3 component & composables            |
| `better-scrollbar`        | `pnpm add better-scrollbar`                               | Compatibility wrapper (re-exports React) |

---

## React — `@better-scrollbar/react`

### Basic Usage

```tsx
import ScrollBar from "@better-scrollbar/react"
import "@better-scrollbar/react/styles/ScrollBar.less"

export default function Demo() {
	return (
		<ScrollBar width={500} height={300} itemHeight={32}>
			<div key="a">Row A</div>
			<div key="b">Row B</div>
		</ScrollBar>
	)
}
```

### 100 Million Rows

```tsx
import ScrollBar from "@better-scrollbar/react"

const ROW_COUNT = 100_000_000

export default function HugeList() {
	return (
		<ScrollBar
			width={720}
			height={420}
			itemCount={ROW_COUNT}
			estimatedItemHeight={32}
			overscan={2}
			maxRenderedItems={500}
			heightCacheLimit={50_000}
			scrollMode="native"
			adaptiveOverscan
			scrollSeek={{ velocityThreshold: 2, exitVelocityThreshold: 0.8 }}
			renderItem={(index) => (
				<div key={index} style={{ height: 32 }}>
					Row {index.toLocaleString()}
				</div>
			)}
		/>
	)
}
```

### Custom Scrollbar

```tsx
import type { HTMLProps } from "react"
import ScrollBar, { type RenderElement } from "@better-scrollbar/react"
import "@better-scrollbar/react/styles/ScrollBar.less"

const renderThumb: RenderElement<HTMLProps<HTMLDivElement>> = (props) => (
	<div
		{...props}
		style={{
			...props?.style,
			background: "rgba(37, 99, 235, 0.7)",
			borderRadius: 999
		}}
	/>
)

export default function CustomScrollbar() {
	return (
		<ScrollBar
			width={500}
			height={300}
			scrollBarSize={8}
			renderThumbVertical={renderThumb}
			renderThumbHorizontal={renderThumb}
		>
			<div style={{ width: 900, height: 600 }}>Large content</div>
		</ScrollBar>
	)
}
```

### React Props

| Prop                             | Type                                 | Default        | Description                                                                                               |
| -------------------------------- | ------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------- |
| `children`                       | `ReactNode`                          | —              | Items for children mode                                                                                   |
| `itemCount`                      | `number`                             | —              | Total item count for indexed rendering                                                                    |
| `renderItem`                     | `(index: number) => ReactElement`    | —              | Lazy row renderer. When `itemCount` and `renderItem` are both provided, indexed rendering takes priority. |
| `itemKey`                        | `(index: number) => Key`             | `index`        | Stable key generator for indexed items                                                                    |
| `isVirtual`                      | `boolean`                            | `true`         | Enables virtual rendering. Falls back to virtual when item count exceeds `maxRenderedItems`.              |
| `width`                          | `number`                             | —              | Scroll viewport width (px)                                                                                |
| `height`                         | `number`                             | —              | Scroll viewport height (px)                                                                               |
| `className`                      | `string`                             | —              | Class name for the outer container                                                                        |
| `style`                          | `CSSProperties`                      | —              | Inline style for the outer container                                                                      |
| `itemHeight`                     | `number`                             | `20`           | Default row height                                                                                        |
| `estimatedItemHeight`            | `number`                             | `itemHeight`   | Estimated height for unmeasured rows                                                                      |
| `heightCacheLimit`               | `number`                             | `50000`        | Max measured heights retained (LRU). Pass `Infinity` to disable eviction.                                 |
| `overscan`                       | `number \| OverscanConfig`           | `1`            | Extra item count or full overscan config                                                                  |
| `adaptiveOverscan`               | `boolean \| AdaptiveOverscanOptions` | `false`        | Direction-aware dynamic overscan                                                                          |
| `maxRenderedItems`               | `number`                             | `500`          | DOM item cap. Visible range is always preserved. Pass `Infinity` to disable.                              |
| `scrollSeek`                     | `boolean \| ScrollSeekOptions`       | `false`        | Placeholder mode during fast scrolling                                                                    |
| `scrollMode`                     | `"controlled" \| "native"`           | `"controlled"` | Wheel input strategy                                                                                      |
| `maintainVisibleContentPosition` | `boolean`                            | `true`         | Anchor visible item on data/measurement changes                                                           |
| `followOutput`                   | `boolean \| FollowOutputOptions`     | `false`        | Pin to bottom on append                                                                                   |
| `preserveItemState`              | `boolean`                            | `false`        | Keep non-visible children mounted (hidden)                                                                |
| `stickyIndices`                  | `number[]`                           | —              | Sticky item indexes                                                                                       |
| `groupCounts`                    | `number[]`                           | —              | Per-group sizes for sticky group headers                                                                  |
| `maxBrowserScrollHeight`         | `number`                             | `10000000`     | Physical scroll height cap                                                                                |
| `prefixCls`                      | `string`                             | `"scroll-bar"` | CSS class prefix                                                                                          |
| `scrollBarSize`                  | `number`                             | `6`            | Scrollbar thickness                                                                                       |
| `scrollBarHidden`                | `boolean`                            | `false`        | Hides scrollbars                                                                                          |
| `scrollBarAutoHideTimeout`       | `number`                             | `1000`         | Auto-hide delay (ms)                                                                                      |
| `onScroll`                       | `(state: ScrollState) => void`       | —              | Scroll state callback                                                                                     |
| `onScrollStart`                  | `() => void`                         | —              | Scroll start callback                                                                                     |
| `onScrollEnd`                    | `() => void`                         | —              | Scroll end callback                                                                                       |
| `onItemsRendered`                | `(info: ItemsRenderedInfo) => void`  | —              | Rendered range callback                                                                                   |
| `renderView`                     | `RenderElement`                      | built-in `div` | Custom scroll view wrapper                                                                                |
| `renderTrackHorizontal`          | `RenderElement`                      | built-in       | Custom horizontal track                                                                                   |
| `renderTrackVertical`            | `RenderElement`                      | built-in       | Custom vertical track                                                                                     |
| `renderThumbHorizontal`          | `RenderElement`                      | built-in       | Custom horizontal thumb                                                                                   |
| `renderThumbVertical`            | `RenderElement`                      | built-in       | Custom vertical thumb                                                                                     |

### React Ref API

```ts
interface VirtualScrollBarRef {
	scrollTo(offset: { x: number; y: number }): void
	getScrollState(): ScrollState
	resizeObserver(
		callback: (
			size: Pick<ScrollState, "scrollWidth" | "scrollHeight" | "clientWidth" | "clientHeight">
		) => void
	): void
}
```

| Method               | Description                                                            |
| -------------------- | ---------------------------------------------------------------------- |
| `scrollTo({ x, y })` | Scrolls to logical coordinates                                         |
| `getScrollState()`   | Returns latest scroll state (reads from internal ref, not React state) |
| `resizeObserver(cb)` | Fires callback immediately with current dimensions                     |

### React Exported Types

```ts
import type {
	VirtualScrollBarProps,
	VirtualScrollBarRef,
	RenderElement,
	RenderItem,
	ScrollSeekPlaceholder,
	ScrollSeekOptions,
	// Re-exported from core:
	ScrollState,
	ScrollOffset,
	ItemsRenderedInfo,
	AdaptiveOverscanOptions,
	OverscanConfig,
	OverscanRange,
	FollowOutputOptions
} from "@better-scrollbar/react"
```

---

## Vue 3 — `@better-scrollbar/vue`

### Basic Usage (Vue)

```vue
<script setup>
import { BScrollBar } from "@better-scrollbar/vue"
import "@better-scrollbar/vue/styles/ScrollBar.less"
</script>

<template>
	<BScrollBar :item-count="10000" :estimated-item-height="32" :height="400">
		<template #default="{ index }">
			<div>Row {{ index }}</div>
		</template>
	</BScrollBar>
</template>
```

### Vue Props

| Prop                  | Type                       | Default        | Description                              |
| --------------------- | -------------------------- | -------------- | ---------------------------------------- |
| `itemCount`           | `number`                   | **required**   | Total number of items                    |
| `estimatedItemHeight` | `number`                   | `20`           | Estimated height for unmeasured rows     |
| `height`              | `number`                   | **required**   | Viewport height (px)                     |
| `width`               | `number`                   | —              | Viewport width (px). Defaults to `100%`. |
| `overscan`            | `number \| OverscanConfig` | `1`            | Extra item count or overscan config      |
| `maxRenderedItems`    | `number`                   | `500`          | Rendered item cap                        |
| `prefixCls`           | `string`                   | `"scroll-bar"` | CSS class prefix                         |

### Vue Events

| Event           | Payload             | Description                         |
| --------------- | ------------------- | ----------------------------------- |
| `scroll`        | `ScrollState`       | Emitted on scroll                   |
| `scrollStart`   | —                   | Emitted when scrolling starts       |
| `scrollEnd`     | —                   | Emitted when scrolling ends         |
| `itemsRendered` | `ItemsRenderedInfo` | Emitted when rendered ranges change |

### Vue Slots

| Slot      | Scope               | Description                             |
| --------- | ------------------- | --------------------------------------- |
| `default` | `{ index: number }` | Scoped slot for rendering each item row |

### Vue Exposed Methods

Access via template ref (`ref="scrollbar"`):

```ts
interface BScrollBarExposed {
	scrollTo(offset: Partial<ScrollOffset>): void
	getScrollState(): ScrollState
}
```

### Vue Composables

#### `useScrollBar(options): UseScrollBarReturn`

Core composable managing scroll state and virtual range computation.

```ts
interface UseScrollBarOptions {
	itemCount: MaybeRef<number>
	estimatedItemHeight?: MaybeRef<number>
	height: MaybeRef<number>
	width?: MaybeRef<number | undefined>
	overscan?: MaybeRef<number | OverscanConfig | undefined>
	maxRenderedItems?: MaybeRef<number | undefined>
}

interface UseScrollBarReturn {
	heightIndex: Ref<VirtualHeightIndexStore>
	scrollState: Ref<ScrollState>
	range: ComputedRef<VirtualRangeResult>
	visibleItems: ComputedRef<number[]>
	scrollTo: (offset: Partial<ScrollOffset>) => void
	handleScroll: (event: Event) => void
	getScrollState: () => ScrollState
}
```

#### `useHeights(options)`

Height index management with reactive measurement tracking.

```ts
interface UseHeightsOptions {
	itemCount: MaybeRef<number>
	estimatedItemHeight: MaybeRef<number>
	heightCacheLimit?: MaybeRef<number | undefined>
}
```

Returns `{ heightIndex, totalHeight, setMeasuredHeight, deleteMeasuredHeight, measureElement, reset }`.

#### `useResizeObserver(target: Ref<HTMLElement | null>)`

Tracks element size changes. Returns `{ size, updateSize, stopObserver, startObserver }`.

### Vue Exported Types

```ts
import type {
	BScrollBarProps,
	BScrollBarExposed,
	UseScrollBarOptions,
	UseScrollBarReturn,
	UseHeightsOptions,
	UseResizeObserverSize,
	MaybeRef,
	ScrollState,
	ScrollOffset,
	ItemsRenderedInfo,
	OverscanConfig
} from "@better-scrollbar/vue"
```

---

## Core — `@better-scrollbar/core`

### Virtual Height Index

The central data structure for virtual scrolling — a block-based Fenwick tree
that maps item indexes to pixel offsets.

```ts
import { createVirtualHeightIndex, createVirtualHeightIndexStore } from "@better-scrollbar/core"
```

#### `createVirtualHeightIndexStore(options): VirtualHeightIndexStore`

```ts
interface VirtualHeightIndexOptions {
	itemCount: number
	estimatedItemHeight: number
	measuredHeights?: Map<number, number>
	blockSize?: number // default 512
	maxMeasuredItems?: number // default Infinity
}

interface VirtualHeightIndexStore extends VirtualHeightIndex {
	setMeasuredHeight(index: number, height: number): VirtualHeightIndexStore
	deleteMeasuredHeight(index: number): VirtualHeightIndexStore
	reset(options: VirtualHeightIndexOptions): VirtualHeightIndexStore
}

interface VirtualHeightIndex {
	totalHeight: number
	getOffset(index: number): number
	getRange(options: VirtualRangeOptions): VirtualRangeResult
}
```

#### `VirtualRangeOptions`

```ts
interface VirtualRangeOptions {
	scrollOffset: number
	viewportSize: number
	overscan: number | VirtualOverscanRange
	overscanPixels?: number | VirtualOverscanRange
	maxItems?: number
}
```

#### `VirtualRangeResult`

```ts
interface VirtualRangeResult {
	scrollHeight: number
	start: number
	end: number
	visibleStartIndex: number
	visibleEndIndex: number
	offset: number
}
```

### Utility Functions

| Function                     | Signature                                                | Description                                                        |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------ |
| `getStickyIndicesFromGroups` | `(groupCounts: number[]) => number[]`                    | Derives sticky header indexes from group sizes                     |
| `getSpinSize`                | `(containerSize: number, scrollRange: number) => number` | Calculates scrollbar thumb size                                    |
| `raf`                        | `(callback: () => void, times?: number) => number`       | `requestAnimationFrame` wrapper with chaining and `raf.cancel(id)` |
| `isDOM`                      | `(node: unknown) => node is HTMLElement \| SVGElement`   | Type guard for DOM elements                                        |
| `getPageXY`                  | `(event, horizontal?) => number`                         | Extracts page coordinate from mouse/touch events                   |

---

## Shared Types

These types are defined in `@better-scrollbar/core` and re-exported by both
adapters.

### `ScrollState`

| Field          | Type      | Description                            |
| -------------- | --------- | -------------------------------------- |
| `x`            | `number`  | Horizontal scroll offset               |
| `y`            | `number`  | Vertical scroll offset                 |
| `scrollWidth`  | `number`  | Full scrollable content width          |
| `scrollHeight` | `number`  | Full scrollable content height         |
| `clientWidth`  | `number`  | Viewport width                         |
| `clientHeight` | `number`  | Viewport height                        |
| `isScrolling`  | `boolean` | Whether a scroll interaction is active |

### `ScrollOffset`

| Field | Type     | Description       |
| ----- | -------- | ----------------- |
| `x`   | `number` | Horizontal offset |
| `y`   | `number` | Vertical offset   |

### `ItemsRenderedInfo`

| Field               | Type     | Description                          |
| ------------------- | -------- | ------------------------------------ |
| `startIndex`        | `number` | First rendered index (with overscan) |
| `endIndex`          | `number` | Last rendered index (with overscan)  |
| `visibleStartIndex` | `number` | First visible index                  |
| `visibleEndIndex`   | `number` | Last visible index                   |

### `AdaptiveOverscanOptions`

| Field            | Type     | Default        | Description                        |
| ---------------- | -------- | -------------- | ---------------------------------- |
| `min`            | `number` | base overscan  | Lower bound                        |
| `max`            | `number` | `overscan + 4` | Upper bound                        |
| `velocityFactor` | `number` | `0.02`         | Scroll distance multiplier         |
| `timeFactor`     | `number` | `0.15`         | Scroll velocity multiplier (px/ms) |

### `OverscanRange`

| Field    | Type     | Description                            |
| -------- | -------- | -------------------------------------- |
| `before` | `number` | Extra items/pixels before the viewport |
| `after`  | `number` | Extra items/pixels after the viewport  |

### `OverscanConfig`

| Field      | Type                                 | Default | Description        |
| ---------- | ------------------------------------ | ------- | ------------------ |
| `items`    | `number`                             | `1`     | Extra item count   |
| `pixels`   | `number \| OverscanRange`            | —       | Pixel-based buffer |
| `adaptive` | `boolean \| AdaptiveOverscanOptions` | `false` | Dynamic overscan   |

### `FollowOutputOptions`

| Field       | Type     | Default | Description                          |
| ----------- | -------- | ------- | ------------------------------------ |
| `threshold` | `number` | `1`     | Pixel threshold for bottom detection |

### `ScrollSeekOptions<Placeholder>`

| Field                   | Type                        | Default                     | Description                                |
| ----------------------- | --------------------------- | --------------------------- | ------------------------------------------ |
| `velocityThreshold`     | `number`                    | `2`                         | Velocity (px/ms) to enter placeholder mode |
| `exitVelocityThreshold` | `number`                    | half of `velocityThreshold` | Velocity to exit placeholder mode          |
| `placeholder`           | `Placeholder`               | —                           | Lightweight placeholder renderer           |
| `onChange`              | `(active: boolean) => void` | —                           | Mode toggle callback                       |

---

## Performance Notes

- **Fenwick tree index** — Dynamic heights are tracked with a block-based
  Fenwick index. Single-row resize updates cost O(log n) instead of rebuilding
  the full height table.
- **Fixed-height fast path** — Fixed-height lists skip the dynamic index.
  Offsets are calculated as `index * estimatedItemHeight`.
- **Shared ResizeObserver** — Row measurement uses one shared `ResizeObserver`.
  Observer callbacks prefer `contentRect.height` and fall back to `offsetHeight`.
- **Batched updates** — High-frequency wheel and drag input writes to internal
  refs first, then batches React state updates through `requestAnimationFrame`.
- **Massive ranges** — When logical height exceeds the browser-safe physical
  height, DOM `scrollTop` is re-based into a local logical window.
- **Native scroll pipeline** — `scrollMode="native"` uses browser scrolling
  when possible. Compressed massive ranges keep controlled wheel handling for
  logical precision.
- **Adaptive overscan** — `adaptiveOverscan` calculates direction-aware
  pre-rendering from scroll distance, event timing, and `devicePixelRatio`.
- **Pixel overscan** — `overscanPixels` / `OverscanConfig.pixels` controls
  pre-rendering by pixels instead of row count.
- **DOM cap** — `maxRenderedItems` protects overscan, adaptive overscan,
  `isVirtual={false}`, and `preserveItemState` from mounting too many DOM nodes.
- **Height cache limit** — `heightCacheLimit` provides LRU eviction for measured
  heights, avoiding unbounded cache growth.
- **Scroll seek** — Placeholders keep list structure stable during fast
  scrolling; real rows restore when velocity drops. Placeholder rows do not
  participate in height measurement.
- **Accessibility** — The wrapper uses `role="list"`, rendered items use
  `role="listitem"` with `aria-posinset` and `aria-setsize`.
