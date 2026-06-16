import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	Children, forwardRef, useImperativeHandle, cloneElement
} from "react"
import type { PropsWithChildren } from "react"
import raf from "./raf"
import { useImmer } from "use-immer"
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
import { createVirtualHeightIndex, VirtualOverscanRange } from "./virtualRange"
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
type ScrollDirection = -1 | 0 | 1
interface ScrollAnchorSnapshot {
	key: React.Key
	index: number
	offsetWithin: number
	scrollY: number
	scrollHeight: number
	maxScrollHeight: number
	itemCount: number
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
	const max = Math.max(options.max === undefined ? Math.max(baseOverscan, min) : toSafeOverscan(options.max), min)
	const velocityFactor = options.velocityFactor === undefined ? 0.02 : Math.max(options.velocityFactor, 0)

	return {min, max, velocityFactor}
}

function getEffectiveOverscan(
	baseOverscan: number,
	adaptiveOptions: Required<AdaptiveOverscanOptions> | null,
	direction: ScrollDirection,
	delta: number
): number | VirtualOverscanRange {
	if (!adaptiveOptions || direction === 0 || delta <= 0) {
		return baseOverscan
	}

	const dynamicOverscan = Math.min(
		Math.max(baseOverscan + Math.ceil(delta * adaptiveOptions.velocityFactor), adaptiveOptions.min),
		adaptiveOptions.max
	)

	if (direction > 0) {
		return {before: baseOverscan, after: dynamicOverscan}
	}

	return {before: dynamicOverscan, after: baseOverscan}
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
		overscan = 1,
		adaptiveOverscan = false,
		maintainVisibleContentPosition = true,
		followOutput = false,
		followOutputThreshold = 1,
		preserveItemState = false,
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

		return (typeof children === "function" ? [children] : Children.toArray(children)) as Array<React.ReactElement>
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
	// 滚动条
	const verticalScrollBarInstance = useRef<ScrollBarRef>({} as ScrollBarRef)
	const horizontalScrollBarInstance = useRef<ScrollBarRef>({} as ScrollBarRef)
	const {setInstanceRef, collectHeight, pruneHeights, getHeightsByIndex, updatedMark} = useHeights()
	
	const [scrollState, setScrollState] = useImmer<ScrollState>({
		x: 0,
		y: 0,
		scrollHeight: 0,
		scrollWidth: 0,
		clientHeight: 0,
		clientWidth: 0,
		isScrolling: false
	})
	
	useResizeObserver(viewContainerRef, (newSize) => {
		setScrollState((preScrollState) => {
			preScrollState.clientHeight = newSize.height
			preScrollState.clientWidth = newSize.width
		})
	})

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
	const scrollActivityRef = useRef<{direction: ScrollDirection, delta: number}>({direction: 0, delta: 0})
	const adaptiveOverscanOptions = useMemo(() => {
		return getAdaptiveOverscanOptions(adaptiveOverscan, baseOverscan)
	}, [adaptiveOverscan, baseOverscan])
	const effectiveOverscan = useMemo(() => {
		return getEffectiveOverscan(
			baseOverscan,
			adaptiveOverscanOptions,
			scrollActivityRef.current.direction,
			scrollActivityRef.current.delta
		)
	}, [adaptiveOverscanOptions, baseOverscan, scrollState.isScrolling, scrollState.y])

	const heightIndex = useMemo(() => {
		return createVirtualHeightIndex({
			itemCount: totalItemCount,
			estimatedItemHeight,
			measuredHeights: getHeightsByIndex(totalItemCount)
		})
	}, [estimatedItemHeight, getHeightsByIndex, totalItemCount, updatedMark])
	
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

		if (!isVirtual) {
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
			overscan: effectiveOverscan
		})
	}, [clientHeight, effectiveOverscan, heightIndex, isVirtual, scrollState.y, totalItemCount])

	useEffect(() => {
		onItemsRendered?.({
			startIndex: start,
			endIndex: end,
			visibleStartIndex,
			visibleEndIndex
		})
	}, [end, onItemsRendered, start, visibleEndIndex, visibleStartIndex])
	
	useEffect(() => {
		setScrollState((preScrollState) => {
			preScrollState.scrollHeight = scrollHeight
		})
	}, [scrollHeight])
	
	const maxScrollHeight = Math.max(scrollHeight - clientHeight, 0)
	const maxScrollHeightRef = useRef(maxScrollHeight)
	maxScrollHeightRef.current = maxScrollHeight

	const physicalScrollHeight = scrollHeight > MAX_BROWSER_SCROLL_HEIGHT
		? Math.max(clientHeight, MAX_BROWSER_SCROLL_HEIGHT)
		: scrollHeight
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
			scrollActivityRef.current = {direction: 0, delta: 0}
			setScrollState((preScrollState) => {
				preScrollState.isScrolling = false
			})
		}, 200)
	}, [])

	useEffect(() => {
		return () => clearTimeout(detectScrollingInterval.current)
	}, [])

	const resolveOffset = useCallback((nextOffset: ScrollOffsetUpdater, preOffset: number) => {
		return typeof nextOffset === "function" ? nextOffset(preOffset) : nextOffset
	}, [])

	const syncedNativeScrollRef = useRef<{ x: number, y: number } | null>(null)
	const syncNativeScrollOffset = useCallback((nextX: number, nextY: number) => {
		const viewContainer = viewContainerRef.current
		if (!viewContainer) {
			return
		}

		const nextPhysicalY = logicalToPhysicalY(nextY)
		syncedNativeScrollRef.current = {x: nextX, y: nextPhysicalY}
		viewContainer.scrollLeft = nextX
		viewContainer.scrollTop = nextPhysicalY
	}, [logicalToPhysicalY])

	const onUpdateScrollOffset = useCallback((offset: Partial<Record<"x" | "y", ScrollOffsetUpdater>>) => {
		setScrollState((preScrollState) => {
			const nextX = offset.x === undefined
				? preScrollState.x
				: keepInHorizontalRange(resolveOffset(offset.x, preScrollState.x))
			const nextY = offset.y === undefined
				? preScrollState.y
				: keepInVerticalRange(resolveOffset(offset.y, preScrollState.y))
			const nextYDelta = nextY - preScrollState.y
			scrollActivityRef.current = {
				direction: nextYDelta > 0 ? 1 : nextYDelta < 0 ? -1 : 0,
				delta: Math.abs(nextYDelta)
			}

			preScrollState.x = nextX
			preScrollState.y = nextY
			preScrollState.isScrolling = true

			syncNativeScrollOffset(nextX, nextY)
		})

		delayScrollStateChange()
	}, [delayScrollStateChange, keepInHorizontalRange, keepInVerticalRange, resolveOffset, syncNativeScrollOffset])

	useLayoutEffect(() => {
		syncNativeScrollOffset(scrollState.x, scrollState.y)
	}, [physicalScrollHeight, scrollState.x, scrollState.y, syncNativeScrollOffset])

	const anchorSnapshotRef = useRef<ScrollAnchorSnapshot | null>(null)
	const anchorVersionRef = useRef<{
		heightIndex: typeof heightIndex,
		childKeys?: React.Key[],
		totalItemCount: number
	} | null>(null)

	const resolveAnchorIndex = useCallback((anchor: ScrollAnchorSnapshot) => {
		if (childKeys) {
			return childKeys.indexOf(anchor.key)
		}

		if (anchor.index >= 0 && anchor.index < totalItemCount) {
			return anchor.index
		}

		return -1
	}, [childKeys, totalItemCount])

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
			previousVersion.totalItemCount !== totalItemCount

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
					setScrollState((preScrollState) => {
						preScrollState.y = safeNextY
					})
					syncNativeScrollOffset(scrollState.x, safeNextY)
					anchorVersionRef.current = {heightIndex, childKeys, totalItemCount}
					return
				}
			}
		}

		anchorSnapshotRef.current = getAnchorSnapshot()
		anchorVersionRef.current = {heightIndex, childKeys, totalItemCount}
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
		setScrollState,
		syncNativeScrollOffset,
		totalItemCount
	])

	const onUpdateScrollState = useCallback((scrollTop: ScrollOffsetUpdater) => {
		onUpdateScrollOffset({y: scrollTop})
	}, [onUpdateScrollOffset])

	const onUpdateHorizontalScrollState = useCallback((scrollLeft: ScrollOffsetUpdater) => {
		onUpdateScrollOffset({x: scrollLeft})
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
	
	const wheelingRaf = useRef<number>(-1)
	const wheelOffsetRef = useRef({x: 0, y: 0})
	
	useEffect(() => {
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

			if (shouldScrollHorizontal) {
				wheelOffsetRef.current.x += scrollOffset
			} else {
				wheelOffsetRef.current.y += scrollOffset
			}

			raf.cancel(wheelingRaf.current)
			
			wheelingRaf.current = raf(() => {
				const {x: scrollLeftOffset, y: scrollTopOffset} = wheelOffsetRef.current
				wheelOffsetRef.current = {x: 0, y: 0}
				collectHeight()

				if (scrollLeftOffset || scrollTopOffset) {
					onUpdateScrollOffset({
						...(scrollLeftOffset
							? {x: (preScrollStateX: number) => keepInHorizontalRange(preScrollStateX + scrollLeftOffset)}
							: {}),
						...(scrollTopOffset
							? {y: (preScrollStateY: number) => keepInVerticalRange(preScrollStateY + scrollTopOffset)}
							: {})
					})
				}
			})
		}
		const scrollContainer = scrollContainerRef.current;
		scrollContainer?.addEventListener("wheel", onScroll)
		return () => {
			scrollContainer?.removeEventListener("wheel", onScroll)
			raf.cancel(wheelingRaf.current)
		}
	}, [collectHeight, keepInHorizontalRange, keepInVerticalRange, onUpdateScrollOffset])
	
	const shouldPreserveItemState = preserveItemState && !useIndexedRendering

	const listChildren = useMemo(() => {
		const renderedNodes: React.ReactElement[] = []
		const renderStart = shouldPreserveItemState ? 0 : start
		const renderEnd = shouldPreserveItemState ? totalItemCount - 1 : end

		for (let index = renderStart; index <= renderEnd; index++) {
			const node = useIndexedRendering ? renderItem?.(index) : childNodes[index]
			if (!node) {
				continue
			}

			const key = getItemKey(index)
			const hidden = shouldPreserveItemState && (index < start || index > end)
			renderedNodes.push(
				<Item
					key={ key }
					hidden={ hidden }
					useWrapper={ shouldPreserveItemState }
					setRef={ (ele) => setInstanceRef(key, index, ele) }
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
		renderItem,
		setInstanceRef,
		shouldPreserveItemState,
		start,
		totalItemCount,
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

		setScrollState((preScrollState) => {
			if (preScrollState.scrollWidth !== nextScrollWidth) {
				preScrollState.scrollWidth = nextScrollWidth
			}
		})
	}, [clientWidth])

	useLayoutEffect(() => {
		collectScrollWidth()
	}, [collectScrollWidth, listChildren, scrollHeight])
	
	const delayHideScrollBar = useCallback(() => {
		verticalScrollBarInstance.current?.delayHiddenScrollBar()
		horizontalScrollBarInstance.current?.delayHiddenScrollBar()
	}, [])
	
	// 当数据大小减小时。它可能会触发本地滚动事件以适应滚动位置
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
		if (Math.abs(newScrollLeft - scrollState.x) > 0.5 || Math.abs(newScrollTop - scrollState.y) > 0.5) {
			onUpdateScrollOffset({
				x: newScrollLeft,
				y: newScrollTop
			})
		}
	}, [onUpdateScrollOffset, physicalToLogicalY, scrollState.x, scrollState.y])
	
	useImperativeHandle(ref, (): VirtualScrollBarRef => {
		return {
			scrollTo(offset: ScrollOffset) {
				onUpdateScrollOffset({
					x: offset.x,
					y: offset.y
				})
			},
			getScrollState() {
				return scrollState
			},
			resizeObserver(callback) {
				callback({
					clientWidth: scrollState.clientWidth,
					clientHeight: scrollState.clientHeight,
					scrollWidth: scrollState.scrollWidth,
					scrollHeight: scrollState.scrollHeight,
				})
			}
		}
	}, [onUpdateScrollOffset, scrollState])

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
					{
						cloneElement(
							renderView({
								className: clsx(`${ prefixCls }-wrapper`),
								style: {transform: `translateY(${ physicalFillerOffset }px)`}
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
