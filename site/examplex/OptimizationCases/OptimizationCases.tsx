import React, { useCallback, useMemo, useRef, useState } from "react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, ScrollState, VirtualScrollBarRef } from "../../../src"
import {
	ESTIMATED_MILLION_ROW_HEIGHT,
	MILLION_ROW_COUNT,
	createInitialScrollState,
	formatVirtualRange,
	getJumpOffset,
	getMillionRowHeight,
	getMillionRowStatus,
	getMillionRowTone,
	getRenderedCount
} from "../sharedMillion"
import "./index.less"

const CASE_LIST_HEIGHT = 238
const GROUP_BLOCK_SIZE = 100_000
const GROUP_COUNT = MILLION_ROW_COUNT / GROUP_BLOCK_SIZE
const GROUP_ITEM_COUNT = GROUP_BLOCK_SIZE - 1

interface CaseCardProps {
	id: string
	title: string
	highlight: string
	interaction: string
	children: React.ReactNode
}

const INITIAL_ITEMS_RENDERED: ItemsRenderedInfo = {
	startIndex: 0,
	endIndex: -1,
	visibleStartIndex: 0,
	visibleEndIndex: -1
}

function CaseCard({id, title, highlight, interaction, children}: CaseCardProps) {
	return (
		<article className="optimization-case-card" data-testid="optimization-case-card" data-case-id={ id } data-row-count={ MILLION_ROW_COUNT }>
			<div className="optimization-case-head">
				<div className="optimization-case-kicker">5000 万行案例</div>
				<h3>{ title }</h3>
				<p data-testid="case-highlight">{ highlight }</p>
				<div className="optimization-case-interaction" data-testid="case-interaction">
					<span>交互形式</span>
					<strong>{ interaction }</strong>
				</div>
			</div>
			{ children }
		</article>
	)
}

function CaseStats({itemsRendered, scrollState, extra}: {
	itemsRendered: ItemsRenderedInfo
	scrollState: ScrollState
	extra?: React.ReactNode
}) {
	return (
		<div className="optimization-case-stats">
			<span>Visible { formatVirtualRange({
				startIndex: itemsRendered.visibleStartIndex,
				endIndex: itemsRendered.visibleEndIndex
			}) }</span>
			<span>DOM { getRenderedCount(itemsRendered) }</span>
			<span>Y { Math.round(scrollState.y).toLocaleString() }</span>
			{ extra }
		</div>
	)
}

function renderMillionRow(index: number, labelPrefix = "Row") {
	const height = getMillionRowHeight(index)
	const tone = getMillionRowTone(index)

	return (
		<div className={ `optimization-row optimization-row--${ tone }` } style={ {height} }>
			<div className="optimization-row-main">
				<span>#{ (index + 1).toLocaleString() }</span>
				<strong>{ labelPrefix } { (index % 997) + 1 }</strong>
			</div>
			<div className="optimization-row-meta">
				<span>{ getMillionRowStatus(index) }</span>
				<span>{ height }px</span>
			</div>
		</div>
	)
}

function DynamicHeightCase() {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useState<ScrollState>(createInitialScrollState)
	const renderItem = useCallback((index: number) => renderMillionRow(index, "Dynamic"), [])

	const jumpToMiddle = () => {
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(scrollState.scrollHeight, scrollState.clientHeight, 0.5)
		})
	}

	return (
		<CaseCard
			id="dynamic-height"
			title="动态高度测量"
			highlight="用估算高度支撑 5000 万行索引空间，真实行高由可见 DOM 测量后回填缓存。"
			interaction="滚动列表或点击中段定位，观察不同高度行进入视口后区间稳定更新。"
		>
			<div className="optimization-case-body">
				<div className="optimization-case-toolbar">
					<button type="button" onClick={ jumpToMiddle }>跳到中段</button>
				</div>
				<div className="optimization-case-list">
					<VirtualScrollBar
						ref={ ref }
						height={ CASE_LIST_HEIGHT }
						itemCount={ MILLION_ROW_COUNT }
						itemKey={ (index) => `dynamic-${ index }` }
						estimatedItemHeight={ ESTIMATED_MILLION_ROW_HEIGHT }
						overscan={ 4 }
						renderItem={ renderItem }
						onScroll={ setScrollState }
						onItemsRendered={ setItemsRendered }
					/>
				</div>
				<CaseStats itemsRendered={ itemsRendered } scrollState={ scrollState }/>
			</div>
		</CaseCard>
	)
}

