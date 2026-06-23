import { act, fireEvent, render } from "@testing-library/react"
import { existsSync } from "node:fs"
import { join } from "node:path"
import React from "react"
import { describe, expect, it, vi } from "vitest"
import { HOME_COPY } from "../site/i18n/home"
import { AgentConversationDemo } from "../site/examplex/AgentConversationCase"
import { AgentMessageRow } from "../site/examplex/AgentConversationCase/components"
import { AuditLogDemo } from "../site/examplex/AuditLogCase"
import { MediaSearchDemo } from "../site/examplex/MediaSearchCase"
import { RuleQueueDemo } from "../site/examplex/RuleQueueCase"
import {
	AGENT_STREAM_CHUNK_MS,
	MOCK_AGENT_CONVERSATION,
	createMockAgentStream,
} from "../site/examplex/AgentConversationCase/mockData"
import { DemosSection } from "../site/views/Home/components/DemosSection"
import { DEMOS } from "../site/views/Home/data"
import "../src/styles/index.less"

const EXAMPLEX_ROOT = join(process.cwd(), "site/examplex")
const AGENT_LABELS = {
	thinkingTitle: "思考中",
	collapseThinking: "收起思考过程",
	expandThinking: "展开思考过程",
	toolChunkPhase: "工具 chunk 阶段",
	toolCallingPhase: "工具调用阶段",
	toolResponsePhase: "工具响应阶段",
}
const sortableCreate = vi.hoisted(() => vi.fn(() => ({destroy: vi.fn()})))
type MockSortableOptions = {
	draggable?: string
	forceFallback?: boolean
	onEnd?: (event: {oldIndex?: number, newIndex?: number}) => void
}

function getAgentMessageCount(container: HTMLElement) {
	const label = Array.from(container.querySelectorAll(".agent-demo-wrapper span"))
		.find((span) => span.textContent === "消息数")
	const value = label?.parentElement?.querySelector("strong")?.textContent

	return Number(value)
}

function getStreamDuration() {
	return createMockAgentStream(MOCK_AGENT_CONVERSATION).length * AGENT_STREAM_CHUNK_MS
}

vi.mock("sortablejs", () => ({
	default: {
		create: sortableCreate
	}
}))

