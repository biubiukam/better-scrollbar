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
import raf from "../raf"
import clsx from "clsx"
import { getPageXY } from "../utils"
import type { ScrollBarProps, ScrollBarRef } from "../types"

export interface ScrollBarComponentProps extends ScrollBarProps {
	/** 滚动条方向 */
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

	// 拖拽状态
	const [dragging, setDragging] = useState<boolean>(false)

	// 当前点击滚动thumb的位置
	const [pageXY, setPageXY] = useState<number>(0)

	// 记录拖拽前的位置
	const [startOffset, setStartOffset] = useState<number>(0)

	// ========================= Refs =========================
	const trackRef = useRef<HTMLDivElement | null>(null)
	const thumbRef = useRef<HTMLDivElement | null>(null)

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
	}, [scrollState[axis], delayHiddenScrollBar])

	// ====================== Container =======================
	const onContainerMouseDown: React.MouseEventHandler = useCallback((event) => {
		event.stopPropagation()
		event.preventDefault()
	}, [])

	// ======================== Range =========================
	// 容器实际滚动长度 = 内容最大长度 - 内容可见长度
	const enableScrollRange = scrollRange - containerSize || 0
	// 可以滚动的长度 = 滚动的容器长度 - 滚动条长度
	const enableOffsetRange = containerSize - thumbSize[sizeProperty] || 0

	// 是否可以滚动
	const canScroll = enableScrollRange > 0

	// ========================= Offset ==========================
	const offset = React.useMemo(() => {
		if (scrollState[axis] === 0 || enableScrollRange === 0) {
			return 0
		}
		const ptg = scrollState[axis] / enableScrollRange
		return ptg * enableOffsetRange
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
			let moveRafId: number

			const onMouseMove = (event: MouseEvent | TouchEvent) => {
				const {
					dragging: stateDragging,
					pageXY: statePageXY,
					startOffset: stateStartOffset
				} = stateRef.current
				raf.cancel(moveRafId)

				if (stateDragging) {
					const eventOffset = getPageXY(event, !isVertical)
					const dragOffset = eventOffset - statePageXY
					let newOffset = stateStartOffset + dragOffset

					const tmpEnableScrollRange = enableScrollRangeRef.current
					const tmpEnableOffsetRange = enableOffsetRangeRef.current

					const ptg: number = tmpEnableOffsetRange ? newOffset / tmpEnableOffsetRange : 0

					let newScrollOffset = Math.ceil(ptg * tmpEnableScrollRange)
					newScrollOffset = Math.max(newScrollOffset, 0)
					newScrollOffset = Math.min(newScrollOffset, tmpEnableScrollRange)

					moveRafId = raf(() => {
						onScroll?.(newScrollOffset)
					})
				}
			}

			const onMouseUp = () => {
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
				raf.cancel(moveRafId)
			}
		}
	}, [dragging, isVertical, onScroll, onStopMove])

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
