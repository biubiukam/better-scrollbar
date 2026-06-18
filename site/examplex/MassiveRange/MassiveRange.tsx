import React, { useCallback, useRef, useState } from "react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, VirtualScrollBarRef } from "../../../src"
import {
	FIXED_MILLION_ROW_HEIGHT,
	INITIAL_ITEMS_RENDERED,
	MILLION_JUMP_POINTS,
	MILLION_ROW_COUNT,
	formatVirtualRange,
	getJumpOffset,
	getRenderedCount,
	useRafScrollState
} from "../sharedMillion"
import { caseTw, cn } from "../tailwind"

const PHYSICAL_SCROLL_CAP = 1_200_000

function renderRangeRow(index: number) {
	return (
		<div className={ cn("optimization-row massive-range-row", caseTw.row) } style={ {height: FIXED_MILLION_ROW_HEIGHT} }>
			<div className={ cn("optimization-row-main", caseTw.rowMain) }>
				<span className={ caseTw.rowIndex }>#{ (index + 1).toLocaleString() }</span>
				<strong className={ caseTw.rowTitle }>Shard { (index % 128) + 1 }</strong>
			</div>
			<div className={ cn("optimization-row-meta", caseTw.rowMeta) }>
				<span>indexed</span>
				<span>{ FIXED_MILLION_ROW_HEIGHT }px</span>
			</div>
		</div>
	)
}

function MassiveRange() {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useRafScrollState()

	const jumpToRatio = useCallback((ratio: number) => {
		const currentScrollState = ref.current?.getScrollState() ?? scrollState
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(currentScrollState.scrollHeight, currentScrollState.clientHeight, ratio)
		})
	}, [scrollState])

	return (
		<article
			className={ cn("optimization-case-card massive-range-card", caseTw.card, caseTw.accentPrimary) }
			data-testid="optimization-case-card"
			data-case-id="massive-range"
			data-row-count={ MILLION_ROW_COUNT }
		>
			<header className={ cn("optimization-case-head massive-range-head", caseTw.head) }>
				<div className={ cn("optimization-case-index", caseTw.index) }>01</div>
				<h3 className={ caseTw.title }>1 亿行 Range</h3>
				<p className={ caseTw.desc } data-testid="case-highlight">只描述索引，不分配 children。</p>
				<div className={ cn("optimization-case-proof", caseTw.proof) } data-testid="case-proof">
					<strong className={ caseTw.proofValue }>{ getRenderedCount(itemsRendered) }</strong>
					<span className={ caseTw.proofLabel }>DOM nodes</span>
				</div>
			</header>
			<div className={ cn("optimization-case-body", caseTw.body) }>
				<div className={ cn("optimization-case-toolbar", caseTw.toolbar) }>
					{ MILLION_JUMP_POINTS.map((point) => (
						<button className={ caseTw.button } key={ point.label } type="button" onClick={ () => jumpToRatio(point.ratio) }>
							{ point.label }
						</button>
					)) }
				</div>
				<div className={ cn("optimization-case-list massive-range-list", caseTw.list) }>
					<VirtualScrollBar
						ref={ ref }
						height={ 238 }
						itemCount={ MILLION_ROW_COUNT }
						itemKey={ (index) => `massive-range-${ index }` }
						itemHeight={ FIXED_MILLION_ROW_HEIGHT }
						estimatedItemHeight={ FIXED_MILLION_ROW_HEIGHT }
						overscan={ 4 }
						maxBrowserScrollHeight={ PHYSICAL_SCROLL_CAP }
						renderItem={ renderRangeRow }
						onScroll={ setScrollState }
						onItemsRendered={ setItemsRendered }
					/>
				</div>
				<div className={ cn("optimization-case-stats", caseTw.stats) }>
					<span>Visible { formatVirtualRange({
						startIndex: itemsRendered.visibleStartIndex,
						endIndex: itemsRendered.visibleEndIndex
					}) }</span>
					<span>Y { Math.round(scrollState.y).toLocaleString() }</span>
					<span>Cap { PHYSICAL_SCROLL_CAP.toLocaleString() }</span>
				</div>
			</div>
		</article>
	)
}

export default MassiveRange
