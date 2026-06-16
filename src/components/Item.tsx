import React, { cloneElement, useCallback } from "react"
import type { ReactElement } from "react"
import clsx from "clsx"

export interface ItemProps {
	children: ReactElement
	setRef: (element: HTMLElement | null) => void;
	hidden?: boolean
	useWrapper?: boolean
	itemProps?: React.HTMLAttributes<HTMLElement>
}

export function Item({setRef, children, hidden = false, useWrapper = false, itemProps}: ItemProps) {
	const refFunc = useCallback((node: HTMLElement | null) => {
		setRef(node)
	}, [setRef])
	const itemStyle = itemProps?.style || {}

	if (useWrapper) {
		return (
			<div
				{...itemProps}
				ref={ hidden ? undefined : refFunc }
				style={ hidden ? {...itemStyle, display: "none"} : itemStyle }
			>
				{ children }
			</div>
		)
	}

	const childStyle = children.props.style || {}
	const className = clsx(children.props.className, itemProps?.className)
	
	return cloneElement(children, {
		...itemProps,
		ref: hidden ? undefined : refFunc,
		...(className ? {className} : {}),
		style: hidden
			? {...childStyle, ...itemStyle, display: "none"}
			: {...childStyle, ...itemStyle}
	})
}