describe("site agent scenario demo", () => {
	it("keeps each scenario demo as an independent examplex folder", () => {
		expect(existsSync(join(EXAMPLEX_ROOT, "AgentConversationCase"))).toBe(true)
		expect(existsSync(join(EXAMPLEX_ROOT, "AuditLogCase"))).toBe(true)
		expect(existsSync(join(EXAMPLEX_ROOT, "MediaSearchCase"))).toBe(true)
		expect(existsSync(join(EXAMPLEX_ROOT, "RuleQueueCase"))).toBe(true)
		expect(existsSync(join(EXAMPLEX_ROOT, "ScenarioPlayground"))).toBe(false)
	})

	it("keeps the four scenario demos while only replacing the agent conversation case", () => {
		const { getByRole, getByText, queryByRole } = render(<DemosSection copy={ HOME_COPY.zh }/>)

		expect(DEMOS.map((demo) => demo.id)).toEqual(["agent", "audit", "media", "rules"])
		expect(getByRole("button", {name: /Agent 对话/})).toBeTruthy()
		expect(queryByRole("heading", {name: /当前 Demo/})).toBeNull()
		expect(getByText("Agent 对话 / OpenAI 风格流式工具调用")).toBeTruthy()
		expect(getByRole("button", {name: /审计日志/})).toBeTruthy()
		expect(getByRole("button", {name: /富媒体搜索/})).toBeTruthy()
		expect(getByRole("button", {name: /规则编排/})).toBeTruthy()
		expect(queryByRole("button", {name: /动态高度/})).toBeNull()
	})

	it("lets every scenario demo surface size to its real content height", () => {
		const { container } = render(<DemosSection copy={ HOME_COPY.zh }/>)
		const visibleDemoButtons = Array.from(container.querySelectorAll("#demos aside button"))
			.filter((button) => button.className.includes("items-start"))
		const wrapperByDemo: Record<(typeof DEMOS)[number]["id"], string> = {
			agent: ".agent-demo-wrapper",
			audit: ".audit-demo-wrapper",
			media: ".media-demo-wrapper",
			rules: ".rule-demo-wrapper",
		}

		expect(visibleDemoButtons).toHaveLength(DEMOS.length)
		DEMOS.forEach((demo, index) => {
			fireEvent.click(visibleDemoButtons[index])
			const demoWrapper = container.querySelector(wrapperByDemo[demo.id]) as HTMLElement
			const containerRoot = demoWrapper?.parentElement?.parentElement as HTMLElement | undefined

			expect(demoWrapper).toBeTruthy()
			expect(demoWrapper.className).not.toContain("h-full")
			expect(containerRoot?.className).not.toContain("--container-height")
		})
	})

	it("keeps mock data and the 24ms chunk contract in the scenario module", () => {
		const stream = createMockAgentStream(MOCK_AGENT_CONVERSATION)
		const textDeltas = stream.flatMap((event) => {
			if (event.type === "thinking_delta" || event.type === "assistant_delta" || event.type === "tool_delta") {
				return [event.delta]
			}

			return []
		})

		expect(AGENT_STREAM_CHUNK_MS).toBe(24)
		expect(MOCK_AGENT_CONVERSATION.messages.length).toBeGreaterThan(8)
		expect(MOCK_AGENT_CONVERSATION.messages.some((message) => message.kind === "thinking")).toBe(true)
		expect(MOCK_AGENT_CONVERSATION.messages.some((message) => message.kind === "tool")).toBe(true)
		expect(Math.max(...textDeltas.map((delta) => delta.length))).toBeLessThanOrEqual(24)
		expect(textDeltas.length).toBeGreaterThan(120)
		expect(stream.some((event) => event.type === "tool_delta" && event.phase === "chunk")).toBe(true)
		expect(stream.some((event) => event.type === "tool_status" && event.phase === "calling")).toBe(true)
		expect(stream.some((event) => event.type === "tool_delta" && event.phase === "response")).toBe(true)
	})

	it("renders the conversation through the core virtual scrollbar", () => {
		const { container, getByText } = render(<AgentConversationDemo/>)

		expect(container.querySelector(".scroll-bar-container")).toBeTruthy()
		expect(container.querySelector(".agent-message-row")).toBeTruthy()
		expect(getByText("流式间隔")).toBeTruthy()
		expect(getByText("24ms / chunk")).toBeTruthy()
		expect(getByText(/我需要你帮我排查一个线上 Agent 编排问题/)).toBeTruthy()
	})

	it("exposes message rows as measurable DOM nodes for virtual height collection", () => {
		const rowRef = React.createRef<HTMLDivElement>()

		render(React.createElement(AgentMessageRow as React.ElementType, {
			ref: rowRef,
			labels: AGENT_LABELS,
			message: MOCK_AGENT_CONVERSATION.messages[0],
			onToggleThinking: vi.fn(),
		}))

		expect(rowRef.current?.classList.contains("agent-message-row")).toBe(true)
	})

	it("streams thinking, body, and tool-call phases with a 24ms chunk cadence", () => {
		vi.useFakeTimers()

		try {
			const { container, getAllByText, getByRole, getByText, queryByText } = render(<AgentConversationDemo/>)
			const replayButton = getByRole("button", {name: "重新播放"})
			const stream = createMockAgentStream(MOCK_AGENT_CONVERSATION)
			const toolChunkIndex = stream.findIndex((event) => event.type === "tool_delta" && event.phase === "chunk")
			const toolCallingIndex = stream.findIndex((event) => event.type === "tool_status" && event.phase === "calling")
			const toolResponseIndex = stream.findIndex((event) => event.type === "tool_delta" && event.phase === "response")
			const initialMessageCount = MOCK_AGENT_CONVERSATION.messages.length
			let elapsedEvents = 0
			const advanceToEvent = (eventIndex: number) => {
				act(() => {
					vi.advanceTimersByTime((eventIndex + 1 - elapsedEvents) * AGENT_STREAM_CHUNK_MS)
				})
				elapsedEvents = eventIndex + 1
			}

			act(() => {
				fireEvent.click(replayButton)
			})

			expect(replayButton.getAttribute("aria-busy")).toBe("true")
			expect(getAgentMessageCount(container)).toBe(initialMessageCount)
			expect(queryByText("先快速复述目标")).toBeNull()

			act(() => {
				vi.advanceTimersByTime(AGENT_STREAM_CHUNK_MS - 1)
			})

			expect(queryByText("先快速复述目标")).toBeNull()

			act(() => {
				vi.advanceTimersByTime(1)
			})
			elapsedEvents = 1

			expect(getByText("先快速复述目标")).toBeTruthy()
			expect(container.querySelector(".agent-thinking-card[aria-expanded='true']")).toBeTruthy()
			expect(getAgentMessageCount(container)).toBe(initialMessageCount + 1)

			advanceToEvent(toolChunkIndex)

			expect(container.querySelector(".agent-message-body")).toBeTruthy()
			expect(container.querySelector(".agent-tool-call[data-tool-phase='chunk']")).toBeTruthy()

			advanceToEvent(toolCallingIndex)

			expect(container.querySelector(".agent-tool-call[data-tool-phase='calling']")).toBeTruthy()

			advanceToEvent(toolResponseIndex)

			expect(container.querySelector(".agent-tool-call[data-tool-phase='response']")).toBeTruthy()
			expect(getAllByText(/工具响应已经返回/).length).toBeGreaterThanOrEqual(1)
		} finally {
			vi.useRealTimers()
		}
	})

	it("appends each replay as a new mock conversation run without clearing prior messages", () => {
		vi.useFakeTimers()

		try {
			const { container, getByRole } = render(<AgentConversationDemo/>)
			const replayButton = getByRole("button", {name: "重新播放"})
			const initialMessageCount = getAgentMessageCount(container)
			const streamDuration = getStreamDuration()

			act(() => {
				fireEvent.click(replayButton)
			})
			act(() => {
				vi.advanceTimersByTime(streamDuration)
			})

			expect(getAgentMessageCount(container)).toBe(initialMessageCount + 4)

			act(() => {
				fireEvent.click(replayButton)
			})
			act(() => {
				vi.advanceTimersByTime(streamDuration)
			})

			expect(getAgentMessageCount(container)).toBe(initialMessageCount + 8)
		} finally {
			vi.useRealTimers()
		}
	})

	it("drives replay with one 24ms timeout per streamed chunk", () => {
		vi.useFakeTimers()
		const setIntervalSpy = vi.spyOn(window, "setInterval")
		const setTimeoutSpy = vi.spyOn(window, "setTimeout")

		try {
			const { getByRole, queryByText } = render(<AgentConversationDemo/>)
			const replayButton = getByRole("button", {name: "重新播放"})

			setIntervalSpy.mockClear()
			setTimeoutSpy.mockClear()

			act(() => {
				fireEvent.click(replayButton)
			})

			expect(setIntervalSpy).not.toHaveBeenCalled()
			expect(setTimeoutSpy.mock.calls.some((call) => call[1] === AGENT_STREAM_CHUNK_MS)).toBe(true)

			act(() => {
				vi.advanceTimersByTime(AGENT_STREAM_CHUNK_MS - 1)
			})

			expect(queryByText("先快速复述目标")).toBeNull()

			act(() => {
				vi.advanceTimersByTime(1)
			})

			expect(queryByText("先快速复述目标")).toBeTruthy()

			const streamTimeouts = setTimeoutSpy.mock.calls.filter((call) => call[1] === AGENT_STREAM_CHUNK_MS)
			expect(streamTimeouts.length).toBeGreaterThanOrEqual(2)
		} finally {
			setIntervalSpy.mockRestore()
			setTimeoutSpy.mockRestore()
			vi.useRealTimers()
		}
	})

	it("keeps the bottom breathing room as a virtual spacer when jumping to the latest message", () => {
		const { container, getByRole } = render(<AgentConversationDemo/>)

		act(() => {
			fireEvent.click(getByRole("button", {name: "滚动到底部"}))
		})

		const renderedRows = Array.from(container.querySelectorAll(".agent-message-row"))
		expect(renderedRows.some((row) => row.className.includes("pb-20"))).toBe(false)
		expect(container.querySelector(".agent-message-bottom-spacer")).toBeTruthy()
	})

	it("collapses completed thinking and lets the user reopen it", () => {
		vi.useFakeTimers()

		try {
			const { container, getByRole } = render(<AgentConversationDemo/>)

			act(() => {
				fireEvent.click(getByRole("button", {name: "重新播放"}))
			})

			act(() => {
				vi.advanceTimersByTime(getStreamDuration())
			})

			const thinkingCards = Array.from(container.querySelectorAll(".agent-thinking-card"))
			const thinkingCard = thinkingCards.at(-1)
			const thinkingToggle = thinkingCard?.querySelector("button")

			expect(thinkingCard?.getAttribute("aria-expanded")).toBe("false")
			expect(thinkingCard?.querySelector(".agent-thinking-detail")).toBeNull()
			expect(thinkingToggle).toBeTruthy()

			act(() => {
				fireEvent.click(thinkingToggle as HTMLButtonElement)
			})

			expect(thinkingCard?.getAttribute("aria-expanded")).toBe("true")
			expect(thinkingCard?.querySelector(".agent-thinking-detail")?.textContent).toContain("先快速复述目标")
		} finally {
			vi.useRealTimers()
		}
	})

	it("lets the audit log demo switch scroll mode and jump through a 100M indexed range", () => {
		const { getByRole, getAllByText } = render(<AuditLogDemo copy={ HOME_COPY.zh.examples }/>)

		act(() => {
			fireEvent.click(getByRole("button", {name: "切换 native"}))
		})
		act(() => {
			fireEvent.click(getByRole("button", {name: "跳到高风险"}))
		})

		expect(getAllByText("scrollMode: native").length).toBeGreaterThanOrEqual(1)
	})

	it("simulates rich media search changes without losing the scroll performance controls", () => {
		const { getByRole, getByText } = render(<MediaSearchDemo copy={ HOME_COPY.zh.examples }/>)

		act(() => {
			fireEvent.click(getByRole("button", {name: "切换搜索词"}))
		})
		act(() => {
			fireEvent.click(getByRole("button", {name: "切换密度"}))
		})

		expect(getByText("adaptiveOverscan: on")).toBeTruthy()
		expect(getByText("scrollSeek: on")).toBeTruthy()
	})

	it("keeps the rule queue demo draggable inside the mounted virtual window", () => {
		sortableCreate.mockClear()
		const { container, getByRole } = render(<RuleQueueDemo copy={ HOME_COPY.zh.examples }/>)
		const calls = sortableCreate.mock.calls as unknown as Array<[unknown, MockSortableOptions]>
		const options = calls[0]?.[1]

		expect(sortableCreate).toHaveBeenCalledTimes(1)
		expect(options?.draggable).toBe(".rule-demo-row.is-draggable")
		expect(options?.forceFallback).toBe(true)

		act(() => {
			options?.onEnd?.({oldIndex: 0, newIndex: 1})
		})
		act(() => {
			fireEvent.click(getByRole("button", {name: "提升优先级"}))
		})

		const rows = Array.from(container.querySelectorAll(".rule-demo-row")).slice(0, 2)
		expect(rows[0]?.textContent).toContain("#2")
		expect(rows[1]?.textContent).toContain("#1")
	})

	it("keeps each scenario scroll pane from covering the footer controls", () => {
		const demos = [
			{ Component: AgentConversationDemo, toolbar: ".agent-demo-toolbar" },
			{ Component: AuditLogDemo, toolbar: ".audit-demo-toolbar" },
			{ Component: MediaSearchDemo, toolbar: ".media-demo-toolbar" },
			{ Component: RuleQueueDemo, toolbar: ".rule-demo-toolbar" },
		]

		demos.forEach(({ Component, toolbar }) => {
			const { container, unmount } = render(<Component copy={ HOME_COPY.zh.examples }/>)
			const scrollPane = container.querySelector(".scroll-bar-outer-container")

			expect(scrollPane?.getAttribute("style")).toContain("height: 360px")
			expect(container.querySelector(toolbar)).toBeTruthy()
			unmount()
		})
	})
})
