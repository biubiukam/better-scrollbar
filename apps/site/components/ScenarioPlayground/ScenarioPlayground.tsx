import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { HTMLProps, PropsWithChildren } from "react"
import VirtualScrollBar, { getStickyIndicesFromGroups } from "@better-scrollbar/react"
import type {
	ItemsRenderedInfo,
	OverscanConfig,
	ScrollState,
	VirtualScrollBarRef
} from "@better-scrollbar/react"
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
} from "../ExampleSupport/sharedMillion"
import { BASE_SCENARIO_CONFIG, SCENARIO_PRESETS, getScenarioPreset } from "./presets"
import type { HeightMode, ScenarioConfig, ScenarioPresetId, StyleMode } from "./types"
import {
	SCENARIO_GROUP_BLOCK_SIZE,
	getBoundedOverscan,
	getBoundedOverscanPixels,
	getScenarioEstimatedHeight,
	getScenarioGroupCounts,
	getScenarioPropsSnapshot
} from "./utils"
import { cn, demoTw, toneRowTw } from "../ExampleSupport/tailwind"
import { DEFAULT_EXAMPLE_COPY } from "../../i18n/examples"
import type { ExampleCopy } from "../../i18n/examples"

const SCENARIO_LIST_HEIGHT = 420
const MAX_LOG_COUNT = 6
const SCENARIO_BUTTON_CLASS =
	"h-[30px] shrink-0 rounded-md border border-border bg-muted/40 px-2.5 text-xs text-card-foreground hover:bg-muted"
const SCENARIO_PANEL_TITLE_CLASS = "text-[13px] font-semibold leading-[18px] text-card-foreground"
const INITIAL_ITEMS_RENDERED: ItemsRenderedInfo = {
	startIndex: 0,
	endIndex: -1,
	visibleStartIndex: 0,
	visibleEndIndex: -1
}

function appendLog(logs: string[], message: string) {
	return [message, ...logs].slice(0, MAX_LOG_COUNT)
}

function Field({ label, children }: PropsWithChildren<{ label: string }>) {
	return (
		<label className="scenario-playground-field grid gap-1.5 text-xs leading-4 text-muted-foreground">
			<span>{label}</span>
			{children}
		</label>
	)
}

