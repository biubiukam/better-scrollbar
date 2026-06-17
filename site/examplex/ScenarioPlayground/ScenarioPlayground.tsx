import React, { useCallback, useMemo, useRef, useState } from "react"
import type { HTMLProps, PropsWithChildren } from "react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, ScrollState, VirtualScrollBarRef } from "../../../src"
import Sortable from "sortablejs"
import {
	FIXED_MILLION_ROW_HEIGHT,
	MILLION_JUMP_POINTS,
	MILLION_ROW_COUNT,
	createInitialScrollState,
	formatVirtualRange,
	getJumpOffset,
	getMillionRowHeight,
	getMillionRowStatus,
	getMillionRowTone,
	getRenderedCount,
	getToneChannel,
	useFpsSample,
	useRafScrollState
} from "../sharedMillion"
import { BASE_SCENARIO_CONFIG, SCENARIO_PRESETS, getScenarioPreset } from "./presets"
import type { AccessibilityMode, HeightMode, ScenarioConfig, ScenarioPresetId, StyleMode } from "./types"
import {
	SCENARIO_GROUP_BLOCK_SIZE,
	getBoundedOverscan,
	getBoundedOverscanPixels,
	getScenarioAccessibility,
	getScenarioEstimatedHeight,
	getScenarioGroupCounts,
	getScenarioPropsSnapshot
} from "./utils"
import "./index.less"

const SCENARIO_LIST_HEIGHT = 420
const MAX_LOG_COUNT = 6
const INITIAL_ITEMS_RENDERED: ItemsRenderedInfo = {
	startIndex: 0,
	endIndex: -1,
	visibleStartIndex: 0,
	visibleEndIndex: -1
}

function appendLog(logs: string[], message: string) {
	return [message, ...logs].slice(0, MAX_LOG_COUNT)
}

function Field({label, children}: PropsWithChildren<{label: string}>) {
	return (
		<label className="scenario-playground-field">
			<span>{ label }</span>
			{ children }
		</label>
	)
}

function Toggle({label, checked, onChange}: {
	label: string
	checked: boolean
	onChange: (checked: boolean) => void
}) {
	return (
		<label className="scenario-playground-toggle">
			<input
				type="checkbox"
				aria-label={ label }
				checked={ checked }
				onChange={ (event) => onChange(event.currentTarget.checked) }
			/>
			<span>{ label }</span>
		</label>
	)
}

function Metric({label, value}: {label: string, value: React.ReactNode}) {
	return (
		<div className="scenario-playground-metric">
			<span>{ label }</span>
			<strong>{ value }</strong>
		</div>
	)
}

function getRowHeight(index: number, config: ScenarioConfig) {
	if (config.heightMode === "fixed") {
		return FIXED_MILLION_ROW_HEIGHT
	}

	return getMillionRowHeight(index)
}

function isScenarioGroupHeaderIndex(index: number) {
	return index % SCENARIO_GROUP_BLOCK_SIZE === 0
}

function getScenarioGroupIndex(index: number) {
	return Math.floor(index / SCENARIO_GROUP_BLOCK_SIZE)
}

function getScenarioGroupRowIndex(index: number) {
	return Math.max(index - getScenarioGroupIndex(index) - 1, 0)
}

