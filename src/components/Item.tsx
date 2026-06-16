import React, { cloneElement, useCallback } from "react"
import type { ReactElement } from "react"

export interface ItemProps {
	children: ReactElement
	setRef: (element: HTMLElement | null) => void;
	hidden?: boolean
	useWrapper?: boolean
}

export function Item({setRef, children, hidden = false, useWrapper = false}: ItemProps) {
	const refFunc = useCallback((node: HTMLElement | null) => {
		setRef(node)
	}, [setRef])

	if (useWrapper) {
		return (
			<div ref={ hidden ? undefined : refFunc } style={ hidden ? {display: "none"} : undefined }>
				{ children }
			</div>
		)
	}
	
	return cloneElement(children, {
		ref: hidden ? undefined : refFunc,
		...(hidden ? {style: {...children.props.style, display: "none"}} : {})
	})
}