function Toggle({
	label,
	checked,
	onChange
}: {
	label: string
	checked: boolean
	onChange: (checked: boolean) => void
}) {
	return (
		<label className="scenario-playground-toggle flex min-h-8 min-w-0 items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-xs leading-4 text-card-foreground">
			<input
				className="h-4 w-4 shrink-0 accent-primary"
				type="checkbox"
				aria-label={label}
				checked={checked}
				onChange={(event) => onChange(event.currentTarget.checked)}
			/>
			<span className="min-w-0 truncate">{label}</span>
		</label>
	)
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="scenario-playground-metric grid min-h-[54px] min-w-0 content-center gap-0.5 bg-muted/30 px-2.5 py-2 tabular-nums">
			<span className="text-[11px] leading-[14px] text-muted-foreground">{label}</span>
			<strong className="min-w-0 truncate text-[13px] font-semibold leading-[18px] text-card-foreground">
				{value}
			</strong>
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

function ScenarioPlayground({ copy = DEFAULT_EXAMPLE_COPY }: { copy?: ExampleCopy }) {
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
	const [logs, setLogs] = useState<string[]>(() => [copy.scenario.logs.initial])
	const fps = useFpsSample()

	const itemCount = MILLION_ROW_COUNT + prependedCount + appendedCount - deletedCount
	const activePreset = getScenarioPreset(activePresetId)
	const activePresetCopy = copy.scenario.presets[activePreset.id]
	const scenarioGroupCounts = useMemo(() => getScenarioGroupCounts(), [])
	const scenarioStickyIndices = useMemo(
		() => getStickyIndicesFromGroups(scenarioGroupCounts),
		[scenarioGroupCounts]
	)
	const toneChannel = getToneChannel(scrollState)

	useEffect(() => {
		const initial = copy.scenario.logs.initial
		queueMicrotask(() => setLogs([initial]))
	}, [copy.scenario.logs.initial])

	const recordLog = useCallback((message: string) => {
		setLogs((currentLogs) => appendLog(currentLogs, message))
	}, [])

	const updateConfig = useCallback((patch: Partial<ScenarioConfig>) => {
		setConfig((currentConfig) => ({ ...currentConfig, ...patch }))
	}, [])

	const applyPreset = useCallback(
		(presetId: ScenarioPresetId) => {
			const preset = getScenarioPreset(presetId)
			const presetCopy = copy.scenario.presets[preset.id]
			setActivePresetId(preset.id)
			setConfig(preset.config)
			setRowOrder({})
			recordLog(copy.scenario.logs.switchPreset(presetCopy.label))
		},
		[copy.scenario.logs, copy.scenario.presets, recordLog]
	)

	const onItemsRendered = useCallback((nextItemsRendered: ItemsRenderedInfo) => {
		itemsRenderedRef.current = nextItemsRendered
		setItemsRendered(nextItemsRendered)
	}, [])

	const onScroll = useCallback(
		(nextScrollState: ScrollState) => {
			scrollStateRef.current = nextScrollState
			setScrollState(nextScrollState)
		},
		[setScrollState]
	)

	const jumpToRatio = useCallback(
		(label: string, ratio: number) => {
			const currentScrollState = scrollStateRef.current
			scrollRef.current?.scrollTo({
				x: 0,
				y: getJumpOffset(
					currentScrollState.scrollHeight,
					currentScrollState.clientHeight,
					ratio
				)
			})
			recordLog(copy.scenario.logs.jumpTo(label))
		},
		[copy.scenario.logs, recordLog]
	)

	const fastScroll = useCallback(() => {
		const currentScrollState = scrollStateRef.current
		const maxOffset = Math.max(
			currentScrollState.scrollHeight - currentScrollState.clientHeight,
			0
		)
		scrollRef.current?.scrollTo({
			x: 0,
			y: Math.min(currentScrollState.y + 260_000, maxOffset)
		})
		recordLog(copy.scenario.logs.fastScroll)
	}, [copy.scenario.logs.fastScroll, recordLog])

	const prependRows = useCallback(() => {
		setPrependedCount((count) => count + 20)
		recordLog(copy.scenario.logs.prependRows)
	}, [copy.scenario.logs.prependRows, recordLog])

	const appendRows = useCallback(() => {
		setAppendedCount((count) => count + 100)
		recordLog(copy.scenario.logs.appendRows)
	}, [copy.scenario.logs.appendRows, recordLog])

	const deleteVisibleRow = useCallback(() => {
		setDeletedCount((count) =>
			Math.min(count + 1, MILLION_ROW_COUNT + prependedCount + appendedCount - 1)
		)
		recordLog(
			copy.scenario.logs.deleteVisibleRow(
				(itemsRenderedRef.current.visibleStartIndex + 1).toLocaleString()
			)
		)
	}, [appendedCount, copy.scenario.logs, prependedCount, recordLog])

	const resetMutations = useCallback(() => {
		setPrependedCount(0)
		setAppendedCount(0)
		setDeletedCount(0)
		setRowOrder({})
		recordLog(copy.scenario.logs.resetMutations)
	}, [copy.scenario.logs.resetMutations, recordLog])

	const moveVisibleRow = useCallback(
		(fromPosition?: number, toPosition?: number) => {
			if (
				fromPosition === undefined ||
				toPosition === undefined ||
				fromPosition === toPosition
			) {
				return
			}

			const currentRange = itemsRenderedRef.current
			const renderedCount = getRenderedCount(currentRange)
			if (
				fromPosition < 0 ||
				toPosition < 0 ||
				fromPosition >= renderedCount ||
				toPosition >= renderedCount
			) {
				return
			}

			setRowOrder((currentOrder) => {
				const nextOrder = { ...currentOrder }
				const targetIndices = Array.from(
					{ length: renderedCount },
					(_, offset) => currentRange.startIndex + offset
				)
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
			recordLog(copy.scenario.logs.dragSort)
		},
		[copy.scenario.logs.dragSort, recordLog]
	)

	const commitVisibleRowMove = useCallback(
		(fromPosition?: number, toPosition?: number) => {
			if (dragPositionRef.current !== null) {
				if (nativeDragCommittedRef.current) {
					return
				}
				nativeDragCommittedRef.current = true
			}

			moveVisibleRow(fromPosition, toPosition)
		},
		[moveVisibleRow]
	)

	const onSortableDragEnd = useCallback(
		(event: { oldIndex?: number; newIndex?: number }) => {
			commitVisibleRowMove(event.oldIndex, event.newIndex)
		},
		[commitVisibleRowMove]
	)

	const getRenderedPosition = useCallback((index: number) => {
		return index - itemsRenderedRef.current.startIndex
	}, [])

	const onNativeDragStart = useCallback(
		(index: number) => (event: React.DragEvent<HTMLDivElement>) => {
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
		},
		[config.dragEnabled, getRenderedPosition]
	)

	const onNativeDragOver = useCallback(
		(index: number) => (event: React.DragEvent<HTMLDivElement>) => {
			if (!config.dragEnabled) {
				return
			}

			event.preventDefault()
			event.dataTransfer.dropEffect = "move"
			setDropTargetIndex(index)
		},
		[config.dragEnabled]
	)

	const onNativeDrop = useCallback(
		(index: number) => (event: React.DragEvent<HTMLDivElement>) => {
			if (!config.dragEnabled) {
				return
			}

			event.preventDefault()
			commitVisibleRowMove(dragPositionRef.current ?? undefined, getRenderedPosition(index))
			setDraggingIndex(null)
			setDropTargetIndex(null)
		},
		[commitVisibleRowMove, config.dragEnabled, getRenderedPosition]
	)

	const onNativeDragEnd = useCallback(() => {
		dragPositionRef.current = null
		setDraggingIndex(null)
		setDropTargetIndex(null)
	}, [])

	const bindScenarioView = useCallback(
		(node: HTMLDivElement | null) => {
			if (
				viewRef.current === node &&
				Boolean(sortableInstance.current) === config.dragEnabled
			) {
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
				ghostClass: "opacity-20",
				chosenClass: "bg-primary/10",
				onEnd: onSortableDragEnd
			})
		},
		[config.dragEnabled, onSortableDragEnd]
	)

	const renderView = useCallback(
		(props?: PropsWithChildren<HTMLProps<HTMLDivElement>>): React.ReactElement => {
			return (
				<div
					{...props}
					ref={bindScenarioView}
					className={cn(props?.className, "scenario-playground-scroll-view bg-card")}
					style={
						{
							...(props?.style || {}),
							"--scenario-tone": toneChannel
						} as React.CSSProperties
					}
				>
					{props?.children}
				</div>
			)
		},
		[bindScenarioView, toneChannel]
	)

	const renderThumbVertical = useCallback(
		(props?: PropsWithChildren<HTMLProps<HTMLDivElement>>): React.ReactElement => {
			return (
				<div
					{...props}
					className={cn(
						props?.className,
						"scenario-playground-thumb rounded-[inherit] bg-primary"
					)}
					style={
						{
							...(props?.style || {}),
							"--scenario-tone": toneChannel
						} as React.CSSProperties
					}
				/>
			)
		},
		[toneChannel]
	)

	const renderPlaceholder = useCallback(
		(index: number) => (
			<div
				className="scenario-playground-placeholder grid w-full grid-cols-[132px_minmax(0,1fr)_94px_54px] items-center gap-2.5 border-t border-border bg-card px-3.5 text-[13px] text-muted-foreground opacity-70 tabular-nums"
				style={{ height: getScenarioEstimatedHeight(config) }}
			>
				<span className="font-semibold text-card-foreground">
					#{(index + 1).toLocaleString()}
				</span>
				<strong className="min-w-0 truncate font-medium">
					{copy.scenario.rows.scrolling}
				</strong>
			</div>
		),
		[config, copy.scenario.rows.scrolling]
	)

	const renderItem = useCallback(
		(index: number) => {
			const orderedIndex = rowOrder[index] ?? index
			const isPrepended = orderedIndex < prependedCount
			const scenarioIndex = Math.max(orderedIndex - prependedCount + deletedCount, 0)
			const isGroupHeader =
				config.grouped && !isPrepended && isScenarioGroupHeaderIndex(scenarioIndex)
			const businessIndex =
				config.grouped && !isPrepended
					? getScenarioGroupRowIndex(scenarioIndex)
					: scenarioIndex
			const height = isGroupHeader
				? 44
				: isPrepended
					? 42
					: getRowHeight(businessIndex, config)
			const tone = isGroupHeader
				? "group"
				: isPrepended
					? "focus"
					: getMillionRowTone(businessIndex)
			const isRowDraggable = config.dragEnabled && !isGroupHeader
			const className = cn(
				"scenario-playground-row",
				`scenario-playground-row--${tone}`,
				"grid w-full grid-cols-[132px_minmax(0,1fr)_94px_54px] items-center gap-2.5 border-t border-border bg-card px-3.5 text-[13px] text-muted-foreground tabular-nums",
				toneRowTw[tone],
				isRowDraggable && "is-draggable cursor-grab select-none active:cursor-grabbing",
				draggingIndex === index && "is-dragging opacity-60",
				dropTargetIndex === index &&
					draggingIndex !== index &&
					"is-drop-target shadow-[inset_3px_0_0_hsl(var(--primary))]"
			)

			if (isGroupHeader) {
				const groupIndex = getScenarioGroupIndex(scenarioIndex)
				return (
					<div
						className={className}
						draggable={isRowDraggable}
						style={{ height }}
						onDragStart={onNativeDragStart(index)}
						onDragOver={onNativeDragOver(index)}
						onDrop={onNativeDrop(index)}
						onDragEnd={onNativeDragEnd}
					>
						<span className="font-semibold text-card-foreground">
							{copy.scenario.rows.group(groupIndex + 1)}
						</span>
						<strong className="min-w-0 truncate font-medium text-card-foreground">
							{(SCENARIO_GROUP_BLOCK_SIZE - 1).toLocaleString()}{" "}
							{copy.scenario.rows.rows}
						</strong>
						<em className="not-italic text-xs text-muted-foreground">
							{copy.scenario.rows.sticky}
						</em>
					</div>
				)
			}

			return (
				<div
					className={className}
					draggable={isRowDraggable}
					style={{ height }}
					onDragStart={onNativeDragStart(index)}
					onDragOver={onNativeDragOver(index)}
					onDrop={onNativeDrop(index)}
					onDragEnd={onNativeDragEnd}
				>
					<span className="font-semibold text-card-foreground">
						{isPrepended
							? copy.scenario.rows.history
							: `#${(businessIndex + 1).toLocaleString()}`}
					</span>
					<strong className="min-w-0 truncate font-medium">
						{isPrepended
							? copy.scenario.rows.prependedBatch(prependedCount - orderedIndex)
							: copy.scenario.rows.order((businessIndex % 997) + 1)}
					</strong>
					<em className="not-italic text-xs text-muted-foreground">
						{isPrepended
							? copy.scenario.rows.anchor
							: getMillionRowStatus(businessIndex)}
					</em>
					<small className="text-right text-xs text-muted-foreground">{height}px</small>
				</div>
			)
		},
		[
			config,
			deletedCount,
			draggingIndex,
			dropTargetIndex,
			onNativeDragEnd,
			onNativeDragOver,
			onNativeDragStart,
			onNativeDrop,
			prependedCount,
			rowOrder,
			copy.scenario.rows
		]
	)

	const scenarioOverscan = useMemo((): number | OverscanConfig => {
		if (!config.overscanPixels && !config.adaptiveOverscan) {
			return config.overscan
		}

		return {
			items: config.overscan,
			pixels: config.overscanPixels || undefined,
			adaptive: config.adaptiveOverscan ? { max: 18, velocityFactor: 0.004 } : false
		}
	}, [config.overscan, config.overscanPixels, config.adaptiveOverscan])

	const propsSnapshot = useMemo(
		() => getScenarioPropsSnapshot(config, itemCount),
		[config, itemCount]
	)
	const shouldRenderScenarioView = config.styleMode === "custom" || config.dragEnabled

	return (
		<div
			className="scenario-playground flex w-full flex-col bg-card text-card-foreground"
			data-row-count={MILLION_ROW_COUNT}
		>
			<div className="scenario-playground-head grid flex-none gap-3 border-b border-border px-5 py-4 lg:flex lg:items-start lg:justify-between lg:gap-[18px]">
				<div>
					<div className="scenario-playground-kicker text-xs font-semibold leading-[18px] text-accent">
						{copy.scenario.kicker}
					</div>
					<h3 className="mt-1 text-lg font-semibold leading-[26px] text-card-foreground">
						{copy.scenario.title}
					</h3>
					<p className="mt-1.5 max-w-[760px] text-[13px] leading-5 text-muted-foreground">
						{copy.scenario.desc}
					</p>
				</div>
				<div className="scenario-playground-total grid min-w-[140px] gap-0.5 rounded-md border border-border bg-muted/30 px-2.5 py-2 text-left tabular-nums lg:text-right">
					<span className="text-xs leading-4 text-muted-foreground">
						{copy.scenario.baseRows}
					</span>
					<strong className="text-[15px] font-semibold leading-5 text-card-foreground">
						{MILLION_ROW_COUNT.toLocaleString()} {copy.shared.rows}
					</strong>
				</div>
			</div>
			<div className="scenario-playground-grid grid grid-cols-1 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
				<aside
					className="scenario-playground-controls min-w-0 border-b border-border bg-muted/20 p-3.5 lg:border-b-0 lg:border-r"
					aria-label={copy.scenario.controlsLabel}
				>
					<div className="scenario-playground-preset-grid grid grid-cols-2 gap-2">
						{SCENARIO_PRESETS.map((preset) => (
							<button
								key={preset.id}
								type="button"
								className={cn(
									SCENARIO_BUTTON_CLASS,
									"min-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
									preset.id === activePresetId &&
										"is-active border-accent bg-accent/10 font-semibold text-accent"
								)}
								onClick={() => applyPreset(preset.id)}
							>
								{copy.scenario.presets[preset.id].label}
							</button>
						))}
					</div>
					<p className="scenario-playground-preset-desc mt-2.5 min-h-14 text-xs leading-[18px] text-muted-foreground">
						{activePresetCopy.description}
					</p>
					<div className="scenario-playground-form grid gap-2.5">
						<Field label={copy.scenario.fields.heightMode}>
							<select
								className={demoTw.control}
								aria-label={copy.scenario.fields.heightMode}
								value={config.heightMode}
								onChange={(event) =>
									updateConfig({
										heightMode: event.currentTarget.value as HeightMode
									})
								}
							>
								<option value="fixed">{copy.scenario.heightOptions.fixed}</option>
								<option value="dynamic">
									{copy.scenario.heightOptions.dynamic}
								</option>
							</select>
						</Field>
						<Field label="overscan">
							<input
								className={demoTw.control}
								aria-label="overscan"
								type="number"
								min={0}
								max={40}
								value={config.overscan}
								onChange={(event) =>
									updateConfig({
										overscan: getBoundedOverscan(
											Number(event.currentTarget.value)
										)
									})
								}
							/>
						</Field>
						<Field label={copy.scenario.fields.overscanPixels}>
							<input
								className={demoTw.control}
								aria-label={copy.scenario.fields.overscanPixels}
								type="number"
								min={0}
								max={600}
								step={20}
								value={config.overscanPixels}
								onChange={(event) =>
									updateConfig({
										overscanPixels: getBoundedOverscanPixels(
											Number(event.currentTarget.value)
										)
									})
								}
							/>
						</Field>
						<Field label={copy.scenario.fields.styleMode}>
							<select
								className={demoTw.control}
								aria-label={copy.scenario.fields.styleMode}
								value={config.styleMode}
								onChange={(event) =>
									updateConfig({
										styleMode: event.currentTarget.value as StyleMode
									})
								}
							>
								<option value="standard">
									{copy.scenario.styleOptions.standard}
								</option>
								<option value="custom">{copy.scenario.styleOptions.custom}</option>
							</select>
						</Field>
						<div className="scenario-playground-toggle-grid grid grid-cols-2 gap-2">
							<Toggle
								label={copy.scenario.toggles.adaptiveOverscan}
								checked={config.adaptiveOverscan}
								onChange={(checked) => updateConfig({ adaptiveOverscan: checked })}
							/>
							<Toggle
								label={copy.scenario.toggles.scrollSeek}
								checked={config.scrollSeek}
								onChange={(checked) => updateConfig({ scrollSeek: checked })}
							/>
							<Toggle
								label={copy.scenario.toggles.maintainVisibleContentPosition}
								checked={config.maintainVisibleContentPosition}
								onChange={(checked) =>
									updateConfig({ maintainVisibleContentPosition: checked })
								}
							/>
							<Toggle
								label={copy.scenario.toggles.followOutput}
								checked={config.followOutput}
								onChange={(checked) => updateConfig({ followOutput: checked })}
							/>
							<Toggle
								label={copy.scenario.toggles.grouped}
								checked={config.grouped}
								onChange={(checked) => updateConfig({ grouped: checked })}
							/>
							<Toggle
								label={copy.scenario.toggles.dragEnabled}
								checked={config.dragEnabled}
								onChange={(checked) => updateConfig({ dragEnabled: checked })}
							/>
						</div>
					</div>
				</aside>
				<section className="scenario-playground-stage flex min-w-0 flex-col bg-card">
					<div className="scenario-playground-actions flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
						{MILLION_JUMP_POINTS.map((point, index) => (
							<button
								className={SCENARIO_BUTTON_CLASS}
								key={point.id}
								type="button"
								aria-label={copy.scenario.actions.jumpTo(copy.jumpPoints[index])}
								onClick={() => jumpToRatio(copy.jumpPoints[index], point.ratio)}
							>
								{copy.jumpPoints[index]}
							</button>
						))}
						<button
							className={SCENARIO_BUTTON_CLASS}
							type="button"
							onClick={fastScroll}
						>
							{copy.scenario.actions.fastScroll}
						</button>
						<button
							className={SCENARIO_BUTTON_CLASS}
							type="button"
							aria-label={copy.scenario.actions.prependRowsAria}
							onClick={prependRows}
						>
							{copy.scenario.actions.prependRowsLabel}
						</button>
						<button
							className={SCENARIO_BUTTON_CLASS}
							type="button"
							aria-label={copy.scenario.actions.appendRowsAria}
							onClick={appendRows}
						>
							{copy.scenario.actions.appendRowsLabel}
						</button>
						<button
							className={SCENARIO_BUTTON_CLASS}
							type="button"
							onClick={deleteVisibleRow}
						>
							{copy.scenario.actions.deleteVisibleRow}
						</button>
						<button
							className={SCENARIO_BUTTON_CLASS}
							type="button"
							onClick={resetMutations}
						>
							{copy.scenario.actions.resetMutations}
						</button>
					</div>
					<div
						className={cn(
							"scenario-playground-list h-[420px] w-full shrink-0 border-b border-border bg-card",
							config.styleMode === "custom" && "is-custom bg-primary/5"
						)}
					>
						<VirtualScrollBar
							ref={scrollRef}
							height={SCENARIO_LIST_HEIGHT}
							itemCount={itemCount}
							itemKey={(index) =>
								index < prependedCount
									? `scenario-history-${index}`
									: `scenario-row-${index - prependedCount + deletedCount}`
							}
							estimatedItemHeight={getScenarioEstimatedHeight(config)}
							overscan={scenarioOverscan}
							scrollSeek={
								config.scrollSeek
									? { velocityThreshold: 2, placeholder: renderPlaceholder }
									: false
							}
							maintainVisibleContentPosition={config.maintainVisibleContentPosition}
							followOutput={config.followOutput}
							stickyIndices={config.grouped ? scenarioStickyIndices : undefined}
							renderView={shouldRenderScenarioView ? renderView : undefined}
							renderThumbVertical={
								config.styleMode === "custom" ? renderThumbVertical : undefined
							}
							renderItem={renderItem}
							onScroll={onScroll}
							onItemsRendered={onItemsRendered}
						/>
					</div>
					<div className="scenario-playground-metrics grid shrink-0 grid-cols-2 gap-px border-b border-border bg-border lg:grid-cols-5">
						<Metric
							label={copy.scenario.metrics.total}
							value={itemCount.toLocaleString()}
						/>
						<Metric
							label={copy.scenario.metrics.visible}
							value={formatVirtualRange({
								startIndex: itemsRendered.visibleStartIndex,
								endIndex: itemsRendered.visibleEndIndex
							})}
						/>
						<Metric
							label={copy.scenario.metrics.rendered}
							value={formatVirtualRange(itemsRendered)}
						/>
						<Metric
							label={copy.scenario.metrics.y}
							value={Math.round(scrollState.y).toLocaleString()}
						/>
						<Metric label={copy.scenario.metrics.fps} value={fps || "-"} />
					</div>
					<div className="scenario-playground-bottom grid min-h-0 flex-1 grid-cols-1 border-b border-border lg:grid-cols-[minmax(0,1.3fr)_minmax(220px,0.7fr)]">
						<div className="scenario-playground-snapshot min-w-0 border-b border-border px-3.5 py-3 lg:border-b-0 lg:border-r">
							<h4 className={SCENARIO_PANEL_TITLE_CLASS}>
								{copy.scenario.panels.propsSnapshot}
							</h4>
							<div className="mt-2 grid grid-cols-1 gap-x-2 gap-y-1.5 xl:grid-cols-2">
								{propsSnapshot.map((line) => (
									<code
										className="min-w-0 truncate rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] leading-[15px] text-muted-foreground"
										key={line}
									>
										{line}
									</code>
								))}
							</div>
						</div>
						<div className="scenario-playground-log min-w-0 px-3.5 py-3">
							<h4 className={SCENARIO_PANEL_TITLE_CLASS}>
								{copy.scenario.panels.eventLog}
							</h4>
							<ul className="mt-2 grid gap-1.5">
								{logs.map((log, index) => (
									<li
										className="min-w-0 truncate text-xs leading-[18px] text-muted-foreground"
										key={`${log}-${index}`}
									>
										{log}
									</li>
								))}
							</ul>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}

export default ScenarioPlayground
