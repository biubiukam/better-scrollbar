import React from "react"
import type { HomeCopy } from "../../../i18n/home"
import OptimizationCases from "../../../components/OptimizationCases/OptimizationCases"
import { SectionIntro } from "./SectionIntro"

export function CasesSection({ copy }: { copy: HomeCopy }) {
	return (
		<section
			id="cases"
			className="scroll-mt-16 border-t border-border/70 bg-background py-16 sm:py-20"
		>
			<SectionIntro title={copy.casesTitle} desc={copy.casesDesc} />
			<div className="mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<OptimizationCases copy={copy.examples} />
			</div>
		</section>
	)
}
