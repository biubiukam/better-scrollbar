import React from "react"
import { BrainCircuit, ChevronDown, ChevronRight, CircleDot, Loader2, Wrench } from "lucide-react"
import type { AgentMessage, AgentToolState, ToolPhase } from "./mockData"

export interface AgentComponentLabels {
	thinkingTitle: string
	collapseThinking: string
	expandThinking: string
	toolChunkPhase: string
	toolCallingPhase: string
	toolResponsePhase: string
}

export function cn(...classes: Array<string | false | null | undefined>) {
	return classes.filter(Boolean).join(" ")
}

export function Metric({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="min-w-0 rounded-md border border-border bg-card px-2.5 py-2">
			<span className="block text-xs leading-4 text-muted-foreground">{label}</span>
			<strong className="block truncate text-[15px] font-semibold leading-6 text-card-foreground">
				{value}
			</strong>
		</div>
	)
}

export function ActionButton({
	children,
	icon,
	disabled,
	busy,
	onClick
}: {
	children: React.ReactNode
	icon: React.ReactNode
	disabled?: boolean
	busy?: boolean
	onClick: () => void
}) {
	return (
		<button
			aria-busy={busy ? "true" : "false"}
			className={cn(
				"inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-semibold text-card-foreground transition-colors hover:bg-muted",
				disabled && "cursor-not-allowed opacity-60"
			)}
			disabled={disabled}
			type="button"
			onClick={onClick}
		>
			{icon}
			<span>{children}</span>
		</button>
	)
}

export function StreamCursor() {
	return (
		<span
			aria-hidden="true"
			className="ml-1 inline-block h-3 w-1 animate-pulse rounded-sm bg-current align-[-1px]"
		/>
	)
}

function PhaseLabel({ labels, phase }: { labels: AgentComponentLabels; phase: ToolPhase }) {
	const label =
		phase === "chunk"
			? labels.toolChunkPhase
			: phase === "calling"
				? labels.toolCallingPhase
				: labels.toolResponsePhase
	return (
		<span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[11px] leading-4 text-muted-foreground">
			{phase === "calling" ? (
				<Loader2 className="h-3 w-3 animate-spin" />
			) : (
				<CircleDot className="h-3 w-3" />
			)}
			{label}
		</span>
	)
}

export function ToolCallCard({
	labels,
	tool,
	streaming
}: {
	labels: AgentComponentLabels
	tool: AgentToolState
	streaming?: boolean
}) {
	return (
		<div
			className="agent-tool-call mt-2 grid gap-2 rounded-md border border-primary/20 bg-card/80 p-2.5"
			data-tool-phase={tool.phase}
		>
			<div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
				<span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-xs font-semibold text-card-foreground">
					<Wrench className="h-3.5 w-3.5 shrink-0 text-primary" />
					<span className="min-w-0 truncate">{tool.name}</span>
				</span>
				<PhaseLabel labels={labels} phase={tool.phase} />
			</div>
			{tool.phase === "calling" ? (
				<div className="rounded-md border border-primary/15 bg-primary/10 px-2 py-1.5 text-xs leading-5 text-muted-foreground">
					{tool.status}
					{streaming ? <StreamCursor /> : null}
				</div>
			) : null}
			{tool.request ? (
				<pre className="max-h-36 min-w-0 overflow-hidden whitespace-pre-wrap break-words rounded-md bg-muted/60 p-2 font-mono text-[11px] leading-4 text-muted-foreground">
					{tool.request}
					{streaming && tool.phase === "chunk" ? <StreamCursor /> : null}
				</pre>
			) : null}
			{tool.response ? (
				<div className="rounded-md border border-success/20 bg-success/10 px-2 py-1.5 text-xs leading-5 text-muted-foreground">
					{tool.response}
					{streaming && tool.phase === "response" ? <StreamCursor /> : null}
				</div>
			) : null}
		</div>
	)
}

export function ThinkingCard({
	labels,
	message,
	onToggle
}: {
	labels: AgentComponentLabels
	message: AgentMessage
	onToggle: () => void
}) {
	const expanded = message.expanded !== false
	const label = expanded ? labels.collapseThinking : labels.expandThinking

	return (
		<div
			className="agent-thinking-card mt-2 grid gap-1.5"
			aria-expanded={expanded ? "true" : "false"}
		>
			<button
				aria-label={label}
				className="flex w-full min-w-0 items-center justify-between gap-2 rounded-md border border-primary/20 bg-primary/10 px-2 py-1.5 text-left text-xs font-semibold text-card-foreground"
				type="button"
				onClick={onToggle}
			>
				<span className="inline-flex min-w-0 items-center gap-1.5">
					<BrainCircuit className="h-3.5 w-3.5 shrink-0 text-primary" />
					<span className="truncate">{labels.thinkingTitle}</span>
				</span>
				<span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
					{label}
					{expanded ? (
						<ChevronDown className="h-3.5 w-3.5" />
					) : (
						<ChevronRight className="h-3.5 w-3.5" />
					)}
				</span>
			</button>
			{expanded ? (
				<p className="agent-thinking-detail rounded-md bg-muted/50 px-2 py-1.5 text-xs leading-5 text-muted-foreground">
					{message.content}
					{message.streaming ? <StreamCursor /> : null}
				</p>
			) : null}
		</div>
	)
}

interface AgentMessageRowProps {
	labels: AgentComponentLabels
	message: AgentMessage
	onToggleThinking: (id: string) => void
}

export const AgentMessageRow = React.forwardRef<HTMLDivElement, AgentMessageRowProps>(
	function AgentMessageRow({ labels, message, onToggleThinking }, ref) {
		const isUser = message.kind === "user"
		const isThinking = message.kind === "thinking"
		const bubbleClass = isUser
			? "border-primary/35 bg-primary text-primary-foreground"
			: isThinking
				? "border-primary/20 bg-primary/10"
				: message.kind === "tool"
					? "border-success/25 bg-success/10"
					: "border-border bg-card"

		return (
			<div
				ref={ref}
				className={cn(
					"agent-message-row flex w-full items-start bg-card px-3.5 py-2 text-left text-[13px] text-muted-foreground",
					isUser ? "justify-end" : "justify-start"
				)}
			>
				<div
					className={cn(
						"min-w-0 max-w-[86%] rounded-lg border px-3 py-2 shadow-sm",
						bubbleClass
					)}
				>
					<div className={cn("flex min-w-0 items-center gap-2", isUser && "justify-end")}>
						<span
							className={cn(
								"shrink-0 font-semibold",
								isUser ? "text-primary-foreground" : "text-card-foreground"
							)}
						>
							{message.title}
						</span>
						<span
							className={cn(
								"rounded-md border px-1.5 py-0.5 text-[11px] leading-4",
								isUser
									? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
									: "border-border bg-muted/40 text-muted-foreground"
							)}
						>
							{message.meta} · {message.timestamp}
						</span>
					</div>
					{message.kind === "thinking" ? (
						<ThinkingCard
							labels={labels}
							message={message}
							onToggle={() => onToggleThinking(message.id)}
						/>
					) : null}
					{message.kind === "tool" && message.tool ? (
						<ToolCallCard
							labels={labels}
							tool={message.tool}
							streaming={message.streaming}
						/>
					) : null}
					{message.kind === "assistant" || message.kind === "user" ? (
						<p
							className={cn(
								"agent-message-body mt-1 whitespace-pre-line text-xs leading-5",
								isUser ? "text-primary-foreground/90" : "text-muted-foreground"
							)}
						>
							{message.content}
							{message.streaming ? <StreamCursor /> : null}
						</p>
					) : null}
				</div>
			</div>
		)
	}
)
