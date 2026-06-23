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
	| { type: "thinking_delta", messageId: string, delta: string }
	| { type: "thinking_done", messageId: string }
	| { type: "assistant_delta", messageId: string, title: string, meta: string, delta: string }
	| { type: "assistant_done", messageId: string }
	| { type: "tool_delta", messageId: string, phase: "chunk" | "response", name: string, delta: string }
	| { type: "tool_status", messageId: string, phase: "calling", name: string, status: string }
	| { type: "tool_done", messageId: string }
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
	title: "Agent 对话 / OpenAI 风格流式工具调用",
	subtitle: "同一个滚动容器承载思考、正文、工具 chunk、工具调用和工具响应。",
	description:
		"这个 mock 场景模拟一个排障 Agent：用户给出复杂问题后，Agent 先展示可折叠的思考摘要，再流式输出正文，然后通过统一工具调用组件依次进入参数 chunk、实际调用、响应回填三个阶段。",
	messages: [
		{
			id: "seed-user-001",
			kind: "user",
			title: "用户",
			meta: "业务请求",
			timestamp: "14:16:02",
			content:
				"我需要你帮我排查一个线上 Agent 编排问题：客服工作台里，Agent 在读取订单、库存、退款记录之后会突然停止输出；有时工具调用已经成功返回，但正文没有继续写完。请按 OpenAI 风格把思考、正文、工具调用参数、调用状态和工具响应都分开展示，并且在长对话里保持滚动体验稳定。",
		},
		{
			id: "seed-thinking-001",
			kind: "thinking",
			title: "思考中",
			meta: "已完成",
			timestamp: "14:16:03",
			expanded: false,
			content:
				"先确认问题边界：停止输出不等于工具失败；需要分别观察 response.output_text.delta、response.function_call_arguments.delta、工具执行状态和最终 response.completed。再判断 UI 是否把不同阶段混在同一条消息里，导致高度测量和底部跟随互相干扰。",
		},
		{
			id: "seed-assistant-001",
			kind: "assistant",
			title: "Assistant",
			meta: "正文",
			timestamp: "14:16:05",
			content:
				"我会把这条链路拆成三个层次：第一层是模型流，关注每个 delta 的到达顺序；第二层是工具流，关注参数是否完整、调用是否进入执行态、响应是否写回；第三层是前端滚动流，关注消息高度变化后是否继续贴住底部，或者在用户主动上滑阅读时保持锚点。",
		},
		{
			id: "seed-tool-001",
			kind: "tool",
			title: "工具调用",
			meta: "response",
			timestamp: "14:16:07",
			content: "",
			tool: {
				name: "support.trace_search",
				phase: "response",
				request:
					"{\n  \"session_id\": \"cs_20260623_8841\",\n  \"include\": [\"orders\", \"refunds\", \"inventory\", \"model_events\"],\n  \"window\": \"15m\"\n}",
				response:
					"工具响应已经返回：模型事件完整，工具执行耗时 618ms，库存服务成功返回 3 个候选仓，退款服务成功返回 2 条记录；异常点出现在 UI 将工具响应追加到正文节点后，没有触发对应行的重新测量。",
				status: "工具响应阶段完成",
			},
		},
		{
			id: "seed-assistant-002",
			kind: "assistant",
			title: "Assistant",
			meta: "结论",
			timestamp: "14:16:09",
			content:
				"初步结论：后端工具链路没有失败，前端展示层更可疑。尤其是工具调用的三个阶段如果共用一个视觉组件，但数据结构没有明确 phase，就容易出现同一个气泡内部高度连续变化，而虚拟滚动容器无法判断用户是否仍在底部。",
		},
		{
			id: "seed-user-002",
			kind: "user",
			title: "用户",
			meta: "追问",
			timestamp: "14:16:22",
			content:
				"请继续模拟一次完整流式过程。我希望能看到思考中、正文、工具 chunk、工具调用中、工具响应这几个阶段，而且思考完成后要自动折叠，但我能手动展开复查。",
		},
		{
			id: "seed-assistant-003",
			kind: "assistant",
			title: "Assistant",
			meta: "准备",
			timestamp: "14:16:24",
			content:
				"可以。下面我会重新播放一条 mock 流，每 24ms 推进一个 chunk。为了接近真实对话，正文会保留较长中文说明，工具调用会保留结构化 JSON 参数，工具响应也会逐段回填，而不是一次性塞进消息里。",
		},
		{
			id: "seed-thinking-002",
			kind: "thinking",
			title: "思考中",
			meta: "已完成",
			timestamp: "14:16:25",
			expanded: false,
			content:
				"需要让用户读到阶段变化，但不能把阶段变化做成三套 UI。最稳妥的做法是 ToolCall 组件只吃 phase、request、response、status 四个字段；chunk 阶段展示参数流，calling 阶段展示执行态，response 阶段展示响应流。",
		},
		{
			id: "seed-assistant-004",
			kind: "assistant",
			title: "Assistant",
			meta: "滚动说明",
			timestamp: "14:16:27",
			content:
				"滚动组件的价值在这里很明确：Agent 对话会不断追加消息、修改最后一条消息高度、折叠已完成思考，并且用户可能在过程中上滑查看旧证据。虚拟滚动必须同时支持动态高度测量、底部跟随和可见内容锚定。",
		},
	],
	stream: {
		thinking: [
			"先快速复述目标",
			"：这不是一个简单聊天气泡，而是一个包含模型事件、工具参数、工具执行和工具响应的长对话面板。",
			"我会把 OpenAI 风格的事件流映射到 UI 状态：reasoning summary 对应思考中，output_text 对应正文，function_call_arguments 对应工具 chunk。",
			"工具真正开始执行时不新建第二套组件，只把同一个工具卡片的 phase 切到 calling；工具返回后 phase 切到 response 并继续流式填充响应。",
			"思考完成后应该默认折叠，因为它已经不是主阅读内容；但保留展开入口，方便用户审计 Agent 的判断过程。",
		],
		body: [
			"我先给出排查路径：把这次客服工作台的 Agent 输出拆成可观察的事件，而不是只看最终消息有没有出现。",
			"第一步，检查 response.output_item.added 是否先创建了思考块；第二步，检查 response.reasoning_summary_text.delta 是否持续抵达；第三步，等待 reasoning done 后自动折叠思考。",
			"接着进入正文阶段，正文使用 response.output_text.delta 按 chunk 追加。这里每个 chunk 的间隔固定为 24ms，用来模拟真实模型流里高频但不完全连续的输出节奏。",
			"然后进入工具调用阶段。工具参数不是一次性出现，而是通过 response.function_call_arguments.delta 逐块进入同一个工具卡片。",
			"当参数流结束，UI 不替换组件，只把 phase 从 chunk 切换为 calling，让用户看到工具已经从参数生成阶段进入实际执行阶段。",
			"最后工具响应返回，phase 切换为 response，响应内容继续按 chunk 回填。这样用户能清楚区分证据来自模型正文还是来自外部工具。",
		],
		toolName: "support.agent_diagnostics",
		toolArguments: [
			"{\n",
			"  \"conversation_id\": \"conv_agent_support_20260623_1142\",\n",
			"  \"trace_window\": \"2026-06-23T14:10:00+08:00/2026-06-23T14:18:00+08:00\",\n",
			"  \"include_model_events\": true,\n",
			"  \"include_tool_events\": true,\n",
			"  \"include_ui_measurements\": true,\n",
			"  \"checks\": [\n",
			"    \"reasoning_summary_done\",\n",
			"    \"output_text_delta_after_tool_response\",\n",
			"    \"function_call_arguments_delta\",\n",
			"    \"tool_response_phase\",\n",
			"    \"virtual_scroll_bottom_follow\",\n",
			"    \"thinking_collapse_after_done\"\n",
			"  ]\n",
			"}",
		],
		toolCallingStatus:
			"工具调用阶段：参数已经完整，正在请求诊断服务；UI 继续复用同一个工具卡片，只切换状态和动效。",
		toolResponse: [
			"工具响应已经返回。",
			"诊断服务确认：模型端事件顺序完整，reasoning_summary_text.done 在 14:16:25.481 到达，function_call_arguments.done 在 14:16:26.104 到达，工具执行耗时 642ms。",
			"异常风险集中在前端：工具响应追加时同一行高度从 96px 增长到 214px，如果滚动容器没有重新测量并保持底部锚定，用户会看到输出停住或底部跳动。",
			"建议 UI 将工具调用抽象成统一组件，通过 phase=chunk/calling/response 表达状态；不要把工具参数、调用中、工具响应拆成三个互不关联的 DOM 结构。",
			"思考块完成后自动折叠是合理的，但折叠动作本身也会改变行高，所以需要让虚拟滚动组件参与测量和锚定。",
		],
		final: [
			"基于工具结果，我建议这个场景的前端实现保持三个边界：mock 数据只负责事件脚本和中文业务文案；基础组件只负责消息、思考和工具卡片；业务组件只负责播放流、驱动滚动和处理用户交互。",
			"滚动容器继续使用仓库核心组件，开启 maintainVisibleContentPosition 与 followOutput，让新增 chunk、工具响应变长、思考折叠这些高度变化都能在同一个列表里被处理。",
			"如果用户主动滚动到顶部查看历史，则不要强行抢回底部；如果用户点击回到底部或重新播放，就恢复自动跟随。这就是 Agent 对话里最常见、也最能体现滚动组件价值的业务闭环。",
		],
	},
}

