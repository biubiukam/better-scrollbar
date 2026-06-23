import React, { useCallback, useRef, useState } from "react"
import VirtualScrollBar from "@better-scrollbar/react"
import type { ItemsRenderedInfo, VirtualScrollBarRef } from "@better-scrollbar/react"
import {
	FIXED_MILLION_ROW_HEIGHT,
	INITIAL_ITEMS_RENDERED,
	MILLION_JUMP_POINTS,
	MILLION_ROW_COUNT,
	formatVirtualRange,
	getJumpOffset,
	useRafScrollState
} from "../../components/ExampleSupport/sharedMillion"
import { caseTw, cn } from "../../components/ExampleSupport/tailwind"
import { DEFAULT_EXAMPLE_COPY } from "../../i18n/examples"
import type { ExampleCopy } from "../../i18n/examples"

const PHYSICAL_SCROLL_CAP = 1_200_000

function renderRangeRow(index: number) {
	return (
		<div
			className={cn("optimization-row massive-range-row", caseTw.row)}
			style={{ height: FIXED_MILLION_ROW_HEIGHT }}
		>
			<div className={cn("optimization-row-main", caseTw.rowMain)}>
				<span className={caseTw.rowIndex}>#{(index + 1).toLocaleString()}</span>
				<strong className={caseTw.rowTitle}>Shard {(index % 128) + 1}</strong>
			</div>
			<div className={cn("optimization-row-meta", caseTw.rowMeta)}>
				<span>indexed</span>
				<span>{FIXED_MILLION_ROW_HEIGHT}px</span>
			</div>
		</div>
	)
}

function MassiveRange({ copy = DEFAULT_EXAMPLE_COPY }: { copy?: ExampleCopy }) {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useRafScrollState()
	const caseCopy = copy.cases.massiveRange

	const jumpToRatio = useCallback(
		(ratio: number) => {
			const currentScrollState = ref.current?.getScrollState() ?? scrollState
			ref.current?.scrollTo({
				x: 0,
				y: getJumpOffset(
					currentScrollState.scrollHeight,
					currentScrollState.clientHeight,
					ratio
				)
			})
		},
		[scrollState]
	)

	return (
		<article
			className={cn(
				"optimization-case-card massive-range-card",
				caseTw.card,
				caseTw.accentPrimary
			)}
			data-testid="optimization-case-card"
			data-case-id="massive-range"
			data-row-count={MILLION_ROW_COUNT}
		>
			<header className={cn("optimization-case-head massive-range-head", caseTw.head)}>
				<div className={cn("optimization-case-index", caseTw.index)}>01</div>
				<h3 className={caseTw.title}>{caseCopy.title}</h3>
				<p className={caseTw.desc} data-testid="case-highlight">
					{caseCopy.desc}
				</p>
				<div
					className={cn("optimization-case-proof", caseTw.proof)}
					data-testid="case-proof"
				>
					<strong className={caseTw.proofValue}>100M</strong>
					<span className={caseTw.proofLabel}>{caseCopy.proofLabel}</span>
				</div>
			</header>
			<div className={cn("optimization-case-body", caseTw.body)}>
				<div className={cn("optimization-case-toolbar", caseTw.toolbar)}>
					{MILLION_JUMP_POINTS.map((point, index) => (
						<button
							className={caseTw.button}
							key={point.id}
							type="button"
							onClick={() => jumpToRatio(point.ratio)}
						>
							{copy.jumpPoints[index]}
						</button>
					))}
				</div>
				<div className={cn("optimization-case-list massive-range-list", caseTw.list)}>
					<VirtualScrollBar
						ref={ref}
						height={238}
						itemCount={MILLION_ROW_COUNT}
						itemKey={(index) => `massive-range-${index}`}
						estimatedItemHeight={FIXED_MILLION_ROW_HEIGHT}
						overscan={4}
						renderItem={renderRangeRow}
						onScroll={setScrollState}
						onItemsRendered={setItemsRendered}
					/>
				</div>
				<div className={cn("optimization-case-stats", caseTw.stats)}>
					<span>
						{copy.shared.visible}{" "}
						{formatVirtualRange({
							startIndex: itemsRendered.visibleStartIndex,
							endIndex: itemsRendered.visibleEndIndex
						})}
					</span>
					<span>
						{copy.shared.y} {Math.round(scrollState.y).toLocaleString()}
					</span>
					<span>Cap {PHYSICAL_SCROLL_CAP.toLocaleString()}</span>
				</div>
			</div>
		</article>
	)
}

export default MassiveRange
