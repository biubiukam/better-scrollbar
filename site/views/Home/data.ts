import React from "react"
import { Activity, Boxes, Gauge, Layers3, PanelTop, Sparkles, Zap } from "lucide-react"
import Shadow from "../../examplex/Shadow"
import RandomHeight from "../../examplex/RandomHeight"
import DragAndDrop from "../../examplex/DragAndDrop"
import CustomStyles from "../../examplex/CustomStyles"
import MillionRows from "../../examplex/MillionRows"
import type {
	ComparisonAdvantageId,
	ComparisonCriterionId,
	ComparisonLibraryId,
	ComparisonSourceId,
	DemoId,
	SupportLevel,
} from "../../i18n/home"

export interface DemoMeta {
	id: DemoId
	tone: "primary" | "accent" | "success" | "warning" | "secondary"
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
	component: React.ComponentType
}

export interface ComparisonLibrary {
	id: ComparisonLibraryId
	name: string
	score: number
	bundleGzipKb: number
	barClassName: string
}

export interface ComparisonCriterion {
	id: ComparisonCriterionId
	weight: string
	support: Record<ComparisonLibraryId, SupportLevel>
}

export interface ComparisonSource {
	id: ComparisonSourceId
	label: string
	href: string
}

export const NAV_HREFS = ["#overview", "#cases", "#comparison", "#playground", "#demos", "#api"]

export const DEMOS: DemoMeta[] = [
	{ id: "dynamic", tone: "primary", icon: Activity, component: RandomHeight },
	{ id: "shadow", tone: "accent", icon: PanelTop, component: Shadow },
	{ id: "drag", tone: "warning", icon: Layers3, component: DragAndDrop },
	{ id: "custom", tone: "success", icon: Sparkles, component: CustomStyles },
	{ id: "million", tone: "secondary", icon: Boxes, component: MillionRows },
]

export const COMPARISON_ADVANTAGES: Array<{
	id: ComparisonAdvantageId
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}> = [
	{ id: "indexedScale", icon: Boxes },
	{ id: "boundedHeights", icon: Gauge },
	{ id: "productScrollUx", icon: Zap },
]

export const CONSOLE_ROW_META = [
	{ index: "98,238,102", width: "76%", tone: "primary" },
	{ index: "98,238,103", width: "54%", tone: "muted" },
	{ index: "98,238,104", width: "68%", tone: "success" },
	{ index: "98,238,105", width: "48%", tone: "warning" },
	{ index: "98,238,106", width: "72%", tone: "muted" },
	{ index: "98,238,107", width: "60%", tone: "accent" },
] as const

export const COMPARISON_LIBRARIES: ComparisonLibrary[] = [
	{
		id: "better-scrollbar",
		name: "better-scrollbar",
		score: 96,
		bundleGzipKb: 11.2,
		barClassName: "bg-primary",
	},
	{
		id: "virtuoso",
		name: "React Virtuoso",
		score: 82,
		bundleGzipKb: 18.6,
		barClassName: "bg-success",
	},
	{
		id: "tanstack",
		name: "TanStack Virtual",
		score: 78,
		bundleGzipKb: 7.2,
		barClassName: "bg-accent",
	},
	{
		id: "react-virtualized",
		name: "react-virtualized",
		score: 58,
		bundleGzipKb: 27.2,
		barClassName: "bg-warning",
	},
	{
		id: "react-window",
		name: "react-window",
		score: 48,
		bundleGzipKb: 6.5,
		barClassName: "bg-muted-foreground",
	},
]

export const COMPARISON_CRITERIA: ComparisonCriterion[] = [
	{
		id: "massiveRange",
		weight: "20%",
		support: {
			"better-scrollbar": "full",
			tanstack: "app",
			virtuoso: "app",
			"react-window": "app",
			"react-virtualized": "app",
		},
	},
	{
		id: "dynamicMeasurement",
		weight: "20%",
		support: {
			"better-scrollbar": "full",
			tanstack: "documented",
			virtuoso: "documented",
			"react-window": "partial",
			"react-virtualized": "partial",
		},
	},
	{
		id: "boundedCache",
		weight: "15%",
		support: {
			"better-scrollbar": "full",
			tanstack: "app",
			virtuoso: "app",
			"react-window": "app",
			"react-virtualized": "partial",
		},
	},
	{
		id: "anchoredMutation",
		weight: "15%",
		support: {
			"better-scrollbar": "full",
			tanstack: "app",
			virtuoso: "documented",
			"react-window": "app",
			"react-virtualized": "app",
		},
	},
	{
		id: "customScrollbar",
		weight: "15%",
		support: {
			"better-scrollbar": "full",
			tanstack: "app",
			virtuoso: "app",
			"react-window": "app",
			"react-virtualized": "app",
		},
	},
	{
		id: "stickyAccessibility",
		weight: "15%",
		support: {
			"better-scrollbar": "full",
			tanstack: "app",
			virtuoso: "documented",
			"react-window": "app",
			"react-virtualized": "partial",
		},
	},
]

export const COMPARISON_SOURCES: ComparisonSource[] = [
	{
		id: "localBuild",
		label: "Local build verification",
		href: "#api",
	},
	{
		id: "bundlephobia",
		label: "Bundlephobia API",
		href: "https://bundlephobia.com/package/react-window@2.2.7",
	},
	{
		id: "tanstackDocs",
		label: "TanStack Virtual docs",
		href: "https://tanstack.com/virtual/latest/docs/api/virtualizer",
	},
	{
		id: "virtuosoDocs",
		label: "React Virtuoso docs",
		href: "https://github.com/petyosi/react-virtuoso",
	},
	{
		id: "reactWindowGuide",
		label: "react-window guide",
		href: "https://web.dev/articles/virtualize-long-lists-react-window",
	},
	{
		id: "reactVirtualizedCellMeasurer",
		label: "react-virtualized CellMeasurer",
		href: "https://github.com/bvaughn/react-virtualized/blob/master/docs/CellMeasurer.md",
	},
]