export const MOCK_AGENT_CONVERSATION_EN: AgentConversationFixture = {
	title: "Agent conversation / OpenAI-style streaming tool calls",
	subtitle: "One scroll surface renders reasoning, body text, tool chunks, tool execution, and tool response.",
	description:
		"This mock scenario simulates an operations agent. It streams a collapsible reasoning summary first, then body text, then a shared tool-call card that moves through argument chunks, execution, and response phases.",
	messages: [
		{
			id: "seed-user-001-en",
			kind: "user",
			title: "User",
			meta: "Request",
			timestamp: "14:16:02",
			content:
				"I need help diagnosing a production agent orchestration issue. In the support workspace, the agent reads orders, inventory, and refund records, then sometimes stops writing. The tool call has already returned, but the final body text does not finish. Please display reasoning, body text, tool arguments, tool execution state, and tool response as separate phases while keeping the long conversation scroll stable.",
		},
		{
			id: "seed-thinking-001-en",
			kind: "thinking",
			title: "Reasoning",
			meta: "Done",
			timestamp: "14:16:03",
			expanded: false,
			content:
				"First separate the symptoms: stopped output is not the same as a failed tool. Inspect output text deltas, function call argument deltas, tool execution status, and response completion independently before judging the frontend.",
		},
		{
			id: "seed-assistant-001-en",
			kind: "assistant",
			title: "Assistant",
			meta: "Body",
			timestamp: "14:16:05",
			content:
				"I will split this into three layers: model streaming, tool streaming, and scroll behavior. Model streaming explains what deltas arrived; tool streaming explains whether the call executed; scroll behavior explains whether dynamic height changes kept the reader anchored.",
		},
		{
			id: "seed-tool-001-en",
			kind: "tool",
			title: "Tool call",
			meta: "response",
			timestamp: "14:16:07",
			content: "",
			tool: {
				name: "support.trace_search",
				phase: "response",
				request:
					"{\n  \"session_id\": \"cs_20260623_8841\",\n  \"include\": [\"orders\", \"refunds\", \"inventory\", \"model_events\"],\n  \"window\": \"15m\"\n}",
				response:
					"Tool response returned: model events are complete, tool execution took 618ms, inventory returned 3 warehouses, refund service returned 2 records, and the risky point is the UI appending tool response content into a row without remeasurement.",
				status: "Tool response phase complete",
			},
		},
		{
			id: "seed-assistant-002-en",
			kind: "assistant",
			title: "Assistant",
			meta: "Finding",
			timestamp: "14:16:09",
			content:
				"Initial finding: the backend tool path did not fail. The presentation layer is more suspicious, especially if the tool phases share a card visually but do not preserve an explicit phase in state.",
		},
		{
			id: "seed-user-002-en",
			kind: "user",
			title: "User",
			meta: "Follow-up",
			timestamp: "14:16:22",
			content:
				"Please simulate a full streaming pass. I want to see reasoning, body text, tool chunks, tool execution, and tool response. Completed reasoning should collapse automatically, but I need to reopen it.",
		},
		{
			id: "seed-assistant-003-en",
			kind: "assistant",
			title: "Assistant",
			meta: "Ready",
			timestamp: "14:16:24",
			content:
				"Yes. The replay below advances one chunk every 24ms. Body text stays relatively long, tool arguments remain structured JSON, and the response is filled gradually instead of appearing all at once.",
		},
		{
			id: "seed-thinking-002-en",
			kind: "thinking",
			title: "Reasoning",
			meta: "Done",
			timestamp: "14:16:25",
			expanded: false,
			content:
				"The tool card should not be implemented three times. It should accept phase, request, response, and status fields. The chunk phase streams arguments, the calling phase shows execution, and the response phase streams returned evidence.",
		},
		{
			id: "seed-assistant-004-en",
			kind: "assistant",
			title: "Assistant",
			meta: "Scroll note",
			timestamp: "14:16:27",
			content:
				"The scroll component matters here because agent conversations append messages, mutate the last row height, collapse completed reasoning, and let users scroll back to inspect old evidence while new chunks keep arriving.",
		},
	],
	stream: {
		thinking: [
			"First restate the target",
			": this is not a basic chat bubble. It is a long conversation surface with model events, tool arguments, tool execution, and tool response evidence.",
			"I will map OpenAI-style events into UI states: reasoning summary becomes the reasoning block, output text becomes body text, and function call argument deltas become tool chunks.",
			"When the tool starts executing, the UI keeps the same tool card and switches phase to calling. When the tool returns, the same card switches to response and streams the result.",
			"Completed reasoning should collapse by default because it is no longer the main reading path, but the user still needs a control to reopen it for audit.",
		],
		body: [
			"I will diagnose this by observing events instead of only checking whether a final message appears.",
			"First, confirm that the reasoning item was created. Then confirm that reasoning deltas arrived. After reasoning is done, collapse that block by default.",
			"Next, body text streams through output text deltas. This mock advances one chunk every 24ms to represent a high-frequency but still visible model stream.",
			"Then the tool call begins. Tool arguments do not appear all at once; they stream into the same shared tool card.",
			"After arguments finish, the card changes phase from chunk to calling. It is the same UI component with a different state, not a new surface.",
			"Finally the tool response streams back into the card. The user can now distinguish generated narrative from external evidence.",
		],
		toolName: "support.agent_diagnostics",
		toolArguments: [
			"{\n",
			"  \"conversation_id\": \"conv_agent_support_20260623_1142\",\n",
			"  \"trace_window\": \"2026-06-23T14:10:00+08:00/2026-06-23T14:18:00+08:00\",\n",
			"  \"include_model_events\": true,\n",
			"  \"include_tool_events\": true,\n",
			"  \"include_ui_measurements\": true,\n",
			"  \"checks\": [\"reasoning_done\", \"tool_response_phase\", \"bottom_follow\"]\n",
			"}",
		],
		toolCallingStatus:
			"Tool execution phase: arguments are complete and the diagnostics service is running. The UI reuses the same tool card and only changes state.",
		toolResponse: [
			"Tool response returned.",
			"The diagnostics service confirms a complete model event order, function call arguments completed, and tool execution took 642ms.",
			"The frontend risk is row height growth when tool response content is appended. Without remeasurement and bottom anchoring, the reader can see the stream appear stuck.",
			"The recommendation is to model tool calls with one shared component and phase=chunk/calling/response.",
			"Reasoning collapse also changes row height, so the virtual scroller should participate in measurement and anchoring.",
		],
		final: [
			"The implementation should keep three boundaries: mock data owns the event script, base components own message and tool visuals, and the scenario component owns playback and scrolling.",
			"The scroll surface should keep maintainVisibleContentPosition and followOutput enabled so appended chunks, growing tool responses, and reasoning collapse remain stable.",
			"If the user scrolls up to inspect history, do not force the bottom. If the user jumps back to the bottom or replays, restore bottom following.",
		],
	},
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
				meta: "正文",
				delta,
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
				delta,
			})
		})
	})
	events.push({
		type: "tool_status",
		messageId: toolId,
		phase: "calling",
		name: conversation.stream.toolName,
		status: conversation.stream.toolCallingStatus,
	})

	conversation.stream.toolResponse.forEach((text) => {
		splitStreamText(text).forEach((delta) => {
			events.push({
				type: "tool_delta",
				messageId: toolId,
				phase: "response",
				name: conversation.stream.toolName,
				delta,
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
				meta: "总结",
				delta,
			})
		})
	})
	events.push({ type: "assistant_done", messageId: finalId })
	events.push({ type: "completed" })

	return events
}
