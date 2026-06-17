# VirtualScrollBar 使用文档

`better-scrollbar` 提供一个 React 虚拟列表与自定义滚动条组件。组件支持 children 渲染和按索引惰性渲染两种模式；当数据规模达到千万级或 5000 万行时，应优先使用 `itemCount + renderItem`，避免提前创建完整数组。

## 基础用法

```tsx
import VirtualScrollBar from "better-scrollbar"
import "better-scrollbar/dist/BetterScrollbar.min.css"

export default function Demo() {
	return (
		<VirtualScrollBar width={500} height={300} itemHeight={32}>
			<div key="a">Row A</div>
			<div key="b">Row B</div>
		</VirtualScrollBar>
	)
}
```

## 5000 万行用法

```tsx
import VirtualScrollBar from "better-scrollbar"

const ROW_COUNT = 50_000_000

export default function HugeList() {
	return (
		<VirtualScrollBar
			width={720}
			height={420}
			itemCount={ROW_COUNT}
			estimatedItemHeight={32}
			overscan={2}
			adaptiveOverscan
			scrollSeek
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
| `children` | `ReactNode \| (() => ReactElement)` | `undefined` | children 模式的数据项。适合中小规模或需要直接声明 JSX 的列表。 |
| `itemCount` | `number` | `undefined` | 按索引渲染模式的数据总数。5000 万行等超大数据量应使用该模式。 |
| `renderItem` | `(index: number) => ReactElement` | `undefined` | 按索引惰性渲染单行。与 `itemCount` 同时提供时优先使用 indexed 模式。 |
| `itemKey` | `(index: number) => Key` | `index` | indexed 模式下生成稳定 key。children 模式默认使用 child key。 |
| `isVirtual` | `boolean` | `true` | 是否开启虚拟渲染。关闭后会渲染全部条目。 |
| `width` | `number` | `undefined` | 滚动容器宽度，单位 px。 |
| `height` | `number` | `undefined` | 滚动容器高度，单位 px。 |
| `className` | `string` | `undefined` | 外层容器 className。 |
| `style` | `CSSProperties` | `undefined` | 外层容器内联样式。 |
| `itemHeight` | `number` | `20` | 单行默认高度。 |
| `estimatedItemHeight` | `number` | `itemHeight` | 未测量行的预估高度。动态高度和 indexed 模式都依赖该值计算总高度。 |
| `overscan` | `number` | `1` | 可视区域外额外渲染的行数。 |
| `adaptiveOverscan` | `boolean \| AdaptiveOverscanOptions` | `false` | 根据滚动方向、距离、时间和设备像素比动态扩大 overscan。 |
| `scrollSeek` | `boolean \| ScrollSeekOptions` | `false` | 高速滚动时用轻量 placeholder 替代真实行，降低重行渲染成本。 |
| `maintainVisibleContentPosition` | `boolean` | `true` | 动态高度变化、前置插入或测量更新时保持当前可见行锚定。 |
| `followOutput` | `boolean` | `false` | 已接近底部时，追加数据后继续贴住底部，适合日志/聊天场景。 |
| `followOutputThreshold` | `number` | `1` | 判断“接近底部”的像素阈值。 |
| `preserveItemState` | `boolean` | `false` | children 模式下保留非可视项的 React 状态；会隐藏非可视项而不是卸载。indexed 模式建议把状态外置。 |
| `stickyIndices` | `number[]` | `undefined` | 指定吸顶行索引。 |
| `groupCounts` | `number[]` | `undefined` | 按分组数据条数推导分组头吸顶索引；每组格式为 1 个 header + N 个 item。 |
| `accessibility` | `boolean \| VirtualAccessibilityOptions` | `false` | 开启列表/网格 ARIA 语义。 |
| `maxBrowserScrollHeight` | `number` | `10000000` | 浏览器物理滚动高度上限。逻辑高度超过该值时会做物理/逻辑坐标映射。 |
| `onItemsRendered` | `(info: ItemsRenderedInfo) => void` | `undefined` | 渲染区间变化回调，返回 overscan 区间和可视区间。 |
| `onScroll` | `(scrollState: ScrollState) => void` | `undefined` | 滚动状态变化回调。高频 wheel 会按帧合并后触发。 |
| `onScrollStart` | `() => void` | `undefined` | 滚动开始回调。 |
| `onScrollEnd` | `() => void` | `undefined` | 滚动结束回调。 |
| `prefixCls` | `string` | `"scroll-bar"` | 组件 className 前缀。 |
| `scrollBarSize` | `number` | `6` | 自定义滚动条厚度。 |
| `scrollBarHidden` | `boolean` | `false` | 是否隐藏自定义滚动条。 |
| `scrollBarAutoHideTimeout` | `number` | `1000` | 自定义滚动条自动隐藏延时，单位 ms。 |
| `renderView` | `RenderElement<HTMLProps<HTMLDivElement>>` | 内置 `div` | 自定义列表内容包裹元素。 |
| `renderTrackHorizontal` | `RenderElement<HTMLProps<HTMLDivElement>>` | 内置水平轨道 | 自定义水平滚动轨。 |
| `renderTrackVertical` | `RenderElement<HTMLProps<HTMLDivElement>>` | 内置垂直轨道 | 自定义垂直滚动轨。 |
| `renderThumbHorizontal` | `RenderElement<HTMLProps<HTMLDivElement>>` | 内置水平滑块 | 自定义水平滚动滑块。 |
| `renderThumbVertical` | `RenderElement<HTMLProps<HTMLDivElement>>` | 内置垂直滑块 | 自定义垂直滚动滑块。 |

## 子类型

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
| `min` | `number` | `overscan` | 动态 overscan 下限。 |
| `max` | `number` | `Math.max(overscan + 4, min)` | 动态 overscan 上限。 |
| `velocityFactor` | `number` | `0.02` | 按滚动距离放大的系数。 |
| `timeFactor` | `number` | `0.15` | 按滚动速度放大的系数，速度单位为 px/ms。 |

```ts
interface ScrollSeekOptions {
	velocityThreshold?: number
	placeholder?: (index: number) => ReactElement
}
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `velocityThreshold` | `number` | `2` | 进入 scroll-seek 的速度阈值，单位 px/ms。 |
| `placeholder` | `(index: number) => ReactElement` | `<div aria-hidden style={{ height: estimatedItemHeight }} />` | 高速滚动时渲染的轻量占位项。 |

