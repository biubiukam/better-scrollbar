import React, { useCallback, useRef, useState } from "react"
import type { HTMLProps, PropsWithChildren } from "react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, ScrollState, VirtualScrollBarRef } from "../../../src"
import {
	FIXED_MILLION_ROW_HEIGHT,
	INITIAL_ITEMS_RENDERED,
	MILLION_JUMP_POINTS,
	MILLION_ROW_COUNT,
	formatVirtualRange,
	getJumpOffset,
	getRenderedCount,
	getToneChannel
} from "../sharedMillion"
import { cn, demoTw } from "../tailwind"

function CustomStyles() {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const scrollStateRef = useRef<ScrollState>({
		x: 0,
		y: 0,
		isScrolling: false,
		scrollHeight: 0,
		scrollWidth: 0,
		clientWidth: 0,
		clientHeight: 0
	})
	const [tone, setTone] = useState(0)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)

	const onScroll = useCallback((state: ScrollState) => {
		scrollStateRef.current = state
		const nextTone = getToneChannel(state)
		setTone((currentTone) => currentTone === nextTone ? currentTone : nextTone)
	}, [])

	const jumpToRatio = useCallback((ratio: number) => {
		const scrollState = scrollStateRef.current
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(scrollState.scrollHeight, scrollState.clientHeight, ratio)
		})
	}, [])

	const renderThumbVertical = useCallback((props?: PropsWithChildren<HTMLProps<HTMLDivElement>>): React.ReactElement => {
		const thumbStyle = {
			backgroundColor: `rgb(${ tone }, ${ tone }, ${ tone })`
		}

		return (
			<div
				{ ...props }
				className={ cn(props?.className, "rounded-[inherit]") }
				style={ {...props?.style, ...thumbStyle} }
			/>
		)
	}, [tone])

	const renderView = useCallback((props?: PropsWithChildren<HTMLProps<HTMLDivElement>>): React.ReactElement => {
		const viewStyle = {
			color: `rgb(${ tone }, ${ tone }, ${ tone })`,
			backgroundColor: `rgb(${ 255 - tone }, ${ 255 - tone }, ${ 255 - tone })`
		}

		return (
			<div
				{ ...props }
				className={ cn(props?.className, "transition-colors duration-150") }
				style={ {...props?.style, ...viewStyle} }
			/>
		)
	}, [tone])

	const renderItem = useCallback((index: number) => {
		return (
			<div className={ cn("custom-million-item", demoTw.row, "select-none border-t-foreground/10") } style={{height: FIXED_MILLION_ROW_HEIGHT}}>
				<span className={ demoTw.rowIndex }>#{ (index + 1).toLocaleString() }</span>
				<span className={ demoTw.rowTitle }>Theme sample { (index % 256) + 1 }</span>
			</div>
		)
	}, [])

	const getItemKey = useCallback((index: number) => `custom-million-${ index }`, [])

	return (
		<div className={ cn("custom-million-wrapper", demoTw.shell) }>
			<div className={ cn("custom-million-head", demoTw.head) }>
				<div>
					<div className={ cn("custom-million-title", demoTw.title) }>高度自定义样式</div>
					<div className={ cn("custom-million-subtitle", demoTw.subtitle) }>{ MILLION_ROW_COUNT.toLocaleString() } rows / tone { tone }</div>
				</div>
				<div className={ cn("custom-million-state", demoTw.state) }>DOM { getRenderedCount(itemsRendered) }</div>
			</div>
			<div className={ cn("custom-million-list", demoTw.listTall) }>
				<VirtualScrollBar
					ref={ ref }
					itemCount={ MILLION_ROW_COUNT }
					itemKey={ getItemKey }
					itemHeight={ FIXED_MILLION_ROW_HEIGHT }
					estimatedItemHeight={ FIXED_MILLION_ROW_HEIGHT }
					overscan={ 4 }
					renderItem={ renderItem }
					renderView={ renderView }
					renderThumbVertical={ renderThumbVertical }
					onScroll={ onScroll }
					onItemsRendered={ setItemsRendered }
				/>
			</div>
			<div className={ cn("custom-million-toolbar", demoTw.toolbar, "border-t-0 pt-2.5") }>
				{ MILLION_JUMP_POINTS.map((point) => (
					<button className={ demoTw.button } key={ point.label } type="button" onClick={ () => jumpToRatio(point.ratio) }>
						{ point.label }
					</button>
				)) }
			</div>
			<div className={ cn("custom-million-result", demoTw.result) }>
				<span>Total: { MILLION_ROW_COUNT.toLocaleString() }</span>
				<span>Visible: { formatVirtualRange({
					startIndex: itemsRendered.visibleStartIndex,
					endIndex: itemsRendered.visibleEndIndex
				}) }</span>
				<span>Rendered: { formatVirtualRange(itemsRendered) }</span>
			</div>
		</div>
	)
}

export default CustomStyles
