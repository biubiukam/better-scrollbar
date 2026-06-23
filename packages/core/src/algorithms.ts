import type {
	AdaptiveOverscanOptions,
	FollowOutputOptions,
	ItemsRenderedInfo,
	OverscanConfig,
	ScrollState
} from "./types"
import type { VirtualOverscanRange } from "./virtualRange"

const MAX_BROWSER_SCROLL_HEIGHT = 10_000_000
const STICKY_PUSH_OVERLAP = 1
const SCROLL_WINDOW_REBASE_RATIO = 0.25

export type ScrollDirection = -1 | 0 | 1

export interface ScrollActivity {
	direction: ScrollDirection
	delta: number
	elapsedMs: number
	deviceScale: number
}

export function toSafeOverscan(value: number) {
	return Math.max(Math.floor(value), 0)
}

export function getAdaptiveOverscanOptions(
	adaptiveOverscan: boolean | AdaptiveOverscanOptions | undefined,
	baseOverscan: number
): Required<AdaptiveOverscanOptions> | null {
	if (!adaptiveOverscan) {
		return null
	}

	const options = typeof adaptiveOverscan === "object" ? adaptiveOverscan : {}
	const min = options.min === undefined ? baseOverscan : toSafeOverscan(options.min)
	const max = Math.max(
		options.max === undefined ? Math.max(baseOverscan + 4, min) : toSafeOverscan(options.max),
		min
	)
	const velocityFactor =
		options.velocityFactor === undefined ? 0.02 : Math.max(options.velocityFactor, 0)
	const timeFactor = options.timeFactor === undefined ? 0.15 : Math.max(options.timeFactor, 0)

	return { min, max, velocityFactor, timeFactor }
}

export function getEffectiveOverscan(
	baseOverscan: number,
	adaptiveOptions: Required<AdaptiveOverscanOptions> | null,
	activity: ScrollActivity
): number | VirtualOverscanRange {
	if (!adaptiveOptions || activity.direction === 0 || activity.delta <= 0) {
		return baseOverscan
	}

	const normalizedDelta = activity.delta / Math.max(activity.deviceScale, 1)
	const velocity = normalizedDelta / Math.max(activity.elapsedMs, 1)
	const dynamicOverscan = Math.min(
		Math.max(
			baseOverscan +
				Math.ceil(
					normalizedDelta * adaptiveOptions.velocityFactor +
						velocity * adaptiveOptions.timeFactor
				),
			adaptiveOptions.min
		),
		adaptiveOptions.max
	)

	if (activity.direction > 0) {
		return { before: baseOverscan, after: dynamicOverscan }
	}

	return { before: dynamicOverscan, after: baseOverscan }
}

export function getDeviceScale() {
	/* v8 ignore if -- SSR guard; component tests run in jsdom */
	if (typeof window === "undefined" || !Number.isFinite(window.devicePixelRatio)) {
		return 1
	}

	return Math.max(window.devicePixelRatio, 1)
}

export function isSameScrollState(left: ScrollState, right: ScrollState) {
	return (
		left.x === right.x &&
		left.y === right.y &&
		left.scrollHeight === right.scrollHeight &&
		left.scrollWidth === right.scrollWidth &&
		left.clientHeight === right.clientHeight &&
		left.clientWidth === right.clientWidth &&
		left.isScrolling === right.isScrolling
	)
}

export function isSameItemsRenderedInfo(left: ItemsRenderedInfo | null, right: ItemsRenderedInfo) {
	return (
		left !== null &&
		left.startIndex === right.startIndex &&
		left.endIndex === right.endIndex &&
		left.visibleStartIndex === right.visibleStartIndex &&
		left.visibleEndIndex === right.visibleEndIndex
	)
}

export function getSafeBrowserScrollHeight(
	maxBrowserScrollHeight: number | undefined,
	clientHeight: number
) {
	const configuredHeight =
		typeof maxBrowserScrollHeight === "number" && Number.isFinite(maxBrowserScrollHeight)
			? maxBrowserScrollHeight
			: MAX_BROWSER_SCROLL_HEIGHT

	return Math.max(Math.floor(configuredHeight), clientHeight, 1)
}

export function getSafeMaxRenderedItems(maxRenderedItems: number) {
	if (!Number.isFinite(maxRenderedItems)) {
		return Number.POSITIVE_INFINITY
	}

	return Math.max(Math.floor(maxRenderedItems), 0)
}

