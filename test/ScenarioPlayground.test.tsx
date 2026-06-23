import { act, fireEvent, render } from "@testing-library/react"
import React from "react"
import { describe, expect, it, vi } from "vitest"
import ScenarioPlayground from "../site/components/ScenarioPlayground/ScenarioPlayground"
import "../src/styles/index.less"

const sortableCreate = vi.hoisted(() => vi.fn(() => ({destroy: vi.fn()})))
type MockSortableOptions = {
	draggable?: string
	forceFallback?: boolean
	onEnd?: (event: {oldIndex?: number, newIndex?: number}) => void
}

vi.mock("sortablejs", () => ({
	default: {
		create: sortableCreate
	}
}))

describe("ScenarioPlayground", () => {
	it("renders the aggregated 100 million row playground with preset controls and a props snapshot", () => {
		const { getByRole, getByText } = render(<ScenarioPlayground/>)

		expect(getByText("1 亿行虚拟列表实验台")).toBeTruthy()
		expect(getByRole("button", {name: "基础大列表"})).toBeTruthy()
		expect(getByRole("button", {name: "快速滚动"})).toBeTruthy()
		expect(getByRole("button", {name: "分组表格"})).toBeTruthy()
		expect(getByText("100,000,000")).toBeTruthy()
		expect(getByText("itemCount: 100,000,000")).toBeTruthy()
		expect(getByText("overscan: 4")).toBeTruthy()
	})

	it("lets the user switch presets and form props that change the generated scenario props", () => {
		const { getByRole, getByText } = render(<ScenarioPlayground/>)

		act(() => {
			fireEvent.click(getByRole("button", {name: "分组表格"}))
		})

		expect(getByText("stickyIndices: enabled")).toBeTruthy()

		act(() => {
			fireEvent.change(getByRole("combobox", {name: "高度策略"}), {target: {value: "dynamic"}})
			fireEvent.click(getByRole("checkbox", {name: "滚动占位"}))
		})

		expect(getByText("heightMode: dynamic")).toBeTruthy()
		expect(getByText("scrollSeek: enabled")).toBeTruthy()
	})

	it("renders grouped rows with a sticky header without shifting the first data row", () => {
		const { container, getByRole } = render(<ScenarioPlayground/>)

		act(() => {
			fireEvent.click(getByRole("button", {name: "分组表格"}))
		})

		const stickyRow = container.querySelector(".scroll-bar-sticky-item")
		const rows = Array.from(container.querySelectorAll(".scroll-bar-wrapper .scenario-playground-row"))

		expect(stickyRow?.textContent).toContain("Group 1")
		expect(rows[0]?.textContent).toContain("Group 1")
		expect(rows[1]?.textContent).toContain("#1")
	})

	it("wires the aggregate drag scenario to Sortable and persists visible window reordering once", () => {
		sortableCreate.mockClear()
		const { container, getByRole } = render(<ScenarioPlayground/>)

		act(() => {
			fireEvent.click(getByRole("button", {name: "拖拽排序"}))
		})

		const calls = sortableCreate.mock.calls as unknown as Array<[unknown, MockSortableOptions]>
		const options = calls[0]?.[1]
		expect(sortableCreate).toHaveBeenCalledTimes(1)
		expect(options?.draggable).toBe(".scenario-playground-row.is-draggable")
		expect(options?.forceFallback).toBe(true)
		expect(options?.onEnd).toBeTypeOf("function")

		const rowsBeforeDrag = Array.from(container.querySelectorAll(".scenario-playground-row")).slice(0, 2)
		const dataTransfer = {
			effectAllowed: "",
			dropEffect: "",
			setData: vi.fn()
		}

		act(() => {
			fireEvent.dragStart(rowsBeforeDrag[0], {dataTransfer})
			fireEvent.dragOver(rowsBeforeDrag[1], {dataTransfer})
			fireEvent.drop(rowsBeforeDrag[1], {dataTransfer})
			options?.onEnd?.({oldIndex: 0, newIndex: 1})
			fireEvent.dragEnd(rowsBeforeDrag[0], {dataTransfer})
		})

		const rows = Array.from(container.querySelectorAll(".scenario-playground-row")).slice(0, 2)
		expect(rows[0]?.textContent).toContain("#2")
		expect(rows[1]?.textContent).toContain("#1")
	})

	it("logs scenario operations and keeps mutations anchored to the 100 million row data set", () => {
		const { getByRole, getByText } = render(<ScenarioPlayground/>)

		act(() => {
			fireEvent.click(getByRole("button", {name: "跳到中段"}))
			fireEvent.click(getByRole("button", {name: "上方插入 20 条"}))
		})

		expect(getByText("100,000,020")).toBeTruthy()
		expect(getByText("跳转到 中段")).toBeTruthy()
		expect(getByText("上方插入 20 条")).toBeTruthy()
	})
})
