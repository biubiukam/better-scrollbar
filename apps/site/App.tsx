import React, { useEffect, useState } from "react"
import Home from "./views/Home"
import { TooltipProvider } from "@/components/ui/tooltip"
import "@better-scrollbar/react/styles/ScrollBar.less"

type ThemeMode = "light" | "dark"
type LocaleMode = "en" | "zh"

const THEME_STORAGE_KEY = "better-scrollbar-theme"
const LOCALE_STORAGE_KEY = "better-scrollbar-locale"

function getInitialTheme(): ThemeMode {
	if (typeof window === "undefined") {
		return "dark"
	}

	const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
	if (savedTheme === "light" || savedTheme === "dark") {
		return savedTheme
	}

	return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

function getInitialLocale(): LocaleMode {
	if (typeof window === "undefined") {
		return "en"
	}

	const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
	if (savedLocale === "en" || savedLocale === "zh") {
		return savedLocale
	}

	return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en"
}

function App() {
	const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
	const [locale, setLocale] = useState<LocaleMode>(getInitialLocale)

	useEffect(() => {
		document.documentElement.dataset.theme = theme
		document.documentElement.classList.toggle("dark", theme === "dark")
		window.localStorage.setItem(THEME_STORAGE_KEY, theme)
	}, [theme])

	useEffect(() => {
		document.documentElement.lang = locale === "zh" ? "zh-CN" : "en"
		window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
	}, [locale])

	const toggleTheme = () => {
		setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))
	}

	return (
		<TooltipProvider>
			<div className="min-h-screen bg-background text-foreground">
				<Home
					theme={theme}
					locale={locale}
					onThemeChange={toggleTheme}
					onLocaleChange={setLocale}
				/>
			</div>
		</TooltipProvider>
	)
}

export default App
