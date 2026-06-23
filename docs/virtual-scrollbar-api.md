# API Reference

`better-scrollbar` provides a React virtual list with customizable scrollbars. It
supports both regular `children` rendering and indexed lazy rendering with
`itemCount + renderItem`. Use indexed rendering for very large data sets, such as
10 million, 50 million, or 100 million rows, so the application does not allocate
a full children array up front.

## Table of Contents

- [Basic Usage](#basic-usage)
- [100 Million Rows](#100-million-rows)
- [Props](#props-api)
- [Supporting Types](#supporting-types)
- [Ref API](#ref-api)
- [Performance Notes](#performance-notes)

## Basic Usage

```tsx
import VirtualScrollBar from "better-scrollbar"
import "better-scrollbar/dist/ScrollBar.min.css"

export default function Demo() {
	return (
		<VirtualScrollBar width={500} height={300} itemHeight={32}>
			<div key="a">Row A</div>
			<div key="b">Row B</div>
		</VirtualScrollBar>
	)
}
```

## 100 Million Rows

```tsx
import VirtualScrollBar from "better-scrollbar"

const ROW_COUNT = 100_000_000

export default function HugeList() {
	return (
		<VirtualScrollBar
			width={720}
			height={420}
			itemCount={ROW_COUNT}
			estimatedItemHeight={32}
			overscan={2}
			overscanPixels={320}
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

## Props API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode \| (() => ReactElement)` | `undefined` | Items for children mode. Best for small and medium lists, or when callers need to declare JSX directly. |
| `itemCount` | `number` | `undefined` | Total item count for indexed rendering. Use this for massive lists. |
| `renderItem` | `(index: number) => ReactElement` | `undefined` | Lazy row renderer. When both `itemCount` and `renderItem` are provided, indexed rendering takes priority. |
| `itemKey` | `(index: number) => Key` | `index` | Stable key generator for indexed items. Children mode uses child keys by default. |
| `isVirtual` | `boolean` | `true` | Enables virtual rendering. If disabled, all items are rendered unless the item count exceeds `maxRenderedItems`; in that case the component falls back to virtual rendering to avoid mounting a large DOM tree. |
| `width` | `number` | `undefined` | Scroll viewport width in px. |
| `height` | `number` | `undefined` | Scroll viewport height in px. |
| `className` | `string` | `undefined` | Class name for the outer container. |
| `style` | `CSSProperties` | `undefined` | Inline style for the outer container. |
| `itemHeight` | `number` | `20` | Default row height. |
| `estimatedItemHeight` | `number` | `itemHeight` | Estimated height for unmeasured rows. Dynamic-height and indexed modes use this value to estimate total height. |
| `heightCacheLimit` | `number` | `50000` | Maximum measured row heights retained in memory. Pass `Infinity` to disable eviction. The limit is soft because currently mounted rows are retained first. |
| `overscan` | `number` | `1` | Extra row count rendered outside the visible range. |
| `overscanPixels` | `number \| OverscanRange` | `undefined` | Extra pixel range rendered outside the viewport. Useful for dynamic-height lists. |
| `adaptiveOverscan` | `boolean \| AdaptiveOverscanOptions` | `false` | Expands overscan by scroll direction, distance, elapsed time, and device pixel ratio. |
| `maxRenderedItems` | `number` | `500` | Rendered item cap. It never clips the real visible range and also guards `isVirtual={false}` and `preserveItemState`. Pass `Infinity` only when rendering every item is intentional. |
| `scrollSeek` | `boolean \| ScrollSeekOptions` | `false` | Uses lightweight placeholders while scrolling fast. |
| `scrollMode` | `"controlled" \| "native"` | `"controlled"` | Wheel input strategy. `controlled` keeps custom wheel handling; `native` uses the browser scroll pipeline when the physical browser range can represent the logical range. |
| `maintainVisibleContentPosition` | `boolean` | `true` | Keeps the current visible item anchored when data or measurements change. |
| `followOutput` | `boolean` | `false` | Keeps the viewport pinned to the bottom after append when it was already near the bottom. Useful for logs and chat views. |
| `followOutputThreshold` | `number` | `1` | Pixel threshold used to decide whether the viewport is near the bottom. |
| `preserveItemState` | `boolean` | `false` | In children mode, keeps non-visible items mounted and hides them instead of unmounting them. If the item count exceeds `maxRenderedItems`, the component falls back to virtual unmounting. Indexed mode should keep row state outside the row component. |
| `stickyIndices` | `number[]` | `undefined` | Item indexes that should stay sticky, commonly used for group headers. |
| `groupCounts` | `number[]` | `undefined` | Per-group item counts used to derive sticky group headers. Each group is modeled as one header plus `N` items. |
| `maxBrowserScrollHeight` | `number` | `10000000` | Maximum physical browser scroll height. When logical height exceeds this value, the component maps between physical and logical coordinates. |
| `onItemsRendered` | `(info: ItemsRenderedInfo) => void` | `undefined` | Called when rendered or visible item ranges change. |
| `onScroll` | `(scrollState: ScrollState) => void` | `undefined` | Called when scroll state changes. High-frequency wheel input is batched to animation frames. |
| `onScrollStart` | `() => void` | `undefined` | Called when scrolling starts. |
| `onScrollEnd` | `() => void` | `undefined` | Called when scrolling ends. |
| `prefixCls` | `string` | `"scroll-bar"` | CSS class prefix. |
| `scrollBarSize` | `number` | `6` | Custom scrollbar thickness. |
| `scrollBarHidden` | `boolean` | `false` | Hides custom scrollbars. |
| `scrollBarAutoHideTimeout` | `number` | `1000` | Delay, in ms, before custom scrollbars auto-hide. |
| `renderView` | `RenderElement<HTMLProps<HTMLDivElement>>` | built-in `div` | Custom render function for the scroll view wrapper. |
| `renderTrackHorizontal` | `RenderElement<HTMLProps<HTMLDivElement>>` | built-in horizontal track | Custom horizontal track renderer. |
| `renderTrackVertical` | `RenderElement<HTMLProps<HTMLDivElement>>` | built-in vertical track | Custom vertical track renderer. |
| `renderThumbHorizontal` | `RenderElement<HTMLProps<HTMLDivElement>>` | built-in horizontal thumb | Custom horizontal thumb renderer. |
| `renderThumbVertical` | `RenderElement<HTMLProps<HTMLDivElement>>` | built-in vertical thumb | Custom vertical thumb renderer. |

## Supporting Types

```ts
interface AdaptiveOverscanOptions {
	min?: number
	max?: number
	velocityFactor?: number
	timeFactor?: number
}
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `min` | `number` | `overscan` | Lower bound for dynamic overscan. |
| `max` | `number` | `Math.max(overscan + 4, min)` | Upper bound for dynamic overscan. |
| `velocityFactor` | `number` | `0.02` | Multiplier applied to scroll distance. |
| `timeFactor` | `number` | `0.15` | Multiplier applied to scroll velocity in px/ms. |

```ts
interface OverscanRange {
	before: number
	after: number
}
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `before` | `number` | none | Extra items or pixels rendered before the viewport. For `overscanPixels`, the unit is px. |
| `after` | `number` | none | Extra items or pixels rendered after the viewport. For `overscanPixels`, the unit is px. |

```ts
interface ScrollSeekOptions {
	velocityThreshold?: number
	exitVelocityThreshold?: number
	placeholder?: (index: number) => ReactElement
	onChange?: (active: boolean) => void
}
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `velocityThreshold` | `number` | `2` | Velocity threshold, in px/ms, used to enter scroll-seek mode. |
| `exitVelocityThreshold` | `number` | `velocityThreshold / 2` | Lower threshold used to leave scroll-seek mode. The default hysteresis avoids placeholder/real row flicker. |
| `placeholder` | `(index: number) => ReactElement` | `<div aria-hidden style={{ height: estimatedItemHeight }} />` | Lightweight placeholder rendered during fast scrolling. It is not written into the real height cache, so its height should be close to `estimatedItemHeight`. |
| `onChange` | `(active: boolean) => void` | `undefined` | Called when scroll-seek mode becomes active or inactive. |

```ts
interface ItemsRenderedInfo {
	startIndex: number
	endIndex: number
	visibleStartIndex: number
	visibleEndIndex: number
}
```

```ts
interface ScrollState {
	x: number
	y: number
	scrollWidth: number
	scrollHeight: number
	clientWidth: number
	clientHeight: number
	isScrolling: boolean
}
```

## Ref API

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

| Method | Description |
| --- | --- |
| `scrollTo({ x, y })` | Imperatively scrolls to the requested logical coordinates. In massive-list scenarios, `y` is still a logical scroll coordinate. |
| `getScrollState()` | Returns the latest scroll state. Wheel input writes to the internal ref before React state is batched, so this method can read the newest coordinates immediately. |
| `resizeObserver(callback)` | Immediately calls `callback` with the current content and viewport dimensions. |

## Performance Notes

- **Fenwick tree index** — Dynamic heights are tracked with a block-based Fenwick
  index over measured height deltas, so single-row resize updates do not rebuild
  the full height table.
- **Fixed-height fast path** — Fixed-height lists skip the dynamic height index
  entirely. Offsets are calculated as `index * estimatedItemHeight`, and visible
  indexes are calculated from `Math.floor(scrollOffset / estimatedItemHeight)`.
- **Shared ResizeObserver** — Row measurement uses one shared `ResizeObserver`.
  Observer callbacks prefer `ResizeObserverEntry.contentRect.height` and only
  fall back to `offsetHeight` when entry dimensions are missing.
- **Batched updates** — High-frequency wheel and drag input writes to internal
  refs first, then batches React state updates through animation frames.
- **Massive ranges** — When logical height is larger than the browser-safe
  physical height, the DOM `scrollTop` is kept inside a local logical window.
  `scrollState.y` still stores the full logical offset, but small native scroll
  deltas are no longer multiplied by the full logical-to-physical range ratio.
- **Native scroll pipeline** — `scrollMode="native"` lets wheel and trackpad
  input use the browser scroll pipeline when possible. When very large lists
  require compressed physical browser height, controlled wheel handling is used
  to preserve logical offset precision.
- **Adaptive overscan** — `adaptiveOverscan` calculates direction-aware
  pre-rendering from scroll distance, event timing, and `devicePixelRatio`.
- **Pixel overscan** — `overscanPixels` controls pre-rendering by pixels instead
  of row count, which is useful for dynamic-height lists.
- **DOM cap** — `maxRenderedItems` protects overscan, adaptive overscan,
  `isVirtual={false}`, and `preserveItemState` from mounting too many DOM nodes.
  The real visible range is always preserved.
- **Height cache limit** — `heightCacheLimit` provides an LRU soft cap for
  measured row heights, avoiding unbounded cache growth during long browsing
  sessions through very large lists.
- **Scroll seek** — Designed for expensive row renderers. During fast scrolling,
  placeholders keep list structure stable; when scrolling slows down, real rows
  are restored. Placeholder rows do not participate in height measurement.
- **Accessibility** — Rendered content is exposed as a virtualized list by
  default. The wrapper uses `role="list"`, and rendered items use
  `role="listitem"` with `aria-posinset` and `aria-setsize`. Grid and table
  semantics should be handled by dedicated components.
