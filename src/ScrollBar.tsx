import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	Children, forwardRef, useImperativeHandle, cloneElement
} from "react"
import type { PropsWithChildren } from "react"
import raf from "./raf"
import { Item } from "./components/Item"
import useHeights from "./hooks/useHeights"
import VerticalScrollBar from "./components/VerticalScrollBar"
import HorizontalScrollBar from "./components/HorizontalScrollBar"
import { getSpinSize } from "./scrollUtil"
import {
	AdaptiveOverscanOptions,
	ScrollOffset,
	ScrollState,
	VirtualScrollBarProps,
	VirtualScrollBarRef,
	ScrollBarRef
} from "./types"
import useResizeObserver from "./hooks/useResizeObserver"
import { VirtualOverscanRange } from "./virtualRange"
import clsx from "clsx"
import {
	renderViewDefault,
	renderTrackHorizontalDefault,
	renderTrackVerticalDefault,
	renderThumbHorizontalDefault,
	renderThumbVerticalDefault
} from "./defaultRenderElements"

type ScrollOffsetUpdater = number | ((preOffset: number) => number)
const MAX_BROWSER_SCROLL_HEIGHT = 10_000_000
const DEFAULT_MAX_RENDERED_ITEMS = 500
const INDEXED_ANCHOR_SEARCH_RADIUS = 1_000
const ignoreItemMeasurement = () => undefined
type ScrollDirection = -1 | 0 | 1
interface ScrollActivity {
	direction: ScrollDirection
	delta: number
	elapsedMs: number
	deviceScale: number
}
interface ScrollAnchorSnapshot {
	key: React.Key
	index: number
	offsetWithin: number
	scrollY: number
	scrollHeight: number
	maxScrollHeight: number
	itemCount: number
}
interface ResolvedScrollSeekOptions {
	velocityThreshold: number
	exitVelocityThreshold: number
	placeholder: (index: number) => React.ReactElement
	onChange?: (active: boolean) => void
}

function toSafeOverscan(value: number) {
	return Math.max(Math.floor(value), 0)
}

function getAdaptiveOverscanOptions(
	adaptiveOverscan: VirtualScrollBarProps["adaptiveOverscan"],
	baseOverscan: number
): Required<AdaptiveOverscanOptions> | null {
	if (!adaptiveOverscan) {
		return null
	}

	const options = typeof adaptiveOverscan === "object" ? adaptiveOverscan : {}
	const min = options.min === undefined ? baseOverscan : toSafeOverscan(options.min)
	const max = Math.max(options.max === undefined ? Math.max(baseOverscan + 4, min) : toSafeOverscan(options.max), min)
	const velocityFactor = options.velocityFactor === undefined ? 0.02 : Math.max(options.velocityFactor, 0)
	const timeFactor = options.timeFactor === undefined ? 0.15 : Math.max(options.timeFactor, 0)

	return {min, max, velocityFactor, timeFactor}
}

function getEffectiveOverscan(
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
			baseOverscan + Math.ceil(
				normalizedDelta * adaptiveOptions.velocityFactor +
				velocity * adaptiveOptions.timeFactor
			),
			adaptiveOptions.min
		),
		adaptiveOptions.max
	)

	if (activity.direction > 0) {
		return {before: baseOverscan, after: dynamicOverscan}
	}

	return {before: dynamicOverscan, after: baseOverscan}
}

function getDeviceScale() {
	/* v8 ignore if -- SSR guard; component tests run in jsdom */
	if (typeof window === "undefined" || !Number.isFinite(window.devicePixelRatio)) {
		return 1
	}

	return Math.max(window.devicePixelRatio, 1)
}

function getScrollSeekOptions(
	scrollSeek: VirtualScrollBarProps["scrollSeek"],
	estimatedItemHeight: number
): ResolvedScrollSeekOptions | null {
	if (!scrollSeek) {
		return null
	}

	const options = typeof scrollSeek === "object" ? scrollSeek : {}
	const velocityThreshold = Math.max(options.velocityThreshold ?? 2, 0)
	const exitVelocityThreshold = Math.min(
		Math.max(options.exitVelocityThreshold ?? velocityThreshold / 2, 0),
		velocityThreshold
	)

	return {
		velocityThreshold,
		exitVelocityThreshold,
		onChange: options.onChange,
		placeholder: options.placeholder ?? ((index: number) => (
			<div key={ index } aria-hidden="true" style={ {height: estimatedItemHeight} } />
		))
	}
}

function isSameScrollState(left: ScrollState, right: ScrollState) {
	return left.x === right.x &&
		left.y === right.y &&
		left.scrollHeight === right.scrollHeight &&
		left.scrollWidth === right.scrollWidth &&
		left.clientHeight === right.clientHeight &&
		left.clientWidth === right.clientWidth &&
		left.isScrolling === right.isScrolling
}

function getSafeBrowserScrollHeight(maxBrowserScrollHeight: number | undefined, clientHeight: number) {
	const configuredHeight = typeof maxBrowserScrollHeight === "number" && Number.isFinite(maxBrowserScrollHeight)
		? maxBrowserScrollHeight
		: MAX_BROWSER_SCROLL_HEIGHT

	return Math.max(Math.floor(configuredHeight), clientHeight, 1)
}