```ts
interface VirtualAccessibilityOptions {
	role?: "list" | "grid" | "table" | "treegrid" | "listbox"
	label?: string
	rowCount?: number
	itemRole?: string
}
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `role` | `"list" \| "grid" \| "table" \| "treegrid" \| "listbox"` | `"list"` | 容器语义角色。 |
| `label` | `string` | `undefined` | 容器可访问名称，对应 `aria-label`。 |
| `rowCount` | `number` | `itemCount` 或 children 数量 | 逻辑总行数。grid/table/treegrid 下会输出 `aria-rowcount`。 |
| `itemRole` | `string` | grid/table/treegrid 为 `"row"`；listbox 为 `"option"`；其他为 `"listitem"` | 单项语义角色。 |

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
| `scrollTo({ x, y })` | 命令式滚动到指定逻辑坐标。5000 万行场景下传入的 `y` 仍然是逻辑滚动坐标。 |
| `getScrollState()` | 获取当前滚动状态。wheel 高频输入会先写入内部 ref，因此该方法能立即读到最新坐标。 |
| `resizeObserver(callback)` | 立即回调当前滚动内容尺寸和视区尺寸。 |

## 性能说明

- 动态高度使用块级 Fenwick 索引维护测量高度 delta，单行 resize 不需要重排完整高度表。
- 行高测量使用单个共享 `ResizeObserver`，不会为每个挂载行创建一个 observer。
- wheel 和拖拽等高频滚动输入先写入内部 ref，再按 animation frame 合并 React state 更新。
- `adaptiveOverscan` 会结合滚动距离、相邻事件时间和 `devicePixelRatio` 计算方向性预渲染范围。
- `scrollSeek` 适合单行渲染成本高的场景；高速滚动期间用 placeholder 保持列表结构，滚动停止后恢复真实行。
