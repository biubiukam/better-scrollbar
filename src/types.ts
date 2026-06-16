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
