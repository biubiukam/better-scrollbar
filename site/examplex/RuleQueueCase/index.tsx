import React, { useCallback, useLayoutEffect, useRef, useState } from "react"
import type { HTMLProps, PropsWithChildren } from "react"
import { ChevronsUp, PauseCircle, Plus, RefreshCw } from "lucide-react"
import Sortable from "sortablejs"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, VirtualScrollBarRef } from "../../../src"
import { DEFAULT_EXAMPLE_COPY } from "../../i18n/examples"
import type { ExampleCopy } from "../../i18n/examples"
import {
	INITIAL_ITEMS_RENDERED,
	formatVirtualRange,
	getRenderedCount,
	useRafScrollState,
} from "../../components/ExampleSupport/sharedMillion"
import { cn, demoTw, toneRowTw } from "../../components/ExampleSupport/tailwind"

const RULE_ROW_COUNT = 20_000
const RULE_ROW_HEIGHT = 42
const SCENARIO_DEMO_LIST_HEIGHT = 360
const LOG_LIMIT = 4

interface RuleQueueDemoProps {
	copy?: ExampleCopy
}

function appendLog(logs: string[], message: string) {
	return [message, ...logs].slice(0, LOG_LIMIT)
}

function Metric({ label, value }: { label: string, value: React.ReactNode }) {
	return (
		<div className="min-w-0 rounded-md border border-border bg-card px-2.5 py-2">
			<span className="block text-xs leading-4 text-muted-foreground">{label}</span>
			<strong className="block truncate text-[15px] font-semibold leading-6 text-card-foreground">{value}</strong>
		</div>
	)
}

function ActionButton({
	children,
	icon,
	onClick,
}: {
	children: React.ReactNode
	icon: React.ReactNode
	onClick: () => void
}) {
	return (
		<button
			className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-semibold text-card-foreground transition-colors hover:bg-muted"
			type="button"
			onClick={onClick}
		>
			{icon}
			<span>{children}</span>
		</button>
	)
}

function useScrollTelemetry() {
	const [scrollState, scheduleScrollState] = useRafScrollState()
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)

	return { itemsRendered, scheduleScrollState, scrollState, setItemsRendered }
}

function createRuleOrder() {
	return Array.from({ length: RULE_ROW_COUNT }, (_, index) => index + 1)
}

function moveItem<T>(items: T[], oldIndex: number, newIndex: number) {
	const nextItems = items.slice()
	const [item] = nextItems.splice(oldIndex, 1)
	if (item !== undefined) {
		nextItems.splice(newIndex, 0, item)
	}
	return nextItems
}

function RuleRow({
	copy,
	index,
	orderId,
	paused,
	priorityId,
}: {
	copy: ExampleCopy["scenarioDemos"]["rules"]
	index: number
	orderId: number
	paused: boolean
	priorityId: number | null
}) {
	const isPriority = orderId === priorityId
	const isPaused = paused && index < 6
	const tone = isPriority ? "focus" : index % 5 === 0 ? "warm" : "plain"
	const status = isPaused ? copy.rows.paused : index % 3 === 0 ? copy.rows.running : copy.rows.waiting

	return (
		<div
			className={cn(
				demoTw.gridRow,
				"rule-demo-row is-draggable grid-cols-[64px_minmax(0,1fr)_86px] cursor-grab active:cursor-grabbing",
				toneRowTw[tone],
				tone === "focus" && "rule-demo-row--focus",
				tone === "warm" && "rule-demo-row--warm"
			)}
			style={{ height: RULE_ROW_HEIGHT }}
		>
			<span className={demoTw.rowIndex}>#{orderId.toLocaleString()}</span>
			<span className={demoTw.rowTitle}>
				{copy.rows.rule} {orderId} · {copy.rows.segment} {orderId % 12}
			</span>
			<span className={demoTw.rowMeta}>{status}</span>
		</div>
	)
}

