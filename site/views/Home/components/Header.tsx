import React, { useEffect, useState } from "react"
import { Moon } from "lucide-react"
import type { HomeCopy, LocaleMode } from "../../../i18n/home"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { NAV_HREFS } from "../data"
import type { ThemeMode } from "../types"
import GithubIcon from "./GithubIcon"
import { SiteIcon } from "./SiteIcon"

const navIconButtonClass = "text-muted-foreground hover:bg-muted hover:text-foreground"
const navIconClass = "size-[18px]"
const headerBaseClass = "sticky top-0 z-50 shadow-none transition-colors duration-200"
const headerTransparentClass = "bg-transparent backdrop-blur-none"
const headerGlassClass = "bg-background/60 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/50"

function getHasScrolled() {
	if (typeof window === "undefined") {
		return false
	}

	return window.scrollY > 0
}

function LanguageIcon() {
	return (
		<svg className={navIconClass} aria-hidden="true" focusable="false" width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M12.87 15.07 10.33 12.56l.03-.03A18.45 18.45 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17A16.28 16.28 0 0 1 9 11.35 16.2 16.2 0 0 1 6.69 8h-2a18.1 18.1 0 0 0 3 4.56L2.6 17.58 4 19l5-5 3.11 3.11.76-2.04ZM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12Zm-2.62 7 1.62-4.33L19.12 17h-3.24Z"
				fill="currentColor"
			/>
		</svg>
	)
}

function ThemeSunIcon() {
	return (
		<svg className={navIconClass} aria-hidden="true" focusable="false" width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM11 1h2v3h-2V1Zm0 19h2v3h-2v-3Zm9-9h3v2h-3v-2ZM1 11h3v2H1v-2Zm17.3-4.7-1.4-1.4L19 2.8l1.4 1.4-2.1 2.1ZM4.2 20.4 2.8 19l2.1-2.1 1.4 1.4-2.1 2.1Zm14.8 0-2.1-2.1 1.4-1.4 2.1 2.1-1.4 1.4ZM4.9 6.3 2.8 4.2l1.4-1.4 2.1 2.1-1.4 1.4Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export interface HeaderProps {
	copy: HomeCopy
	theme: ThemeMode
	locale: LocaleMode
	onThemeChange: () => void
	onLocaleChange: (locale: LocaleMode) => void
}

export function Header({ copy, theme, locale, onThemeChange, onLocaleChange }: HeaderProps) {
	const [hasScrolled, setHasScrolled] = useState(getHasScrolled)

	useEffect(() => {
		let frameId = 0

		const updateScrolledState = () => {
			frameId = 0
			const nextHasScrolled = getHasScrolled()
			setHasScrolled((currentHasScrolled) => currentHasScrolled === nextHasScrolled ? currentHasScrolled : nextHasScrolled)
		}

		const handleScroll = () => {
			if (frameId === 0) {
				frameId = window.requestAnimationFrame(updateScrolledState)
			}
		}

		updateScrolledState()
		window.addEventListener("scroll", handleScroll, { passive: true })

		return () => {
			if (frameId !== 0) {
				window.cancelAnimationFrame(frameId)
			}
			window.removeEventListener("scroll", handleScroll)
		}
	}, [])

	return (
		<header className={`${headerBaseClass} ${hasScrolled ? headerGlassClass : headerTransparentClass}`}>
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				<a className="flex min-w-0 items-center gap-3 text-foreground" href="#overview" aria-label={copy.homeLabel}>
					<SiteIcon />
					<span className="truncate text-sm font-semibold">better-scrollbar</span>
				</a>
				<nav className="hidden items-center gap-1 md:flex" aria-label={copy.navLabel}>
					{copy.nav.map((item, index) => (
						<a
							key={item}
							className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							href={NAV_HREFS[index]}
						>
							{item}
						</a>
					))}
				</nav>
				<div className="flex shrink-0 items-center gap-2">
					<DropdownMenu>
						<Tooltip>
							<TooltipTrigger asChild>
								<DropdownMenuTrigger asChild>
									<Button type="button" size="icon-sm" variant="ghost" className={navIconButtonClass} aria-label={`${copy.languageLabel}: ${locale.toUpperCase()}`}>
										<LanguageIcon />
									</Button>
								</DropdownMenuTrigger>
							</TooltipTrigger>
							<TooltipContent>{copy.languageLabel}</TooltipContent>
						</Tooltip>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>{copy.languageMenuLabel}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuRadioGroup
								value={locale}
								onValueChange={(nextLocale: string) => {
									if (nextLocale === "en" || nextLocale === "zh") {
										onLocaleChange(nextLocale)
									}
								}}
							>
								<DropdownMenuRadioItem value="en">{copy.languageOptions.en}</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="zh">{copy.languageOptions.zh}</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button type="button" size="icon-sm" variant="ghost" className={navIconButtonClass} onClick={onThemeChange} aria-label={copy.themeLabel}>
								{theme === "dark" ? <ThemeSunIcon /> : <Moon className={navIconClass} fill="currentColor" stroke="none" />}
							</Button>
						</TooltipTrigger>
						<TooltipContent>{theme === "dark" ? copy.themeToLight : copy.themeToDark}</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="ghost" size="icon-sm" className={navIconButtonClass} asChild>
								<a href="https://github.com/kampiu/better-scrollbar" aria-label={copy.githubLabel}>
									<GithubIcon className={navIconClass} />
								</a>
							</Button>
						</TooltipTrigger>
						<TooltipContent>{copy.githubText}</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</header>
	)
}
