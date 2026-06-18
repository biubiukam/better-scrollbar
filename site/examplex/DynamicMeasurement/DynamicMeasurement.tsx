import React, { useCallback, useRef, useState } from "react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, VirtualScrollBarRef } from "../../../src"
import {
	ESTIMATED_MILLION_ROW_HEIGHT,
	INITIAL_ITEMS_RENDERED,
	MILLION_ROW_COUNT,
	formatVirtualRange,
	getJumpOffset,
	getMillionRowHeight,
	getMillionRowStatus,
	getMillionRowTone,
	getRenderedCount,
	useRafScrollState
} from "../sharedMillion"
import { caseTw, cn, toneRowTw } from "../tailwind"

const HEIGHT_CACHE_LIMIT = 50_000

function renderMeasuredRow(index: number) {
	const height = getMillionRowHeight(index)
	const tone = getMillionRowTone(index)

	return (
		<div className={ cn("optimization-row dynamic-measurement-row", `optimization-row--${ tone }`, caseTw.row, toneRowTw[tone]) } style={ {height} }>
			<div className={ cn("optimization-row-main", caseTw.rowMain) }>
				<span className={ caseTw.rowIndex }>#{ (index + 1).toLocaleString() }</span>
				<strong className={ caseTw.rowTitle }>{ getMillionRowStatus(index) }</strong>
			</div>
			<div className={ cn("optimization-row-meta", caseTw.rowMeta) }>
				<span>measured</span>
				<span>{ height }px</span>
			</div>
		</div>
	)
}

function DynamicMeasurement() {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useRafScrollState()

	const jumpToMiddle = useCallback(() => {
		const currentScrollState = ref.current?.getScrollState() ?? scrollState
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(currentScrollState.scrollHeight, currentScrollState.clientHeight, 0.5)
		})
	}, [scrollState])

	return (
		<article
			className={ cn("optimization-case-card dynamic-measurement-card", caseTw.card, caseTw.accentSky) }
			data-testid="optimization-case-card"
			data-case-id="dynamic-measurement"
			data-row-count={ MILLION_ROW_COUNT }
		>
			<header className={ cn("optimization-case-head", caseTw.head) }>
				<div className={ cn("optimization-case-index", caseTw.index) }>02</div>
				<h3 className={ caseTw.title }>动态高度测量</h3>
				<p className={ caseTw.desc } data-testid="case-highlight">先估算，再用真实 DOM 回填。</p>
				<div className={ cn("optimization-case-proof", caseTw.proof) } data-testid="case-proof">
					<strong className={ caseTw.proofValue }>{ HEIGHT_CACHE_LIMIT.toLocaleString() }</strong>
					<span className={ caseTw.proofLabel }>cache cap</span>
				</div>
			</header>
			<div className={ cn("optimization-case-body", caseTw.body) }>
				<div className={ cn("optimization-case-toolbar", caseTw.toolbar) }>
					<button className={ caseTw.button } type="button" onClick={ jumpToMiddle }>跳到中段</button>
				</div>
				<div className={ cn("optimization-case-list", caseTw.list) }>
					<VirtualScrollBar
						ref={ ref }
						height={ 238 }
						itemCount={ MILLION_ROW_COUNT }
						itemKey={ (index) => `dynamic-measurement-${ index }` }
						estimatedItemHeight={ ESTIMATED_MILLION_ROW_HEIGHT }
						heightCacheLimit={ HEIGHT_CACHE_LIMIT }
						overscan={ 3 }
						overscanPixels={ {before: 120, after: 220} }
						renderItem={ renderMeasuredRow }
						onScroll={ setScrollState }
						onItemsRendered={ setItemsRendered }
					/>
				</div>
				<div className={ cn("optimization-case-stats", caseTw.stats) }>
					<span>Visible { formatVirtualRange({
						startIndex: itemsRendered.visibleStartIndex,
						endIndex: itemsRendered.visibleEndIndex
					}) }</span>
					<span>DOM { getRenderedCount(itemsRendered) }</span>
					<span>Height { Math.round(scrollState.scrollHeight).toLocaleString() }</span>
				</div>
			</div>
		</article>
	)
}

export default DynamicMeasurement
