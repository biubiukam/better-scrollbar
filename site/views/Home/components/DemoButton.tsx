import React from "react"
import type { DemoId, HomeCopy } from "../../../i18n/home"
import { cn } from "@/lib/utils"
import type { DemoMeta } from "../data"

export interface DemoButtonProps {
	demo: DemoMeta
	active: boolean
	copy: HomeCopy["demos"][DemoId]
	onClick: () => void
}

export function DemoButton({ demo, active, copy, onClick }: DemoButtonProps) {
	const Icon = demo.icon

	return (
		<button
			type="button"
			className={cn(
				"flex min-w-0 items-start gap-3 rounded-lg border p-4 text-left transition-all",
				active
					? "border-primary bg-primary/10 text-foreground shadow-site-line"
					: "border-border bg-card/64 text-muted-foreground hover:border-border/90 hover:bg-card",
			)}
			onClick={onClick}
		>
			<span
				className={cn(
					"mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md",
					active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
				)}
			>
				<Icon className="size-4" />
			</span>
			<span className="min-w-0">
				<span className="block truncate text-sm font-semibold text-foreground">{copy.title}</span>
				<span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">{copy.desc}</span>
			</span>
		</button>
	)
}
