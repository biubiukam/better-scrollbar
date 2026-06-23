import React from "react"
import type { HomeCopy } from "../../../i18n/home"
import Container from "../../../components/Container"
import ScenarioPlayground from "../../../components/ScenarioPlayground"
import { SectionIntro } from "./SectionIntro"

export function PlaygroundSection({ copy }: { copy: HomeCopy }) {
	return (
		<section
			id="playground"
			className="scroll-mt-16 border-t border-border/70 bg-secondary/18 py-16 sm:py-20"
		>
			<SectionIntro title={copy.playgroundTitle} desc={copy.playgroundDesc} />
			<div className="mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<Container className="min-w-0" flow>
					<ScenarioPlayground copy={copy.examples} />
				</Container>
			</div>
		</section>
	)
}
