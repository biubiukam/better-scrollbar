import React, { useEffect, useState } from "react"
import DemoA from "./views/DemoA"
import styles from "./App.module.less"
import "../src/styles/index.less"

type ThemeMode = "light" | "dark"
const THEME_STORAGE_KEY = "better-scrollbar-theme"

function getInitialTheme(): ThemeMode {
	if (typeof window === "undefined") {
		return "light"
	}

	const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
	if (savedTheme === "light" || savedTheme === "dark") {
		return savedTheme
	}

	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function App() {
	const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

	useEffect(() => {
		document.documentElement.dataset.theme = theme
		window.localStorage.setItem(THEME_STORAGE_KEY, theme)
	}, [theme])

	const toggleTheme = () => {
		setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark")
	}

	return (
		<div className={ styles.layout }>
			<DemoA theme={ theme } onThemeChange={ toggleTheme }/>
		</div>
	)
}

export default App
