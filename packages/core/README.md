# @better-scrollbar/core

Framework-neutral virtual scrolling algorithms and utilities for
[better-scrollbar](https://github.com/biubiukam/better-scrollbar).

This package contains no React or Vue dependency. It provides the data
structures, math, and shared types consumed by `@better-scrollbar/react` and
`@better-scrollbar/vue`.

## Installation

```bash
pnpm add @better-scrollbar/core
```

> Most users do not need to install this package directly — it is a peer
> dependency of both `@better-scrollbar/react` and `@better-scrollbar/vue`.

## Exports

### Virtual Height Index

The core of virtual scrolling — a block-based Fenwick tree that maps item
indexes to pixel offsets with O(log n) updates and queries.

```ts
import { createVirtualHeightIndex, createVirtualHeightIndexStore } from "@better-scrollbar/core"
```

#### `createVirtualHeightIndexStore(options): VirtualHeightIndexStore`

Creates a mutable height index used to track item offsets and compute visible
ranges.

```ts
interface VirtualHeightIndexOptions {
	itemCount: number
	estimatedItemHeight: number
	measuredHeights?: Map<number, number>
	blockSize?: number // Fenwick tree block size, default 512
	maxMeasuredItems?: number // LRU cache limit, default Infinity
}
```

#### `VirtualHeightIndexStore`

```ts
interface VirtualHeightIndexStore extends VirtualHeightIndex {
	setMeasuredHeight(index: number, height: number): VirtualHeightIndexStore
	deleteMeasuredHeight(index: number): VirtualHeightIndexStore
	reset(options: VirtualHeightIndexOptions): VirtualHeightIndexStore
}
```

#### `VirtualHeightIndex`

```ts
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

### Shared Types

```ts
import type {
	ScrollState,
	ScrollOffset,
	ItemsRenderedInfo,
	AdaptiveOverscanOptions,
	OverscanRange,
	OverscanConfig,
	FollowOutputOptions,
	ScrollSeekOptions
} from "@better-scrollbar/core"
```

#### `ScrollState`

| Field          | Type      | Description                            |
| -------------- | --------- | -------------------------------------- |
| `x`            | `number`  | Horizontal scroll offset               |
| `y`            | `number`  | Vertical scroll offset                 |
| `scrollWidth`  | `number`  | Full scrollable content width          |
| `scrollHeight` | `number`  | Full scrollable content height         |
| `clientWidth`  | `number`  | Viewport width                         |
| `clientHeight` | `number`  | Viewport height                        |
| `isScrolling`  | `boolean` | Whether a scroll interaction is active |

#### `ScrollOffset`

| Field | Type     | Description       |
| ----- | -------- | ----------------- |
| `x`   | `number` | Horizontal offset |
| `y`   | `number` | Vertical offset   |

#### `ItemsRenderedInfo`

| Field               | Type     | Description                               |
| ------------------- | -------- | ----------------------------------------- |
| `startIndex`        | `number` | First rendered index (including overscan) |
| `endIndex`          | `number` | Last rendered index (including overscan)  |
| `visibleStartIndex` | `number` | First visible index                       |
| `visibleEndIndex`   | `number` | Last visible index                        |

#### `AdaptiveOverscanOptions`

| Field            | Type     | Default        | Description                                   |
| ---------------- | -------- | -------------- | --------------------------------------------- |
| `min`            | `number` | base overscan  | Lower bound for dynamic overscan              |
| `max`            | `number` | `overscan + 4` | Upper bound for dynamic overscan              |
| `velocityFactor` | `number` | `0.02`         | Multiplier applied to scroll distance         |
| `timeFactor`     | `number` | `0.15`         | Multiplier applied to scroll velocity (px/ms) |

#### `OverscanRange`

| Field    | Type     | Description                                        |
| -------- | -------- | -------------------------------------------------- |
| `before` | `number` | Extra items or pixels rendered before the viewport |
| `after`  | `number` | Extra items or pixels rendered after the viewport  |

#### `OverscanConfig`

| Field      | Type                                 | Default     | Description                                   |
| ---------- | ------------------------------------ | ----------- | --------------------------------------------- |
| `items`    | `number`                             | `1`         | Extra item count outside the visible viewport |
| `pixels`   | `number \| OverscanRange`            | `undefined` | Pixel-based buffer                            |
| `adaptive` | `boolean \| AdaptiveOverscanOptions` | `false`     | Direction-aware dynamic overscan              |

#### `ScrollSeekOptions<Placeholder>`

| Field                   | Type                        | Default                 | Description                                |
| ----------------------- | --------------------------- | ----------------------- | ------------------------------------------ |
| `velocityThreshold`     | `number`                    | `2`                     | Velocity (px/ms) to enter placeholder mode |
| `exitVelocityThreshold` | `number`                    | `velocityThreshold / 2` | Velocity to leave placeholder mode         |
| `placeholder`           | `Placeholder`               | -                       | Lightweight placeholder renderer           |
| `onChange`              | `(active: boolean) => void` | `undefined`             | Called when placeholder mode toggles       |

### Utility Functions

| Function                                  | Description                                                         |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `getStickyIndicesFromGroups(groupCounts)` | Derives sticky header indexes from per-group item counts            |
| `getSpinSize(containerSize, scrollRange)` | Calculates scrollbar thumb size                                     |
| `raf(callback, times?)`                   | Cross-environment `requestAnimationFrame` wrapper with cancellation |
| `isDOM(node)`                             | Type guard for HTML/SVG elements                                    |
| `getPageXY(event, horizontal?)`           | Extracts page coordinate from mouse or touch events                 |

### Algorithm Helpers

These are lower-level functions used internally by the adapters:

| Function                                           | Description                                        |
| -------------------------------------------------- | -------------------------------------------------- |
| `getAdaptiveOverscanOptions(config, base)`         | Resolves adaptive overscan configuration           |
| `getEffectiveOverscan(base, options, activity)`    | Computes direction-aware overscan range            |
| `getActiveStickyIndex(indices, offset, getOffset)` | Binary-search for the active sticky header         |
| `getStickyOverlayOffset(...)`                      | Calculates push-up offset for sticky headers       |
| `getLogicalScrollWindowStart(...)`                 | Re-bases logical scroll windows for massive ranges |
| `resolveOverscanConfig(overscan)`                  | Normalizes `number \| OverscanConfig` input        |
| `resolveFollowOutputThreshold(followOutput)`       | Extracts threshold from follow-output options      |
| `getSafeBrowserScrollHeight(max, clientHeight)`    | Clamps browser scroll height                       |

## License

[MIT](../../LICENSE)
