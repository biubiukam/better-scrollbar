import React, { useMemo, useState } from "react"
import type { DemoId, HomeCopy } from "../../../i18n/home"
import Container from "../../../components/Container"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DEMOS } from "../data"
import { DemoButton } from "./DemoButton"
import { SectionIntro } from "./SectionIntro"

export function DemosSection({ copy }: { copy: HomeCopy }) {
	const [activeDemoId, setActiveDemoId] = useState<DemoId>(DEMOS[0].id)
	const activeDemo = useMemo(
		() => DEMOS.find((demo) => demo.id === activeDemoId) ?? DEMOS[0],
		[activeDemoId]
	)
	const ActiveDemo = activeDemo.component

	return (
		<section
			id="demos"
			className="scroll-mt-16 border-t border-border/70 bg-background py-16 sm:py-20"
		>
			<SectionIntro title={copy.demosTitle} desc={copy.demosDesc} />
			<div className="mx-auto mt-8 grid w-full max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
				<aside className="min-w-0">
					<div className="mb-3 flex items-center justify-between gap-3">
						<div className="text-sm font-semibold text-foreground">
							{copy.demoSelectLabel}
						</div>
						<ToggleGroup
							type="single"
							value={activeDemoId}
							onValueChange={(nextDemo: string) => {
								if (DEMOS.some((demo) => demo.id === nextDemo)) {
									setActiveDemoId(nextDemo as DemoId)
								}
							}}
							className="hidden"
							aria-label={copy.demoSelectLabel}
						>
							{DEMOS.map((demo) => (
								<ToggleGroupItem key={demo.id} value={demo.id}>
									{copy.demos[demo.id].title}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</div>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
						{DEMOS.map((demo) => (
							<DemoButton
								key={demo.id}
								demo={demo}
								active={demo.id === activeDemo.id}
								copy={copy.demos[demo.id]}
								onClick={() => setActiveDemoId(demo.id)}
							/>
						))}
					</div>
				</aside>
				<Container className="min-w-0" flow>
					<ActiveDemo copy={copy.examples} />
				</Container>
			</div>
		</section>
	)
}
