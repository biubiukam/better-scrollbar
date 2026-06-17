import { act, fireEvent, render } from "@testing-library/react"
import React from "react"
import { describe, expect, it, vi } from "vitest"
import CustomStyles from "../site/examplex/CustomStyles/CustomStyles"
import DragAndDrop from "../site/examplex/DragAndDrop/DragAndDrop"
import RandomHeight from "../site/examplex/RandomHeight/RandomHeight"
import "../src/styles/index.less"

const sortableCreate = vi.hoisted(() => vi.fn(() => ({destroy: vi.fn()})))
type MockSortableOptions = {
	forceFallback?: boolean
	onEnd?: (event: {oldIndex: number, newIndex: number}) => void
}

vi.mock("sortablejs", () => ({
	default: {
		create: sortableCreate
	}
}))

describe("site demo interactions", () => {
	it("keeps the visible dynamic-height row stable when inserting before it", () => {
		const { container, getByRole } = render(<RandomHeight/>)

		act(() => {
			fireEvent.click(getByRole("button", {name: "中段"}))
		})
		const beforeInsert = container.querySelector(".random-million-item")?.textContent
		const beforeButton = container.querySelector(".random-million-item button:nth-of-type(2)") as HTMLButtonElement

		act(() => {
			fireEvent.click(beforeButton)
		})

		expect(container.querySelector(".random-million-item")?.textContent).toBe(beforeInsert)
	})

	it("offers a quick jump control for the custom style demo so tone changes are observable", () => {
		const { getByRole } = render(<CustomStyles/>)

		expect(getByRole("button", {name: "75%"})).toBeTruthy()
	})

	it("persists visible drag reordering after Sortable reports a row move", () => {
		sortableCreate.mockClear()
		const { container } = render(<DragAndDrop/>)
		const calls = sortableCreate.mock.calls as unknown as Array<[unknown, MockSortableOptions]>
		const options = calls[0]?.[1]

		expect(options?.onEnd).toBeTypeOf("function")
		expect(options?.forceFallback).toBeUndefined()
		act(() => {
			options?.onEnd?.({oldIndex: 0, newIndex: 1})
		})

		const rows = Array.from(container.querySelectorAll(".drag-million-item")).slice(0, 2)
		expect(rows[0]?.textContent).toContain("#2")
		expect(rows[1]?.textContent).toContain("#1")
	})

	it("keeps the drag demo interactive when native drag/drop events handle the visible row move", () => {
		sortableCreate.mockClear()
		const { container } = render(<DragAndDrop/>)
		const calls = sortableCreate.mock.calls as unknown as Array<[unknown, MockSortableOptions]>
		const options = calls[0]?.[1]
		const rows = Array.from(container.querySelectorAll(".drag-million-item")).slice(0, 2)
		const dataTransfer = {
			effectAllowed: "",
			dropEffect: "",
			setData: vi.fn()
		}

		act(() => {
			fireEvent.dragStart(rows[0], {dataTransfer})
			fireEvent.dragOver(rows[1], {dataTransfer})
			fireEvent.drop(rows[1], {dataTransfer})
			options?.onEnd?.({oldIndex: 0, newIndex: 1})
			fireEvent.dragEnd(rows[0], {dataTransfer})
		})

		const reorderedRows = Array.from(container.querySelectorAll(".drag-million-item")).slice(0, 2)
		expect(reorderedRows[0]?.textContent).toContain("#2")
		expect(reorderedRows[1]?.textContent).toContain("#1")
	})
})
