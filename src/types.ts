import type { CSSProperties, HTMLProps, Key, PropsWithChildren, ReactElement } from "react"

/** 滚动状态 */
export interface ScrollState {
	/** X轴滚动偏移 */
	x: number
	/** Y轴滚动偏移 */
	y: number
	/** 可滚动宽度 */
	scrollWidth: number
	/** 可滚动高度 */
	scrollHeight: number
	/** 滚动视区宽度 */
	clientWidth: number
	/** 滚动视区高度 */
	clientHeight: number
	/** 是否正在滚动 */
	isScrolling: boolean
}

/** 滚动偏移 */
export interface ScrollOffset {
	/** X轴上的偏移 */
	x: number
	/** Y轴上的偏移 */
	y: number
}

/** 渲染元素 */
export type RenderElement<Props> = (props?: PropsWithChildren<Props>) => ReactElement

export interface ItemsRenderedInfo {
	/** 实际渲染的起始索引，包含 overscan */
	startIndex: number
	/** 实际渲染的结束索引，包含 overscan */
	endIndex: number
	/** 可视区域起始索引 */
	visibleStartIndex: number
	/** 可视区域结束索引 */
	visibleEndIndex: number
}

export type RenderItem = (index: number) => ReactElement

export interface AdaptiveOverscanOptions {
	/** 最小 overscan 条数，默认使用 overscan */
	min?: number
	/** 最大 overscan 条数，默认至少为 overscan */
	max?: number
	/** 按单次滚动距离放大的系数 */
	velocityFactor?: number
}

export interface VirtualAccessibilityOptions {
	/** 容器语义角色，表格/网格场景建议使用 grid/table/treegrid */
	role?: "list" | "grid" | "table" | "treegrid" | "listbox"
	/** 容器可访问名称 */
	label?: string
	/** 逻辑总行数；默认使用 itemCount/children 数量 */
	rowCount?: number
	/** 渲染条目的语义角色；grid/table/treegrid 默认 row，list/listbox 默认 listitem/option */
	itemRole?: string
}

// (props?: PropsWithChildren<Props>) => ReactElement | ForwardRefExoticComponent<PropsWithoutRef<Instance> & RefAttributes<PropsWithChildren<Props>>>

/** 组件Props */
export interface VirtualScrollBarProps {
	/** 开始滚动回调 */
	onScrollStart?: () => void
	/** 结束滚动回调 */
	onScrollEnd?: () => void
	/**
	 * @description 滚动回调
	 * @param {ScrollState} scrollState 滚动状态
	 */
	onScroll?: (scrollState: ScrollState) => void
	/** 是否需要虚拟滚动 */
	isVirtual?: boolean
	/** 按索引渲染的数据总数，用于百万级列表避免创建完整 children 数组 */
	itemCount?: number
	/** 按索引惰性渲染 item；提供 itemCount 时优先使用该模式 */
	renderItem?: RenderItem
	/** 按索引生成稳定 key；默认使用 index */
	itemKey?: (index: number) => Key
	/** 外层容器样式 */
	className?: string
	/** 外层容器内联样式 */
	style?: CSSProperties
	/** 单条数据默认高度 */
	itemHeight?: number
	/** 未测量数据的预估高度，优先级高于 itemHeight */
	estimatedItemHeight?: number
	/** 可视区域外额外渲染的条目数量 */
	overscan?: number
	/** 根据滚动方向和滚动距离动态扩大前置/后置渲染范围 */
	adaptiveOverscan?: boolean | AdaptiveOverscanOptions
	/** 数据插入或测量变化时保持当前可见条目锚定 */
	maintainVisibleContentPosition?: boolean
	/** 已在底部时，追加数据后继续贴住底部 */
	followOutput?: boolean
	/** 判断“已在底部”的像素阈值 */
	followOutputThreshold?: number
	/** 保留 children 模式下已渲染条目的 React 状态；会渲染全部 children 并隐藏非可视项 */
	preserveItemState?: boolean
	/** 始终保持吸顶语义的条目索引，常用于分组头 */
	stickyIndices?: number[]
	/** 每组数据条数；组件按 GroupedVirtuoso 风格推导每组头所在的扁平索引 */
	groupCounts?: number[]
	/** 虚拟列表的可访问性语义和 ARIA 行信息 */
	accessibility?: boolean | VirtualAccessibilityOptions
	/** 浏览器物理滚动容器最大高度，用于超大逻辑滚动范围映射 */
	maxBrowserScrollHeight?: number
	/** 渲染区间变化回调 */
	onItemsRendered?: (info: ItemsRenderedInfo) => void
	/** 样式前缀 */
	prefixCls?: string
	/** 滚动容器宽度 */
	width?: number
	/** 滚动容器高度 */
	height?: number
	/** 滚动条粗细 */
	scrollBarSize?: number
	/** 滚动条是否隐藏 */
	scrollBarHidden?: boolean
	/** 滚动条隐藏延时 */
	scrollBarAutoHideTimeout?: number
	/**
	 * @description 绘制滚动区域
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderView?: RenderElement<HTMLProps<HTMLDivElement>>
	/**
	 * @description 绘制水平滚动轨
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderTrackHorizontal?: RenderElement<HTMLProps<HTMLDivElement>>
	/**
	 * @description 绘制垂直滚动轨
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderTrackVertical?: RenderElement<HTMLProps<HTMLDivElement>>
	/**
	 * @description 绘制垂直滚动滑块
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderThumbHorizontal?: RenderElement<HTMLProps<HTMLDivElement>>
	/**
	 * @description 绘制垂直滚动滑块
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderThumbVertical?: RenderElement<HTMLProps<HTMLDivElement>>
}

export interface VirtualScrollBarRef {
	/** 滚动到指定位置 */
	scrollTo: (offset: ScrollOffset) => void
	/** 获取当前的滚动数据 */
	getScrollState: () => ScrollState
	/** 滚动、视区中的高宽变化回调 */
	resizeObserver: (callback: (resizeState: Pick<ScrollState, "scrollWidth" | "scrollHeight" | "clientWidth" | "clientHeight">) => void) => void
}


export interface ScrollBarProps {
	/** 当前滚动状态 */
	scrollState: ScrollState
	/** 当前可视区容器大小 */
	containerSize: number
	/** 内容最大高度 */
	scrollRange: number
	/**
	 * @description 滚动回调
	 * @param {number} offset 当前轴上的偏移位置
	 */
	onScroll?: (offset: number) => void
	/** 开始滚动的回调 */
	onStartMove?: () => void
	/** 停止滚动的回调 */
	onStopMove?: () => void
	/** 样式前缀 */
	prefixCls?: string
	/** 滚动条粗细 */
	thumbSize: {
		/** 宽度 */
		width: number
		/** 高度 */
		height: number
	}
	/** 滚动条是否隐藏 */
	hidden?: boolean
	/** 滚动条隐藏延时 */
	autoHideTimeout?: number
	/**
	 * @description 绘制垂直滚动轨
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderTrack: RenderElement<HTMLProps<HTMLDivElement>>
	/**
	 * @description 绘制垂直滚动滑块
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderThumb: RenderElement<HTMLProps<HTMLDivElement>>
}

export interface ScrollBarRef {
	/** 延时隐藏滚动条 */
	delayHiddenScrollBar: () => void
}
