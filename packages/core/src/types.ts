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

export interface ScrollSeekOptions<Placeholder = unknown> {
	/** Velocity threshold, in px/ms, used to enter placeholder rendering. */
	velocityThreshold?: number
	/** Velocity threshold used to leave placeholder rendering. Defaults to half of velocityThreshold. */
	exitVelocityThreshold?: number
	/** Lightweight placeholder renderer used during fast scrolling. */
	placeholder?: Placeholder
	/** Called when placeholder rendering becomes active or inactive. */
	onChange?: (active: boolean) => void
}
