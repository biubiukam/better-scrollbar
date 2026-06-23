import React, {
	useState,
	forwardRef,
	useCallback,
	useEffect,
	useRef,
	useImperativeHandle,
	cloneElement,
	useLayoutEffect
} from "react"
import clsx from "clsx"
import { getPageXY } from "../utils"
import raf from "../raf"
import type { ScrollBarProps, ScrollBarRef } from "../types"

export interface ScrollBarComponentProps extends ScrollBarProps {
	/** Scrollbar orientation. */
	orientation: "vertical" | "horizontal"
}

const ScrollBar = forwardRef<ScrollBarRef, ScrollBarComponentProps>((props, ref) => {
	const {
		scrollState,
		containerSize,
		scrollRange,
		onScroll,
		onStartMove,
		onStopMove,
		prefixCls,
		thumbSize,
		hidden,
		autoHideTimeout,
		renderTrack,
		renderThumb,
		orientation
	} = props

	const isVertical = orientation === "vertical"
	const axis = isVertical ? "y" : "x"
	const sizeProperty = isVertical ? "height" : "width"
	const oppositeSizeProperty = isVertical ? "width" : "height"
	const transformProperty = isVertical ? "translateY" : "translateX"
	const trackClassName = `${prefixCls}-${orientation}-track`
	const thumbClassName = `${prefixCls}-${orientation}-thumb`

	// Dragging state.
	const [dragging, setDragging] = useState<boolean>(false)

	// Pointer position where the current thumb drag started.
	const [pageXY, setPageXY] = useState<number>(0)

	// Scrollbar offset before the current drag started.
	const [startOffset, setStartOffset] = useState<number>(0)

	// ========================= Refs =========================
	const trackRef = useRef<HTMLDivElement | null>(null)
	const thumbRef = useRef<HTMLDivElement | null>(null)
	const onScrollRef = useRef(onScroll)
	const dragScrollRafRef = useRef<number>(-1)
	const pendingDragScrollOffsetRef = useRef<number | null>(null)
	onScrollRef.current = onScroll

	// ======================= Visible ========================
	const [visible, setVisible] = useState(false)
	const visibleTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

	const delayHiddenScrollBar = useCallback(() => {
		clearTimeout(visibleTimeoutRef.current)
		setVisible(true)

		visibleTimeoutRef.current = setTimeout(() => {
			setVisible(false)
		}, autoHideTimeout)
	}, [autoHideTimeout])

	useLayoutEffect(() => {
		delayHiddenScrollBar()
		return () => clearTimeout(visibleTimeoutRef.current)
		// eslint-disable-next-line react-hooks/exhaustive-deps -- computed axis value triggers re-show
	}, [scrollState[axis], delayHiddenScrollBar])

	// ====================== Container =======================
	const onContainerMouseDown: React.MouseEventHandler = useCallback((event) => {
		event.stopPropagation()
		event.preventDefault()
	}, [])

	// ======================== Range =========================
	// Actual scrollable content range equals full content size minus visible size.
	const enableScrollRange = scrollRange - containerSize || 0
	// Available thumb travel range equals track size minus thumb size.
	const enableOffsetRange = containerSize - thumbSize[sizeProperty] || 0

	// Whether the axis has any scrollable overflow.
	const canScroll = enableScrollRange > 0

	// ========================= Offset ==========================
	const offset = React.useMemo(() => {
		if (scrollState[axis] === 0 || enableScrollRange === 0) {
			return 0
		}
		const ptg = scrollState[axis] / enableScrollRange
		return ptg * enableOffsetRange
		// eslint-disable-next-line react-hooks/exhaustive-deps -- computed axis value is the invalidation trigger
	}, [scrollState[axis], enableScrollRange, enableOffsetRange])

	// ======================== Thumb =========================
	const stateRef = useRef({
		offset,
		dragging,
		pageXY,
		startOffset
	})
	stateRef.current = {
		offset,
		dragging,
		pageXY,
		startOffset
	}

	const onThumbMouseDown = useCallback(
		(event: React.MouseEvent | React.TouchEvent | TouchEvent) => {
			setDragging(true)
			setPageXY(getPageXY(event, !isVertical))
			setStartOffset(stateRef.current.offset)

			onStartMove?.()
			event.stopPropagation()
			event.preventDefault()
		},
		[isVertical, onStartMove]
	)

	const onScrollbarTouchStart = useCallback((event: TouchEvent) => {
		event.preventDefault()
	}, [])

	const flushPendingDragScroll = useCallback(() => {
		raf.cancel(dragScrollRafRef.current)
		dragScrollRafRef.current = -1

		const nextScrollOffset = pendingDragScrollOffsetRef.current
		pendingDragScrollOffsetRef.current = null
		if (nextScrollOffset !== null) {
			onScrollRef.current?.(nextScrollOffset)
		}
	}, [])

	const scheduleDragScroll = useCallback((nextScrollOffset: number) => {
		pendingDragScrollOffsetRef.current = nextScrollOffset
		if (dragScrollRafRef.current !== -1) {
			return
		}

		dragScrollRafRef.current = raf(() => {
			dragScrollRafRef.current = -1
			const pendingScrollOffset = pendingDragScrollOffsetRef.current
			pendingDragScrollOffsetRef.current = null
			if (pendingScrollOffset !== null) {
				onScrollRef.current?.(pendingScrollOffset)
			}
		})
	}, [])

	useEffect(() => {
		return () => {
			raf.cancel(dragScrollRafRef.current)
		}
	}, [])

	useEffect(() => {
		const scrollbarEle = trackRef.current
		const thumbEle = thumbRef.current

		if (scrollbarEle && thumbEle) {
			scrollbarEle.addEventListener("touchstart", onScrollbarTouchStart)
			thumbEle.addEventListener("touchstart", onThumbMouseDown)

			return () => {
				scrollbarEle.removeEventListener("touchstart", onScrollbarTouchStart)
				thumbEle.removeEventListener("touchstart", onThumbMouseDown)
			}
		}
	}, [onScrollbarTouchStart, onThumbMouseDown])

	// Pass to effect
	const enableScrollRangeRef = React.useRef<number>(0)
	enableScrollRangeRef.current = enableScrollRange
	const enableOffsetRangeRef = React.useRef<number>(0)
	enableOffsetRangeRef.current = enableOffsetRange

	useEffect(() => {
		if (dragging) {
			const onMouseMove = (event: MouseEvent | TouchEvent) => {
				const {
					dragging: stateDragging,
					pageXY: statePageXY,
					startOffset: stateStartOffset
				} = stateRef.current

				if (stateDragging) {
					const eventOffset = getPageXY(event, !isVertical)
					const dragOffset = eventOffset - statePageXY
					const newOffset = stateStartOffset + dragOffset

					const tmpEnableScrollRange = enableScrollRangeRef.current
					const tmpEnableOffsetRange = enableOffsetRangeRef.current

					const ptg: number = tmpEnableOffsetRange ? newOffset / tmpEnableOffsetRange : 0

					let newScrollOffset = Math.ceil(ptg * tmpEnableScrollRange)
					newScrollOffset = Math.max(newScrollOffset, 0)
					newScrollOffset = Math.min(newScrollOffset, tmpEnableScrollRange)
					scheduleDragScroll(newScrollOffset)
				}
			}

			const onMouseUp = () => {
				flushPendingDragScroll()
				setDragging(false)
				onStopMove?.()
			}

			window.addEventListener("mousemove", onMouseMove)
			window.addEventListener("touchmove", onMouseMove)
			window.addEventListener("mouseup", onMouseUp)
			window.addEventListener("touchend", onMouseUp)

			return () => {
				window.removeEventListener("mousemove", onMouseMove)
				window.removeEventListener("touchmove", onMouseMove)
				window.removeEventListener("mouseup", onMouseUp)
				window.removeEventListener("touchend", onMouseUp)
			}
		}
	}, [dragging, flushPendingDragScroll, isVertical, onStopMove, scheduleDragScroll])

	// ====================== Imperative ======================
	useImperativeHandle(ref, () => ({
		delayHiddenScrollBar
	}))

	const trackStyles: React.CSSProperties = {
		visibility: !hidden && visible && canScroll ? undefined : "hidden",
		[oppositeSizeProperty]: thumbSize[oppositeSizeProperty]
	}

	const thumbStyles: React.CSSProperties = {
		transform: `${transformProperty}(${offset}px)`,
		[sizeProperty]: thumbSize[sizeProperty]
	}

	return cloneElement(
		renderTrack({
			style: trackStyles,
			className: clsx(trackClassName)
		}),
		{
			ref: trackRef,
			onMouseDown: onContainerMouseDown,
			onMouseMove: delayHiddenScrollBar
		},
		cloneElement(
			renderThumb({
				style: thumbStyles,
				className: clsx(thumbClassName)
			}),
			{
				ref: thumbRef,
				onMouseDown: onThumbMouseDown
			}
		)
	)
})

export default ScrollBar
