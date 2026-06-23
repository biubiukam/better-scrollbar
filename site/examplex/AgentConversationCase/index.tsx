import React, {
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react"
import { ArrowDown, ArrowUp, RefreshCw } from "lucide-react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo, ScrollState, VirtualScrollBarRef } from "../../../src"
import { DEFAULT_EXAMPLE_COPY } from "../../i18n/examples"
import type { ExampleCopy } from "../../i18n/examples"
import {
	INITIAL_ITEMS_RENDERED,
	formatVirtualRange,
	getRenderedCount,
	useRafScrollState,
} from "../../components/ExampleSupport/sharedMillion"
import { demoTw } from "../../components/ExampleSupport/tailwind"
import { ActionButton, AgentMessageRow, Metric, cn } from "./components"
import type { AgentComponentLabels } from "./components"
import {
	AGENT_STREAM_CHUNK_MS,
	MOCK_AGENT_CONVERSATION,
	createMockAgentStream,
} from "./mockData"
import type { AgentConversationFixture, AgentMessage, AgentStreamEvent } from "./mockData"

const SCENARIO_DEMO_LIST_HEIGHT = 360
const AGENT_BOTTOM_SPACER_HEIGHT = 80
const BOTTOM_FOLLOW_FRAMES = 6
const LOG_LIMIT = 4

type LocaleMode = "en" | "zh"

interface AgentConversationDemoProps {
	copy?: ExampleCopy
	locale?: LocaleMode
}

interface AgentUiCopy {
	statusIdle: string
	statusStreaming: string
	streamInterval: string
	replay: string
	replaying: string
	scrollTop: string
	scrollBottom: string
	messages: string
	visible: string
	rendered: string
	logInitial: string
	logReplay: string
	logComplete: string
	logTop: string
	logBottom: string
	labels: AgentComponentLabels
}

const AGENT_UI_COPY: Record<LocaleMode, AgentUiCopy> = {
	en: {
		statusIdle: "Ready",
		statusStreaming: "Streaming",
		streamInterval: "Chunk interval",
		replay: "Replay",
		replaying: "Replaying",
		scrollTop: "Scroll top",
		scrollBottom: "Scroll bottom",
		messages: "Messages",
		visible: "Visible",
		rendered: "Rendered",
		logInitial: "Agent fixture initialized",
		logReplay: "Streaming mock conversation at 24ms per chunk",
		logComplete: "Mock stream completed",
		logTop: "Scrolled to the first message",
		logBottom: "Scrolled to latest output",
		labels: {
			thinkingTitle: "Reasoning",
			collapseThinking: "Collapse reasoning",
			expandThinking: "Expand reasoning",
			toolChunkPhase: "tool chunks",
			toolCallingPhase: "tool calling",
			toolResponsePhase: "tool response",
		},
	},
	zh: {
		statusIdle: "Ready",
		statusStreaming: "Streaming",
		streamInterval: "Chunk interval",
		replay: "Replay",
		replaying: "Replaying",
		scrollTop: "Scroll top",
		scrollBottom: "Scroll bottom",
		messages: "Messages",
		visible: "Visible",
		rendered: "Rendered",
		logInitial: "Agent fixture initialized",
		logReplay: "Streaming mock conversation at 24ms per chunk",
		logComplete: "Mock stream completed",
		logTop: "Scrolled to the first message",
		logBottom: "Scrolled to latest output",
		labels: {
			thinkingTitle: "Reasoning",
			collapseThinking: "Collapse reasoning",
			expandThinking: "Expand reasoning",
			toolChunkPhase: "tool chunks",
			toolCallingPhase: "tool calling",
			toolResponsePhase: "tool response",
		},
	},
}

function appendLog(logs: string[], message: string) {
	return [message, ...logs].slice(0, LOG_LIMIT)
}

function useScrollTelemetry() {
	const [scrollState, scheduleScrollState] = useRafScrollState()
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)

	return { itemsRendered, scheduleScrollState, scrollState, setItemsRendered }
}

function getMaxOffset(scrollState: ScrollState) {
	return Math.max(scrollState.scrollHeight - scrollState.clientHeight, 0)
}

