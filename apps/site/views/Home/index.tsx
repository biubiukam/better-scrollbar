import React from "react"
import { getHomeCopy } from "../../i18n/home"
import { ApiSection } from "./components/ApiSection"
import { CasesSection } from "./components/CasesSection"
import { DemosSection } from "./components/DemosSection"
import { Footer } from "./components/Footer"
import { Header } from "./components/Header"
import { Hero } from "./components/Hero"
import { PlaygroundSection } from "./components/PlaygroundSection"
import type { HomeViewProps } from "./types"

function Home({ theme, locale, onThemeChange, onLocaleChange }: HomeViewProps) {
	const copy = getHomeCopy(locale)

	return (
		<main className="min-h-screen bg-background text-foreground">
			<Header
				copy={copy}
				theme={theme}
				locale={locale}
				onThemeChange={onThemeChange}
				onLocaleChange={onLocaleChange}
			/>
			<Hero copy={copy} />
			<CasesSection copy={copy} />
			<PlaygroundSection copy={copy} />
			<DemosSection copy={copy} />
			<ApiSection copy={copy} locale={locale} />
			<Footer copy={copy} />
		</main>
	)
}

export default Home