export function RuleQueueDemo({ copy = DEFAULT_EXAMPLE_COPY }: RuleQueueDemoProps) {
	const text = copy.scenarioDemos.rules
	const scrollerRef = useRef<VirtualScrollBarRef>(null)
	const viewRef = useRef<HTMLDivElement | null>(null)
	const { itemsRendered, scheduleScrollState, setItemsRendered } = useScrollTelemetry()
	const [order, setOrder] = useState(createRuleOrder)
	const [, setLogs] = useState<string[]>(() => [text.logs.initial])
	const [paused, setPaused] = useState(false)
	const [priorityId, setPriorityId] = useState<number | null>(null)

	const addLog = useCallback((log: string) => {
		setLogs((currentLogs) => appendLog(currentLogs, log))
	}, [])

	const reorderVisibleWindow = useCallback((oldIndex: number, newIndex: number) => {
		setOrder((currentOrder) => moveItem(currentOrder, oldIndex, newIndex))
		addLog(text.logs.reordered)
	}, [addLog, text.logs.reordered])

	useLayoutEffect(() => {
		if (!viewRef.current) {
			return undefined
		}

		const sortable = Sortable.create(viewRef.current, {
			draggable: ".rule-demo-row.is-draggable",
			forceFallback: true,
			onEnd: (event) => {
				if (event.oldIndex === undefined || event.newIndex === undefined || event.oldIndex === event.newIndex) {
					return
				}
				reorderVisibleWindow(event.oldIndex, event.newIndex)
			},
		})

		return () => sortable.destroy()
	}, [reorderVisibleWindow])

	return (
		<div className={cn(demoTw.shell, "rule-demo-wrapper")}>
			<header className={cn(demoTw.head, "rule-demo-head")}>
				<div>
					<h3 className={demoTw.title}>{text.title}</h3>
					<p className={demoTw.subtitle}>{text.subtitle}</p>
				</div>
				<div className={cn(demoTw.state, demoTw.stateActive)}>SortableJS</div>
			</header>
			<div className={cn(demoTw.metricGrid, "grid-cols-2 md:grid-cols-4")}>
				<Metric label={text.metrics.queue} value={order.length.toLocaleString()} />
				<Metric label={text.metrics.draggable} value="enabled" />
				<Metric label={copy.shared.visible} value={formatVirtualRange(itemsRendered)} />
				<Metric label={copy.shared.rendered} value={getRenderedCount(itemsRendered).toLocaleString()} />
			</div>
			<div className={cn(demoTw.listTall, "rule-demo-list")}>
				<VirtualScrollBar
					ref={scrollerRef}
					height={SCENARIO_DEMO_LIST_HEIGHT}
					isVirtual
					itemCount={order.length}
					estimatedItemHeight={RULE_ROW_HEIGHT}
					overscan={6}
					maintainVisibleContentPosition
					onItemsRendered={setItemsRendered}
					onScroll={scheduleScrollState}
					renderView={(props?: PropsWithChildren<HTMLProps<HTMLDivElement>>) => (
						<div {...props} ref={viewRef} />
					)}
					renderItem={(index) => (
						<RuleRow
							key={order[index] ?? index}
							copy={text}
							index={index}
							orderId={order[index] ?? index + 1}
							paused={paused}
							priorityId={priorityId}
						/>
					)}
				/>
			</div>
			<footer className={cn(demoTw.toolbar, "rule-demo-toolbar")}>
				<ActionButton
					icon={<Plus className="h-3.5 w-3.5" />}
					onClick={() => {
						setOrder((currentOrder) => [currentOrder.length + 1, ...currentOrder])
						addLog(text.logs.enqueued)
					}}
				>
					{text.actions.enqueue}
				</ActionButton>
				<ActionButton
					icon={<ChevronsUp className="h-3.5 w-3.5" />}
					onClick={() => {
						setPriorityId(order[0] ?? null)
						addLog(text.logs.promoted)
					}}
				>
					{text.actions.promote}
				</ActionButton>
				<ActionButton
					icon={<PauseCircle className="h-3.5 w-3.5" />}
					onClick={() => {
						setPaused((currentPaused) => !currentPaused)
						addLog(text.logs.paused)
					}}
				>
					{text.actions.pause}
				</ActionButton>
				<ActionButton
					icon={<RefreshCw className="h-3.5 w-3.5" />}
					onClick={() => {
						setOrder(createRuleOrder())
						setPaused(false)
						setPriorityId(null)
						scrollerRef.current?.scrollTo({ x: 0, y: 0 })
						addLog(text.logs.reset)
					}}
				>
					{text.actions.reset}
				</ActionButton>
			</footer>
		</div>
	)
}
