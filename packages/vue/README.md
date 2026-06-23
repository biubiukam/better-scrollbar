# @better-scrollbar/vue

Vue 3 adapter for [better-scrollbar](https://github.com/biubiukam/better-scrollbar)
— a highly customizable, high-performance virtual scrollbar component.

## Installation

```bash
pnpm add @better-scrollbar/vue @better-scrollbar/core
```

**Peer dependencies:** `vue >= 3.3.0`, `@better-scrollbar/core >= 1.0.0`

## Quick Start

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

## Components

### `<BScrollBar>`

The main virtual scrollbar component.

#### Props

| Prop                  | Type                       | Default        | Description                                           |
| --------------------- | -------------------------- | -------------- | ----------------------------------------------------- |
| `itemCount`           | `number`                   | **required**   | Total number of items                                 |
| `estimatedItemHeight` | `number`                   | `20`           | Estimated height for unmeasured rows                  |
| `height`              | `number`                   | **required**   | Viewport height (px)                                  |
| `width`               | `number`                   | —              | Viewport width (px). Defaults to `100%` when omitted. |
| `overscan`            | `number \| OverscanConfig` | `1`            | Extra item count or full overscan configuration       |
| `maxRenderedItems`    | `number`                   | `500`          | Rendered item cap                                     |
| `prefixCls`           | `string`                   | `"scroll-bar"` | CSS class prefix                                      |

#### Slots

| Slot      | Scope               | Description                         |
| --------- | ------------------- | ----------------------------------- |
| `default` | `{ index: number }` | Scoped slot for rendering each item |

#### Events

| Event           | Payload             | Description                         |
| --------------- | ------------------- | ----------------------------------- |
| `scroll`        | `ScrollState`       | Emitted when scroll state changes   |
| `scrollStart`   | —                   | Emitted when scrolling starts       |
| `scrollEnd`     | —                   | Emitted when scrolling ends         |
| `itemsRendered` | `ItemsRenderedInfo` | Emitted when rendered ranges change |

#### Exposed (via template ref)

```vue
<script setup>
import { ref } from "vue"
import { BScrollBar } from "@better-scrollbar/vue"
import type { BScrollBarExposed } from "@better-scrollbar/vue"

const scrollbar = ref<BScrollBarExposed>()

// Programmatic scrolling
scrollbar.value?.scrollTo({ y: 500 })

// Read current state
const state = scrollbar.value?.getScrollState()
</script>

<template>
	<BScrollBar ref="scrollbar" :item-count="1000" :height="400">
		<template #default="{ index }">
			<div>Row {{ index }}</div>
		</template>
	</BScrollBar>
</template>
```

| Method           | Signature                                 | Description                      |
| ---------------- | ----------------------------------------- | -------------------------------- |
| `scrollTo`       | `(offset: Partial<ScrollOffset>) => void` | Scrolls to the given offset      |
| `getScrollState` | `() => ScrollState`                       | Returns the current scroll state |

### `<BScrollBarItem>`

Internal item wrapper rendered by `BScrollBar`. Not typically used directly.

| Prop    | Type     | Description |
| ------- | -------- | ----------- |
| `index` | `number` | Item index  |

### Internal Scrollbar Components

| Component             | Description                        |
| --------------------- | ---------------------------------- |
| `VerticalScrollBar`   | Vertical scrollbar track & thumb   |
| `HorizontalScrollBar` | Horizontal scrollbar track & thumb |
| `ScrollBarTrack`      | Scrollbar track/thumb primitive    |

## Composables

### `useScrollBar(options): UseScrollBarReturn`

The core composable that manages virtual scrolling state.

```ts
import { useScrollBar } from "@better-scrollbar/vue"

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

### `useHeights(options)`

Manages the height index with reactive measurement tracking.

```ts
import { useHeights } from "@better-scrollbar/vue"

interface UseHeightsOptions {
	itemCount: MaybeRef<number>
	estimatedItemHeight: MaybeRef<number>
	heightCacheLimit?: MaybeRef<number | undefined>
}
```

Returns `{ heightIndex, totalHeight, setMeasuredHeight, deleteMeasuredHeight, measureElement, reset }`.

### `useResizeObserver(target)`

Tracks an element's size via `ResizeObserver`.

```ts
import { useResizeObserver } from "@better-scrollbar/vue"

const target = ref<HTMLElement | null>(null)
const { size, updateSize } = useResizeObserver(target)
// size.value → { width: number, height: number }
```

## Exported Types

```ts
import type {
	BScrollBarProps,
	BScrollBarExposed,
	UseScrollBarOptions,
	UseScrollBarReturn,
	UseHeightsOptions,
	UseResizeObserverSize,
	MaybeRef,
	// Re-exported from @better-scrollbar/core
	ScrollState,
	ScrollOffset,
	ItemsRenderedInfo,
	OverscanConfig
} from "@better-scrollbar/vue"
```

## License

[MIT](../../LICENSE)