function getSafeMaxRenderedItems(maxRenderedItems: number) {
	if (!Number.isFinite(maxRenderedItems)) {
		return Number.POSITIVE_INFINITY
	}

	return Math.max(Math.floor(maxRenderedItems), 0)
}

function normalizeStickyIndices(indices: number[], itemCount: number) {
	return Array.from(new Set(indices
		.filter((index) => Number.isInteger(index) && index >= 0 && index < itemCount)))
		.sort((indexA, indexB) => indexA - indexB)
}

function getStickyIndicesFromGroupCounts(groupCounts: number[] | undefined, itemCount: number) {
	if (!groupCounts?.length) {
		return []
	}

	const stickyIndexes: number[] = []
	let nextGroupHeaderIndex = 0

	groupCounts.forEach((groupCount) => {
		if (nextGroupHeaderIndex >= itemCount) {
			return
		}

		stickyIndexes.push(nextGroupHeaderIndex)
		nextGroupHeaderIndex += Math.max(Math.floor(groupCount), 0) + 1
	})

	return stickyIndexes
}

function getActiveStickyIndex(stickyIndices: number[], visibleStartIndex: number) {
	if (visibleStartIndex < 0 || stickyIndices.length === 0) {
		return undefined
	}

	let activeStickyIndex: number | undefined
	for (const stickyIndex of stickyIndices) {
		if (stickyIndex > visibleStartIndex) {
			break
		}
		activeStickyIndex = stickyIndex
	}

	return activeStickyIndex
}

function isGridRole(role: string) {
	return role === "grid" || role === "table" || role === "treegrid"
}