function ScenarioPlayground() {
	const scrollRef = useRef<VirtualScrollBarRef>({} as VirtualScrollBarRef)
	const viewRef = useRef<HTMLDivElement | null>(null)
	const sortableInstance = useRef<Sortable | null>(null)
	const [activePresetId, setActivePresetId] = useState<ScenarioPresetId>("baseline")
	const [config, setConfig] = useState<ScenarioConfig>(BASE_SCENARIO_CONFIG)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [scrollState, setScrollState] = useRafScrollState()
	const scrollStateRef = useRef<ScrollState>(createInitialScrollState())
	const itemsRenderedRef = useRef<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [prependedCount, setPrependedCount] = useState(0)
	const [appendedCount, setAppendedCount] = useState(0)
	const [deletedCount, setDeletedCount] = useState(0)
	const [rowOrder, setRowOrder] = useState<Record<number, number>>({})
	const dragPositionRef = useRef<number | null>(null)
	const nativeDragCommittedRef = useRef(false)
	const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
	const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
	const [logs, setLogs] = useState<string[]>(["加载基础大列表预设"])
	const fps = useFpsSample()

	const itemCount = MILLION_ROW_COUNT + prependedCount + appendedCount - deletedCount
	const activePreset = getScenarioPreset(activePresetId)
	const groupCounts = useMemo(() => getScenarioGroupCounts(), [])
	const toneChannel = getToneChannel(scrollState)

	const recordLog = useCallback((message: string) => {
		setLogs((currentLogs) => appendLog(currentLogs, message))
	}, [])

	const updateConfig = useCallback((patch: Partial<ScenarioConfig>) => {
		setConfig((currentConfig) => ({...currentConfig, ...patch}))
	}, [])

	const applyPreset = useCallback((presetId: ScenarioPresetId) => {
		const preset = getScenarioPreset(presetId)
		setActivePresetId(preset.id)
		setConfig(preset.config)
		setRowOrder({})
		recordLog(`切换预设：${ preset.label }`)
	}, [recordLog])

	const onItemsRendered = useCallback((nextItemsRendered: ItemsRenderedInfo) => {
		itemsRenderedRef.current = nextItemsRendered
		setItemsRendered(nextItemsRendered)
	}, [])

	const onScroll = useCallback((nextScrollState: ScrollState) => {
		scrollStateRef.current = nextScrollState
		setScrollState(nextScrollState)
	}, [setScrollState])

	const jumpToRatio = useCallback((label: string, ratio: number) => {
		const currentScrollState = scrollStateRef.current
		scrollRef.current?.scrollTo({
			x: 0,
			y: getJumpOffset(currentScrollState.scrollHeight, currentScrollState.clientHeight, ratio)
		})
		recordLog(`跳转到 ${ label }`)
	}, [recordLog])

	const fastScroll = useCallback(() => {
		const currentScrollState = scrollStateRef.current
		const maxOffset = Math.max(currentScrollState.scrollHeight - currentScrollState.clientHeight, 0)
		scrollRef.current?.scrollTo({
			x: 0,
			y: Math.min(currentScrollState.y + 260_000, maxOffset)
		})
		recordLog("快速下滚压力测试")
	}, [recordLog])

	const prependRows = useCallback(() => {
		setPrependedCount((count) => count + 20)
		recordLog("上方插入 20 条")
	}, [recordLog])

	const appendRows = useCallback(() => {
		setAppendedCount((count) => count + 100)
		recordLog("底部追加 100 条")
	}, [recordLog])

	const deleteVisibleRow = useCallback(() => {
		setDeletedCount((count) => Math.min(count + 1, MILLION_ROW_COUNT + prependedCount + appendedCount - 1))
		recordLog(`删除可见首行 #${ (itemsRenderedRef.current.visibleStartIndex + 1).toLocaleString() }`)
	}, [appendedCount, prependedCount, recordLog])

	const resetMutations = useCallback(() => {
		setPrependedCount(0)
		setAppendedCount(0)
		setDeletedCount(0)
		setRowOrder({})
		recordLog("重置数据变更")
	}, [recordLog])

	const moveVisibleRow = useCallback((fromPosition?: number, toPosition?: number) => {
		if (fromPosition === undefined || toPosition === undefined || fromPosition === toPosition) {
			return
		}

		const currentRange = itemsRenderedRef.current
		const renderedCount = getRenderedCount(currentRange)
		if (fromPosition < 0 || toPosition < 0 || fromPosition >= renderedCount || toPosition >= renderedCount) {
			return
		}

		setRowOrder((currentOrder) => {
			const nextOrder = {...currentOrder}
			const targetIndices = Array.from({length: renderedCount}, (_, offset) => currentRange.startIndex + offset)
			const sourceIndices = targetIndices.map((index) => currentOrder[index] ?? index)
			const [movedIndex] = sourceIndices.splice(fromPosition, 1)
			sourceIndices.splice(toPosition, 0, movedIndex)
			targetIndices.forEach((targetIndex, offset) => {
				const sourceIndex = sourceIndices[offset]
				if (sourceIndex === targetIndex) {
					delete nextOrder[targetIndex]
				} else {
					nextOrder[targetIndex] = sourceIndex
				}
			})
			return nextOrder
		})
		recordLog("窗口内拖拽排序")
	}, [recordLog])

	const commitVisibleRowMove = useCallback((fromPosition?: number, toPosition?: number) => {
		if (dragPositionRef.current !== null) {
			if (nativeDragCommittedRef.current) {
				return
			}
			nativeDragCommittedRef.current = true
		}

		moveVisibleRow(fromPosition, toPosition)
	}, [moveVisibleRow])

	const onSortableDragEnd = useCallback((event: {oldIndex?: number, newIndex?: number}) => {
		commitVisibleRowMove(event.oldIndex, event.newIndex)
	}, [commitVisibleRowMove])

	const getRenderedPosition = useCallback((index: number) => {
		return index - itemsRenderedRef.current.startIndex
	}, [])

	const onNativeDragStart = useCallback((index: number) => (event: React.DragEvent<HTMLDivElement>) => {
		if (!config.dragEnabled) {
			return
		}

		const renderedPosition = getRenderedPosition(index)
		dragPositionRef.current = renderedPosition
		nativeDragCommittedRef.current = false
		setDraggingIndex(index)
		setDropTargetIndex(index)
		event.dataTransfer.effectAllowed = "move"
		event.dataTransfer.setData("text/plain", String(index))
	}, [config.dragEnabled, getRenderedPosition])

	const onNativeDragOver = useCallback((index: number) => (event: React.DragEvent<HTMLDivElement>) => {
		if (!config.dragEnabled) {
			return
		}

		event.preventDefault()
		event.dataTransfer.dropEffect = "move"
		setDropTargetIndex(index)
	}, [config.dragEnabled])

	const onNativeDrop = useCallback((index: number) => (event: React.DragEvent<HTMLDivElement>) => {
		if (!config.dragEnabled) {
			return
		}

		event.preventDefault()
		commitVisibleRowMove(dragPositionRef.current ?? undefined, getRenderedPosition(index))
		setDraggingIndex(null)
		setDropTargetIndex(null)
	}, [commitVisibleRowMove, config.dragEnabled, getRenderedPosition])

	const onNativeDragEnd = useCallback(() => {
		dragPositionRef.current = null
		setDraggingIndex(null)
		setDropTargetIndex(null)
	}, [])

	const bindScenarioView = useCallback((node: HTMLDivElement | null) => {
		if (viewRef.current === node && Boolean(sortableInstance.current) === config.dragEnabled) {
			return
		}

		if (sortableInstance.current) {
			sortableInstance.current.destroy()
			sortableInstance.current = null
		}

		viewRef.current = node

		if (!node || !config.dragEnabled) {
			return
		}

		sortableInstance.current = Sortable.create(node, {
			animation: 120,
			draggable: ".scenario-playground-row.is-draggable",
			forceFallback: true,
			ghostClass: "scenario-playground-row--ghost",
			chosenClass: "scenario-playground-row--chosen",
			onEnd: onSortableDragEnd
		})
	}, [config.dragEnabled, onSortableDragEnd])

	const renderView = useCallback((props?: PropsWithChildren<HTMLProps<HTMLDivElement>>): React.ReactElement => {
		return (
			<div
				{ ...props }
				ref={ bindScenarioView }
				className={ `${ props?.className ?? "" } scenario-playground-scroll-view` }
				style={ {
					...(props?.style || {}),
					"--scenario-tone": toneChannel
				} as React.CSSProperties }
			>
				{ props?.children }
			</div>
		)
	}, [bindScenarioView, toneChannel])

	const renderThumbVertical = useCallback((props?: PropsWithChildren<HTMLProps<HTMLDivElement>>): React.ReactElement => {
		return (
			<div
				{ ...props }
				className={ `${ props?.className ?? "" } scenario-playground-thumb` }
				style={ {
					...(props?.style || {}),
					"--scenario-tone": toneChannel
				} as React.CSSProperties }
			/>
		)
	}, [toneChannel])

	const renderPlaceholder = useCallback((index: number) => (
		<div className="scenario-playground-placeholder" style={ {height: getScenarioEstimatedHeight(config)} }>
			<span>#{ (index + 1).toLocaleString() }</span>
			<strong>Scrolling...</strong>
		</div>
	), [config])

	const renderItem = useCallback((index: number) => {
		const orderedIndex = rowOrder[index] ?? index
		const isPrepended = orderedIndex < prependedCount
		const scenarioIndex = Math.max(orderedIndex - prependedCount + deletedCount, 0)
		const isGroupHeader = config.grouped && !isPrepended && isScenarioGroupHeaderIndex(scenarioIndex)
		const businessIndex = config.grouped && !isPrepended
			? getScenarioGroupRowIndex(scenarioIndex)
			: scenarioIndex
		const height = isGroupHeader ? 44 : isPrepended ? 42 : getRowHeight(businessIndex, config)
		const tone = isGroupHeader ? "group" : isPrepended ? "focus" : getMillionRowTone(businessIndex)
		const isRowDraggable = config.dragEnabled && !isGroupHeader
		const className = [
			"scenario-playground-row",
			`scenario-playground-row--${ tone }`,
			isRowDraggable ? "is-draggable" : "",
			draggingIndex === index ? "is-dragging" : "",
			dropTargetIndex === index && draggingIndex !== index ? "is-drop-target" : ""
		].filter(Boolean).join(" ")

		if (isGroupHeader) {
			const groupIndex = getScenarioGroupIndex(scenarioIndex)
			return (
				<div
					className={ className }
					draggable={ isRowDraggable }
					style={ {height} }
					onDragStart={ onNativeDragStart(index) }
					onDragOver={ onNativeDragOver(index) }
					onDrop={ onNativeDrop(index) }
					onDragEnd={ onNativeDragEnd }
				>
					<span>Group { groupIndex + 1 }</span>
					<strong>{ (SCENARIO_GROUP_BLOCK_SIZE - 1).toLocaleString() } rows</strong>
					<em>sticky</em>
				</div>
			)
		}

		return (
			<div
				className={ className }
				draggable={ isRowDraggable }
				style={ {height} }
				onDragStart={ onNativeDragStart(index) }
				onDragOver={ onNativeDragOver(index) }
				onDrop={ onNativeDrop(index) }
				onDragEnd={ onNativeDragEnd }
			>
				<span>{ isPrepended ? "History" : `#${ (businessIndex + 1).toLocaleString() }` }</span>
				<strong>{ isPrepended ? `Prepended batch ${ prependedCount - orderedIndex }` : `Order ${ (businessIndex % 997) + 1 }` }</strong>
				<em>{ isPrepended ? "anchor" : getMillionRowStatus(businessIndex) }</em>
				<small>{ height }px</small>
			</div>
		)
	}, [
		config,
		deletedCount,
		draggingIndex,
		dropTargetIndex,
		onNativeDragEnd,
		onNativeDragOver,
		onNativeDragStart,
		onNativeDrop,
		prependedCount,
		rowOrder
	])

	const propsSnapshot = useMemo(() => getScenarioPropsSnapshot(config, itemCount), [config, itemCount])
	const shouldRenderScenarioView = config.styleMode === "custom" || config.dragEnabled

	return (
		<div className="scenario-playground" data-row-count={ MILLION_ROW_COUNT }>
			<div className="scenario-playground-head">
				<div>
					<div className="scenario-playground-kicker">All-in-one props playground</div>
					<h3>5000 万行虚拟列表实验台</h3>
					<p>通过场景预设和表单组合 props，观察同一份 5000 万行数据在不同虚拟滚动策略下的 DOM、区间、滚动和交互表现。</p>
				</div>
				<div className="scenario-playground-total">
					<span>Base rows</span>
					<strong>{ MILLION_ROW_COUNT.toLocaleString() } rows</strong>
				</div>
			</div>
			<div className="scenario-playground-grid">
				<aside className="scenario-playground-controls" aria-label="场景配置">
					<div className="scenario-playground-preset-grid">
						{ SCENARIO_PRESETS.map((preset) => (
							<button
								key={ preset.id }
								type="button"
								className={ preset.id === activePresetId ? "is-active" : "" }
								onClick={ () => applyPreset(preset.id) }
							>
								{ preset.label }
							</button>
						)) }
					</div>
					<p className="scenario-playground-preset-desc">{ activePreset.description }</p>
					<div className="scenario-playground-form">
						<Field label="高度策略">
							<select
								aria-label="高度策略"
								value={ config.heightMode }
								onChange={ (event) => updateConfig({heightMode: event.currentTarget.value as HeightMode}) }
							>
								<option value="fixed">固定高度</option>
								<option value="dynamic">动态高度</option>
							</select>
						</Field>
						<Field label="overscan">
							<input
								aria-label="overscan"
								type="number"
								min={ 0 }
								max={ 40 }
								value={ config.overscan }
								onChange={ (event) => updateConfig({overscan: getBoundedOverscan(Number(event.currentTarget.value))}) }
							/>
						</Field>
						<Field label="像素 overscan">
							<input
								aria-label="像素 overscan"
								type="number"
								min={ 0 }
								max={ 600 }
								step={ 20 }
								value={ config.overscanPixels }
								onChange={ (event) => updateConfig({overscanPixels: getBoundedOverscanPixels(Number(event.currentTarget.value))}) }
							/>
						</Field>
						<Field label="ARIA 模式">
							<select
								aria-label="ARIA 模式"
								value={ config.accessibilityMode }
								onChange={ (event) => updateConfig({accessibilityMode: event.currentTarget.value as AccessibilityMode}) }
							>
								<option value="none">关闭</option>
								<option value="list">列表</option>
								<option value="grid">网格</option>
							</select>
						</Field>
						<Field label="样式模式">
							<select
								aria-label="样式模式"
								value={ config.styleMode }
								onChange={ (event) => updateConfig({styleMode: event.currentTarget.value as StyleMode}) }
							>
								<option value="standard">标准</option>
								<option value="custom">自定义滚动条</option>
							</select>
						</Field>
						<Field label="物理滚动范围">
							<select
								aria-label="物理滚动范围"
								value={ config.maxBrowserScrollHeight }
								onChange={ (event) => updateConfig({maxBrowserScrollHeight: Number(event.currentTarget.value)}) }
							>
								<option value={ 800_000 }>800,000</option>
								<option value={ 1_200_000 }>1,200,000</option>
								<option value={ 2_000_000 }>2,000,000</option>
							</select>
						</Field>
						<div className="scenario-playground-toggle-grid">
							<Toggle label="自适应 overscan" checked={ config.adaptiveOverscan } onChange={ (checked) => updateConfig({adaptiveOverscan: checked}) }/>
							<Toggle label="滚动占位" checked={ config.scrollSeek } onChange={ (checked) => updateConfig({scrollSeek: checked}) }/>
							<Toggle label="锚点保持" checked={ config.maintainVisibleContentPosition } onChange={ (checked) => updateConfig({maintainVisibleContentPosition: checked}) }/>
							<Toggle label="底部跟随" checked={ config.followOutput } onChange={ (checked) => updateConfig({followOutput: checked}) }/>
							<Toggle label="吸顶分组" checked={ config.grouped } onChange={ (checked) => updateConfig({grouped: checked}) }/>
							<Toggle label="窗口拖拽" checked={ config.dragEnabled } onChange={ (checked) => updateConfig({dragEnabled: checked}) }/>
						</div>
					</div>
				</aside>
				<section className="scenario-playground-stage">
					<div className="scenario-playground-actions">
						{ MILLION_JUMP_POINTS.map((point) => (
							<button
								key={ point.label }
								type="button"
								aria-label={ `跳到${ point.label }` }
								onClick={ () => jumpToRatio(point.label, point.ratio) }
							>
								{ point.label }
							</button>
						)) }
						<button type="button" onClick={ fastScroll }>快速下滚</button>
						<button type="button" aria-label="上方插入 20 条" onClick={ prependRows }>插入 20</button>
						<button type="button" aria-label="底部追加 100 条" onClick={ appendRows }>追加 100</button>
						<button type="button" onClick={ deleteVisibleRow }>删除首行</button>
						<button type="button" onClick={ resetMutations }>重置变更</button>
					</div>
					<div className={ `scenario-playground-list ${ config.styleMode === "custom" ? "is-custom" : "" }` }>
						<VirtualScrollBar
							ref={ scrollRef }
							height={ SCENARIO_LIST_HEIGHT }
							itemCount={ itemCount }
							itemKey={ (index) => index < prependedCount ? `scenario-history-${ index }` : `scenario-row-${ index - prependedCount + deletedCount }` }
							itemHeight={ config.heightMode === "fixed" ? FIXED_MILLION_ROW_HEIGHT : undefined }
							estimatedItemHeight={ getScenarioEstimatedHeight(config) }
							overscan={ config.overscan }
							overscanPixels={ config.overscanPixels || undefined }
							adaptiveOverscan={ config.adaptiveOverscan ? {max: 18, velocityFactor: 0.004} : false }
							scrollSeek={ config.scrollSeek ? {velocityThreshold: 2, placeholder: renderPlaceholder} : false }
							maintainVisibleContentPosition={ config.maintainVisibleContentPosition }
							followOutput={ config.followOutput }
							groupCounts={ config.grouped ? groupCounts : undefined }
							accessibility={ getScenarioAccessibility(config.accessibilityMode) }
							maxBrowserScrollHeight={ config.maxBrowserScrollHeight }
							renderView={ shouldRenderScenarioView ? renderView : undefined }
							renderThumbVertical={ config.styleMode === "custom" ? renderThumbVertical : undefined }
							renderItem={ renderItem }
							onScroll={ onScroll }
							onItemsRendered={ onItemsRendered }
						/>
					</div>
					<div className="scenario-playground-metrics">
						<Metric label="Total" value={ itemCount.toLocaleString() }/>
						<Metric label="Visible" value={ formatVirtualRange({
							startIndex: itemsRendered.visibleStartIndex,
							endIndex: itemsRendered.visibleEndIndex
						}) }/>
						<Metric label="Rendered" value={ formatVirtualRange(itemsRendered) }/>
						<Metric label="DOM" value={ getRenderedCount(itemsRendered) }/>
						<Metric label="Y" value={ Math.round(scrollState.y).toLocaleString() }/>
						<Metric label="FPS" value={ fps || "-" }/>
					</div>
					<div className="scenario-playground-bottom">
						<div className="scenario-playground-snapshot">
							<h4>当前 props 快照</h4>
							<div>
								{ propsSnapshot.map((line) => <code key={ line }>{ line }</code>) }
							</div>
						</div>
						<div className="scenario-playground-log">
							<h4>事件日志</h4>
							<ul>
								{ logs.map((log, index) => <li key={ `${ log }-${ index }` }>{ log }</li>) }
							</ul>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}

export default ScenarioPlayground
