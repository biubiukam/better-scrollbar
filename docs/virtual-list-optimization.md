# Virtual List Optimization Practices

This document describes the optimization strategies used by `better-scrollbar`
and how they compare to industry practices from established virtualizers like
TanStack Virtual, React Virtuoso, and AG Grid.

> **Architecture note:** Since v2.0.0, `better-scrollbar` is a monorepo with
> three packages: `@better-scrollbar/core` (framework-neutral algorithms),
> `@better-scrollbar/react` (React adapter), and `@better-scrollbar/vue` (Vue 3
> adapter). The optimizations below apply to the core algorithms shared by both
> framework adapters.

## Design Decisions

| Direction                    | Industry practice                                                                                                                                                                                                                           | Project implementation                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dynamic height               | Estimate first, measure real DOM with `ResizeObserver`, keep a key-based height cache, and batch invalidations to animation frames.                                                                                                         | `useHeights` (React) and `useHeights` composable (Vue) observe mounted items with `ResizeObserver`, feed into the core `VirtualHeightIndexStore`, and keep updates batched through `raf`.                                                                                                                                                                      |
| Layout reads during scroll   | Mature virtualizers avoid forced layout reads on wheel frames and use observer-provided measurements when available.                                                                                                                        | Wheel frames no longer call `collectHeight`; mounted rows use shared `ResizeObserver`, and observer callbacks prefer `ResizeObserverEntry.contentRect.height` before falling back to `offsetHeight`.                                                                                                                                                           |
| Native scroll pipeline       | Browser-native wheel/trackpad handling preserves compositor optimizations and momentum scrolling better than blocking wheel handlers.                                                                                                       | `scrollMode="native"` (React) skips the custom wheel `preventDefault` path and syncs logical offsets from the native scroll event when the browser can represent the full scroll range. Compressed massive ranges automatically keep controlled wheel handling for logical precision.                                                                          |
| Bounded measurement memory   | Large-list virtualizers cap measurement caches or window them around recent ranges to avoid memory growth during long sessions.                                                                                                             | `heightCacheLimit` in both adapters caps measured row heights with LRU eviction via `VirtualHeightIndexStore.maxMeasuredItems`. The default keeps up to 50,000 measured heights; `Infinity` disables eviction.                                                                                                                                                 |
| Scroll anchoring             | Preserve the current visible anchor by stable key and offset within the item when measurements or data before the viewport change.                                                                                                          | The React `ScrollBar` records the first visible item key plus intra-item offset, resolves the key after measurement/prepend changes, and corrects logical `y` without firing a new user-scroll cycle.                                                                                                                                                          |
| Stateful recycling           | Default to unmounting for large data, but provide an explicit keep-mounted mode for stateful form/editor rows where React local state matters more than DOM count.                                                                          | `preserveItemState` (React) keeps children-mode rows mounted behind wrappers only while the total count is within `maxRenderedItems`; larger lists fall back to virtual unmounting. Indexed rendering remains unmounted by default.                                                                                                                            |
| Adaptive overscan            | Use static overscan as the baseline, then expand overscan toward the active scroll direction during faster scrolling to reduce blank edges.                                                                                                 | `adaptiveOverscan` computes direction-aware `{ before, after }` overscan via the core `getEffectiveOverscan()` algorithm, and `VirtualHeightIndex.getRange()` supports asymmetric overscan via `VirtualOverscanRange`.                                                                                                                                         |
| Pixel overscan and DOM guard | Production grids commonly combine pixel buffers with hard rendered-row caps so dynamic heights do not over-render during fast scrolls.                                                                                                      | `overscanPixels` / `OverscanConfig.pixels` adds pixel-based buffering on top of row overscan. `maxRenderedItems` caps virtual DOM output, guards `isVirtual={false}` / `preserveItemState`, and preserves all visible rows.                                                                                                                                    |
| Scroll seek hysteresis       | Placeholder mode should avoid rapid toggling when velocity hovers near the threshold and must not overwrite real row measurements.                                                                                                          | `scrollSeek` has separate enter/exit velocity thresholds plus `onChange`, so placeholder rendering remains stable while decelerating. Placeholder rows are not registered as measured item refs.                                                                                                                                                               |
| Observer churn               | Ref callback identity changes can detach and reattach observers even when the row DOM did not change.                                                                                                                                       | Item ref callbacks are cached by key/index with a bounded cache, reducing repeated `observe/unobserve` churn on unchanged rerenders.                                                                                                                                                                                                                           |
| Append following             | Only follow newly appended content when the user was already at the bottom; do not steal scroll position from users reading older content.                                                                                                  | `followOutput` uses the previous max scroll offset and configurable `followOutputThreshold` / `FollowOutputOptions.threshold` to keep bottom-pinned streams pinned after append.                                                                                                                                                                               |
| Sticky group headers         | Keep the active sticky header rendered even if its source index is outside the normal virtual range. TanStack Virtual demonstrates this by deriving the active sticky index from the current range and forcing it into the extracted range. | `stickyIndices` marks sticky-capable rows. The React `ScrollBar` resolves the last sticky index at or before `visibleStartIndex` via binary search (`getActiveStickyIndex`), applies sticky style when it is already rendered, and renders a zero-height sticky overlay when it is outside the virtual range.                                                  |
| Group counts                 | Grouped virtualizers commonly expose an array of per-group item counts instead of asking callers to hand-maintain all header offsets. React Virtuoso's `groupCounts` specifies both group count and items in each group.                    | `groupCounts` follows the same flattened model: each group has one header row plus `count` item rows. The core `getStickyIndicesFromGroups()` derives header indexes `0, count[0] + 1, ...` and feeds them into sticky handling.                                                                                                                               |
| Accessibility                | Virtualized lists need explicit set position metadata because the DOM only contains a subset of rows.                                                                                                                                       | The React `ScrollBar` exposes list semantics by default: the wrapper uses `role="list"`, and rendered rows use `role="listitem"` with `aria-posinset` and `aria-setsize`. Grid/table semantics are intentionally left for dedicated components.                                                                                                                |
| Massive scroll range         | Browsers cap maximum div height, so large grids use a physical scroll range plus logical row offset/stretching. AG Grid documents this as stretching the div and altering row positions based on scroll percent.                            | The core `getLogicalScrollWindowStart()` algorithm keeps `ScrollState.y` and `ScrollState.scrollHeight` as full logical values, but re-bases DOM `scrollTop` into a local logical window when the logical range exceeds the browser-safe physical range. Small native scroll deltas stay small instead of being multiplied by the full logical/physical ratio. |
| Fixed-height range math      | Fixed-row virtualizers should not pay dynamic-height indexing costs when every unmeasured item shares the same height.                                                                                                                      | `VirtualHeightIndex.getRange()` bypasses Fenwick allocation and binary search while no measured heights exist. Offsets and ranges are direct arithmetic, and the dynamic block index is created lazily only when a real measured height appears.                                                                                                               |

