import React from "react"
import { ArrowRight, ChevronDown } from "lucide-react"
import type { HomeCopy } from "../../../i18n/home"
import { Button } from "@/components/ui/button"
import GithubIcon from "./GithubIcon"
import { LiveConsole } from "./LiveConsole"

export function Hero({ copy }: { copy: HomeCopy }) {
	return (
		<section id="overview" className="relative scroll-mt-16">
			<div className="absolute inset-x-0 -top-16 bottom-0 bg-[linear-gradient(120deg,hsl(var(--primary)/0.13),transparent_34%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.32)_65%,hsl(var(--background)))]" />
			<div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.28)_1px,transparent_1px)] bg-[size:54px_54px] opacity-30" />
			<div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.82fr_1fr] lg:px-8 lg:py-20">
				<div className="flex min-w-0 flex-col gap-8">
					<div className="flex flex-col gap-6">
						<h1 className="max-w-3xl text-4xl font-semibold leading-[1.04] text-foreground sm:text-5xl lg:text-6xl">
							{copy.heroTitle}
						</h1>
						<p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
							{copy.heroDesc}
						</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<Button size="lg" asChild>
							<a href="#demos">
								{copy.primaryCta}
								<ArrowRight data-icon="inline-end" />
							</a>
						</Button>
						<Button variant="outline" size="lg" asChild>
							<a href="https://github.com/kampiu/better-scrollbar">
								<GithubIcon />
								{copy.secondaryCta}
							</a>
						</Button>
					</div>
				</div>
				<div className="min-w-0 lg:row-span-2">
					<LiveConsole copy={copy} />
				</div>
				<div className="grid gap-3 sm:grid-cols-2 lg:col-start-1 lg:row-start-2">
					{copy.proof.map((item) => (
						<div
							key={item.label}
							className="rounded-lg border border-border/75 bg-card/62 p-4 shadow-site-line backdrop-blur"
						>
							<div className="text-xs font-medium text-muted-foreground">
								{item.label}
							</div>
							<div className="mt-2 text-2xl font-semibold text-foreground">
								{item.value}
							</div>
							<div className="mt-1 text-xs text-muted-foreground">{item.detail}</div>
						</div>
					))}
				</div>
				<a
					className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-md border border-border bg-card/80 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground md:flex"
					href="#cases"
				>
					{copy.nav[1]}
					<ChevronDown className="size-3.5" />
				</a>
			</div>
		</section>
	)
}
