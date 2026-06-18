import React, { useCallback, useMemo, useRef, useState } from "react"
import type { HTMLProps, PropsWithChildren } from "react"
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
	getToneChannel,
	useRafScrollState
} from "../sharedMillion"
import { caseTw, cn, toneRowTw } from "../tailwind"

const GROUP_COUNT = 500

interface GroupInfo {
	groupIndex: number
	groupItemCount: number
	itemIndexInGroup: number
}

function getGroupItemCount(groupIndex: number) {
	return 5 + (groupIndex % 11)
}

function createGroupModel() {
	const groupCounts: number[] = []
	const groupStarts: number[] = []
	const groupInfoByItem = new Map<number, GroupInfo>()
	let nextGroupStart = 0

	for (let groupIndex = 0; groupIndex < GROUP_COUNT; groupIndex++) {
		const groupItemCount = getGroupItemCount(groupIndex)
		groupCounts.push(groupItemCount - 1)
		groupStarts.push(nextGroupStart)

		for (let itemIndexInGroup = 0; itemIndexInGroup < groupItemCount; itemIndexInGroup++) {
			groupInfoByItem.set(nextGroupStart + itemIndexInGroup, {
				groupIndex,
				groupItemCount,
				itemIndexInGroup
			})
		}

		nextGroupStart += groupItemCount
	}

	return {groupCounts, groupStarts, groupInfoByItem}
}

function GroupedProductShell() {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useRafScrollState()
	const {groupCounts, groupStarts, groupInfoByItem} = useMemo(() => createGroupModel(), [])
	const toneChannel = getToneChannel(scrollState)

	const renderView = useCallback((props?: PropsWithChildren<HTMLProps<HTMLDivElement>>): React.ReactElement => (
		<div
			{ ...props }
			className={ cn(props?.className, "grouped-product-shell-view bg-card") }
			style={ {
				...(props?.style || {}),
				"--grouped-tone": toneChannel
			} as React.CSSProperties }
		/>
	), [toneChannel])

	const renderTrackVertical = useCallback((props?: PropsWithChildren<HTMLProps<HTMLDivElement>>): React.ReactElement => (
		<div
			{ ...props }
			className={ cn(props?.className, "grouped-product-shell-track") }
			style={ {
				...(props?.style || {}),
				zIndex: 3
			} }
		/>
	), [])

	const renderThumbVertical = useCallback((props?: PropsWithChildren<HTMLProps<HTMLDivElement>>): React.ReactElement => (
		<div
			{ ...props }
			className={ cn(props?.className, "grouped-product-shell-thumb rounded-[inherit] bg-success") }
			style={ {
				...(props?.style || {}),
				"--grouped-tone": toneChannel
			} as React.CSSProperties }
		/>
	), [toneChannel])

	const renderItem = useCallback((index: number) => {
		const groupInfo = groupInfoByItem.get(index)
		if (groupInfo?.itemIndexInGroup === 0) {
			return (
				<div className={ cn("optimization-row optimization-group-row grouped-product-shell-row", caseTw.row, caseTw.groupRow) } style={ {height: 44} }>
					<div className={ cn("optimization-row-main", caseTw.rowMain) }>
						<span className={ caseTw.rowIndex }>Group { groupInfo.groupIndex + 1 }</span>
						<strong className={ caseTw.rowTitle }>{ groupInfo.groupItemCount } items</strong>
					</div>
					<div className={ cn("optimization-row-meta", caseTw.rowMeta) }>sticky</div>
				</div>
			)
		}

		const businessIndex = groupInfo
			? index - groupInfo.groupIndex - 1
			: Math.max(index - GROUP_COUNT, 0)
		const height = getMillionRowHeight(businessIndex)
		const tone = getMillionRowTone(businessIndex)
		return (
			<div className={ cn("optimization-row grouped-product-shell-row", `optimization-row--${ tone }`, caseTw.row, toneRowTw[tone]) } style={ {height} }>
				<div className={ cn("optimization-row-main", caseTw.rowMain) }>
					<span className={ caseTw.rowIndex }>#{ (businessIndex + 1).toLocaleString() }</span>
					<strong className={ caseTw.rowTitle }>{ getMillionRowStatus(businessIndex) }</strong>
				</div>
				<div className={ cn("optimization-row-meta", caseTw.rowMeta) }>
					<span>grid</span>
					<span>{ height }px</span>
				</div>
			</div>
		)
	}, [groupInfoByItem])

	const jumpGroup = useCallback(() => {
		const currentScrollState = ref.current?.getScrollState() ?? scrollState
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(currentScrollState.scrollHeight, currentScrollState.clientHeight, 0.18) + (groupStarts[12] || 0)
		})
	}, [groupStarts, scrollState])

	return (
		<article
			className={ cn("optimization-case-card grouped-product-shell-card", caseTw.card, caseTw.accentSuccess) }
			data-testid="optimization-case-card"
			data-case-id="grouped-product-shell"
			data-row-count={ MILLION_ROW_COUNT }
		>
			<header className={ cn("optimization-case-head", caseTw.head) }>
				<div className={ cn("optimization-case-index", caseTw.index) }>04</div>
				<h3 className={ caseTw.title }>分组产品壳</h3>
				<p className={ caseTw.desc } data-testid="case-highlight">吸顶、ARIA、滚动条外观同场工作。</p>
				<div className={ cn("optimization-case-proof", caseTw.proof) } data-testid="case-proof">
					<strong className={ caseTw.proofValue }>{ GROUP_COUNT }</strong>
					<span className={ caseTw.proofLabel }>groups</span>
				</div>
			</header>
			<div className={ cn("optimization-case-body", caseTw.body) }>
				<div className={ cn("optimization-case-toolbar", caseTw.toolbar) }>
					<button className={ caseTw.button } type="button" onClick={ jumpGroup }>跨组跳转</button>
				</div>
				<div className={ cn("optimization-case-list grouped-product-shell-list", caseTw.list) }>
					<VirtualScrollBar
						ref={ ref }
						height={ 238 }
						itemCount={ MILLION_ROW_COUNT }
						itemKey={ (index) => `grouped-product-shell-${ index }` }
						estimatedItemHeight={ ESTIMATED_MILLION_ROW_HEIGHT }
						overscan={ 4 }
						groupCounts={ groupCounts }
						accessibility={ {role: "grid", label: "1 亿行虚拟网格", rowCount: MILLION_ROW_COUNT, itemRole: "row"} }
						maxBrowserScrollHeight={ 1_200_000 }
						renderView={ renderView }
						renderTrackVertical={ renderTrackVertical }
						renderThumbVertical={ renderThumbVertical }
						renderItem={ renderItem }
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
					<span>Y { Math.round(scrollState.y).toLocaleString() }</span>
				</div>
			</div>
		</article>
	)
}

export default GroupedProductShell
