import React, { forwardRef } from "react"
import ScrollBar from "./ScrollBar"
import type { ScrollBarProps, ScrollBarRef } from "../types"

const VerticalScrollBar = forwardRef<ScrollBarRef, ScrollBarProps>((props, ref) => {
	return <ScrollBar {...props} ref={ref} orientation="vertical" />
})

export default VerticalScrollBar
