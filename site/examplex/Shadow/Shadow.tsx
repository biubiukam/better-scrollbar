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
import { cn, demoTw } from "../tailwind"

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
			<div className={ cn("shadow-million-item", demoTw.row) } style={{height: getFixedMillionRowHeight()}}>
				<span className={ demoTw.rowIndex }>#{ (index + 1).toLocaleString() }</span>
				<span className={ demoTw.rowTitle }>Row group { (index % 128) + 1 }</span>
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
		<div className={ cn("shadow-million-wrapper", demoTw.shell) }>
			<div className={ cn("shadow-million-head", demoTw.head) }>
				<div>
					<div className={ cn("shadow-million-title", demoTw.title) }>阴影滚动条</div>
					<div className={ cn("shadow-million-subtitle", demoTw.subtitle) }>{ MILLION_ROW_COUNT.toLocaleString() } rows / { FIXED_MILLION_ROW_HEIGHT }px fixed height</div>
				</div>
				<div className={ cn("shadow-million-state", demoTw.state, scrollState.isScrolling && "is-active", scrollState.isScrolling && demoTw.stateActive) }>
					{ scrollState.isScrolling ? "Scrolling" : "Idle" }
				</div>
			</div>
			<div className={ cn("shadow-million-list", demoTw.listTall, "relative") }>
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
				<div ref={ shadowTop } className="shadow-million-top pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-foreground/20 to-transparent opacity-0 transition-opacity duration-100"/>
				<div ref={ shadowBottom } className="shadow-million-bottom pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity duration-100"/>
			</div>
			<div className={ cn("shadow-million-result", demoTw.result) }>
				<span>DOM: { getRenderedCount(itemsRendered) }</span>
				<span>Visible: { formatVirtualRange({
					startIndex: itemsRendered.visibleStartIndex,
					endIndex: itemsRendered.visibleEndIndex
				}) }</span>
				<span>Y: { Math.round(scrollState.y).toLocaleString() }</span>
				<div className="shadow-million-jumps ml-auto flex items-center gap-1.5">
					{ MILLION_JUMP_POINTS.map((point) => (
						<button className={ demoTw.button } key={ point.label } type="button" onClick={ () => jumpToRatio(point.ratio) }>
							{ point.label }
						</button>
					)) }
				</div>
			</div>
		</div>
	)
}

export default Shadow