## Core Algorithms (Framework-Neutral)

The following key algorithms live in `@better-scrollbar/core` and are shared
by both the React and Vue adapters:

- **`VirtualHeightIndexStore`** — Block-based Fenwick tree for O(log n) offset
  queries and updates. Supports LRU eviction (`maxMeasuredItems`), lazy
  Fenwick tree allocation, and fixed-height fast path.
- **`getRange()`** — Computes the visible and overscan ranges from a scroll
  offset and viewport size. Supports asymmetric overscan, pixel-based
  overscan, and `maxItems` capping that always preserves the visible range.
- **`getEffectiveOverscan()`** — Computes direction-aware overscan from scroll
  delta, elapsed time, and device pixel ratio.
- **`getActiveStickyIndex()`** — Binary search for the sticky header at or
  before the current scroll offset.
- **`getLogicalScrollWindowStart()`** — Re-bases massive logical ranges into
  a physical browser window using a configurable rebase ratio.

## Public Options

### React (`VirtualScrollBarProps`)

- `maintainVisibleContentPosition?: boolean` — defaults to `true`.
- `followOutput?: boolean | FollowOutputOptions` — defaults to `false`.
- `preserveItemState?: boolean` — defaults to `false`.
- `heightCacheLimit?: number` — defaults to `50000`.
- `overscan?: number | OverscanConfig` — defaults to `1`.
- `adaptiveOverscan?: boolean | AdaptiveOverscanOptions` — defaults to `false`.
- `maxRenderedItems?: number` — defaults to `500`.
- `scrollMode?: "controlled" | "native"` — defaults to `"controlled"`.
- `scrollSeek?: boolean | ScrollSeekOptions` — defaults to `false`.
- `stickyIndices?: number[]` — defaults to `undefined`.
- `groupCounts?: number[]` — defaults to `undefined`.
- `maxBrowserScrollHeight?: number` — defaults to `10000000`.

