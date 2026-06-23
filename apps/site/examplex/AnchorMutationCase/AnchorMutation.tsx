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

const PREPEND_BATCH_SIZE = 20

function AnchorMutation({ copy = DEFAULT_EXAMPLE_COPY }: { copy?: ExampleCopy }) {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useRafScrollState()
	const [prependedCount, setPrependedCount] = useState(0)
	const totalCount = MILLION_ROW_COUNT + prependedCount
	const caseCopy = copy.cases.anchorMutation

	const renderItem = useCallback(
		(index: number) => {
			if (index < prependedCount) {
				return (
					<div
						className={cn(
							"optimization-row optimization-row--focus anchor-mutation-row",
							caseTw.row,
							toneRowTw.focus
						)}
						style={{ height: ESTIMATED_MILLION_ROW_HEIGHT }}
					>
						<div className={cn("optimization-row-main", caseTw.rowMain)}>
							<span className={caseTw.rowIndex}>{caseCopy.history}</span>
							<strong className={caseTw.rowTitle}>
								{caseCopy.batch(prependedCount - index)}
							</strong>
						</div>
						<div className={cn("optimization-row-meta", caseTw.rowMeta)}>
							{caseCopy.anchor}
						</div>
					</div>
				)
			}

			const businessIndex = index - prependedCount
			const height = getMillionRowHeight(businessIndex)
			const tone = getMillionRowTone(businessIndex)
			return (
				<div
					className={cn(
						"optimization-row anchor-mutation-row",
						`optimization-row--${tone}`,
						caseTw.row,
						toneRowTw[tone]
					)}
					style={{ height }}
				>
					<div className={cn("optimization-row-main", caseTw.rowMain)}>
						<span className={caseTw.rowIndex}>
							#{(businessIndex + 1).toLocaleString()}
						</span>
						<strong className={caseTw.rowTitle}>
							{getMillionRowStatus(businessIndex)}
						</strong>
					</div>
					<div className={cn("optimization-row-meta", caseTw.rowMeta)}>
						<span>{height}px</span>
					</div>
				</div>
			)
		},
		[caseCopy, prependedCount]
	)

	const jumpToMiddle = useCallback(() => {
		const currentScrollState = ref.current?.getScrollState() ?? scrollState
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(currentScrollState.scrollHeight, currentScrollState.clientHeight, 0.5)
		})
	}, [scrollState])

	const prependRows = useCallback(() => {
		setPrependedCount((count) => count + PREPEND_BATCH_SIZE)
	}, [])

	return (
		<article
			className={cn(
				"optimization-case-card anchor-mutation-card",
				caseTw.card,
				caseTw.accentWarning
			)}
			data-testid="optimization-case-card"
			data-case-id="anchor-mutation"
			data-row-count={MILLION_ROW_COUNT}
		>
			<header className={cn("optimization-case-head", caseTw.head)}>
				<div className={cn("optimization-case-index", caseTw.index)}>03</div>
				<h3 className={caseTw.title}>{caseCopy.title}</h3>
				<p className={caseTw.desc} data-testid="case-highlight">
					{caseCopy.desc}
				</p>
				<div
					className={cn("optimization-case-proof", caseTw.proof)}
					data-testid="case-proof"
				>
					<strong className={caseTw.proofValue}>{prependedCount}</strong>
					<span className={caseTw.proofLabel}>{caseCopy.proofLabel}</span>
				</div>
			</header>
			<div className={cn("optimization-case-body", caseTw.body)}>
				<div className={cn("optimization-case-toolbar", caseTw.toolbar)}>
					<button className={caseTw.button} type="button" onClick={jumpToMiddle}>
						{caseCopy.jumpMiddle}
					</button>
					<button className={caseTw.button} type="button" onClick={prependRows}>
						{caseCopy.prepend}
					</button>
				</div>
				<div className={cn("optimization-case-list", caseTw.list)}>
					<VirtualScrollBar
						ref={ref}
						height={238}
						itemCount={totalCount}
						itemKey={(index) =>
							index < prependedCount
								? `history-${index}`
								: `anchor-mutation-${index - prependedCount}`
						}
						estimatedItemHeight={ESTIMATED_MILLION_ROW_HEIGHT}
						maintainVisibleContentPosition
						overscan={PREPEND_BATCH_SIZE}
						renderItem={renderItem}
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
						{copy.shared.total} {totalCount.toLocaleString()}
					</span>
				</div>
			</div>
		</article>
	)
}

export default AnchorMutation