export function resolveOverscanConfig(overscan: number | OverscanConfig | undefined | null): {
	items: number
	pixels: OverscanConfig["pixels"]
	adaptive: OverscanConfig["adaptive"]
} {
	if (overscan === undefined || overscan === null) {
		return { items: 1, pixels: undefined, adaptive: false }
	}

	if (typeof overscan === "number") {
		return { items: overscan, pixels: undefined, adaptive: false }
	}

	return {
		items: overscan.items ?? 1,
		pixels: overscan.pixels,
		adaptive: overscan.adaptive ?? false
	}
}

export function resolveFollowOutputThreshold(
	followOutput: boolean | FollowOutputOptions | undefined
): number {
	if (!followOutput) {
		return 1
	}

	if (typeof followOutput === "object" && typeof followOutput.threshold === "number") {
		return followOutput.threshold
	}

	return 1
}

export function getLogicalScrollWindowStart(
	currentStart: number,
	scrollTop: number,
	logicalRange: number,
	physicalRange: number
) {
	const maxWindowStart = Math.max(logicalRange - physicalRange, 0)
	/* v8 ignore start -- caller already guards logicalRange > physicalRange */
	if (logicalRange <= physicalRange || maxWindowStart <= 0) {
		return 0
	}
	/* v8 ignore stop */

	const safeScrollTop = Math.min(Math.max(scrollTop, 0), logicalRange)
	const safeCurrentStart = Math.min(Math.max(currentStart, 0), maxWindowStart)
	const localTop = safeScrollTop - safeCurrentStart
	const lowerRebaseEdge = physicalRange * SCROLL_WINDOW_REBASE_RATIO
	const upperRebaseEdge = physicalRange * (1 - SCROLL_WINDOW_REBASE_RATIO)

	if (localTop >= lowerRebaseEdge && localTop <= upperRebaseEdge) {
		return safeCurrentStart
	}

	return Math.min(Math.max(safeScrollTop - physicalRange / 2, 0), maxWindowStart)
}

export function normalizeStickyIndices(indices: number[], itemCount: number) {
	return Array.from(
		new Set(
			indices.filter((index) => Number.isInteger(index) && index >= 0 && index < itemCount)
		)
	).sort((indexA, indexB) => indexA - indexB)
}

export function getActiveStickyIndex(
	stickyIndices: number[],
	scrollOffset: number,
	getOffset: (index: number) => number
) {
	if (scrollOffset < 0 || stickyIndices.length === 0) {
		return undefined
	}

	let activeStickyIndex: number | undefined
	let left = 0
	let right = stickyIndices.length - 1

	while (left <= right) {
		const middle = Math.floor((left + right) / 2)
		const stickyIndex = stickyIndices[middle]

		if (getOffset(stickyIndex) <= scrollOffset) {
			activeStickyIndex = stickyIndex
			left = middle + 1
		} else {
			right = middle - 1
		}
	}

	return activeStickyIndex
}

export function getNextStickyIndex(stickyIndices: number[], activeStickyIndex: number) {
	let nextStickyIndex: number | undefined
	let left = 0
	let right = stickyIndices.length - 1

	while (left <= right) {
		const middle = Math.floor((left + right) / 2)
		const stickyIndex = stickyIndices[middle]

		if (stickyIndex > activeStickyIndex) {
			nextStickyIndex = stickyIndex
			right = middle - 1
		} else {
			left = middle + 1
		}
	}

	return nextStickyIndex
}

export function getStickyOverlayOffset(
	stickyIndices: number[],
	activeStickyIndex: number | undefined,
	activeStickyHeightOverride: number | undefined,
	nextStickyDistanceOverride: number | undefined,
	stickyDistanceAdjustment: number,
	scrollOffset: number,
	itemCount: number,
	getOffset: (index: number) => number
) {
	if (activeStickyIndex === undefined) {
		return 0
	}

	const nextStickyIndex = getNextStickyIndex(stickyIndices, activeStickyIndex)
	if (nextStickyIndex === undefined) {
		return 0
	}

	const activeStickyHeight = Math.max(
		activeStickyHeightOverride ??
			getOffset(Math.min(activeStickyIndex + 1, itemCount)) - getOffset(activeStickyIndex),
		0
	)
	const nextStickyDistance =
		nextStickyDistanceOverride ??
		getOffset(nextStickyIndex) - scrollOffset + stickyDistanceAdjustment

	return Math.min(nextStickyDistance - activeStickyHeight + STICKY_PUSH_OVERLAP, 0)
}