const ScrollBar = forwardRef<VirtualScrollBarRef, PropsWithChildren<VirtualScrollBarProps>>((props, ref) => {
	const {
		onScrollStart,
		onScrollEnd,
		onScroll,
		children,
		width,
		height,
		style,
		className,
		prefixCls = "scroll-bar",
		isVirtual = true,
		itemCount,
		renderItem,
		itemKey,
		itemHeight = 20,
		estimatedItemHeight = itemHeight,
		heightCacheLimit,
		overscan = 1,
		overscanPixels,
		adaptiveOverscan = false,
		maxRenderedItems = DEFAULT_MAX_RENDERED_ITEMS,
		scrollSeek = false,
		scrollMode = "controlled",
		maintainVisibleContentPosition = true,
		followOutput = false,
		followOutputThreshold = 1,
		preserveItemState = false,
		stickyIndices,
		groupCounts,
		accessibility = false,
		maxBrowserScrollHeight,
		onItemsRendered,
		scrollBarSize = 6,
		scrollBarHidden = false,
		scrollBarAutoHideTimeout = 1000,
		renderView = renderViewDefault,
		renderTrackHorizontal = renderTrackHorizontalDefault,
		renderTrackVertical = renderTrackVerticalDefault,
		renderThumbHorizontal = renderThumbHorizontalDefault,
		renderThumbVertical = renderThumbVerticalDefault,
	} = props

	const useIndexedRendering = typeof itemCount === "number" && typeof renderItem === "function"
	const childNodes = useMemo(() => {
		if (useIndexedRendering) {
			return []
		}

		return (typeof children === "function"
			? [(children as () => React.ReactElement)()]
			: Children.toArray(children)) as Array<React.ReactElement>
	}, [children, useIndexedRendering])

	const totalItemCount = useIndexedRendering
		? Math.max(Math.floor(itemCount || 0), 0)
		: childNodes.length

	const getItemKey = useCallback((index: number) => {
		if (useIndexedRendering) {
			return itemKey?.(index) ?? index
		}

		return childNodes[index]?.key ?? index
	}, [childNodes, itemKey, useIndexedRendering])
	
	// 可见视图区域
	const viewContainerRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	// 滚动区域
	const scrollContainerRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	const itemRefCallbackCacheRef = useRef(new Map<React.Key, {
		index: number
		callback: (element: HTMLElement | null) => void
	}>())
	// 滚动条
	const verticalScrollBarInstance = useRef<ScrollBarRef>({} as ScrollBarRef)
	const horizontalScrollBarInstance = useRef<ScrollBarRef>({} as ScrollBarRef)
	const {setInstanceRef, pruneHeights, heightIndex, updatedMark} = useHeights({
		itemCount: totalItemCount,
		estimatedItemHeight,
		heightCacheLimit
	})
	
	const [scrollState, setScrollState] = useState<ScrollState>({
		x: 0,
		y: 0,
		scrollHeight: 0,
		scrollWidth: 0,
		clientHeight: typeof height === "number" ? height : 0,
		clientWidth: typeof width === "number" ? width : 0,
		isScrolling: false
	})
	const scrollStateRef = useRef(scrollState)
	const scrollCommitRafRef = useRef<number>(-1)
	const commitScrollState = useCallback((nextScrollState: ScrollState, sync = false) => {
		const previousScrollState = scrollStateRef.current
		if (isSameScrollState(previousScrollState, nextScrollState)) {
			return
		}

		scrollStateRef.current = nextScrollState
		if (sync) {
			raf.cancel(scrollCommitRafRef.current)
			scrollCommitRafRef.current = -1
			setScrollState(nextScrollState)
			return
		}

		raf.cancel(scrollCommitRafRef.current)
		scrollCommitRafRef.current = raf(() => {
			scrollCommitRafRef.current = -1
			setScrollState(scrollStateRef.current)
		})
	}, [])
	const updateScrollState = useCallback((updater: (draft: ScrollState) => void, sync = false) => {
		const nextScrollState = {...scrollStateRef.current}
		updater(nextScrollState)
		commitScrollState(nextScrollState, sync)
	}, [commitScrollState])
	
	useResizeObserver(viewContainerRef, (newSize) => {
		updateScrollState((preScrollState) => {
			preScrollState.clientHeight = newSize.height
			preScrollState.clientWidth = newSize.width
		}, true)
	})

	useEffect(() => {
		return () => {
			raf.cancel(scrollCommitRafRef.current)
		}
	}, [])

	const childKeys = useMemo(() => {
		if (useIndexedRendering) {
			return undefined
		}

		return childNodes.map((_, index) => getItemKey(index))
	}, [childNodes, getItemKey, useIndexedRendering])

	useLayoutEffect(() => {
		pruneHeights(childKeys, totalItemCount)
	}, [childKeys, pruneHeights, totalItemCount])

	const clientHeight = scrollState.clientHeight || (typeof height === "number" ? height : 0)
	const clientWidth = scrollState.clientWidth || (typeof width === "number" ? width : 0)
	const baseOverscan = toSafeOverscan(overscan)
	const safeMaxRenderedItems = getSafeMaxRenderedItems(maxRenderedItems)
	const shouldForceVirtualRendering = totalItemCount > safeMaxRenderedItems
	const shouldUseVirtualRendering = isVirtual || shouldForceVirtualRendering
	const scrollActivityRef = useRef<ScrollActivity>({direction: 0, delta: 0, elapsedMs: 16, deviceScale: 1})
	const [scrollSeekActive, setScrollSeekActive] = useState(false)
	const scrollSeekActiveRef = useRef(false)
	const adaptiveOverscanOptions = useMemo(() => {
		return getAdaptiveOverscanOptions(adaptiveOverscan, baseOverscan)
	}, [adaptiveOverscan, baseOverscan])
	const scrollSeekOptions = useMemo(() => {
		return getScrollSeekOptions(scrollSeek, estimatedItemHeight)
	}, [estimatedItemHeight, scrollSeek])
	const scrollSeekOptionsRef = useRef(scrollSeekOptions)
	scrollSeekOptionsRef.current = scrollSeekOptions
	const updateScrollSeekActive = useCallback((nextActive: boolean) => {
		if (scrollSeekActiveRef.current === nextActive) {
			return
		}

		scrollSeekActiveRef.current = nextActive
		setScrollSeekActive(nextActive)
		scrollSeekOptionsRef.current?.onChange?.(nextActive)
	}, [])
	const effectiveOverscan = useMemo(() => {
		return getEffectiveOverscan(
			baseOverscan,
			adaptiveOverscanOptions,
			scrollActivityRef.current
		)
	}, [adaptiveOverscanOptions, baseOverscan, scrollState.isScrolling, scrollState.y])
	
	const {
		scrollHeight,
		start,
		end,
		visibleStartIndex,
		visibleEndIndex,
		offset: fillerOffset
	} = useMemo(() => {
		const lastIndex = totalItemCount - 1
		if (lastIndex < 0) {
			return {
				scrollHeight: heightIndex.totalHeight,
				start: 0,
				end: -1,
				visibleStartIndex: 0,
				visibleEndIndex: -1,
				offset: 0,
			}
		}

		if (!shouldUseVirtualRendering) {
			return {
				scrollHeight: heightIndex.totalHeight,
				start: 0,
				end: lastIndex,
				visibleStartIndex: 0,
				visibleEndIndex: lastIndex,
				offset: 0,
			}
		}

		return heightIndex.getRange({
			scrollOffset: scrollState.y,
			viewportSize: clientHeight,
			overscan: effectiveOverscan,
			overscanPixels,
			maxItems: safeMaxRenderedItems
		})
	}, [
		clientHeight,
		effectiveOverscan,
		heightIndex,
		overscanPixels,
		safeMaxRenderedItems,
		scrollState.y,
		shouldUseVirtualRendering,
		totalItemCount,
		updatedMark
	])

	const normalizedStickyIndices = useMemo(() => {
		return normalizeStickyIndices([
			...(stickyIndices || []),
			...getStickyIndicesFromGroupCounts(groupCounts, totalItemCount)
		], totalItemCount)
	}, [groupCounts, stickyIndices, totalItemCount])

	const activeStickyIndex = useMemo(() => {
		return getActiveStickyIndex(normalizedStickyIndices, visibleStartIndex)
	}, [normalizedStickyIndices, visibleStartIndex])

	const accessibilityOptions = useMemo(() => {
		if (!accessibility) {
			return null
		}

		const options = typeof accessibility === "object" ? accessibility : {}
		const role = options.role || "list"
		const rowCount = options.rowCount ?? totalItemCount
		const itemRole = options.itemRole || (isGridRole(role) ? "row" : role === "listbox" ? "option" : "listitem")

		return {
			role,
			label: options.label,
			rowCount,
			itemRole
		}
	}, [accessibility, totalItemCount])

	const wrapperAccessibilityProps = useMemo((): React.HTMLAttributes<HTMLDivElement> => {
		if (!accessibilityOptions) {
			return {}
		}

		return {
			role: accessibilityOptions.role,
			"aria-label": accessibilityOptions.label,
			...(isGridRole(accessibilityOptions.role) ? {"aria-rowcount": accessibilityOptions.rowCount} : {})
		}
	}, [accessibilityOptions])

	const getItemAccessibilityProps = useCallback((index: number): React.HTMLAttributes<HTMLElement> => {
		if (!accessibilityOptions) {
			return {}
		}

		if (isGridRole(accessibilityOptions.role)) {
			return {
				role: accessibilityOptions.itemRole,
				"aria-rowindex": index + 1
			}
		}

		return {
			role: accessibilityOptions.itemRole,
			"aria-posinset": index + 1,
			"aria-setsize": accessibilityOptions.rowCount
		}
	}, [accessibilityOptions])

	useEffect(() => {
		onItemsRendered?.({
			startIndex: start,
			endIndex: end,
			visibleStartIndex,
			visibleEndIndex
		})
	}, [end, onItemsRendered, start, visibleEndIndex, visibleStartIndex])
	
	useEffect(() => {
		updateScrollState((preScrollState) => {
			preScrollState.scrollHeight = scrollHeight
		}, true)
	}, [scrollHeight, updateScrollState])
	
	const maxScrollHeight = Math.max(scrollHeight - clientHeight, 0)
	const maxScrollHeightRef = useRef(maxScrollHeight)
	maxScrollHeightRef.current = maxScrollHeight

	const browserScrollHeightLimit = getSafeBrowserScrollHeight(maxBrowserScrollHeight, clientHeight)
	const physicalScrollHeight = scrollHeight > browserScrollHeightLimit
		? Math.max(clientHeight, browserScrollHeightLimit)
		: scrollHeight
	const effectiveScrollMode = scrollMode === "native" && physicalScrollHeight >= scrollHeight
		? "native"
		: "controlled"
	const maxPhysicalScrollHeight = Math.max(physicalScrollHeight - clientHeight, 0)
	const maxPhysicalScrollHeightRef = useRef(maxPhysicalScrollHeight)
	maxPhysicalScrollHeightRef.current = maxPhysicalScrollHeight

	const maxScrollWidth = Math.max(scrollState.scrollWidth - clientWidth, 0)
	const maxScrollWidthRef = useRef(maxScrollWidth)
	maxScrollWidthRef.current = maxScrollWidth
	
	const keepInVerticalRange = useCallback((newScrollTop: number) => {
		let newTop = newScrollTop
		if (!Number.isNaN(maxScrollHeightRef.current)) {
			newTop = Math.min(newTop, maxScrollHeightRef.current)
		}
		newTop = Math.max(newTop, 0)
		return newTop
	}, [])

	const logicalToPhysicalY = useCallback((scrollTop: number) => {
		const logicalRange = maxScrollHeightRef.current
		const physicalRange = maxPhysicalScrollHeightRef.current
		if (logicalRange <= 0 || physicalRange <= 0) {
			return 0
		}

		const nextTop = Math.min(Math.max(scrollTop, 0), logicalRange)
		if (logicalRange === physicalRange) {
			return nextTop
		}

		return (nextTop / logicalRange) * physicalRange
	}, [])

	const physicalToLogicalY = useCallback((scrollTop: number) => {
		const logicalRange = maxScrollHeightRef.current
		const physicalRange = maxPhysicalScrollHeightRef.current
		if (logicalRange <= 0 || physicalRange <= 0) {
			return 0
		}

		const nextTop = Math.min(Math.max(scrollTop, 0), physicalRange)
		if (logicalRange === physicalRange) {
			return keepInVerticalRange(nextTop)
		}

		return keepInVerticalRange((nextTop / physicalRange) * logicalRange)
	}, [keepInVerticalRange])

	const keepInHorizontalRange = useCallback((newScrollLeft: number) => {
		let newLeft = newScrollLeft
		if (!Number.isNaN(maxScrollWidthRef.current)) {
			newLeft = Math.min(newLeft, maxScrollWidthRef.current)
		}
		newLeft = Math.max(newLeft, 0)
		return newLeft
	}, [])
	
	const detectScrollingInterval = useRef<ReturnType<typeof setTimeout>>()

	/**
	 * @description 延迟"是否滚动"的滚动状态变更
	 */
	const delayScrollStateChange = useCallback(() => {
		clearTimeout(detectScrollingInterval.current)
		
		detectScrollingInterval.current = setTimeout(() => {
			scrollActivityRef.current = {direction: 0, delta: 0, elapsedMs: 16, deviceScale: getDeviceScale()}
			updateScrollSeekActive(false)
			updateScrollState((preScrollState) => {
				preScrollState.isScrolling = false
			}, true)
		}, 200)
	}, [updateScrollSeekActive, updateScrollState])

	useEffect(() => {
		return () => clearTimeout(detectScrollingInterval.current)
	}, [])

	const resolveOffset = useCallback((nextOffset: ScrollOffsetUpdater, preOffset: number) => {
		return typeof nextOffset === "function" ? nextOffset(preOffset) : nextOffset
	}, [])

	const syncedNativeScrollRef = useRef<{ x: number, y: number } | null>(null)
	const syncNativeScrollOffset = useCallback((nextX: number, nextY: number) => {
		const viewContainer = viewContainerRef.current
		/* v8 ignore start -- ref is available after mount before this callback is invoked */
		if (!viewContainer) {
			return
		}
		/* v8 ignore stop */

		const nextPhysicalY = logicalToPhysicalY(nextY)
		syncedNativeScrollRef.current = {x: nextX, y: nextPhysicalY}
		viewContainer.scrollLeft = nextX
		viewContainer.scrollTop = nextPhysicalY
	}, [logicalToPhysicalY])

	const onUpdateScrollOffset = useCallback((
		offset: Partial<Record<"x" | "y", ScrollOffsetUpdater>>,
		options: { sync?: boolean, elapsedMs?: number } = {}
	) => {
		const previousScrollState = scrollStateRef.current
		const nextX = offset.x === undefined
			? previousScrollState.x
			: keepInHorizontalRange(resolveOffset(offset.x, previousScrollState.x))
		const nextY = offset.y === undefined
			? previousScrollState.y
			: keepInVerticalRange(resolveOffset(offset.y, previousScrollState.y))
		const nextYDelta = nextY - previousScrollState.y
		const nextActivity: ScrollActivity = {
			direction: nextYDelta > 0 ? 1 : nextYDelta < 0 ? -1 : 0,
			delta: Math.abs(nextYDelta),
			elapsedMs: Math.max(options.elapsedMs ?? 16, 1),
			deviceScale: getDeviceScale()
		}

		scrollActivityRef.current = nextActivity
		if (scrollSeekOptions) {
			const normalizedDelta = nextActivity.delta / Math.max(nextActivity.deviceScale, 1)
			const velocity = normalizedDelta / Math.max(nextActivity.elapsedMs, 1)
			const velocityThreshold = scrollSeekActiveRef.current
				? scrollSeekOptions.exitVelocityThreshold
				: scrollSeekOptions.velocityThreshold
			updateScrollSeekActive(velocity >= velocityThreshold)
		}

		const nextScrollState = {
			...previousScrollState,
			x: nextX,
			y: nextY,
			isScrolling: true
		}

		syncNativeScrollOffset(nextX, nextY)
		commitScrollState(nextScrollState, options.sync)
		delayScrollStateChange()
	}, [
		commitScrollState,
		delayScrollStateChange,
		keepInHorizontalRange,
		keepInVerticalRange,
		resolveOffset,
		scrollSeekOptions,
		syncNativeScrollOffset,
		updateScrollSeekActive
	])

	useLayoutEffect(() => {
		syncNativeScrollOffset(scrollState.x, scrollState.y)
	}, [physicalScrollHeight, scrollState.x, scrollState.y, syncNativeScrollOffset])

	const anchorSnapshotRef = useRef<ScrollAnchorSnapshot | null>(null)
	const anchorVersionRef = useRef<{
		heightIndex: typeof heightIndex,
		childKeys?: React.Key[],
		totalItemCount: number,
		updatedMark: number
	} | null>(null)

	const resolveAnchorIndex = useCallback((anchor: ScrollAnchorSnapshot) => {
		if (childKeys) {
			return childKeys.indexOf(anchor.key)
		}

		const directIndex = anchor.index >= 0 && anchor.index < totalItemCount ? anchor.index : -1
		if (directIndex < 0) {
			return -1
		}

		if (getItemKey(directIndex) === anchor.key) {
			return directIndex
		}

		const startIndex = Math.max(directIndex - INDEXED_ANCHOR_SEARCH_RADIUS, 0)
		const endIndex = Math.min(directIndex + INDEXED_ANCHOR_SEARCH_RADIUS, totalItemCount - 1)
		for (let index = startIndex; index <= endIndex; index++) {
			if (index !== directIndex && getItemKey(index) === anchor.key) {
				return index
			}
		}

		return directIndex
	}, [childKeys, getItemKey, totalItemCount])

	const getAnchorSnapshot = useCallback((): ScrollAnchorSnapshot | null => {
		if (totalItemCount <= 0 || visibleStartIndex < 0) {
			return null
		}

		return {
			key: getItemKey(visibleStartIndex),
			index: visibleStartIndex,
			offsetWithin: Math.max(scrollState.y - heightIndex.getOffset(visibleStartIndex), 0),
			scrollY: scrollState.y,
			scrollHeight,
			maxScrollHeight,
			itemCount: totalItemCount
		}
	}, [
		getItemKey,
		heightIndex,
		maxScrollHeight,
		scrollHeight,
		scrollState.y,
		totalItemCount,
		visibleStartIndex
	])

	useLayoutEffect(() => {
		const previousAnchor = anchorSnapshotRef.current
		const previousVersion = anchorVersionRef.current
		const anchorVersionChanged = !previousVersion ||
			previousVersion.heightIndex !== heightIndex ||
			previousVersion.childKeys !== childKeys ||
			previousVersion.totalItemCount !== totalItemCount ||
			previousVersion.updatedMark !== updatedMark

		if (anchorVersionChanged && previousAnchor && previousAnchor.itemCount > 0 && totalItemCount > 0) {
			const scrollOffsetStayedOnAnchor = Math.abs(scrollState.y - previousAnchor.scrollY) <= 0.5
			const isFollowingOutput = followOutput &&
				scrollOffsetStayedOnAnchor &&
				scrollHeight >= previousAnchor.scrollHeight &&
				previousAnchor.maxScrollHeight - previousAnchor.scrollY <= followOutputThreshold
			let nextY: number | undefined

			if (isFollowingOutput) {
				nextY = maxScrollHeight
			} else if (maintainVisibleContentPosition && scrollOffsetStayedOnAnchor) {
				const anchorIndex = resolveAnchorIndex(previousAnchor)
				if (anchorIndex >= 0) {
					nextY = heightIndex.getOffset(anchorIndex) + previousAnchor.offsetWithin
				}
			}

			if (nextY !== undefined) {
				const safeNextY = keepInVerticalRange(nextY)
				if (Math.abs(safeNextY - scrollState.y) > 0.5) {
					updateScrollState((preScrollState) => {
						preScrollState.y = safeNextY
					}, true)
					syncNativeScrollOffset(scrollState.x, safeNextY)
					anchorVersionRef.current = {heightIndex, childKeys, totalItemCount, updatedMark}
					return
				}
			}
		}

		anchorSnapshotRef.current = getAnchorSnapshot()
		anchorVersionRef.current = {heightIndex, childKeys, totalItemCount, updatedMark}
	}, [
		childKeys,
		followOutput,
		followOutputThreshold,
		getAnchorSnapshot,
		heightIndex,
		keepInVerticalRange,
		maintainVisibleContentPosition,
		maxScrollHeight,
		resolveAnchorIndex,
		scrollHeight,
		scrollState.x,
		scrollState.y,
		syncNativeScrollOffset,
		totalItemCount,
		updatedMark,
		updateScrollState
	])

	const onUpdateScrollState = useCallback((scrollTop: ScrollOffsetUpdater) => {
		onUpdateScrollOffset({y: scrollTop}, {sync: true})
	}, [onUpdateScrollOffset])

	const onUpdateHorizontalScrollState = useCallback((scrollLeft: ScrollOffsetUpdater) => {
		onUpdateScrollOffset({x: scrollLeft}, {sync: true})
	}, [onUpdateScrollOffset])
	
	useEffect(() => {
		onScroll?.(scrollState)
	}, [scrollState, onScroll])

	const prevIsScrollingRef = useRef(scrollState.isScrolling)
	useEffect(() => {
		if (prevIsScrollingRef.current !== scrollState.isScrolling) {
			if (scrollState.isScrolling) {
				onScrollStart?.()
			} else {
				onScrollEnd?.()
			}
			prevIsScrollingRef.current = scrollState.isScrolling
		}
	}, [scrollState.isScrolling, onScrollEnd, onScrollStart])
	
	const lastWheelTimeRef = useRef<number | null>(null)
	
	useEffect(() => {
		if (effectiveScrollMode === "native") {
			lastWheelTimeRef.current = null
			return
		}

		const onScroll = function (event: WheelEvent): void {
			event?.preventDefault()
			
			const {deltaX, deltaY} = event
			
			const StepY = 360
			const StepX = 360
			
			const shouldScrollHorizontal = event.shiftKey || Math.abs(deltaX) > Math.abs(deltaY)
			const rawScrollOffset = event.shiftKey ? (deltaX || deltaY) : (shouldScrollHorizontal ? deltaX : deltaY)
			const scrollOffset = shouldScrollHorizontal
				? Math.max(Math.min(rawScrollOffset, StepX), -StepX)
				: Math.max(Math.min(rawScrollOffset, StepY), -StepY)
			const now = Date.now()
			const elapsedMs = lastWheelTimeRef.current === null ? 16 : Math.max(now - lastWheelTimeRef.current, 1)
			lastWheelTimeRef.current = now

			if (scrollOffset) {
				onUpdateScrollOffset({
					...(shouldScrollHorizontal
						? {x: (preScrollStateX: number) => keepInHorizontalRange(preScrollStateX + scrollOffset)}
						: {y: (preScrollStateY: number) => keepInVerticalRange(preScrollStateY + scrollOffset)})
				}, {elapsedMs})
			}
		}
		const scrollContainer = scrollContainerRef.current;
		scrollContainer?.addEventListener("wheel", onScroll)
		return () => {
			scrollContainer?.removeEventListener("wheel", onScroll)
		}
	}, [effectiveScrollMode, keepInHorizontalRange, keepInVerticalRange, onUpdateScrollOffset])
	
	const shouldPreserveItemState = preserveItemState && !useIndexedRendering && !shouldForceVirtualRendering
	const getItemRefCallback = useCallback((key: React.Key, index: number) => {
		const cached = itemRefCallbackCacheRef.current.get(key)
		if (cached?.index === index) {
			itemRefCallbackCacheRef.current.delete(key)
			itemRefCallbackCacheRef.current.set(key, cached)
			return cached.callback
		}

		const callback = (element: HTMLElement | null) => setInstanceRef(key, index, element)
		itemRefCallbackCacheRef.current.set(key, {index, callback})

		const renderedRangeSize = Math.max(end - start + 1, 1)
		const maxCacheSize = Math.max(safeMaxRenderedItems * 2, renderedRangeSize, 1)
		while (itemRefCallbackCacheRef.current.size > maxCacheSize) {
			const oldestKey = itemRefCallbackCacheRef.current.keys().next().value
			/* v8 ignore start -- size above a positive limit guarantees an oldest key that is not the just-inserted key */
			if (oldestKey === undefined || oldestKey === key) {
				break
			}
			/* v8 ignore stop */
			itemRefCallbackCacheRef.current.delete(oldestKey)
		}

		return callback
	}, [end, safeMaxRenderedItems, setInstanceRef, start])
	const getVirtualItemProps = useCallback((index: number): React.HTMLAttributes<HTMLElement> => {
		const isActiveSticky = index === activeStickyIndex
		return {
			...getItemAccessibilityProps(index),
			...(isActiveSticky
				? {
					className: `${ prefixCls }-sticky-item`,
					style: {
						position: "sticky",
						top: 0,
						zIndex: 1,
					} as React.CSSProperties
				}
				: {})
		}
	}, [activeStickyIndex, getItemAccessibilityProps, prefixCls])

	const listChildren = useMemo(() => {
		const renderedNodes: React.ReactElement[] = []
		const renderStart = shouldPreserveItemState ? 0 : start
		const renderEnd = shouldPreserveItemState ? totalItemCount - 1 : end
		const shouldRenderPlaceholder = Boolean(scrollSeekActive && scrollSeekOptions && shouldUseVirtualRendering)

		for (let index = renderStart; index <= renderEnd; index++) {
			const node = shouldRenderPlaceholder
				? scrollSeekOptions?.placeholder(index)
				: useIndexedRendering ? renderItem?.(index) : childNodes[index]
			if (!node) {
				continue
			}

			const key = getItemKey(index)
			const hidden = shouldPreserveItemState && (index < start || index > end)
			const setRef = shouldRenderPlaceholder ? ignoreItemMeasurement : getItemRefCallback(key, index)
			renderedNodes.push(
				<Item
					key={ key }
					hidden={ hidden }
					useWrapper={ shouldPreserveItemState }
					itemProps={ getVirtualItemProps(index) }
					setRef={ setRef }
				>
					{ node }
				</Item>
			)
		}

		return renderedNodes
	}, [
		childNodes,
		end,
		getItemKey,
		getItemRefCallback,
		getVirtualItemProps,
		renderItem,
		scrollSeekActive,
		scrollSeekOptions,
		shouldPreserveItemState,
		shouldUseVirtualRendering,
		start,
		totalItemCount,
		useIndexedRendering
	])

	const stickyOverlay = useMemo(() => {
		if (activeStickyIndex === undefined || (activeStickyIndex >= start && activeStickyIndex <= end)) {
			return null
		}

		const node = useIndexedRendering ? renderItem?.(activeStickyIndex) : childNodes[activeStickyIndex]
		if (!node) {
			return null
		}

		const key = getItemKey(activeStickyIndex)
		return (
			<div className={ `${ prefixCls }-sticky-layer` } style={ {position: "sticky", top: 0, zIndex: 1, height: 0} }>
				<Item
					key={ `sticky-${ key }` }
					useWrapper
					setRef={ () => undefined }
					itemProps={ getVirtualItemProps(activeStickyIndex) }
				>
					{ node }
				</Item>
			</div>
		)
	}, [
		activeStickyIndex,
		childNodes,
		end,
		getItemKey,
		getVirtualItemProps,
		prefixCls,
		renderItem,
		start,
		useIndexedRendering
	])

	const collectScrollWidth = useCallback(() => {
		const viewContainer = viewContainerRef.current
		const scrollContainer = scrollContainerRef.current
		const nextScrollWidth = Math.max(
			viewContainer?.scrollWidth || 0,
			scrollContainer?.scrollWidth || 0,
			clientWidth
		)

		updateScrollState((preScrollState) => {
			if (preScrollState.scrollWidth !== nextScrollWidth) {
				preScrollState.scrollWidth = nextScrollWidth
			}
		}, true)
	}, [clientWidth, updateScrollState])

	useLayoutEffect(() => {
		collectScrollWidth()
	}, [collectScrollWidth, listChildren, scrollHeight])
	
	const delayHideScrollBar = useCallback(() => {
		verticalScrollBarInstance.current?.delayHiddenScrollBar()
		horizontalScrollBarInstance.current?.delayHiddenScrollBar()
	}, [])
	
	// 当数据大小减小时。它可能会触发本地滚动事件以适应滚动位置
	const lastNativeScrollTimeRef = useRef<number | null>(null)
	const onFallbackScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
		const {scrollLeft: newScrollLeft, scrollTop: newPhysicalScrollTop} = event.currentTarget
		const syncedNativeScroll = syncedNativeScrollRef.current

		if (
			syncedNativeScroll &&
			Math.abs(syncedNativeScroll.x - newScrollLeft) < 1 &&
			Math.abs(syncedNativeScroll.y - newPhysicalScrollTop) < 1
		) {
			syncedNativeScrollRef.current = null
			return
		}

		const newScrollTop = physicalToLogicalY(newPhysicalScrollTop)
		const currentScrollState = scrollStateRef.current
		if (Math.abs(newScrollLeft - currentScrollState.x) > 0.5 || Math.abs(newScrollTop - currentScrollState.y) > 0.5) {
			const now = Date.now()
			const elapsedMs = lastNativeScrollTimeRef.current === null
				? 16
				: Math.max(now - lastNativeScrollTimeRef.current, 1)
			lastNativeScrollTimeRef.current = now
			onUpdateScrollOffset({
				x: newScrollLeft,
				y: newScrollTop
			}, {elapsedMs})
		}
	}, [onUpdateScrollOffset, physicalToLogicalY])
	
	useImperativeHandle(ref, (): VirtualScrollBarRef => {
		return {
			scrollTo(offset: ScrollOffset) {
				onUpdateScrollOffset({
					x: offset.x,
					y: offset.y
				}, {sync: true})
			},
			getScrollState() {
				return scrollStateRef.current
			},
			resizeObserver(callback) {
				const currentScrollState = scrollStateRef.current
				callback({
					clientWidth: currentScrollState.clientWidth,
					clientHeight: currentScrollState.clientHeight,
					scrollWidth: currentScrollState.scrollWidth,
					scrollHeight: currentScrollState.scrollHeight,
				})
			}
		}
	}, [onUpdateScrollOffset])

	const outerStyle: React.CSSProperties = {...style}
	if (width !== undefined) {
		outerStyle.width = width
	}
	if (height !== undefined) {
		outerStyle.height = height
	}

	const viewContainerStyle: React.CSSProperties = {}
	if (width !== undefined) {
		viewContainerStyle.width = width
	}
	if (height !== undefined) {
		viewContainerStyle.height = height
	}

	const scrollContainerStyle: React.CSSProperties = {
		height: physicalScrollHeight,
		width: scrollState.scrollWidth > clientWidth ? scrollState.scrollWidth : "100%"
	}

	const physicalFillerOffset = logicalToPhysicalY(scrollState.y) + (fillerOffset - scrollState.y)
	
	return (
		<div style={ outerStyle } className={ clsx(className, `${ prefixCls }-outer-container`) }>
			<div
				ref={ viewContainerRef }
				style={ viewContainerStyle }
				className={ clsx(`${ prefixCls }-inner-container`) }
				onMouseEnter={ delayHideScrollBar }
				onScroll={ onFallbackScroll }
			>
				<div
					ref={ scrollContainerRef }
					style={ scrollContainerStyle }
					className={ clsx(`${ prefixCls }-container`) }
					onScroll={ event => event.preventDefault() }
				>
					{ stickyOverlay }
					{
						cloneElement(
							renderView({
								className: clsx(`${ prefixCls }-wrapper`),
								style: {transform: `translateY(${ physicalFillerOffset }px)`},
								...wrapperAccessibilityProps
							}),
							{},
							listChildren
						)
					}
				</div>
			</div>
			<VerticalScrollBar
				prefixCls={ prefixCls }
				ref={ verticalScrollBarInstance }
				hidden={ scrollBarHidden }
				thumbSize={ {
					height: getSpinSize(clientHeight, scrollHeight),
					width: scrollBarSize
				} }
				renderTrack={ renderTrackVertical }
				renderThumb={ renderThumbVertical }
				autoHideTimeout={ scrollBarAutoHideTimeout }
				scrollState={ scrollState }
				scrollRange={ scrollHeight }
				containerSize={ clientHeight }
				onScroll={ onUpdateScrollState }
			/>
			<HorizontalScrollBar
				prefixCls={ prefixCls }
				ref={ horizontalScrollBarInstance }
				hidden={ scrollBarHidden }
				thumbSize={ {
					width: getSpinSize(clientWidth, scrollState.scrollWidth),
					height: scrollBarSize
				} }
				renderTrack={ renderTrackHorizontal }
				renderThumb={ renderThumbHorizontal }
				autoHideTimeout={ scrollBarAutoHideTimeout }
				scrollState={ scrollState }
				scrollRange={ scrollState.scrollWidth }
				containerSize={ clientWidth }
				onScroll={ onUpdateHorizontalScrollState }
			/>
		</div>
	)
})

export { ScrollBar }
