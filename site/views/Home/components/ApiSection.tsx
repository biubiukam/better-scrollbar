import React from "react"
import type { HomeCopy, LocaleMode } from "../../../i18n/home"
import { HOME_API_PROPS } from "../../../i18n/home"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SectionIntro } from "./SectionIntro"

export function ApiSection({ copy, locale }: { copy: HomeCopy, locale: LocaleMode }) {
	return (
		<section id="api" className="scroll-mt-16 border-t border-border/70 bg-secondary/18 py-16 sm:py-20">
			<SectionIntro title={copy.apiTitle} desc={copy.apiDesc} />
			<div className="mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="overflow-hidden rounded-lg border border-border bg-card/72 shadow-site-line">
					<Table>
						<TableHeader>
							<TableRow className="bg-secondary/52 hover:bg-secondary/52">
								<TableHead className="min-w-[168px] text-foreground">{copy.apiHeaders.name}</TableHead>
								<TableHead className="min-w-[320px] text-foreground">{copy.apiHeaders.description}</TableHead>
								<TableHead className="min-w-[280px] text-foreground">{copy.apiHeaders.type}</TableHead>
								<TableHead className="min-w-[150px] text-foreground">{copy.apiHeaders.defaultValue}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{HOME_API_PROPS[locale].map((prop) => (
								<TableRow key={prop.name}>
									<TableCell className="font-mono text-sm font-semibold text-primary">{prop.name}</TableCell>
									<TableCell className="max-w-[420px] text-sm leading-6 text-muted-foreground">{prop.description}</TableCell>
									<TableCell>
										<code className="whitespace-nowrap rounded-md border border-border bg-background/64 px-2 py-1 font-mono text-xs text-foreground">
											{prop.type}
										</code>
									</TableCell>
									<TableCell>
										<code className="whitespace-nowrap rounded-md border border-border bg-background/64 px-2 py-1 font-mono text-xs text-muted-foreground">
											{prop.defaultValue}
										</code>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</section>
	)
}
