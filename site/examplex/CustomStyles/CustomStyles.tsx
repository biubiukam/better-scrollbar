import React, { useCallback, useState } from "react"
import type { HTMLProps, PropsWithChildren } from "react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, ScrollState } from "../../../src"
import {
	FIXED_MILLION_ROW_HEIGHT,
	INITIAL_ITEMS_RENDERED,
	MILLION_ROW_COUNT,
	formatVirtualRange,
	getRenderedCount,
	getToneChannel
} from "../sharedMillion"
import "./index.less"

function CustomStyles() {
	const [tone, setTone] = useState(0)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)

	const onScroll = useCallback((state: ScrollState) => {
		const nextTone = getToneChannel(state)
		setTone((currentTone) => currentTone === nextTone ? currentTone : nextTone)
	}, [])

	const renderThumbVertical = useCallback((props?: PropsWithChildren<HTMLProps<HTMLDivElement>>): React.ReactElement => {
		const thumbStyle = {
			backgroundColor: `rgb(${ tone }, ${ tone }, ${ tone })`
		}

		return (
			<div
				{ ...props }
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
				style={ {...props?.style, ...viewStyle} }
			/>
		)
	}, [tone])

	const renderItem = useCallback((index: number) => {
		return (
			<div className="custom-million-item" style={{height: FIXED_MILLION_ROW_HEIGHT}}>
				<span>#{ (index + 1).toLocaleString() }</span>
				<span>Theme sample { (index % 256) + 1 }</span>
			</div>
		)
	}, [])

	const getItemKey = useCallback((index: number) => `custom-million-${ index }`, [])

	return (
		<div className="custom-million-wrapper">
			<div className="custom-million-head">
				<div>
					<div className="custom-million-title">高度自定义样式</div>
					<div className="custom-million-subtitle">{ MILLION_ROW_COUNT.toLocaleString() } rows / tone { tone }</div>
				</div>
				<div className="custom-million-state">DOM { getRenderedCount(itemsRendered) }</div>
			</div>
			<div className="custom-million-list">
				<VirtualScrollBar
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
			<div className="custom-million-result">
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
