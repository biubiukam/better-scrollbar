import React, { type PropsWithChildren } from "react"
import { cn } from "../../lib/utils"

interface ContainerProps {
	title?: string
	desc?: string
	className?: string
	flow?: boolean
}

function Container({title, desc, className, flow = false, children}: PropsWithChildren<ContainerProps>) {
	return (
		<div
			className={ cn(
				"flex w-full min-w-0 flex-col rounded-lg border border-border bg-card text-card-foreground shadow-[var(--site-shadow-card)]",
				flow
					? "h-auto overflow-visible"
					: "h-[var(--container-height,100%)] overflow-hidden max-md:h-auto max-md:overflow-visible",
				className
			) }
		>
			{ (title || desc) && (
				<div className="w-full min-h-[92px] flex-none border-b border-border p-5">
					{ title && (
						<h3 className="overflow-hidden truncate text-base font-semibold leading-6 text-card-foreground">
							{ title }
						</h3>
					) }
					{ desc && (
						<p className="mt-1.5 line-clamp-2 overflow-hidden text-[13px] leading-[19px] text-muted-foreground">
							{ desc }
						</p>
					) }
				</div>
			) }
			<div
				className={ cn(
					"min-h-0 w-full flex-auto p-0 text-muted-foreground max-md:flex-none",
					flow && "min-h-[auto] flex-none"
				) }
			>
				{ children }
			</div>
		</div>
	)
}

export default Container
