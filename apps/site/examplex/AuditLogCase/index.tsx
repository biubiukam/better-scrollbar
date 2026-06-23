import React, { useCallback, useRef, useState } from "react"
import { ArrowDown, RefreshCw, Search, Zap } from "lucide-react"
import VirtualScrollBar from "@better-scrollbar/react"
import type { ItemsRenderedInfo, VirtualScrollBarRef } from "@better-scrollbar/react"
import { DEFAULT_EXAMPLE_COPY } from "../../i18n/examples"
import type { ExampleCopy } from "../../i18n/examples"
import {
	INITIAL_ITEMS_RENDERED,
	MILLION_ROW_COUNT,
	formatVirtualRange,
	getJumpOffset,
	getRenderedCount,
	useRafScrollState
} from "../../components/ExampleSupport/sharedMillion"
import { cn, demoTw, toneRowTw } from "../../components/ExampleSupport/tailwind"

const AUDIT_ROW_HEIGHT = 38
const SCENARIO_DEMO_LIST_HEIGHT = 360

interface AuditLogDemoProps {
	copy?: ExampleCopy
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="min-w-0 rounded-md border border-border bg-card px-2.5 py-2">
			<span className="block text-xs leading-4 text-muted-foreground">{label}</span>
			<strong className="block truncate text-[15px] font-semibold leading-6 text-card-foreground">
				{value}
			</strong>
		</div>
	)
}

function ActionButton({
	children,
	icon,
	onClick
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

function getAuditTone(index: number) {
	if (index % 41 === 0) {
		return "alert"
	}
	if (index % 17 === 0) {
		return "focus"
	}
	return "plain"
}

function AuditRow({ copy, index }: { copy: ExampleCopy["scenarioDemos"]["audit"]; index: number }) {
	const tone = getAuditTone(index)
	const status =
		tone === "alert"
			? copy.rows.risk
			: index % 9 === 0
				? copy.rows.settlement
				: copy.rows.cleared
	const channel =
		index % 3 === 0
			? copy.rows.ledger
			: index % 3 === 1
				? copy.rows.transfer
				: copy.rows.settlement

	return (
		<div
			className={cn(
				demoTw.row,
				"audit-demo-row",
				toneRowTw[tone],
				tone === "alert" && "audit-demo-row--alert",
				tone === "focus" && "audit-demo-row--focus"
			)}
			style={{ height: AUDIT_ROW_HEIGHT }}
		>
			<span className={demoTw.rowIndex}>#{index.toLocaleString()}</span>
			<span className={demoTw.rowTitle}>
				{channel} · {status}
			</span>
			<span className={demoTw.rowMeta}>
				trace_{(index % 10_000).toString().padStart(4, "0")}
			</span>
		</div>
	)
}

export function AuditLogDemo({ copy = DEFAULT_EXAMPLE_COPY }: AuditLogDemoProps) {
	const text = copy.scenarioDemos.audit
	const scrollerRef = useRef<VirtualScrollBarRef>(null)
	const { itemsRendered, scheduleScrollState, scrollState, setItemsRendered } =
		useScrollTelemetry()
	const [scrollMode, setScrollMode] = useState<"controlled" | "native">("controlled")

	const jumpTo = useCallback(
		(ratio: number) => {
			const state = scrollerRef.current?.getScrollState() ?? scrollState
			scrollerRef.current?.scrollTo({
				x: 0,
				y: getJumpOffset(state.scrollHeight, state.clientHeight, ratio)
			})
		},
		[scrollState]
	)

	return (
		<div className={cn(demoTw.shell, "audit-demo-wrapper")}>
			<header className={cn(demoTw.head, "audit-demo-head")}>
				<div>
					<h3 className={demoTw.title}>{text.title}</h3>
					<p className={demoTw.subtitle}>{text.subtitle}</p>
				</div>
				<div className={cn(demoTw.state, scrollMode === "native" && demoTw.stateActive)}>
					{`scrollMode: ${scrollMode}`}
				</div>
			</header>
			<div className={cn(demoTw.metricGrid, "grid-cols-2 md:grid-cols-4")}>
				<Metric label={text.metrics.rows} value={MILLION_ROW_COUNT.toLocaleString()} />
				<Metric label={text.metrics.mode} value={`scrollMode: ${scrollMode}`} />
				<Metric label={copy.shared.visible} value={formatVirtualRange(itemsRendered)} />
				<Metric
					label={copy.shared.rendered}
					value={getRenderedCount(itemsRendered).toLocaleString()}
				/>
			</div>
			<div className={cn(demoTw.listTall, "audit-demo-list")}>
				<VirtualScrollBar
					ref={scrollerRef}
					height={SCENARIO_DEMO_LIST_HEIGHT}
					isVirtual
					itemCount={MILLION_ROW_COUNT}
					estimatedItemHeight={AUDIT_ROW_HEIGHT}
					overscan={5}
					scrollMode={scrollMode}
					maintainVisibleContentPosition
					onItemsRendered={setItemsRendered}
					onScroll={scheduleScrollState}
					renderItem={(index) => <AuditRow key={index} copy={text} index={index} />}
				/>
			</div>
			<footer className={cn(demoTw.toolbar, "audit-demo-toolbar")}>
				<ActionButton
					icon={<RefreshCw className="h-3.5 w-3.5" />}
					onClick={() => {
						setScrollMode((current) =>
							current === "controlled" ? "native" : "controlled"
						)
					}}
				>
					{scrollMode === "controlled"
						? text.actions.switchNative
						: text.actions.switchControlled}
				</ActionButton>
				<ActionButton icon={<Zap className="h-3.5 w-3.5" />} onClick={() => jumpTo(0.82)}>
					{text.actions.jumpRisk}
				</ActionButton>
				<ActionButton icon={<Search className="h-3.5 w-3.5" />} onClick={() => jumpTo(0.5)}>
					{text.actions.jumpMiddle}
				</ActionButton>
				<ActionButton
					icon={<ArrowDown className="h-3.5 w-3.5" />}
					onClick={() => jumpTo(1)}
				>
					{text.actions.jumpLatest}
				</ActionButton>
			</footer>
		</div>
	)
}
