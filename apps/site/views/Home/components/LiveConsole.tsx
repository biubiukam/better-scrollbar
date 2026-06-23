import React from "react"
import type { HomeCopy } from "../../../i18n/home"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CONSOLE_ROW_META } from "../data"

export function LiveConsole({ copy }: { copy: HomeCopy }) {
	return (
		<div className="relative overflow-hidden rounded-lg border border-border/80 bg-card/78 shadow-site-panel shadow-site-line">
			<div className="flex items-center justify-between gap-4 border-b border-border/80 px-4 py-3">
				<div className="min-w-0">
					<div className="truncate text-sm font-semibold text-card-foreground">
						{copy.consoleTitle}
					</div>
					<div className="mt-1 truncate text-xs text-muted-foreground">
						{copy.consoleSubtitle}
					</div>
				</div>
				<Badge variant="success">{copy.consoleStatus}</Badge>
			</div>
			<div className="grid gap-0 lg:grid-cols-[1fr_148px]">
				<div className="relative min-w-0 p-4">
					<div className="absolute inset-x-4 top-16 h-14 rounded-md border border-primary/40 bg-primary/10 shadow-[0_0_32px_hsl(var(--primary)/0.14)] animate-console-scan" />
					<div className="flex flex-col gap-2">
						{CONSOLE_ROW_META.map((row, index) => (
							<div
								key={row.index}
								className="grid h-12 grid-cols-[112px_minmax(0,1fr)_64px] items-center gap-3 rounded-md border border-border/70 bg-background/48 px-3 text-xs font-medium"
							>
								<span className="font-mono text-muted-foreground">{row.index}</span>
								<span className="min-w-0 truncate text-card-foreground">
									{copy.consoleRows[index]}
								</span>
								<span
									className={cn(
										"h-1.5 rounded-full",
										row.tone === "primary" && "bg-primary/80",
										row.tone === "accent" && "bg-accent/80",
										row.tone === "success" && "bg-success/80",
										row.tone === "warning" && "bg-warning/80",
										row.tone === "muted" && "bg-muted-foreground/40"
									)}
									style={{ width: row.width }}
								/>
								{index === 2 && (
									<span className="absolute right-7 h-8 w-1 rounded-full bg-accent shadow-[0_0_18px_hsl(var(--accent)/0.7)] animate-rail-pulse" />
								)}
							</div>
						))}
					</div>
				</div>
				<div className="border-t border-border/80 bg-secondary/38 p-4 lg:border-l lg:border-t-0">
					<div className="flex flex-col gap-4">
						<div>
							<div className="text-xs font-medium text-muted-foreground">
								{copy.consoleVisible}
							</div>
							<div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
								<div className="h-full w-[58%] rounded-full bg-primary" />
							</div>
						</div>
						<div className="grid gap-2">
							<div className="rounded-md border border-border bg-card/70 p-3">
								<span className="text-xs text-muted-foreground">
									{copy.consoleOffset}
								</span>
								<strong className="mt-1 block font-mono text-lg text-card-foreground">
									8.42e8
								</strong>
							</div>
						</div>
						<div className="flex items-center justify-between rounded-md border border-border bg-card/70 px-3 py-2 text-xs">
							<span className="text-muted-foreground">{copy.consoleVelocity}</span>
							<span className="font-mono text-accent">+260k/s</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
