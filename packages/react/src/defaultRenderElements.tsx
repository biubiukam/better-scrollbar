import React from "react"
import type { HTMLProps, ReactElement } from "react"
import { RenderElement } from "./types"

export const renderViewDefault: RenderElement<HTMLProps<HTMLDivElement>> = (
	props?: HTMLProps<HTMLDivElement>
) => {
	return <div {...props} />
}

export function renderTrackHorizontalDefault(props?: HTMLProps<HTMLDivElement>): ReactElement {
	const finalStyle = {
		...(props?.style || {}),
		right: 2,
		bottom: 2,
		left: 2,
		borderRadius: 3
	}
	return <div {...props} style={finalStyle} />
}

export function renderTrackVerticalDefault(props?: HTMLProps<HTMLDivElement>): ReactElement {
	const finalStyle = {
		...(props?.style || {}),
		right: 2,
		bottom: 2,
		top: 2,
		borderRadius: 3
	}
	return <div {...props} style={finalStyle} />
}

export function renderThumbHorizontalDefault(props?: HTMLProps<HTMLDivElement>): ReactElement {
	const finalStyle = {
		...(props?.style || {}),
		cursor: "pointer",
		borderRadius: "inherit",
		backgroundColor: "rgba(0,0,0,.2)"
	}
	return <div {...props} style={finalStyle} />
}

export const renderThumbVerticalDefault = (props?: HTMLProps<HTMLDivElement>): ReactElement => {
	const finalStyle = {
		...(props?.style || {}),
		cursor: "pointer",
		borderRadius: "inherit",
		backgroundColor: "rgba(0,0,0,.2)"
	}
	return <div {...props} style={finalStyle} />
}