### Vue (`BScrollBarProps`)

- `itemCount: number` — **required**.
- `estimatedItemHeight?: number` — defaults to `20`.
- `height: number` — **required**.
- `width?: number` — defaults to `undefined` (renders as `100%`).
- `overscan?: number | OverscanConfig` — defaults to `1`.
- `maxRenderedItems?: number` — defaults to `500`.
- `prefixCls?: string` — defaults to `"scroll-bar"`.

## Verification Coverage

- Dynamic resize anchoring: `keeps the first visible row anchored when a measured row above it resizes`
- Prepend anchoring: `keeps the same keyed row anchored when rows are prepended`
- Append following: `follows appended output when already scrolled to the bottom`
- Stateful keep-mounted mode: `keeps stateful children mounted when preserveItemState is enabled`
- Direction-aware overscan: `supports asymmetric overscan for direction-aware pre-rendering` and `expands overscan in the active scroll direction when adaptiveOverscan is enabled`
- Pixel overscan: `supports pixel overscan for dynamic height ranges`
- DOM cap: `caps overscan rendering without dropping visible rows`, `falls back to virtual rendering when preserveItemState exceeds maxRenderedItems`, `falls back to virtual rendering when non-virtual rendering exceeds maxRenderedItems`, and `allows disabling the non-virtual rendering guard with infinite maxRenderedItems`
- Cache cap: `evicts the oldest measured heights when the cache limit is reached` and `limits remembered measured heights when heightCacheLimit is configured`
- Native wheel path: `supports native scroll mode without blocking wheel default behavior`, `uses native scroll event timing for scroll-seek velocity`, and `keeps controlled wheel precision for compressed massive scroll ranges`
- Scroll-frame layout reads: `does not read item layout during wheel frames when ResizeObserver is available`
- Scroll seek hysteresis: `keeps scroll-seek active until velocity drops below the exit threshold` and `does not store scroll-seek placeholder heights as measured row heights`
- Observer churn: `keeps item ref callbacks stable across unchanged rerenders`
- Sticky overlay: `renders the active sticky item even when it is outside the virtual range`
- Group counts: `derives sticky group headers from groupCounts`
- Accessibility: `adds list accessibility attributes by default`
- Massive range: `uses a configurable physical scroll height for massive logical ranges` and `keeps native fallback scroll deltas local for massive logical ranges`
- Fixed-height math: `keeps fixed-height massive ranges independent from block count`

## Industry References

- TanStack Virtual sticky example: https://tanstack.com/virtual/v3/docs/framework/react/examples/sticky
- React Virtuoso GroupedVirtuoso API: https://virtuoso.dev/react-virtuoso/api-reference/grouped-virtuoso/
- WAI-ARIA grid and table properties: https://www.w3.org/WAI/ARIA/apd/practices/grid-and-table-properties/
- AG Grid massive row count stretching: https://www.ag-grid.com/javascript-data-grid/massive-row-count/
