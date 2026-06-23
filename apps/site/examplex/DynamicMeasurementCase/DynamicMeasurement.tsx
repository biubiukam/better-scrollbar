import React, { useCallback, useRef, useState } from "react"
import VirtualScrollBar from "@better-scrollbar/react"
import type { ItemsRenderedInfo, VirtualScrollBarRef } from "@better-scrollbar/react"
import {
	ESTIMATED_MILLION_ROW_HEIGHT,
	INITIAL_ITEMS_RENDERED,
	MILLION_ROW_COUNT,
	formatVirtualRange,
	getJumpOffset,
	getMillionRowHeight,
	getMillionRowStatus,
	getMillionRowTone,
	useRafScrollState
} from "../../components/ExampleSupport/sharedMillion"
import { caseTw, cn, toneRowTw } from "../../components/ExampleSupport/tailwind"
import { DEFAULT_EXAMPLE_COPY } from "../../i18n/examples"
import type { ExampleCopy } from "../../i18n/examples"

function renderMeasuredRow(index: number) {
	const height = getMillionRowHeight(index)
	const tone = getMillionRowTone(index)

	return (
		<div
			className={cn(
				"optimization-row dynamic-measurement-row",
				`optimization-row--${tone}`,
				caseTw.row,
				toneRowTw[tone]
			)}
			style={{ height }}
		>
			<div className={cn("optimization-row-main", caseTw.rowMain)}>
				<span className={caseTw.rowIndex}>#{(index + 1).toLocaleString()}</span>
				<strong className={caseTw.rowTitle}>{getMillionRowStatus(index)}</strong>
			</div>
			<div className={cn("optimization-row-meta", caseTw.rowMeta)}>
				<span>measured</span>
				<span>{height}px</span>
			</div>
		</div>
	)
}

function DynamicMeasurement({ copy = DEFAULT_EXAMPLE_COPY }: { copy?: ExampleCopy }) {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useRafScrollState()
	const caseCopy = copy.cases.dynamicMeasurement

	const jumpToMiddle = useCallback(() => {
		const currentScrollState = ref.current?.getScrollState() ?? scrollState
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(currentScrollState.scrollHeight, currentScrollState.clientHeight, 0.5)
		})
	}, [scrollState])

	return (
		<article
			className={cn(
				"optimization-case-card dynamic-measurement-card",
				caseTw.card,
				caseTw.accentSky
			)}
			data-testid="optimization-case-card"
			data-case-id="dynamic-measurement"
			data-row-count={MILLION_ROW_COUNT}
		>
			<header className={cn("optimization-case-head", caseTw.head)}>
				<div className={cn("optimization-case-index", caseTw.index)}>02</div>
				<h3 className={caseTw.title}>{caseCopy.title}</h3>
				<p className={caseTw.desc} data-testid="case-highlight">
					{caseCopy.desc}
				</p>
				<div
					className={cn("optimization-case-proof", caseTw.proof)}
					data-testid="case-proof"
				>
					<strong className={caseTw.proofValue}>
						{MILLION_ROW_COUNT.toLocaleString()}
					</strong>
					<span className={caseTw.proofLabel}>{caseCopy.proofLabel}</span>
				</div>
			</header>
			<div className={cn("optimization-case-body", caseTw.body)}>
				<div className={cn("optimization-case-toolbar", caseTw.toolbar)}>
					<button className={caseTw.button} type="button" onClick={jumpToMiddle}>
						{caseCopy.jumpMiddle}
					</button>
				</div>
				<div className={cn("optimization-case-list", caseTw.list)}>
					<VirtualScrollBar
						ref={ref}
						height={238}
						itemCount={MILLION_ROW_COUNT}
						itemKey={(index) => `dynamic-measurement-${index}`}
						estimatedItemHeight={ESTIMATED_MILLION_ROW_HEIGHT}
						overscan={{ items: 3, pixels: { before: 120, after: 220 } }}
						renderItem={renderMeasuredRow}
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
						{copy.shared.rendered} {formatVirtualRange(itemsRendered)}
					</span>
					<span>
						{copy.shared.height} {Math.round(scrollState.scrollHeight).toLocaleString()}
					</span>
				</div>
			</div>
		</article>
	)
}

export default DynamicMeasurement