function getLocaleFromCopy(copy: ExampleCopy | undefined, explicitLocale: LocaleMode | undefined): LocaleMode {
	if (explicitLocale) {
		return explicitLocale
	}

	return copy?.scenarioDemos.agent.title.startsWith("Agent conversation") ? "en" : "zh"
}

function cloneMessage(message: AgentMessage): AgentMessage {
	return {
		...message,
		tool: message.tool ? { ...message.tool } : undefined,
	}
}

function createCompletedMessages(conversation: AgentConversationFixture) {
	return conversation.messages.map(cloneMessage)
}

function upsertMessage(
	messages: AgentMessage[],
	messageId: string,
	createMessage: () => AgentMessage,
	updateMessage: (message: AgentMessage) => AgentMessage
) {
	const existingIndex = messages.findIndex((message) => message.id === messageId)
	if (existingIndex === -1) {
		return [...messages, updateMessage(createMessage())]
	}

	return messages.map((message, index) => index === existingIndex ? updateMessage(message) : message)
}

function makeStreamTimestamp(messages: AgentMessage[]) {
	return `14:17:${String(messages.length + 1).padStart(2, "0")}`
}

export function AgentConversationDemo({
	copy = DEFAULT_EXAMPLE_COPY,
	locale: explicitLocale,
}: AgentConversationDemoProps) {
	const locale = getLocaleFromCopy(copy, explicitLocale)
	const ui = AGENT_UI_COPY[locale]
	const conversation = MOCK_AGENT_CONVERSATION
	const scrollerRef = useRef<VirtualScrollBarRef>(null)
	const timerRef = useRef<number>()
	const bottomFollowFrameRef = useRef<number>()
	const bottomFollowVersionRef = useRef(0)
	const eventIndexRef = useRef(0)
	const streamRunIndexRef = useRef(0)
	const { itemsRendered, scheduleScrollState, scrollState, setItemsRendered } = useScrollTelemetry()
	const [messages, setMessages] = useState<AgentMessage[]>(() => createCompletedMessages(conversation))
	const [, setLogs] = useState<string[]>(() => [ui.logInitial])
	const [streaming, setStreaming] = useState(false)

	useEffect(() => {
		setMessages(createCompletedMessages(conversation))
		setLogs([ui.logInitial])
		setStreaming(false)
		eventIndexRef.current = 0
		streamRunIndexRef.current = 0
		if (timerRef.current !== undefined) {
			window.clearTimeout(timerRef.current)
			timerRef.current = undefined
		}
	}, [conversation, ui.logInitial])

	useEffect(() => {
		return () => {
			if (timerRef.current !== undefined) {
				window.clearTimeout(timerRef.current)
			}
			if (bottomFollowFrameRef.current !== undefined) {
				window.cancelAnimationFrame(bottomFollowFrameRef.current)
			}
		}
	}, [])

	const stopTimer = useCallback(() => {
		if (timerRef.current !== undefined) {
			window.clearTimeout(timerRef.current)
			timerRef.current = undefined
		}
	}, [])

	const scrollToLatestOutput = useCallback(() => {
		const currentState = scrollerRef.current?.getScrollState() ?? scrollState
		scrollerRef.current?.scrollTo({ x: 0, y: getMaxOffset(currentState) })
	}, [scrollState])

	const keepLatestOutputVisible = useCallback((frameCount = BOTTOM_FOLLOW_FRAMES) => {
		if (bottomFollowFrameRef.current !== undefined) {
			window.cancelAnimationFrame(bottomFollowFrameRef.current)
			bottomFollowFrameRef.current = undefined
		}

		const version = bottomFollowVersionRef.current + 1
		bottomFollowVersionRef.current = version
		let remainingFrames = Math.max(frameCount, 1)

		const scrollAndSchedule = () => {
			if (bottomFollowVersionRef.current !== version) {
				return
			}

			scrollToLatestOutput()
			remainingFrames -= 1

			if (remainingFrames > 0) {
				bottomFollowFrameRef.current = window.requestAnimationFrame(scrollAndSchedule)
			} else {
				bottomFollowFrameRef.current = undefined
			}
		}

		scrollAndSchedule()
	}, [scrollToLatestOutput])

	const applyStreamEvent = useCallback((event: AgentStreamEvent) => {
		if (event.type === "thinking_delta") {
			setMessages((currentMessages) => upsertMessage(
				currentMessages,
				event.messageId,
				() => ({
					id: event.messageId,
					kind: "thinking",
					title: ui.labels.thinkingTitle,
					meta: "Streaming",
					timestamp: makeStreamTimestamp(currentMessages),
					content: "",
					streaming: true,
					expanded: true,
				}),
				(message) => ({
					...message,
					content: `${message.content}${event.delta}`,
					streaming: true,
					expanded: true,
				})
			))
			return
		}

		if (event.type === "thinking_done") {
			setMessages((currentMessages) => currentMessages.map((message) => message.id === event.messageId
				? {
					...message,
					meta: "Done",
					streaming: false,
					expanded: false,
				}
				: message))
			return
		}

		if (event.type === "assistant_delta") {
			setMessages((currentMessages) => upsertMessage(
				currentMessages,
				event.messageId,
				() => ({
					id: event.messageId,
					kind: "assistant",
					title: event.title,
					meta: event.meta,
					timestamp: makeStreamTimestamp(currentMessages),
					content: "",
					streaming: true,
				}),
				(message) => ({
					...message,
					content: `${message.content}${event.delta}`,
					streaming: true,
				})
			))
			return
		}

		if (event.type === "assistant_done") {
			setMessages((currentMessages) => currentMessages.map((message) => message.id === event.messageId
				? { ...message, streaming: false }
				: message))
			return
		}

		if (event.type === "tool_delta") {
			setMessages((currentMessages) => upsertMessage(
				currentMessages,
				event.messageId,
				() => ({
					id: event.messageId,
					kind: "tool",
					title: "Tool call",
					meta: event.phase,
					timestamp: makeStreamTimestamp(currentMessages),
					content: "",
					streaming: true,
					tool: {
						name: event.name,
						phase: event.phase,
						request: "",
						response: "",
						status: "",
					},
				}),
				(message) => {
					const tool = message.tool ?? {
						name: event.name,
						phase: event.phase,
						request: "",
						response: "",
						status: "",
					}

					return {
						...message,
						meta: event.phase,
						streaming: true,
						tool: {
							...tool,
							name: event.name,
							phase: event.phase,
							request: event.phase === "chunk" ? `${tool.request}${event.delta}` : tool.request,
							response: event.phase === "response" ? `${tool.response}${event.delta}` : tool.response,
						},
					}
				}
			))
			return
		}

		if (event.type === "tool_status") {
			setMessages((currentMessages) => upsertMessage(
				currentMessages,
				event.messageId,
				() => ({
					id: event.messageId,
					kind: "tool",
					title: "Tool call",
					meta: event.phase,
					timestamp: makeStreamTimestamp(currentMessages),
					content: "",
					streaming: true,
					tool: {
						name: event.name,
						phase: event.phase,
						request: "",
						response: "",
						status: event.status,
					},
				}),
				(message) => ({
					...message,
					meta: event.phase,
					streaming: true,
					tool: {
						name: event.name,
						phase: event.phase,
						request: message.tool?.request ?? "",
						response: message.tool?.response ?? "",
						status: event.status,
					},
				})
			))
			return
		}

		if (event.type === "tool_done") {
			setMessages((currentMessages) => currentMessages.map((message) => message.id === event.messageId
				? { ...message, streaming: false }
				: message))
			return
		}

		setStreaming(false)
		setLogs((currentLogs) => appendLog(currentLogs, ui.logComplete))
		stopTimer()
	}, [locale, stopTimer, ui.labels.thinkingTitle, ui.logComplete])

	const replay = useCallback(() => {
		stopTimer()
		eventIndexRef.current = 0
		streamRunIndexRef.current += 1
		const streamEvents = createMockAgentStream(conversation, {
			runId: `stream-run-${streamRunIndexRef.current}`,
		})
		setLogs((currentLogs) => appendLog(currentLogs, ui.logReplay))
		setStreaming(true)
		keepLatestOutputVisible()

		const playNextChunk = () => {
			timerRef.current = undefined
			const event = streamEvents[eventIndexRef.current]
			eventIndexRef.current += 1

			if (!event) {
				setStreaming(false)
				return
			}

			applyStreamEvent(event)

			if (event.type === "completed" || eventIndexRef.current >= streamEvents.length) {
				setStreaming(false)
				timerRef.current = undefined
				return
			}

			timerRef.current = window.setTimeout(playNextChunk, AGENT_STREAM_CHUNK_MS)
		}

		timerRef.current = window.setTimeout(playNextChunk, AGENT_STREAM_CHUNK_MS)
	}, [applyStreamEvent, conversation, keepLatestOutputVisible, stopTimer, ui.logReplay])

	const toggleThinking = useCallback((messageId: string) => {
		setMessages((currentMessages) => currentMessages.map((message) => message.id === messageId
			? { ...message, expanded: message.expanded === false }
			: message))
	}, [])

	const scrollToTop = useCallback(() => {
		scrollerRef.current?.scrollTo({ x: 0, y: 0 })
		setLogs((currentLogs) => appendLog(currentLogs, ui.logTop))
	}, [ui.logTop])

	const scrollToBottom = useCallback(() => {
		keepLatestOutputVisible()
		setLogs((currentLogs) => appendLog(currentLogs, ui.logBottom))
	}, [keepLatestOutputVisible, ui.logBottom])

	return (
		<div className={cn(demoTw.shell, "agent-demo-wrapper")}>
			<header className={cn(demoTw.head, "agent-demo-head")}>
				<div>
					<h3 className={demoTw.title}>{conversation.title}</h3>
					<p className={demoTw.subtitle}>{conversation.subtitle}</p>
				</div>
				<div className={cn(demoTw.state, streaming && demoTw.stateActive)}>
					{streaming ? ui.statusStreaming : ui.statusIdle}
				</div>
			</header>

			<div className={cn(demoTw.metricGrid, "grid-cols-2 md:grid-cols-4")}>
				<Metric label={ui.streamInterval} value={`${AGENT_STREAM_CHUNK_MS}ms / chunk`} />
				<Metric label={ui.messages} value={messages.length.toLocaleString()} />
				<Metric label={ui.visible} value={formatVirtualRange(itemsRendered)} />
				<Metric label={ui.rendered} value={getRenderedCount(itemsRendered).toLocaleString()} />
			</div>

			<div className={cn(demoTw.listTall, "agent-demo-list")}>
				<VirtualScrollBar
					ref={scrollerRef}
					height={SCENARIO_DEMO_LIST_HEIGHT}
					isVirtual
					itemCount={messages.length + 1}
					itemKey={(index) => index === messages.length ? "agent-bottom-spacer" : messages[index]?.id ?? index}
					followOutput={{ threshold: 80 }}
					onItemsRendered={setItemsRendered}
					onScroll={scheduleScrollState}
					renderItem={(index) => {
						const message = messages[index]
						if (!message) {
							return (
								<div
									key={index}
									className="agent-message-bottom-spacer"
									style={{ height: AGENT_BOTTOM_SPACER_HEIGHT }}
								/>
							)
						}

						return (
							<AgentMessageRow
								key={message.id}
								labels={ui.labels}
								message={message}
								onToggleThinking={toggleThinking}
							/>
						)
					}}
				/>
			</div>

			<footer className={cn(demoTw.toolbar, "agent-demo-toolbar")}>
				<ActionButton icon={<ArrowUp className="h-3.5 w-3.5" />} onClick={scrollToTop}>
					{ui.scrollTop}
				</ActionButton>
				<ActionButton icon={<ArrowDown className="h-3.5 w-3.5" />} onClick={scrollToBottom}>
					{ui.scrollBottom}
				</ActionButton>
				<ActionButton
					busy={streaming}
					disabled={streaming}
					icon={<RefreshCw className={cn("h-3.5 w-3.5", streaming && "animate-spin")} />}
					onClick={replay}
				>
					{streaming ? ui.replaying : ui.replay}
				</ActionButton>
			</footer>
		</div>
	)
}
