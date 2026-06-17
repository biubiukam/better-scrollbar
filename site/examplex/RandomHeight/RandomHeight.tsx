import React, { useCallback, useLayoutEffect, useRef, useState } from "react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, VirtualScrollBarRef } from "../../../src"
import {
	ESTIMATED_MILLION_ROW_HEIGHT,
	INITIAL_ITEMS_RENDERED,
	MILLION_JUMP_POINTS,
	MILLION_ROW_COUNT,
	formatVirtualRange,
	getJumpOffset,
	getMillionRowHeight,
	getMillionRowStatus,
	getMillionRowTone,
	getRenderedCount,
	useRafScrollState
} from "../sharedMillion"
import "./index.less"

function RandomHeight() {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const pendingScrollYRef = useRef<number | null>(null)
	const [itemCount, setItemCount] = useState(MILLION_ROW_COUNT)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useRafScrollState()

	useLayoutEffect(() => {
		if (pendingScrollYRef.current === null) {
			return
		}

		const nextY = pendingScrollYRef.current
		pendingScrollYRef.current = null
		ref.current?.scrollTo({x: 0, y: nextY})
	}, [itemCount])

	const removeAt = useCallback(() => {
		pendingScrollYRef.current = ref.current?.getScrollState().y || 0
		setItemCount((count) => Math.max(count - 1, 0))
	}, [])

	const insertBefore = useCallback((index: number) => {
		const height = getMillionRowHeight(index)
		const scrollY = ref.current?.getScrollState().y || 0

		pendingScrollYRef.current = scrollY + height
		setItemCount((count) => count + 1)
	}, [])

	const insertAfter = useCallback(() => {
		pendingScrollYRef.current = ref.current?.getScrollState().y || 0
		setItemCount((count) => count + 1)
	}, [])

	const renderItem = useCallback((index: number) => {
		const height = getMillionRowHeight(index)
		const rowTone = getMillionRowTone(index)

		return (
			<div className={ `random-million-item random-million-item--${ rowTone }` } style={{height}}>
				<div className="random-million-main">
					<span className="random-million-index">#{ (index + 1).toLocaleString() }</span>
					<span>{ getMillionRowStatus(index) }</span>
					<span>{ height }px</span>
				</div>
				<div className="random-million-actions">
					<button type="button" className="is-danger" onClick={ removeAt }>Remove</button>
					<button type="button" onClick={ () => insertBefore(index) }>Before</button>
					<button type="button" onClick={ insertAfter }>After</button>
				</div>
			</div>
		)
	}, [insertAfter, insertBefore, removeAt])

	const getItemKey = useCallback((index: number) => `random-million-${ index }`, [])

	const jumpToRatio = useCallback((ratio: number) => {
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(scrollState.scrollHeight, scrollState.clientHeight, ratio)
		})
	}, [scrollState.clientHeight, scrollState.scrollHeight])

	return (
		<div className="random-million-wrapper">
			<div className="random-million-head">
				<div>
					<div className="random-million-title">动态高度</div>
					<div className="random-million-subtitle">{ MILLION_ROW_COUNT.toLocaleString() } rows / indexed render</div>
				</div>
				<div className={ `random-million-state ${ scrollState.isScrolling ? "is-active" : "" }` }>
					{ scrollState.isScrolling ? "Scrolling" : "Idle" }
				</div>
			</div>
			<div className="random-million-metrics">
				<div>
					<span>总行数</span>
					<strong>{ itemCount.toLocaleString() }</strong>
				</div>
				<div>
					<span>当前 DOM</span>
					<strong>{ getRenderedCount(itemsRendered) }</strong>
				</div>
				<div>
					<span>可见范围</span>
					<strong>{ formatVirtualRange({
						startIndex: itemsRendered.visibleStartIndex,
						endIndex: itemsRendered.visibleEndIndex
					}) }</strong>
				</div>
			</div>
			<div className="random-million-list">
				<VirtualScrollBar
					ref={ ref }
					itemCount={ itemCount }
					itemKey={ getItemKey }
					estimatedItemHeight={ ESTIMATED_MILLION_ROW_HEIGHT }
					overscan={ 6 }
					renderItem={ renderItem }
					onScroll={ setScrollState }
					onItemsRendered={ setItemsRendered }
				/>
			</div>
			<div className="random-million-toolbar">
				<span>Y: { Math.round(scrollState.y).toLocaleString() }</span>
				<span>Height: { Math.round(scrollState.scrollHeight).toLocaleString() }</span>
				<div className="random-million-jumps">
					{ MILLION_JUMP_POINTS.map((point) => (
						<button key={ point.label } type="button" onClick={ () => jumpToRatio(point.ratio) }>
							{ point.label }
						</button>
					)) }
				</div>
			</div>
		</div>
	)
}

export default RandomHeight
