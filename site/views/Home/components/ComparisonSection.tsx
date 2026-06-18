import React from "react"
import type { HomeCopy, SupportLevel } from "../../../i18n/home"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
	COMPARISON_ADVANTAGES,
	COMPARISON_CRITERIA,
	COMPARISON_LIBRARIES,
	COMPARISON_SOURCES,
} from "../data"

function getSupportVariant(level: SupportLevel): "default" | "outline" | "success" | "warning" {
	if (level === "full") {
		return "success"
	}
	if (level === "documented") {
		return "default"
	}
	if (level === "partial") {
		return "warning"
	}
	return "outline"
}

export function ComparisonSection({ copy }: { copy: HomeCopy }) {
	const maxBundleGzip = Math.max(...COMPARISON_LIBRARIES.map((library) => library.bundleGzipKb))

	return (
		<section
			id="comparison"
			className="scroll-mt-16 border-t border-border/70 bg-secondary/18 py-16 sm:py-20"
			aria-labelledby="comparison-heading"
		>
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div className="min-w-0">
						<h2 id="comparison-heading" className="max-w-3xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
							{copy.comparisonTitle}
						</h2>
						<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{copy.comparisonDesc}</p>
					</div>
					<div className="flex shrink-0 flex-wrap items-center gap-2">
						<Badge variant="outline">{copy.comparisonBenchmarkNote}</Badge>
						<Badge variant="secondary">{copy.comparisonHeaders.weight}: 100%</Badge>
					</div>
				</div>
				<p className="max-w-4xl rounded-md border border-border bg-card/66 px-4 py-3 text-xs leading-5 text-muted-foreground">
					{copy.comparisonMethod}
				</p>
			</div>

			<div className="mx-auto mt-8 grid w-full max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
				<div className="rounded-lg border border-border bg-card/78 p-5 shadow-site-line">
					<div className="mb-5 flex items-center justify-between gap-3">
						<h3 className="text-base font-semibold text-card-foreground">{copy.comparisonChartLabel}</h3>
						<span className="text-xs text-muted-foreground">0-100</span>
					</div>
					<div className="space-y-4" role="img" aria-label={copy.comparisonChartLabel}>
						{COMPARISON_LIBRARIES.map((library) => {
							const libraryCopy = copy.comparisonLibraries[library.id]

							return (
								<div key={library.id} className="grid gap-2 sm:grid-cols-[156px_minmax(0,1fr)_48px] sm:items-center">
									<div className="min-w-0">
										<div className="truncate text-sm font-semibold text-card-foreground">{library.name}</div>
										<div className="mt-0.5 truncate text-xs text-muted-foreground">{libraryCopy.source}</div>
									</div>
									<div className="h-3 overflow-hidden rounded-full bg-muted">
										<div
											className={cn("h-full rounded-full", library.barClassName)}
											style={{ width: `${library.score}%` }}
										/>
									</div>
									<div className="font-mono text-sm font-semibold text-foreground sm:text-right">{library.score}</div>
								</div>
							)
						})}
					</div>
				</div>

				<div className="rounded-lg border border-border bg-card/78 p-5 shadow-site-line">
					<div className="mb-5 flex items-center justify-between gap-3">
						<h3 className="text-base font-semibold text-card-foreground">{copy.comparisonBundleLabel}</h3>
						<span className="text-xs text-muted-foreground">gzip</span>
					</div>
					<div className="space-y-4" role="img" aria-label={copy.comparisonBundleLabel}>
						{COMPARISON_LIBRARIES.map((library) => {
							const libraryCopy = copy.comparisonLibraries[library.id]

							return (
								<div key={library.id} className="grid gap-2 sm:grid-cols-[156px_minmax(0,1fr)_112px] sm:items-center">
									<div className="min-w-0">
										<div className="truncate text-sm font-semibold text-card-foreground">{library.name}</div>
										<div className="mt-0.5 truncate text-xs text-muted-foreground">{libraryCopy.source}</div>
									</div>
									<div className="h-3 overflow-hidden rounded-full bg-muted">
										<div
											className={cn("h-full rounded-full", library.barClassName)}
											style={{ width: `${Math.max(8, Math.round((library.bundleGzipKb / maxBundleGzip) * 100))}%` }}
										/>
									</div>
									<div className="font-mono text-xs font-semibold text-foreground sm:text-right">{libraryCopy.bundleLabel}</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>

			<div className="mx-auto mt-6 grid w-full max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
				<div className="rounded-lg border border-border bg-card/78 p-5 shadow-site-line lg:col-span-3">
					<h3 className="text-base font-semibold text-card-foreground">{copy.comparisonAdvantageTitle}</h3>
					<div className="mt-4 grid gap-4 lg:grid-cols-3">
						{COMPARISON_ADVANTAGES.map((advantage) => {
							const Icon = advantage.icon
							const advantageCopy = copy.comparisonAdvantages[advantage.id]

							return (
								<div key={advantage.id} className="rounded-md border border-border bg-background/56 p-4">
									<div className="flex items-start gap-3">
										<div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
											<Icon className="size-5" />
										</div>
										<div className="min-w-0">
											<div className="text-sm font-semibold leading-5 text-foreground">{advantageCopy.title}</div>
											<p className="mt-2 text-xs leading-5 text-muted-foreground">{advantageCopy.desc}</p>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>

			<div className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="overflow-hidden rounded-lg border border-border bg-card/78 shadow-site-line">
					<div className="border-b border-border px-5 py-4">
						<h3 className="text-base font-semibold text-card-foreground">{copy.comparisonMatrixTitle}</h3>
					</div>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="bg-secondary/52 hover:bg-secondary/52">
									<TableHead className="min-w-[220px] text-foreground">{copy.comparisonHeaders.criterion}</TableHead>
									<TableHead className="min-w-[96px] text-foreground">{copy.comparisonHeaders.weight}</TableHead>
									{COMPARISON_LIBRARIES.map((library) => (
										<TableHead key={library.id} className="min-w-[150px] text-foreground">{library.name}</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{COMPARISON_CRITERIA.map((criterion) => (
									<TableRow key={criterion.id}>
										<TableCell className="font-medium text-foreground">{copy.comparisonCriteria[criterion.id].label}</TableCell>
										<TableCell className="font-mono text-sm text-muted-foreground">{criterion.weight}</TableCell>
										{COMPARISON_LIBRARIES.map((library) => {
											const support = criterion.support[library.id]

											return (
												<TableCell key={library.id}>
													<Badge variant={getSupportVariant(support)}>{copy.comparisonSupportLabels[support]}</Badge>
												</TableCell>
											)
										})}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			</div>

			<div className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="rounded-lg border border-border bg-card/78 p-5 shadow-site-line">
					<h3 className="text-base font-semibold text-card-foreground">{copy.comparisonSourceTitle}</h3>
					<div className="mt-4 grid gap-3 lg:grid-cols-2">
						{COMPARISON_SOURCES.map((source) => (
							<a
								key={source.id}
								className="rounded-md border border-border bg-background/56 p-4 text-sm transition-colors hover:border-primary/45 hover:bg-primary/10"
								href={source.href}
							>
								<span className="font-semibold text-foreground">{source.label}</span>
								<span className="mt-2 block text-xs leading-5 text-muted-foreground">{copy.comparisonSources[source.id].detail}</span>
							</a>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
