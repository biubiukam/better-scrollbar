import { cloneElement, useCallback } from "react"
import type { ReactElement } from "react"

export interface ItemProps {
	children: ReactElement
	setRef: (element: HTMLElement | null) => void;
}

export function Item({setRef, children}: ItemProps) {
	const refFunc = useCallback((node: HTMLElement | null) => {
		setRef(node)
	}, [setRef])
	
	return cloneElement(children, {
		ref: refFunc,
	})
}
