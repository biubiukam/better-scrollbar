import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"
import { defineComponent, h, nextTick, ref } from "vue"
import {
	BScrollBar,
	BScrollBarItem,
	HorizontalScrollBar,
	VerticalScrollBar,
	useHeights,
	useResizeObserver,
	useScrollBar
} from "@better-scrollbar/vue"

describe("@better-scrollbar/vue", () => {
	it("exports Vue components and composables", () => {
		expect(BScrollBar.name).toBe("BScrollBar")
		expect(BScrollBarItem.name).toBe("BScrollBarItem")
		expect(typeof useScrollBar).toBe("function")
		expect(typeof useHeights).toBe("function")
		expect(typeof useResizeObserver).toBe("function")
	})

	it("renders virtual rows and emits scroll state changes", async () => {
		const wrapper = mount(BScrollBar, {
			props: {
				itemCount: 100,
				estimatedItemHeight: 20,
				height: 60,
				width: 200
			},
			slots: {
				default: ({ index }: { index: number }) =>
					h("span", { class: "row" }, `Row ${index}`)
			}
		})

		expect(wrapper.find(".scroll-bar-outer-container").exists()).toBe(true)
		expect(wrapper.findAll(".scroll-bar-item").map((item) => item.text())).toEqual([
			"Row 0",
			"Row 1",
			"Row 2",
			"Row 3"
		])

		const viewport = wrapper.find(".scroll-bar-inner-container").element as HTMLElement
		viewport.scrollTop = 40
		await wrapper.find(".scroll-bar-inner-container").trigger("scroll")
		await nextTick()

		expect(wrapper.emitted("scroll")?.at(-1)?.[0]).toMatchObject({
			y: 40,
			clientHeight: 60,
			scrollHeight: 2_000
		})
		expect(wrapper.findAll(".scroll-bar-item").map((item) => item.text())).toContain("Row 2")
	})

	it("renders default slots and fluid width when width is omitted", () => {
		const wrapper = mount(BScrollBar, {
			props: {
				itemCount: 2,
				estimatedItemHeight: 20,
				height: 40
			}
		})

		expect(wrapper.find(".scroll-bar-outer-container").attributes("style")).toContain(
			"width: 100%"
		)
		expect(wrapper.findAll(".scroll-bar-item").map((item) => item.text())).toEqual(["0", "1"])
	})

	it("renders standalone item and scrollbar tracks", () => {
		const wrapper = mount(BScrollBarItem, {
			props: { index: 7 },
			slots: {
				default: ({ index }: { index: number }) => h("span", `Item ${index}`)
			}
		})

		expect(wrapper.attributes("data-index")).toBe("7")
		expect(wrapper.text()).toBe("Item 7")
	})

	it("computes scroll ranges through useScrollBar", async () => {
		let api: ReturnType<typeof useScrollBar> | undefined
		const itemCount = ref(10)
		const height = ref(30)
		mount(
			defineComponent({
				setup() {
					api = useScrollBar({
						itemCount,
						estimatedItemHeight: 10,
						height,
						overscan: 1
					})

					return () => h("div")
				}
			})
		)

		expect(api?.visibleItems.value).toEqual([0, 1, 2, 3])
		api?.scrollTo({ y: 20 })
		await nextTick()
		expect(api?.scrollState.value.y).toBe(20)
		expect(api?.visibleItems.value).toEqual([1, 2, 3, 4, 5])

		api?.scrollTo({ x: 5 })
		expect(api?.scrollState.value.x).toBe(5)
		expect(api?.scrollState.value.y).toBe(20)

		api?.handleScroll(new Event("scroll"))
		expect(api?.scrollState.value.x).toBe(0)
		expect(api?.scrollState.value.y).toBe(0)

		itemCount.value = 4
		height.value = 20
		await nextTick()
		expect(api?.scrollState.value.scrollHeight).toBe(40)
	})

	it("uses default overscan when useScrollBar options omit it", () => {
		let api: ReturnType<typeof useScrollBar> | undefined
		mount(
			defineComponent({
				setup() {
					api = useScrollBar({
						itemCount: 5,
						estimatedItemHeight: 10,
						height: 20
					})

					return () => h("div")
				}
			})
		)

		expect(api?.visibleItems.value).toEqual([0, 1, 2])
	})

	it("tracks measured heights through useHeights", () => {
		let api: ReturnType<typeof useHeights> | undefined
		const itemCount = ref(5)
		mount(
			defineComponent({
				setup() {
					api = useHeights({
						itemCount,
						estimatedItemHeight: 10
					})

					return () => h("div")
				}
			})
		)

		api?.setMeasuredHeight(1, 30)
		expect(api?.heightIndex.value.totalHeight).toBe(70)
		expect(api?.heightIndex.value.getOffset(2)).toBe(40)

		api?.deleteMeasuredHeight(1)
		expect(api?.heightIndex.value.totalHeight).toBe(50)

		const element = document.createElement("div")
		Object.defineProperty(element, "offsetHeight", { configurable: true, value: 25 })
		api?.measureElement(2, element)
		expect(api?.totalHeight.value).toBe(65)

		const measuredByRect = document.createElement("div")
		Object.defineProperty(measuredByRect, "offsetHeight", { configurable: true, value: 0 })
		measuredByRect.getBoundingClientRect = () => ({
			width: 0,
			height: 18,
			x: 0,
			y: 0,
			top: 0,
			right: 0,
			bottom: 18,
			left: 0,
			toJSON: () => undefined
		})
		api?.measureElement(3, measuredByRect)
		expect(api?.totalHeight.value).toBe(73)

		api?.measureElement(2, null)
		expect(api?.totalHeight.value).toBe(58)

		itemCount.value = 3
		api?.reset()
		expect(api?.heightIndex.value.totalHeight).toBe(30)
	})

	it("observes element size through useResizeObserver", async () => {
		const target = ref<HTMLElement | null>(null)
		let size: ReturnType<typeof useResizeObserver>["size"] | undefined

		const wrapper = mount(
			defineComponent({
				setup() {
					size = useResizeObserver(target).size
					return () => h("div", { ref: target })
				}
			}),
			{
				attachTo: document.body
			}
		)

		Object.defineProperty(wrapper.element, "clientWidth", { configurable: true, value: 123 })
		Object.defineProperty(wrapper.element, "clientHeight", { configurable: true, value: 45 })
		window.dispatchEvent(new Event("resize"))
		await nextTick()

		expect(size?.value).toEqual({ width: 123, height: 45 })
		wrapper.unmount()
	})

	it("positions Vue scrollbar thumbs on scrollable axes", () => {
		const scrollState = {
			x: 50,
			y: 80,
			scrollWidth: 300,
			scrollHeight: 300,
			clientWidth: 100,
			clientHeight: 100,
			isScrolling: true
		}
		const vertical = mount(VerticalScrollBar, {
			props: {
				prefixCls: "scroll-bar",
				scrollState,
				containerSize: 100,
				scrollRange: 300
			}
		})
		const horizontal = mount(HorizontalScrollBar, {
			props: {
				prefixCls: "scroll-bar",
				scrollState,
				containerSize: 100,
				scrollRange: 300
			}
		})

		expect(vertical.find(".scroll-bar-vertical-thumb").attributes("style")).toContain(
			"translateY(26.8px)"
		)
		expect(horizontal.find(".scroll-bar-horizontal-thumb").attributes("style")).toContain(
			"translateX(16.75px)"
		)
	})
})
