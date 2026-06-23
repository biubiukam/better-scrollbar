export const AGENT_STREAM_CHUNK_MS = 24
const AGENT_STREAM_TEXT_CHARS_PER_CHUNK = 12

export type AgentMessageKind = "user" | "assistant" | "thinking" | "tool"
export type ToolPhase = "chunk" | "calling" | "response"

export interface AgentToolState {
	name: string
	phase: ToolPhase
	request: string
	response: string
	status: string
}

export interface AgentMessage {
	id: string
	kind: AgentMessageKind
	title: string
	content: string
	meta: string
	timestamp: string
	streaming?: boolean
	expanded?: boolean
	tool?: AgentToolState
}

export type AgentStreamEvent =
	| { type: "thinking_delta"; messageId: string; delta: string }
	| { type: "thinking_done"; messageId: string }
	| { type: "assistant_delta"; messageId: string; title: string; meta: string; delta: string }
	| { type: "assistant_done"; messageId: string }
	| {
			type: "tool_delta"
			messageId: string
			phase: "chunk" | "response"
			name: string
			delta: string
	  }
	| { type: "tool_status"; messageId: string; phase: "calling"; name: string; status: string }
	| { type: "tool_done"; messageId: string }
	| { type: "completed" }

export interface AgentStreamOptions {
	runId?: string
}

interface AgentStreamFixture {
	thinking: string[]
	body: string[]
	toolName: string
	toolArguments: string[]
	toolCallingStatus: string
	toolResponse: string[]
	final: string[]
}

function splitStreamText(text: string) {
	const chars = Array.from(text)
	const chunks: string[] = []

	for (let index = 0; index < chars.length; index += AGENT_STREAM_TEXT_CHARS_PER_CHUNK) {
		chunks.push(chars.slice(index, index + AGENT_STREAM_TEXT_CHARS_PER_CHUNK).join(""))
	}

	return chunks.length > 0 ? chunks : [text]
}

function getStreamMessageId(id: string, runId: string | undefined) {
	return runId ? `${runId}-${id}` : id
}

export interface AgentConversationFixture {
	title: string
	subtitle: string
	description: string
	messages: AgentMessage[]
	stream: AgentStreamFixture
}