function AnchorCase() {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useState<ScrollState>(createInitialScrollState)
	const [prependedCount, setPrependedCount] = useState(0)
	const totalCount = MILLION_ROW_COUNT + prependedCount

	const renderItem = useCallback((index: number) => {
		if (index < prependedCount) {
			return (
				<div className="optimization-row optimization-row--focus" style={ {height: 42} }>
					<div className="optimization-row-main">
						<span>History</span>
						<strong>Prepended batch #{ prependedCount - index }</strong>
					</div>
					<div className="optimization-row-meta">anchor safe</div>
				</div>
			)
		}

		return renderMillionRow(index - prependedCount, "Anchor")
	}, [prependedCount])

	const jumpToMiddle = () => {
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(scrollState.scrollHeight, scrollState.clientHeight, 0.5)
		})
	}

	const prependRows = () => {
		setPrependedCount((count) => count + 20)
	}

	return (
		<CaseCard
			id="scroll-anchor"
			title="滚动锚点稳定"
			highlight="数据插入到视口上方时，以当前可见 key 和项内偏移修正滚动位置，避免阅读位置跳动。"
			interaction="先跳到中段，再插入上方历史批次；当前视口会尽量保持在同一条业务数据附近。"
		>
			<div className="optimization-case-body">
				<div className="optimization-case-toolbar">
					<button type="button" onClick={ jumpToMiddle }>跳到中段</button>
					<button type="button" onClick={ prependRows }>插入上方 20 条</button>
				</div>
				<div className="optimization-case-list">
					<VirtualScrollBar
						ref={ ref }
						height={ CASE_LIST_HEIGHT }
						itemCount={ totalCount }
						itemKey={ (index) => index < prependedCount ? `history-${ index }` : `anchor-${ index - prependedCount }` }
						estimatedItemHeight={ ESTIMATED_MILLION_ROW_HEIGHT }
						maintainVisibleContentPosition
						overscan={ 4 }
						renderItem={ renderItem }
						onScroll={ setScrollState }
						onItemsRendered={ setItemsRendered }
					/>
				</div>
				<CaseStats
					itemsRendered={ itemsRendered }
					scrollState={ scrollState }
					extra={ <span>Prepended { prependedCount }</span> }
				/>
			</div>
		</CaseCard>
	)
}

function StatefulCase() {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useState<ScrollState>(createInitialScrollState)
	const [markedIndex, setMarkedIndex] = useState<number | null>(null)

	const renderItem = useCallback((index: number) => {
		const marked = index === markedIndex
		return (
			<button
				className={ `optimization-row optimization-row-button ${ marked ? "is-marked" : "" }` }
				style={ {height: 42} }
				type="button"
				onClick={ () => setMarkedIndex(index) }
			>
				<span>#{ (index + 1).toLocaleString() }</span>
				<strong>{ marked ? "已保留关注状态" : "点击保留此行状态" }</strong>
			</button>
		)
	}, [markedIndex])

	const markVisibleRow = () => {
		setMarkedIndex(itemsRendered.visibleStartIndex)
	}

	const jumpAway = () => {
		ref.current?.scrollTo({
			x: 0,
			y: getJumpOffset(scrollState.scrollHeight, scrollState.clientHeight, 0.72)
		})
	}

	const returnToMarked = () => {
		if (markedIndex === null) {
			return
		}

		ref.current?.scrollTo({x: 0, y: markedIndex * 42})
	}

	return (
		<CaseCard
			id="stateful-recycling"
			title="回收场景下的状态持久化"
			highlight="5000 万 indexed 渲染不保留全部 DOM，行状态通过稳定 key 和外部状态表恢复。"
			interaction="标记当前可见行，跳到远处后再返回标记行，关注状态仍然存在。"
		>
			<div className="optimization-case-body">
				<div className="optimization-case-toolbar">
					<button type="button" onClick={ markVisibleRow }>标记当前首行</button>
					<button type="button" onClick={ jumpAway }>跳到远处</button>
					<button type="button" onClick={ returnToMarked }>回到标记</button>
				</div>
				<div className="optimization-case-list">
					<VirtualScrollBar
						ref={ ref }
						height={ CASE_LIST_HEIGHT }
						itemCount={ MILLION_ROW_COUNT }
						itemKey={ (index) => `state-${ index }` }
						estimatedItemHeight={ 42 }
						overscan={ 4 }
						renderItem={ renderItem }
						onScroll={ setScrollState }
						onItemsRendered={ setItemsRendered }
					/>
				</div>
				<CaseStats
					itemsRendered={ itemsRendered }
					scrollState={ scrollState }
					extra={ <span>Marked { markedIndex === null ? "-" : `#${ (markedIndex + 1).toLocaleString() }` }</span> }
				/>
			</div>
		</CaseCard>
	)
}

