import React, { useCallback, useRef, useState } from "react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, ScrollState, VirtualScrollBarRef } from "../../../src"
import {
	FIXED_MILLION_ROW_HEIGHT,
	INITIAL_ITEMS_RENDERED,
	MILLION_JUMP_POINTS,
	MILLION_ROW_COUNT,
	formatVirtualRange,
	getFixedMillionRowHeight,
	getJumpOffset,
	getRenderedCount,
	useRafScrollState
} from "../sharedMillion"
import "./index.less"

function Shadow() {
	const shadowTop = useRef<HTMLDivElement>(null)
	const shadowBottom = useRef<HTMLDivElement>(null)
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useRafScrollState()

	const updateShadow = useCallback((state: ScrollState) => {
		const bottomScrollTop = state.scrollHeight - state.clientHeight
		const shadowTopOpacity = Math.min(state.y, 20) / 20
		const shadowBottomOpacity = (bottomScrollTop - Math.max(state.y, bottomScrollTop - 20)) / 20

		if (shadowTop.current) {
			shadowTop.current.style.opacity = `${ Math.max(shadowTopOpacity, 0) }`
		}
		if (shadowBottom.current) {
			shadowBottom.current.style.opacity = `${ Math.max(shadowBottomOpacity, 0) }`
		}
	}, [])

	const onScroll = useCallback((state: ScrollState) => {
		updateShadow(state)
		setScrollState(state)
	}, [setScrollState, updateShadow])

	const renderItem = useCallback((index: number) => {
		return (
			<div className="shadow-million-item" style={{height: getFixedMillionRowHeight()}}>
				<span>#{ (index + 1).toLocaleString() }</span>
				<span>Row group { (index % 128) + 1 }</span>
			</div>
		)
	}, [])

	const getItemKey = useCallback((index: number) => `shadow-million-${ index }`, [])

	const jumpToRatio = useCallback((ratio: number) => {
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(scrollState.scrollHeight, scrollState.clientHeight, ratio)
		})
	}, [scrollState.clientHeight, scrollState.scrollHeight])

	return (
		<div className="shadow-million-wrapper">
			<div className="shadow-million-head">
				<div>
					<div className="shadow-million-title">阴影滚动条</div>
					<div className="shadow-million-subtitle">{ MILLION_ROW_COUNT.toLocaleString() } rows / { FIXED_MILLION_ROW_HEIGHT }px fixed height</div>
				</div>
				<div className={ `shadow-million-state ${ scrollState.isScrolling ? "is-active" : "" }` }>
					{ scrollState.isScrolling ? "Scrolling" : "Idle" }
				</div>
			</div>
			<div className="shadow-million-list">
				<VirtualScrollBar
					ref={ ref }
					itemCount={ MILLION_ROW_COUNT }
					itemKey={ getItemKey }
					itemHeight={ FIXED_MILLION_ROW_HEIGHT }
					estimatedItemHeight={ FIXED_MILLION_ROW_HEIGHT }
					overscan={ 4 }
					renderItem={ renderItem }
					onScroll={ onScroll }
					onItemsRendered={ setItemsRendered }
				/>
				<div ref={ shadowTop } className="shadow-million-top"/>
				<div ref={ shadowBottom } className="shadow-million-bottom"/>
			</div>
			<div className="shadow-million-result">
				<span>DOM: { getRenderedCount(itemsRendered) }</span>
				<span>Visible: { formatVirtualRange({
					startIndex: itemsRendered.visibleStartIndex,
					endIndex: itemsRendered.visibleEndIndex
				}) }</span>
				<span>Y: { Math.round(scrollState.y).toLocaleString() }</span>
				<div className="shadow-million-jumps">
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

export default Shadow
