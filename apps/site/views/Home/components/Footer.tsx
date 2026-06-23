import React from "react"
import type { HomeCopy } from "../../../i18n/home"
import { Separator } from "@/components/ui/separator"
import { SiteIcon } from "./SiteIcon"

export function Footer({ copy }: { copy: HomeCopy }) {
	return (
		<footer className="border-t border-border bg-card/54">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
				<div className="flex items-center gap-3">
					<SiteIcon className="size-7" />
					<span>{copy.footer}</span>
				</div>
				<div className="flex items-center gap-3">
					<span>{copy.licenseLabel}</span>
					<Separator orientation="vertical" className="h-4" />
					<a
						className="transition-colors hover:text-foreground"
						href="https://github.com/kampiu/better-scrollbar"
						aria-label={copy.githubLabel}
					>
						{copy.githubText}
					</a>
				</div>
			</div>
		</footer>
	)
}
