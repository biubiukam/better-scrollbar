# @better-scrollbar/react

React adapter for [better-scrollbar](https://github.com/biubiukam/better-scrollbar)
— a highly customizable, high-performance virtual scrollbar component.

## Installation

```bash
pnpm add @better-scrollbar/react @better-scrollbar/core
```

**Peer dependencies:** `react >= 16.9.0`, `react-dom >= 16.9.0`,
`@better-scrollbar/core >= 1.0.0`

## Quick Start

### Children Mode

```tsx
import ScrollBar from "@better-scrollbar/react"
import "@better-scrollbar/react/styles/ScrollBar.less"

export default function BasicList() {
	return (
		<ScrollBar width={500} height={300} itemHeight={32}>
			<div key="a">Row A</div>
			<div key="b">Row B</div>
			<div key="c">Row C</div>
		</ScrollBar>
	)
}
```

### Indexed Rendering (Massive Lists)

```tsx
import ScrollBar from "@better-scrollbar/react"
import "@better-scrollbar/react/styles/ScrollBar.less"

export default function HugeList() {
	return (
		<ScrollBar
			width={720}
			height={420}
			itemCount={50_000_000}
			estimatedItemHeight={32}
			overscan={2}
			maxRenderedItems={500}
			scrollMode="native"
			adaptiveOverscan
			scrollSeek={{ velocityThreshold: 2 }}
			renderItem={(index) => (
				<div key={index} style={{ height: 32 }}>
					Row {index.toLocaleString()}
				</div>
			)}
		/>
	)
}
```

## Props

| Prop                             | Type                                 | Default        | Description                                     |
| -------------------------------- | ------------------------------------ | -------------- | ----------------------------------------------- |
| `children`                       | `ReactNode`                          | —              | Items for children mode                         |
| `itemCount`                      | `number`                             | —              | Total item count for indexed rendering          |
| `renderItem`                     | `(index: number) => ReactElement`    | —              | Lazy row renderer (requires `itemCount`)        |
| `itemKey`                        | `(index: number) => Key`             | `index`        | Stable key generator for indexed items          |
| `isVirtual`                      | `boolean`                            | `true`         | Enables virtual rendering                       |
| `width`                          | `number`                             | —              | Scroll viewport width (px)                      |
| `height`                         | `number`                             | —              | Scroll viewport height (px)                     |
| `className`                      | `string`                             | —              | Class name for the outer container              |
| `style`                          | `CSSProperties`                      | —              | Inline style for the outer container            |
| `itemHeight`                     | `number`                             | `20`           | Default row height                              |
| `estimatedItemHeight`            | `number`                             | `itemHeight`   | Estimated height for unmeasured rows            |
| `heightCacheLimit`               | `number`                             | `50000`        | Maximum measured row heights retained (LRU)     |
| `overscan`                       | `number \| OverscanConfig`           | `1`            | Extra item count or full overscan configuration |
| `adaptiveOverscan`               | `boolean \| AdaptiveOverscanOptions` | `false`        | Direction-aware dynamic overscan                |
| `maxRenderedItems`               | `number`                             | `500`          | Rendered item cap (pass `Infinity` to disable)  |
| `scrollSeek`                     | `boolean \| ScrollSeekOptions`       | `false`        | Lightweight placeholders during fast scrolling  |
| `scrollMode`                     | `"controlled" \| "native"`           | `"controlled"` | Wheel input strategy                            |
| `maintainVisibleContentPosition` | `boolean`                            | `true`         | Scroll anchor on data/measurement changes       |
| `followOutput`                   | `boolean \| FollowOutputOptions`     | `false`        | Pin to bottom on append                         |
| `preserveItemState`              | `boolean`                            | `false`        | Keep non-visible children mounted               |
| `stickyIndices`                  | `number[]`                           | —              | Item indexes that stay sticky                   |
| `groupCounts`                    | `number[]`                           | —              | Per-group sizes for sticky group headers        |
| `maxBrowserScrollHeight`         | `number`                             | `10000000`     | Physical scroll height cap for massive datasets |
| `prefixCls`                      | `string`                             | `"scroll-bar"` | CSS class prefix                                |
| `scrollBarSize`                  | `number`                             | `6`            | Custom scrollbar thickness                      |
| `scrollBarHidden`                | `boolean`                            | `false`        | Hides custom scrollbars                         |
| `scrollBarAutoHideTimeout`       | `number`                             | `1000`         | Auto-hide delay (ms)                            |

### Callback Props

| Prop              | Type                                 | Description                        |
| ----------------- | ------------------------------------ | ---------------------------------- |
| `onScroll`        | `(scrollState: ScrollState) => void` | Called when scroll state changes   |
| `onScrollStart`   | `() => void`                         | Called when scrolling starts       |
| `onScrollEnd`     | `() => void`                         | Called when scrolling ends         |
| `onItemsRendered` | `(info: ItemsRenderedInfo) => void`  | Called when rendered ranges change |

### Render Props (Custom Scrollbar)

| Prop                    | Type                                       | Description                |
| ----------------------- | ------------------------------------------ | -------------------------- |
| `renderView`            | `RenderElement<HTMLProps<HTMLDivElement>>` | Custom scroll view wrapper |
| `renderTrackHorizontal` | `RenderElement<HTMLProps<HTMLDivElement>>` | Custom horizontal track    |
| `renderTrackVertical`   | `RenderElement<HTMLProps<HTMLDivElement>>` | Custom vertical track      |
| `renderThumbHorizontal` | `RenderElement<HTMLProps<HTMLDivElement>>` | Custom horizontal thumb    |
| `renderThumbVertical`   | `RenderElement<HTMLProps<HTMLDivElement>>` | Custom vertical thumb      |

```ts
type RenderElement<Props> = (props?: PropsWithChildren<Props>) => ReactElement
```

## Ref API

```tsx
import { useRef } from "react"
import ScrollBar, { type VirtualScrollBarRef } from "@better-scrollbar/react"

const ref = useRef<VirtualScrollBarRef>(null)

// Programmatic scrolling
ref.current?.scrollTo({ x: 0, y: 500 })

// Read current state
const state = ref.current?.getScrollState()
```

### `VirtualScrollBarRef`

| Method           | Signature                                                                                                                   | Description                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `scrollTo`       | `(offset: { x: number; y: number }) => void`                                                                                | Scrolls to the given logical coordinates                                   |
| `getScrollState` | `() => ScrollState`                                                                                                         | Returns the latest scroll state (reads from internal ref, not React state) |
| `resizeObserver` | `(callback: (size: Pick<ScrollState, "scrollWidth" \| "scrollHeight" \| "clientWidth" \| "clientHeight">) => void) => void` | Fires callback immediately with current viewport/content dimensions        |

## Exported Types

```ts
import type {
	VirtualScrollBarProps,
	VirtualScrollBarRef,
	ScrollState,
	ScrollOffset,
	ItemsRenderedInfo,
	AdaptiveOverscanOptions,
	OverscanConfig,
	OverscanRange,
	FollowOutputOptions,
	ScrollSeekOptions,
	ScrollSeekPlaceholder,
	RenderElement,
	RenderItem
} from "@better-scrollbar/react"
```

## License

[MIT](../../LICENSE)