export const MOCK_AGENT_CONVERSATION: AgentConversationFixture = {
	title: "Agent conversation / OpenAI-style streaming tool calls",
	subtitle:
		"One scroll surface renders reasoning, body text, tool chunks, tool execution, and tool response.",
	description:
		"This mock scenario simulates an operations agent. It streams a collapsible reasoning summary first, then body text, then a shared tool-call card that moves through argument chunks, execution, and response phases.",
	messages: [
		{
			id: "seed-user-001",
			kind: "user",
			title: "User",
			meta: "Request",
			timestamp: "14:16:02",
			content:
				"I need help diagnosing a production agent orchestration issue. In the support workspace, the agent reads orders, inventory, and refund records, then sometimes stops writing. The tool call has already returned, but the final body text does not finish. Please display reasoning, body text, tool arguments, tool execution state, and tool response as separate phases while keeping the long conversation scroll stable."
		},
		{
			id: "seed-thinking-001",
			kind: "thinking",
			title: "Reasoning",
			meta: "Done",
			timestamp: "14:16:03",
			expanded: false,
			content:
				"First separate the symptoms: stopped output is not the same as a failed tool. Inspect output text deltas, function call argument deltas, tool execution status, and response completion independently before judging the frontend."
		},
		{
			id: "seed-assistant-001",
			kind: "assistant",
			title: "Assistant",
			meta: "Body",
			timestamp: "14:16:05",
			content:
				"I will split this into three layers: model streaming, tool streaming, and scroll behavior. Model streaming explains what deltas arrived; tool streaming explains whether the call executed; scroll behavior explains whether dynamic height changes kept the reader anchored."
		},
		{
			id: "seed-tool-001",
			kind: "tool",
			title: "Tool call",
			meta: "response",
			timestamp: "14:16:07",
			content: "",
			tool: {
				name: "support.trace_search",
				phase: "response",
				request:
					'{\n  "session_id": "cs_20260623_8841",\n  "include": ["orders", "refunds", "inventory", "model_events"],\n  "window": "15m"\n}',
				response:
					"Tool response returned: model events are complete, tool execution took 618ms, inventory returned 3 warehouses, refund service returned 2 records, and the risky point is the UI appending tool response content into a row without remeasurement.",
				status: "Tool response phase complete"
			}
		},
		{
			id: "seed-assistant-002",
			kind: "assistant",
			title: "Assistant",
			meta: "Finding",
			timestamp: "14:16:09",
			content:
				"Initial finding: the backend tool path did not fail. The presentation layer is more suspicious, especially if the tool phases share a card visually but do not preserve an explicit phase in state."
		},
		{
			id: "seed-user-002",
			kind: "user",
			title: "User",
			meta: "Follow-up",
			timestamp: "14:16:22",
			content:
				"Please simulate a full streaming pass. I want to see reasoning, body text, tool chunks, tool execution, and tool response. Completed reasoning should collapse automatically, but I need to reopen it."
		},
		{
			id: "seed-assistant-003",
			kind: "assistant",
			title: "Assistant",
			meta: "Ready",
			timestamp: "14:16:24",
			content:
				"Yes. The replay below advances one chunk every 24ms. Body text stays relatively long, tool arguments remain structured JSON, and the response is filled gradually instead of appearing all at once."
		},
		{
			id: "seed-thinking-002",
			kind: "thinking",
			title: "Reasoning",
			meta: "Done",
			timestamp: "14:16:25",
			expanded: false,
			content:
				"The tool card should not be implemented three times. It should accept phase, request, response, and status fields. The chunk phase streams arguments, the calling phase shows execution, and the response phase streams returned evidence."
		},
		{
			id: "seed-assistant-004",
			kind: "assistant",
			title: "Assistant",
			meta: "Scroll note",
			timestamp: "14:16:27",
			content:
				"The scroll component matters here because agent conversations append messages, mutate the last row height, collapse completed reasoning, and let users scroll back to inspect old evidence while new chunks keep arriving."
		}
	],
	stream: {
		thinking: [
			"First restate the target",
			": this is not a basic chat bubble. It is a long conversation surface with model events, tool arguments, tool execution, and tool response evidence.",
			"I will map OpenAI-style events into UI states: reasoning summary becomes the reasoning block, output text becomes body text, and function call argument deltas become tool chunks.",
			"When the tool starts executing, the UI keeps the same tool card and switches phase to calling. When the tool returns, the same card switches to response and streams the result.",
			"Completed reasoning should collapse by default because it is no longer the main reading path, but the user still needs a control to reopen it for audit."
		],
		body: [
			"I will diagnose this by observing events instead of only checking whether a final message appears.",
			"First, confirm that the reasoning item was created. Then confirm that reasoning deltas arrived. After reasoning is done, collapse that block by default.",
			"Next, body text streams through output text deltas. This mock advances one chunk every 24ms to represent a high-frequency but still visible model stream.",
			"Then the tool call begins. Tool arguments do not appear all at once; they stream into the same shared tool card.",
			"After arguments finish, the card changes phase from chunk to calling. It is the same UI component with a different state, not a new surface.",
			"Finally the tool response streams back into the card. The user can now distinguish generated narrative from external evidence."
		],
		toolName: "support.agent_diagnostics",
		toolArguments: [
			"{\n",
			'  "conversation_id": "conv_agent_support_20260623_1142",\n',
			'  "trace_window": "2026-06-23T14:10:00+08:00/2026-06-23T14:18:00+08:00",\n',
			'  "include_model_events": true,\n',
			'  "include_tool_events": true,\n',
			'  "include_ui_measurements": true,\n',
			'  "checks": [\n',
			'    "reasoning_summary_done",\n',
			'    "output_text_delta_after_tool_response",\n',
			'    "function_call_arguments_delta",\n',
			'    "tool_response_phase",\n',
			'    "virtual_scroll_bottom_follow",\n',
			'    "thinking_collapse_after_done"\n',
			"  ]\n",
			"}"
		],
		toolCallingStatus:
			"Tool execution phase: arguments are complete and the diagnostics service is running. The UI reuses the same tool card and only changes state.",
		toolResponse: [
			"Tool response returned.",
			"The diagnostics service confirms a complete model event order, function call arguments completed, and tool execution took 642ms.",
			"The frontend risk is row height growth when tool response content is appended. Without remeasurement and bottom anchoring, the reader can see the stream appear stuck.",
			"The recommendation is to model tool calls with one shared component and phase=chunk/calling/response.",
			"Reasoning collapse also changes row height, so the virtual scroller should participate in measurement and anchoring."
		],
		final: [
			"The implementation should keep three boundaries: mock data owns the event script, base components own message and tool visuals, and the scenario component owns playback and scrolling.",
			"The scroll surface should keep maintainVisibleContentPosition and followOutput enabled so appended chunks, growing tool responses, and reasoning collapse remain stable.",
			"If the user scrolls up to inspect history, do not force the bottom. If the user jumps back to the bottom or replays, restore bottom following."
		]
	}
}

export function createMockAgentStream(
	conversation: AgentConversationFixture,
	options: AgentStreamOptions = {}
): AgentStreamEvent[] {
	const thinkingId = getStreamMessageId("stream-thinking", options.runId)
	const bodyId = getStreamMessageId("stream-body", options.runId)
	const toolId = getStreamMessageId("stream-tool", options.runId)
	const finalId = getStreamMessageId("stream-final", options.runId)
	const events: AgentStreamEvent[] = []

	conversation.stream.thinking.forEach((text) => {
		splitStreamText(text).forEach((delta) => {
			events.push({ type: "thinking_delta", messageId: thinkingId, delta })
		})
	})
	events.push({ type: "thinking_done", messageId: thinkingId })

	conversation.stream.body.forEach((text) => {
		splitStreamText(text).forEach((delta) => {
			events.push({
				type: "assistant_delta",
				messageId: bodyId,
				title: "Assistant",
				meta: "Body",
				delta
			})
		})
	})
	events.push({ type: "assistant_done", messageId: bodyId })

	conversation.stream.toolArguments.forEach((text) => {
		splitStreamText(text).forEach((delta) => {
			events.push({
				type: "tool_delta",
				messageId: toolId,
				phase: "chunk",
				name: conversation.stream.toolName,
				delta
			})
		})
	})
	events.push({
		type: "tool_status",
		messageId: toolId,
		phase: "calling",
		name: conversation.stream.toolName,
		status: conversation.stream.toolCallingStatus
	})

	conversation.stream.toolResponse.forEach((text) => {
		splitStreamText(text).forEach((delta) => {
			events.push({
				type: "tool_delta",
				messageId: toolId,
				phase: "response",
				name: conversation.stream.toolName,
				delta
			})
		})
	})
	events.push({ type: "tool_done", messageId: toolId })

	conversation.stream.final.forEach((text) => {
		splitStreamText(text).forEach((delta) => {
			events.push({
				type: "assistant_delta",
				messageId: finalId,
				title: "Assistant",
				meta: "Summary",
				delta
			})
		})
	})
	events.push({ type: "assistant_done", messageId: finalId })
	events.push({ type: "completed" })

	return events
}
