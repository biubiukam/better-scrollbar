import React, { useCallback, useMemo, useRef, useState } from "react"
import { ChevronsUp, RefreshCw, Search, Zap } from "lucide-react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, VirtualScrollBarRef } from "../../../src"
import { DEFAULT_EXAMPLE_COPY } from "../../i18n/examples"
import type { ExampleCopy } from "../../i18n/examples"
import {
	INITIAL_ITEMS_RENDERED,
	formatVirtualRange,
	getJumpOffset,
	useRafScrollState,
} from "../../components/ExampleSupport/sharedMillion"
import { cn, demoTw, toneRowTw } from "../../components/ExampleSupport/tailwind"

const MEDIA_ROW_COUNT = 1_200_000
const SCENARIO_DEMO_LIST_HEIGHT = 360
const LOG_LIMIT = 4

interface MediaSearchDemoProps {
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

function getMediaTone(index: number) {
	if (index % 11 === 0) {
		return "focus"
	}
	if (index % 5 === 0) {
		return "warm"
	}
	return "plain"
}

function getMediaHeight(index: number, compact: boolean) {
	if (compact) {
		return index % 6 === 0 ? 78 : 58
	}

	return index % 6 === 0 ? 112 : 82
}

function MediaRow({
	compact,
	copy,
	index,
	query,
}: {
	compact: boolean
	copy: ExampleCopy["scenarioDemos"]["media"]
	index: number
	query: string
}) {
	const tone = getMediaTone(index)
	const height = getMediaHeight(index, compact)

	return (
		<div
			className={cn(
				demoTw.gridRow,
				"media-demo-row grid-cols-[64px_minmax(0,1fr)_92px]",
				toneRowTw[tone],
				tone === "focus" && "media-demo-row--focus",
				tone === "warm" && "media-demo-row--warm"
			)}
			style={{ height }}
		>
			<span className={demoTw.rowIndex}>#{index.toLocaleString()}</span>
			<span className={demoTw.rowTitle}>
				{copy.rows.asset} · {query} · {copy.rows.collection} {index % 97}
			</span>
			<span className={demoTw.rowMeta}>{index % 6 === 0 ? copy.rows.heavy : copy.rows.preview}</span>
		</div>
	)
}

export function MediaSearchDemo({ copy = DEFAULT_EXAMPLE_COPY }: MediaSearchDemoProps) {
	const text = copy.scenarioDemos.media
	const queries = useMemo(() => copy === DEFAULT_EXAMPLE_COPY
		? ["退款凭证", "门店海报", "质检截图"]
		: ["refund proof", "store poster", "quality screenshot"], [copy])
	const scrollerRef = useRef<VirtualScrollBarRef>(null)
	const { itemsRendered, scheduleScrollState, scrollState, setItemsRendered } = useScrollTelemetry()
	const [queryIndex, setQueryIndex] = useState(0)
	const [compact, setCompact] = useState(false)
	const [, setLogs] = useState<string[]>(() => [text.logs.initial])
	const query = queries[queryIndex % queries.length]

	const addLog = useCallback((log: string) => {
		setLogs((currentLogs) => appendLog(currentLogs, log))
	}, [])

	const fastScroll = useCallback(() => {
		const state = scrollerRef.current?.getScrollState() ?? scrollState
		scrollerRef.current?.scrollTo({ x: 0, y: getJumpOffset(state.scrollHeight, state.clientHeight, 0.68) })
		addLog(text.logs.fastScroll)
	}, [addLog, scrollState, text.logs.fastScroll])

	const resetView = useCallback(() => {
		setQueryIndex(0)
		setCompact(false)
		scrollerRef.current?.scrollTo({ x: 0, y: 0 })
		addLog(text.logs.reset)
	}, [addLog, text.logs.reset])

	return (
		<div className={cn(demoTw.shell, "media-demo-wrapper")}>
			<header className={cn(demoTw.head, "media-demo-head")}>
				<div>
					<h3 className={demoTw.title}>{text.title}</h3>
					<p className={demoTw.subtitle}>{text.subtitle}</p>
				</div>
				<div className={cn(demoTw.state, demoTw.stateActive)}>seek enabled</div>
			</header>
			<div className={cn(demoTw.metricGrid, "grid-cols-2 md:grid-cols-4")}>
				<Metric label={text.metrics.query} value={query} />
				<Metric label={text.metrics.seek} value="scrollSeek: on" />
				<Metric label="adaptiveOverscan" value="adaptiveOverscan: on" />
				<Metric label={copy.shared.visible} value={formatVirtualRange(itemsRendered)} />
			</div>
			<div className={cn(demoTw.listTall, "media-demo-list")}>
				<VirtualScrollBar
					ref={scrollerRef}
					height={SCENARIO_DEMO_LIST_HEIGHT}
					isVirtual
					itemCount={MEDIA_ROW_COUNT}
					estimatedItemHeight={compact ? 62 : 88}
					overscan={{ items: 4, pixels: { before: 240, after: 520 }, adaptive: { min: 4, max: 18, velocityFactor: 0.04, timeFactor: 0.2 } }}
					scrollSeek={{
						velocityThreshold: 0.8,
						placeholder: (index) => (
							<div
								key={index}
								className="media-demo-row media-demo-row--focus flex items-center border-t border-border bg-muted/50 px-3.5 text-xs text-muted-foreground"
								style={{ height: getMediaHeight(index, compact) }}
							>
								{text.rows.scrolling}
							</div>
						),
					}}
					onItemsRendered={setItemsRendered}
					onScroll={scheduleScrollState}
					renderItem={(index) => (
						<MediaRow
							key={`${query}-${compact}-${index}`}
							compact={compact}
							copy={text}
							index={index}
							query={query}
						/>
					)}
				/>
			</div>
			<footer className={cn(demoTw.toolbar, "media-demo-toolbar")}>
				<ActionButton
					icon={<Search className="h-3.5 w-3.5" />}
					onClick={() => {
						setQueryIndex((currentIndex) => currentIndex + 1)
						addLog(text.logs.query)
					}}
				>
					{text.actions.switchQuery}
				</ActionButton>
				<ActionButton icon={<Zap className="h-3.5 w-3.5" />} onClick={fastScroll}>
					{text.actions.fastScroll}
				</ActionButton>
				<ActionButton
					icon={<ChevronsUp className="h-3.5 w-3.5" />}
					onClick={() => {
						setCompact((currentCompact) => !currentCompact)
						addLog(text.logs.density)
					}}
				>
					{text.actions.toggleDensity}
				</ActionButton>
				<ActionButton icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={resetView}>
					{text.actions.resetView}
				</ActionButton>
			</footer>
		</div>
	)
}
