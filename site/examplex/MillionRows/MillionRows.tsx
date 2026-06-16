import React, { useCallback, useEffect, useRef, useState } from "react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, ScrollState, VirtualScrollBarRef } from "../../../src"
import {
	ESTIMATED_MILLION_ROW_HEIGHT,
	MILLION_JUMP_POINTS,
	MILLION_ROW_COUNT,
	PROGRESS_SCALE,
	getJumpOffset,
	getMillionRowHeight,
	getMillionRowStatus,
	getMillionRowTone,
	getOffsetFromProgress,
	getProgressValue,
	getRenderedCount
} from "./utils"
import "./index.less"

const INITIAL_ITEMS_RENDERED: ItemsRenderedInfo = {
	startIndex: 0,
	endIndex: -1,
	visibleStartIndex: 0,
	visibleEndIndex: -1
}

function MillionRows() {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [fps, setFps] = useState(0)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useState<ScrollState>({
		x: 0,
		y: 0,
		isScrolling: false,
		scrollHeight: 0,
		scrollWidth: 0,
		clientWidth: 0,
		clientHeight: 0
	})

	useEffect(() => {
		let animationFrame = 0
		let frameCount = 0
		let lastTime = performance.now()

		const tick = (now: number) => {
			frameCount += 1
			if (now - lastTime >= 500) {
				setFps(Math.round((frameCount * 1000) / (now - lastTime)))
				frameCount = 0
				lastTime = now
			}
			animationFrame = requestAnimationFrame(tick)
		}

		animationFrame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(animationFrame)
	}, [])

	const renderItem = useCallback((index: number) => {
		const height = getMillionRowHeight(index)
		const rowTone = getMillionRowTone(index)

		return (
			<div className={ `million-row million-row--${ rowTone }` } style={{height}}>
				<div className="million-row-main">
					<span className="million-row-index">#{ (index + 1).toLocaleString() }</span>
					<span className="million-row-title">Shard { (index % 64) + 1 } / Task { (index * 13) % 997 }</span>
				</div>
				<div className="million-row-meta">
					<span>{ getMillionRowStatus(index) }</span>
					<span>{ height }px</span>
				</div>
			</div>
		)
	}, [])

	const getItemKey = useCallback((index: number) => `million-row-${ index }`, [])

	const jumpToRatio = useCallback((ratio: number) => {
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(scrollState.scrollHeight, scrollState.clientHeight, ratio)
		})
	}, [scrollState.clientHeight, scrollState.scrollHeight])

	const onProgressChange = useCallback((event: React.FormEvent<HTMLInputElement>) => {
		ref.current?.scrollTo({
			x: 0,
			y: getOffsetFromProgress(Number(event.currentTarget.value), scrollState.scrollHeight, scrollState.clientHeight)
		})
	}, [scrollState.clientHeight, scrollState.scrollHeight])

	const renderedCount = getRenderedCount(itemsRendered)
	const progressValue = getProgressValue(scrollState.y, scrollState.scrollHeight, scrollState.clientHeight)
	const visibleRange = itemsRendered.visibleEndIndex >= itemsRendered.visibleStartIndex
		? `${ itemsRendered.visibleStartIndex.toLocaleString() } - ${ itemsRendered.visibleEndIndex.toLocaleString() }`
		: "-"
	const renderedRange = itemsRendered.endIndex >= itemsRendered.startIndex
		? `${ itemsRendered.startIndex.toLocaleString() } - ${ itemsRendered.endIndex.toLocaleString() }`
		: "-"

	return (
		<div className="million-wrapper">
			<div className="million-head">
				<div>
					<div className="million-title">5000万级大列表性能场景</div>
					<div className="million-subtitle">按索引惰性渲染，动态高度测量，页面中只保留可视区附近 DOM。</div>
				</div>
				<div className={ `million-state ${ scrollState.isScrolling ? "is-active" : "" }` }>
					{ scrollState.isScrolling ? "Scrolling" : "Idle" }
				</div>
			</div>
			<div className="million-metrics">
				<div className="million-metric">
					<span>总行数</span>
					<strong>{ MILLION_ROW_COUNT.toLocaleString() }</strong>
				</div>
				<div className="million-metric">
					<span>当前 DOM</span>
					<strong>{ renderedCount }</strong>
				</div>
				<div className="million-metric">
					<span>FPS</span>
					<strong>{ fps || "-" }</strong>
				</div>
				<div className="million-metric">
					<span>Y 偏移</span>
					<strong>{ Math.round(scrollState.y).toLocaleString() }</strong>
				</div>
			</div>
			<div className="million-list">
				<VirtualScrollBar
					ref={ ref }
					height={ 320 }
					itemCount={ MILLION_ROW_COUNT }
					itemKey={ getItemKey }
					estimatedItemHeight={ ESTIMATED_MILLION_ROW_HEIGHT }
					overscan={ 6 }
					renderItem={ renderItem }
					onScroll={ setScrollState }
					onItemsRendered={ setItemsRendered }
				/>
			</div>
			<div className="million-toolbar">
				<div className="million-ranges">
					<span>Visible: { visibleRange }</span>
					<span>Rendered: { renderedRange }</span>
					<span>Height: { Math.round(scrollState.scrollHeight).toLocaleString() }</span>
				</div>
				<div className="million-actions">
					{ MILLION_JUMP_POINTS.map((point) => (
						<button key={ point.label } type="button" onClick={ () => jumpToRatio(point.ratio) }>
							{ point.label }
						</button>
					)) }
				</div>
				<label className="million-progress">
					<span>快速定位</span>
					<input
						type="range"
						min={ 0 }
							max={ PROGRESS_SCALE }
							value={ progressValue }
							onInput={ onProgressChange }
							onChange={ onProgressChange }
						/>
				</label>
			</div>
		</div>
	)
}

export default MillionRows
