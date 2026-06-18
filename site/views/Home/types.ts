import type { LocaleMode } from "../../i18n/home"

export type ThemeMode = "light" | "dark"

export interface HomeViewProps {
	theme: ThemeMode
	locale: LocaleMode
	onThemeChange: () => void
	onLocaleChange: (locale: LocaleMode) => void
}