function AdaptiveOverscanCase() {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useState<ScrollState>(createInitialScrollState)
	const renderItem = useCallback((index: number) => renderMillionRow(index, "Overscan"), [])

	const fastScroll = () => {
		ref.current?.scrollTo({
			x: 0,
			y: Math.min(scrollState.y + 180_000, Math.max(scrollState.scrollHeight - scrollState.clientHeight, 0))
		})
	}

	return (
		<CaseCard
			id="adaptive-overscan"
			title="自适应 Overscan"
			highlight="保留基础 overscan，在快速滚动时朝滚动方向临时扩大预渲染范围，滚动结束后回落。"
			interaction="点击快速下滚或直接滚动列表，观察当前 DOM 数量随速度短暂增加。"
		>
			<div className="optimization-case-body">
				<div className="optimization-case-toolbar">
					<button type="button" onClick={ fastScroll }>快速下滚</button>
				</div>
				<div className="optimization-case-list">
					<VirtualScrollBar
						ref={ ref }
						height={ CASE_LIST_HEIGHT }
						itemCount={ MILLION_ROW_COUNT }
						itemKey={ (index) => `overscan-${ index }` }
						estimatedItemHeight={ ESTIMATED_MILLION_ROW_HEIGHT }
						overscan={ 2 }
						adaptiveOverscan={ {max: 18, velocityFactor: 0.004} }
						renderItem={ renderItem }
						onScroll={ setScrollState }
						onItemsRendered={ setItemsRendered }
					/>
				</div>
				<CaseStats itemsRendered={ itemsRendered } scrollState={ scrollState }/>
			</div>
		</CaseCard>
	)
}

function AdvancedCase() {
	const ref = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useState<ScrollState>(createInitialScrollState)
	const groupCounts = useMemo(() => {
		return Array.from({length: GROUP_COUNT}, () => GROUP_ITEM_COUNT)
	}, [])

	const renderItem = useCallback((index: number) => {
		const groupIndex = Math.floor(index / GROUP_BLOCK_SIZE)
		if (index % GROUP_BLOCK_SIZE === 0) {
			return (
				<div className="optimization-row optimization-group-row" style={ {height: 44} }>
					<div className="optimization-row-main">
						<span>Group { groupIndex + 1 }</span>
						<strong>{ GROUP_ITEM_COUNT.toLocaleString() } rows</strong>
					</div>
					<div className="optimization-row-meta">sticky</div>
				</div>
			)
		}

		return renderMillionRow(index - groupIndex - 1, "Grid")
	}, [])

	const jumpGroup = () => {
		ref.current?.scrollTo({x: 0, y: GROUP_BLOCK_SIZE * 12 * ESTIMATED_MILLION_ROW_HEIGHT})
	}

	return (
		<CaseCard
			id="advanced"
			title="吸顶分组 / ARIA / 超大 Range"
			highlight="分组头吸顶、groupCounts 推导、ARIA 行号和浏览器安全物理滚动范围组合在一个 5000 万行网格场景里。"
			interaction="滚动跨越分组或点击跨组跳转，分组头保持吸顶，DOM 同时携带 grid 行数和行索引。"
		>
			<div className="optimization-case-body">
				<div className="optimization-case-toolbar">
					<button type="button" onClick={ jumpGroup }>跨组跳转</button>
				</div>
				<div className="optimization-case-list">
					<VirtualScrollBar
						ref={ ref }
						height={ CASE_LIST_HEIGHT }
						itemCount={ MILLION_ROW_COUNT }
						itemKey={ (index) => `advanced-${ index }` }
						estimatedItemHeight={ ESTIMATED_MILLION_ROW_HEIGHT }
						overscan={ 4 }
						groupCounts={ groupCounts }
						accessibility={ {role: "grid", label: "5000 万行虚拟网格", rowCount: MILLION_ROW_COUNT, itemRole: "row"} }
						maxBrowserScrollHeight={ 1_200_000 }
						renderItem={ renderItem }
						onScroll={ setScrollState }
						onItemsRendered={ setItemsRendered }
					/>
				</div>
				<CaseStats
					itemsRendered={ itemsRendered }
					scrollState={ scrollState }
					extra={ <span>Groups { GROUP_COUNT.toLocaleString() }</span> }
				/>
			</div>
		</CaseCard>
	)
}

function OptimizationCases() {
	return (
		<div className="optimization-cases-grid">
			<DynamicHeightCase/>
			<AnchorCase/>
			<StatefulCase/>
			<AdaptiveOverscanCase/>
			<AdvancedCase/>
		</div>
	)
}

export default OptimizationCases
