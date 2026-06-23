import { render } from "@testing-library/react"
import React from "react"
import { describe, expect, it } from "vitest"
import Container from "../site/components/Container"

describe("site Container", () => {
	it("renders with Tailwind utility classes instead of CSS module class names", () => {
		const { container } = render(
			<Container title="Demo title" desc="Demo description" className="custom-shell" flow>
				<div>content</div>
			</Container>
		)

		const root = container.firstElementChild as HTMLElement
		const header = root.firstElementChild as HTMLElement
		const wrapper = root.lastElementChild as HTMLElement

		expect(root.className).toContain("w-full")
		expect(root.className).toContain("flex-col")
		expect(root.className).toContain("h-auto")
		expect(root.className).toContain("overflow-visible")
		expect(root.className).toContain("custom-shell")
		expect(root.className).not.toContain("container_")
		expect(root.className).not.toContain("containerFlow")
		expect(header.className).toContain("min-h-[92px]")
		expect(header.className).toContain("border-b")
		expect(wrapper.className).toContain("min-h-[auto]")
		expect(wrapper.className).toContain("flex-none")
	})
})
