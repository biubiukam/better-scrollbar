import React from "react"
import { ChevronDown, Languages, Moon, Sun } from "lucide-react"
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

export interface HeaderProps {
	copy: HomeCopy
	theme: ThemeMode
	locale: LocaleMode
	onThemeChange: () => void
	onLocaleChange: (locale: LocaleMode) => void
}

export function Header({ copy, theme, locale, onThemeChange, onLocaleChange }: HeaderProps) {
	return (
		<header className="sticky top-0 z-50 border-b border-border/80 bg-background/88 shadow-[0_1px_0_hsl(var(--border)/0.65),0_10px_40px_hsl(var(--background)/0.52)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/76">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				<a className="flex min-w-0 items-center gap-3 text-foreground" href="#overview" aria-label={copy.homeLabel}>
					<SiteIcon />
					<span className="truncate text-sm font-semibold">better-scrollbar</span>
				</a>
				<nav className="hidden items-center gap-1 md:flex" aria-label={copy.navLabel}>
					{copy.nav.map((item, index) => (
						<a
							key={item}
							className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
							href={NAV_HREFS[index]}
						>
							{item}
						</a>
					))}
				</nav>
				<div className="flex shrink-0 items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button type="button" size="sm" variant="outline" aria-label={copy.languageLabel}>
								<Languages data-icon="inline-start" />
								<span className="hidden sm:inline">{copy.languageTrigger}</span>
								<span className="hidden font-mono text-xs sm:inline">{locale.toUpperCase()}</span>
								<ChevronDown data-icon="inline-end" />
							</Button>
						</DropdownMenuTrigger>
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
							<Button type="button" size="icon-sm" variant="outline" onClick={onThemeChange} aria-label={copy.themeLabel}>
								{theme === "dark" ? <Sun data-icon="inline-start" /> : <Moon data-icon="inline-start" />}
							</Button>
						</TooltipTrigger>
						<TooltipContent>{theme === "dark" ? copy.themeToLight : copy.themeToDark}</TooltipContent>
					</Tooltip>
					<Button className="hidden sm:inline-flex" variant="outline" size="sm" asChild>
						<a href="https://github.com/kampiu/better-scrollbar" aria-label={copy.githubLabel}>
							<GithubIcon />
							{copy.githubText}
						</a>
					</Button>
					<Button className="sm:hidden" variant="outline" size="icon-sm" asChild>
						<a href="https://github.com/kampiu/better-scrollbar" aria-label={copy.githubLabel}>
							<GithubIcon />
						</a>
					</Button>
				</div>
			</div>
		</header>
	)
}
