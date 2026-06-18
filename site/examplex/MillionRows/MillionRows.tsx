import React, { useCallback, useEffect, useRef, useState } from "react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, VirtualScrollBarRef } from "../../../src"
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
	getRenderedCount,
	useRafScrollState
} from "./utils"
import { cn, demoTw, toneRowTw } from "../tailwind"

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
	const [scrollState, setScrollState] = useRafScrollState()

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
			<div className={ cn("million-row", `million-row--${ rowTone }`, demoTw.row, toneRowTw[rowTone]) } style={{height}}>
				<div className="million-row-main flex min-w-0 items-center gap-2.5">
					<span className={ cn("million-row-index", demoTw.rowIndex, "min-w-[86px]") }>#{ (index + 1).toLocaleString() }</span>
					<span className={ cn("million-row-title", demoTw.rowTitle) }>Shard { (index % 64) + 1 } / Task { (index * 13) % 997 }</span>
				</div>
				<div className={ cn("million-row-meta", "flex shrink-0 items-center gap-2 text-xs text-muted-foreground") }>
					<span>{ getMillionRowStatus(index) }</span>
					<span>{ height }px</span>
				</div>
			</div>
		)
	}, [])

	const getItemKey = useCallback((index: number) => `million-row-${ index }`, [])

	const jumpToRatio = useCallback((ratio: number) => {
		const currentScrollState = ref.current?.getScrollState() ?? scrollState
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(currentScrollState.scrollHeight, currentScrollState.clientHeight, ratio)
		})
	}, [scrollState])

	const onProgressChange = useCallback((event: React.FormEvent<HTMLInputElement>) => {
		const currentScrollState = ref.current?.getScrollState() ?? scrollState
		ref.current?.scrollTo({
			x: 0,
			y: getOffsetFromProgress(Number(event.currentTarget.value), currentScrollState.scrollHeight, currentScrollState.clientHeight)
		})
	}, [scrollState])

	const renderedCount = getRenderedCount(itemsRendered)
	const progressValue = getProgressValue(scrollState.y, scrollState.scrollHeight, scrollState.clientHeight)
	const visibleRange = itemsRendered.visibleEndIndex >= itemsRendered.visibleStartIndex
		? `${ itemsRendered.visibleStartIndex.toLocaleString() } - ${ itemsRendered.visibleEndIndex.toLocaleString() }`
		: "-"
	const renderedRange = itemsRendered.endIndex >= itemsRendered.startIndex
		? `${ itemsRendered.startIndex.toLocaleString() } - ${ itemsRendered.endIndex.toLocaleString() }`
		: "-"

	return (
		<div className={ cn("million-wrapper", demoTw.shell) }>
			<div className={ cn("million-head", demoTw.head) }>
				<div>
					<div className={ cn("million-title", demoTw.title) }>1亿级大列表性能场景</div>
					<div className={ cn("million-subtitle", demoTw.subtitle) }>按索引惰性渲染，动态高度测量，页面中只保留可视区附近 DOM。</div>
				</div>
				<div className={ cn("million-state", demoTw.state, scrollState.isScrolling && "is-active", scrollState.isScrolling && demoTw.stateActive) }>
					{ scrollState.isScrolling ? "Scrolling" : "Idle" }
				</div>
			</div>
			<div className={ cn("million-metrics", demoTw.metricGrid, "grid-cols-2 sm:grid-cols-4") }>
				<div className={ cn("million-metric", demoTw.metric) }>
					<span className={ demoTw.metricLabel }>总行数</span>
					<strong className={ demoTw.metricValue }>{ MILLION_ROW_COUNT.toLocaleString() }</strong>
				</div>
				<div className={ cn("million-metric", demoTw.metric) }>
					<span className={ demoTw.metricLabel }>当前 DOM</span>
					<strong className={ demoTw.metricValue }>{ renderedCount }</strong>
				</div>
				<div className={ cn("million-metric", demoTw.metric) }>
					<span className={ demoTw.metricLabel }>FPS</span>
					<strong className={ demoTw.metricValue }>{ fps || "-" }</strong>
				</div>
				<div className={ cn("million-metric", demoTw.metric) }>
					<span className={ demoTw.metricLabel }>Y 偏移</span>
					<strong className={ demoTw.metricValue }>{ Math.round(scrollState.y).toLocaleString() }</strong>
				</div>
			</div>
			<div className="million-list h-[320px] shrink-0 border-b border-border bg-card">
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
			<div className="million-toolbar flex flex-col items-stretch gap-2 border-t border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
				<div className="million-ranges flex items-center justify-between gap-2">
					<span>Visible: { visibleRange }</span>
					<span>Rendered: { renderedRange }</span>
					<span>Height: { Math.round(scrollState.scrollHeight).toLocaleString() }</span>
				</div>
				<div className="million-actions flex items-center gap-2">
					{ MILLION_JUMP_POINTS.map((point) => (
						<button className={ demoTw.button } key={ point.label } type="button" onClick={ () => jumpToRatio(point.ratio) }>
							{ point.label }
						</button>
					)) }
				</div>
				<label className="million-progress grid grid-cols-[64px_1fr] items-center gap-2.5 text-muted-foreground">
					<span>快速定位</span>
					<input
						className="w-full accent-primary"
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
