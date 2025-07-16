import React from "react"
import ReactDOM from "react-dom"

export function isDOM(node: any): node is HTMLElement | SVGElement {
	return node instanceof HTMLElement || node instanceof SVGElement
}

/**
 * Return if a node is a DOM node. Else will return by `findDOMNode`
 */
export function findDOMNode<T = Element | Text>(
	node: React.ReactInstance | HTMLElement | SVGElement
): T | null {
	if (isDOM(node)) {
		return node as unknown as T
	}

	if (node instanceof React.Component) {
		return ReactDOM.findDOMNode(node) as unknown as T
	}

	return null
}

export function getPageXY(
	e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
	horizontal?: boolean
) {
	const obj = "touches" in e ? e.touches[0] : e
	return obj[horizontal ? "pageX" : "pageY"]
}
