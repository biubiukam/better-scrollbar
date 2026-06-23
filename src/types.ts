import type { CSSProperties, HTMLProps, Key, PropsWithChildren, ReactElement } from "react"

/** Current scroll state. */
export interface ScrollState {
	/** Horizontal scroll offset. */
	x: number
	/** Vertical scroll offset. */
	y: number
	/** Full scrollable content width. */
	scrollWidth: number
	/** Full scrollable content height. */
	scrollHeight: number
	/** Viewport width. */
	clientWidth: number
	/** Viewport height. */
	clientHeight: number
	/** Whether a scroll interaction is currently active. */
	isScrolling: boolean
}

/** Target scroll offset. */
export interface ScrollOffset {
	/** Horizontal offset. */
	x: number
	/** Vertical offset. */
	y: number
}

/** Render callback for customizable elements. */
export type RenderElement<Props> = (props?: PropsWithChildren<Props>) => ReactElement

export interface ItemsRenderedInfo {
	/** First rendered index, including overscan. */
	startIndex: number
	/** Last rendered index, including overscan. */
	endIndex: number
	/** First visible index. */
	visibleStartIndex: number
	/** Last visible index. */
	visibleEndIndex: number
}

export type RenderItem = (index: number) => ReactElement

export interface AdaptiveOverscanOptions {
	/** Minimum overscan item count. Defaults to the base overscan. */
	min?: number
	/** Maximum overscan item count. Defaults to at least the base overscan. */
	max?: number
	/** Multiplier applied to the latest scroll distance. */
	velocityFactor?: number
	/** Multiplier applied to scroll velocity in px/ms. */
	timeFactor?: number
}

export interface OverscanRange {
	/** Extra items or pixels rendered before the viewport. */
	before: number
	/** Extra items or pixels rendered after the viewport. */
	after: number
}

export interface OverscanConfig {
	/** Extra item count rendered outside the visible viewport. */
	items?: number
	/** Extra pixel range rendered outside the viewport. */
	pixels?: number | OverscanRange
	/** Expands before/after overscan dynamically by scroll direction and distance. */
	adaptive?: boolean | AdaptiveOverscanOptions
}

export interface FollowOutputOptions {
	/** Pixel threshold used to decide whether the viewport is at the bottom. Defaults to 1. */
	threshold?: number
}

export type ScrollSeekPlaceholder = (index: number) => ReactElement

export interface ScrollSeekOptions {
	/** Velocity threshold, in px/ms, used to enter placeholder rendering. */
	velocityThreshold?: number
	/** Velocity threshold used to leave placeholder rendering. Defaults to half of velocityThreshold. */
	exitVelocityThreshold?: number
	/** Lightweight placeholder renderer used during fast scrolling. */
	placeholder?: ScrollSeekPlaceholder
	/** Called when placeholder rendering becomes active or inactive. */
	onChange?: (active: boolean) => void
}

/** Virtual scrollbar props. */
export interface VirtualScrollBarProps {
	/** Called when scrolling starts. */
	onScrollStart?: () => void
	/** Called when scrolling ends. */
	onScrollEnd?: () => void
	/**
	 * @description Called whenever scroll state changes.
	 * @param {ScrollState} scrollState Current scroll state.
	 */
	onScroll?: (scrollState: ScrollState) => void
	/** Enables virtual rendering. */
	isVirtual?: boolean
	/** Total indexed item count for large lists that should not create a full children array. */
	itemCount?: number
	/** Lazy item renderer used with itemCount. */
	renderItem?: RenderItem
	/** Stable key generator for indexed items. Defaults to the index. */
	itemKey?: (index: number) => Key
	/** Class name for the outer container. */
	className?: string
	/** Inline style for the outer container. */
	style?: CSSProperties
	/** Estimated height for unmeasured items. Used for virtual range estimation. */
	estimatedItemHeight?: number
	/** Extra item count or full overscan configuration rendered outside the visible viewport. */
	overscan?: number | OverscanConfig
	/** Uses lightweight placeholders during fast scrolling. */
	scrollSeek?: boolean | ScrollSeekOptions
	/** Keeps the current visible item anchored when data or measurements change. */
	maintainVisibleContentPosition?: boolean
	/** Keeps the viewport pinned to the bottom after append when it was already at the bottom. Pass true or options. */
	followOutput?: boolean | FollowOutputOptions
	/** Item indexes that should stay sticky, commonly used for group headers. */
	stickyIndices?: number[]
	/** Called when rendered ranges change. */
	onItemsRendered?: (info: ItemsRenderedInfo) => void
	/** CSS class prefix. */
	prefixCls?: string
	/** Scroll viewport width. */
	width?: number
	/** Scroll viewport height. */
	height?: number
	/** Scrollbar thickness. */
	scrollBarSize?: number
	/** Hides custom scrollbars. */
	scrollBarHidden?: boolean
	/** Delay before auto-hiding the scrollbar. */
	scrollBarAutoHideTimeout?: number
	/**
	 * @description Renders the scroll view.
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderView?: RenderElement<HTMLProps<HTMLDivElement>>
	/**
	 * @description Renders the horizontal track.
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderTrackHorizontal?: RenderElement<HTMLProps<HTMLDivElement>>
	/**
	 * @description Renders the vertical track.
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderTrackVertical?: RenderElement<HTMLProps<HTMLDivElement>>
	/**
	 * @description Renders the horizontal thumb.
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderThumbHorizontal?: RenderElement<HTMLProps<HTMLDivElement>>
	/**
	 * @description Renders the vertical thumb.
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderThumbVertical?: RenderElement<HTMLProps<HTMLDivElement>>
}

export interface VirtualScrollBarRef {
	/** Scrolls to the requested offset. */
	scrollTo: (offset: ScrollOffset) => void
	/** Returns the current scroll state. */
	getScrollState: () => ScrollState
	/** Registers a callback for current scroll content and viewport dimensions. */
	resizeObserver: (callback: (resizeState: Pick<ScrollState, "scrollWidth" | "scrollHeight" | "clientWidth" | "clientHeight">) => void) => void
}


export interface ScrollBarProps {
	/** Current scroll state. */
	scrollState: ScrollState
	/** Current viewport size on the scrollbar axis. */
	containerSize: number
	/** Maximum content size on the scrollbar axis. */
	scrollRange: number
	/**
	 * @description Called with the next offset on the current axis.
	 * @param {number} offset Offset on the current axis.
	 */
	onScroll?: (offset: number) => void
	/** Called when thumb dragging starts. */
	onStartMove?: () => void
	/** Called when thumb dragging stops. */
	onStopMove?: () => void
	/** CSS class prefix. */
	prefixCls?: string
	/** Scrollbar thumb size. */
	thumbSize: {
		/** Thumb width. */
		width: number
		/** Thumb height. */
		height: number
	}
	/** Whether the scrollbar is hidden. */
	hidden?: boolean
	/** Delay before auto-hiding the scrollbar. */
	autoHideTimeout?: number
	/**
	 * @description Renders the scrollbar track.
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderTrack: RenderElement<HTMLProps<HTMLDivElement>>
	/**
	 * @description Renders the scrollbar thumb.
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderThumb: RenderElement<HTMLProps<HTMLDivElement>>
}

export interface ScrollBarRef {
	/** Shows the scrollbar and schedules it to hide later. */
	delayHiddenScrollBar: () => void
}
