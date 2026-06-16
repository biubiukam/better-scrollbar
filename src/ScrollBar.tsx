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
import { ScrollOffset, ScrollState, VirtualScrollBarProps, VirtualScrollBarRef, ScrollBarRef } from "./types"
import useResizeObserver from "./hooks/useResizeObserver"
import clsx from "clsx"
import {
	renderViewDefault,
	renderTrackHorizontalDefault,
	renderTrackVerticalDefault,
	renderThumbHorizontalDefault,
	renderThumbVerticalDefault
} from "./defaultRenderElements"

type ScrollOffsetUpdater = number | ((preOffset: number) => number)

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
		itemHeight = 20,
		estimatedItemHeight = itemHeight,
		overscan = 1,
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
	
	const childNodes = useMemo(() => {
		return (typeof children === "function" ? [children] : Children.toArray(children)) as Array<React.ReactElement>
	}, [children])
	
	// 可见视图区域
	const viewContainerRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	// 滚动区域
	const scrollContainerRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	// 滚动条
	const verticalScrollBarInstance = useRef<ScrollBarRef>({} as ScrollBarRef)
	const horizontalScrollBarInstance = useRef<ScrollBarRef>({} as ScrollBarRef)
	const {setInstanceRef, collectHeight, pruneHeights, heights, updatedMark} = useHeights()
	
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
		return childNodes.map((node) => node?.key as React.Key)
	}, [childNodes])

	useLayoutEffect(() => {
		pruneHeights(childKeys)
	}, [childKeys, pruneHeights])

	const clientHeight = scrollState.clientHeight || (typeof height === "number" ? height : 0)
	const clientWidth = scrollState.clientWidth || (typeof width === "number" ? width : 0)
	
	const {
		scrollHeight,
		start,
		end,
		visibleStartIndex,
		visibleEndIndex,
		offset: fillerOffset
	} = useMemo(() => {
		let itemTop = 0
		let visibleStart: number | undefined
		let visibleEnd: number | undefined
		const itemOffsets: number[] = []
		const safeEstimatedItemHeight = Math.max(estimatedItemHeight, 1)
		const safeOverscan = Math.max(overscan, 0)
		
		for (let i = 0, len = childNodes.length; i < len; i++) {
			const key = childNodes[i]?.key as React.Key
			
			const cacheHeight = heights.get(key)
			const itemOffset = itemTop
			const currentItemBottom = itemTop + (cacheHeight === undefined ? safeEstimatedItemHeight : cacheHeight)
			itemOffsets[i] = itemOffset
			
			// 选中范围中的顶部项目
			if (currentItemBottom > scrollState.y && visibleStart === undefined) {
				visibleStart = i
			}
			
			if (currentItemBottom >= scrollState.y + clientHeight && visibleEnd === undefined) {
				visibleEnd = i
			}
			
			itemTop = currentItemBottom
		}

		const lastIndex = childNodes.length - 1
		if (lastIndex < 0) {
			return {
				scrollHeight: itemTop,
				start: 0,
				end: -1,
				visibleStartIndex: 0,
				visibleEndIndex: -1,
				offset: 0,
			}
		}

		if (!isVirtual) {
			return {
				scrollHeight: itemTop,
				start: 0,
				end: lastIndex,
				visibleStartIndex: 0,
				visibleEndIndex: lastIndex,
				offset: 0,
			}
		}

		// 当滚动顶部在末尾，但数据被剪切到小计数时，将达到此值
		if (visibleStart === undefined) {
			visibleStart = 0
			visibleEnd = Math.min(Math.ceil(clientHeight / safeEstimatedItemHeight) - 1, lastIndex)
		}
		if (visibleEnd === undefined) {
			visibleEnd = lastIndex
		}
		
		const startIndex = Math.max(visibleStart - safeOverscan, 0)
		const endIndex = Math.min(visibleEnd + safeOverscan, lastIndex)
		return {
			scrollHeight: itemTop,
			start: startIndex,
			end: endIndex,
			visibleStartIndex: visibleStart,
			visibleEndIndex: visibleEnd,
			offset: itemOffsets[startIndex] || 0,
		}
	}, [childNodes, clientHeight, estimatedItemHeight, heights, isVirtual, overscan, scrollState.y, updatedMark])

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

	const onUpdateScrollOffset = useCallback((offset: Partial<Record<"x" | "y", ScrollOffsetUpdater>>) => {
		setScrollState((preScrollState) => {
			const nextX = offset.x === undefined
				? preScrollState.x
				: keepInHorizontalRange(resolveOffset(offset.x, preScrollState.x))
			const nextY = offset.y === undefined
				? preScrollState.y
				: keepInVerticalRange(resolveOffset(offset.y, preScrollState.y))

			preScrollState.x = nextX
			preScrollState.y = nextY
			preScrollState.isScrolling = true

			if (viewContainerRef.current) {
				viewContainerRef.current.scrollLeft = nextX
				viewContainerRef.current.scrollTop = nextY
			}
		})

		delayScrollStateChange()
	}, [delayScrollStateChange, keepInHorizontalRange, keepInVerticalRange, resolveOffset])

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
	
	const listChildren = useMemo(() => {
		return childNodes.slice(start, end + 1).map((node) => {
			return (
				<Item key={ node?.key } setRef={ (ele) => setInstanceRef(node, ele) }>
					{ node }
				</Item>
			)
		})
	}, [childNodes, start, end, setInstanceRef])

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
		const {scrollLeft: newScrollLeft, scrollTop: newScrollTop} = event.currentTarget
		if (newScrollLeft !== scrollState.x || newScrollTop !== scrollState.y) {
			onUpdateScrollOffset({
				x: newScrollLeft,
				y: newScrollTop
			})
		}
	}, [onUpdateScrollOffset, scrollState.x, scrollState.y])
	
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
		height: scrollHeight,
		width: scrollState.scrollWidth > clientWidth ? scrollState.scrollWidth : "100%"
	}
	
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
								style: {transform: `translateY(${ fillerOffset }px)`}
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
