type PageXYPoint = {
	pageX: number
	pageY: number
}

type TouchListLike = {
	readonly length: number
	[index: number]: PageXYPoint
	item?: (index: number) => PageXYPoint | null
}

type TouchEventLike = {
	touches: TouchListLike
}

export function isDOM(node: unknown): node is HTMLElement | SVGElement {
	return node instanceof HTMLElement || node instanceof SVGElement
}

export function getPageXY(event: PageXYPoint | TouchEventLike, horizontal?: boolean) {
	const point = "touches" in event ? (event.touches.item?.(0) ?? event.touches[0]) : event
	return point[horizontal ? "pageX" : "pageY"]
}
