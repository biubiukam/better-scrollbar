import React, { useMemo, useState } from "react"
import {
	Activity,
	ArrowRight,
	Boxes,
	CheckCircle2,
	ChevronDown,
	Gauge,
	Languages,
	Layers3,
	Moon,
	PanelTop,
	Sparkles,
	Sun,
	Zap,
} from "lucide-react"
import Shadow from "../../examplex/Shadow"
import RandomHeight from "../../examplex/RandomHeight"
import DragAndDrop from "../../examplex/DragAndDrop"
import CustomStyles from "../../examplex/CustomStyles"
import MillionRows from "../../examplex/MillionRows"
import OptimizationCases from "../../examplex/OptimizationCases/OptimizationCases"
import ScenarioPlayground from "../../examplex/ScenarioPlayground"
import Container from "../../components/Container"
import GithubIcon from "./Github"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type ThemeMode = "light" | "dark"
type LocaleMode = "en" | "zh"
type DemoId = "dynamic" | "shadow" | "drag" | "custom" | "million"
type PropRow = {
	name: string
	description: string
	type: string
	defaultValue: string
}

interface IndexProps {
	theme: ThemeMode
	locale: LocaleMode
	onThemeChange: () => void
	onLocaleChange: (locale: LocaleMode) => void
}

interface DemoMeta {
	id: DemoId
	tone: "primary" | "accent" | "success" | "warning" | "secondary"
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
	component: React.ComponentType
}

const DEMOS: DemoMeta[] = [
	{id: "dynamic", tone: "primary", icon: Activity, component: RandomHeight},
	{id: "shadow", tone: "accent", icon: PanelTop, component: Shadow},
	{id: "drag", tone: "warning", icon: Layers3, component: DragAndDrop},
	{id: "custom", tone: "success", icon: Sparkles, component: CustomStyles},
	{id: "million", tone: "secondary", icon: Boxes, component: MillionRows},
]

const CONSOLE_ROW_META = [
	{index: "48,238,102", width: "76%", tone: "primary"},
	{index: "48,238,103", width: "54%", tone: "muted"},
	{index: "48,238,104", width: "68%", tone: "success"},
	{index: "48,238,105", width: "48%", tone: "warning"},
	{index: "48,238,106", width: "72%", tone: "muted"},
	{index: "48,238,107", width: "60%", tone: "accent"},
]

const API_PROPS: Record<LocaleMode, PropRow[]> = {
	en: [
		{name: "width", description: "Scroll viewport width.", type: "number", defaultValue: "-"},
		{name: "height", description: "Scroll viewport height.", type: "number", defaultValue: "-"},
		{name: "style", description: "Inline style for the outer container.", type: "CSSProperties", defaultValue: "-"},
		{name: "className", description: "Class name for the outer container.", type: "string", defaultValue: "-"},
		{name: "isVirtual", description: "Enable virtual rendering.", type: "boolean", defaultValue: "true"},
		{name: "itemCount", description: "Total indexed item count. Use this for huge lists without building a children array.", type: "number", defaultValue: "children.length"},
		{name: "renderItem", description: "Lazy renderer used with itemCount.", type: "(index: number) => ReactElement", defaultValue: "-"},
		{name: "itemKey", description: "Stable key generator for indexed items.", type: "(index: number) => Key", defaultValue: "index"},
		{name: "itemHeight", description: "Default row height.", type: "number", defaultValue: "20"},
		{name: "estimatedItemHeight", description: "Estimated height for unmeasured rows. Overrides itemHeight for virtual range estimation.", type: "number", defaultValue: "itemHeight"},
		{name: "heightCacheLimit", description: "Maximum measured row heights retained in memory.", type: "number", defaultValue: "-"},
		{name: "overscan", description: "Extra item count rendered outside the visible range.", type: "number", defaultValue: "1"},
		{name: "overscanPixels", description: "Extra pixel range rendered before and after the viewport.", type: "number | { before: number; after: number }", defaultValue: "-"},
		{name: "adaptiveOverscan", description: "Expand overscan dynamically by scroll direction and speed.", type: "boolean | AdaptiveOverscanOptions", defaultValue: "false"},
		{name: "maxRenderedItems", description: "Maximum rendered items in virtual mode. The real visible range is never clipped.", type: "number", defaultValue: "500"},
		{name: "scrollSeek", description: "Render lightweight placeholders while scrolling fast.", type: "boolean | ScrollSeekOptions", defaultValue: "false"},
		{name: "scrollMode", description: "Wheel input strategy. Native uses the browser scroll pipeline when possible.", type: "\"controlled\" | \"native\"", defaultValue: "\"controlled\""},
		{name: "maintainVisibleContentPosition", description: "Keep the current visible item anchored when data or measurements change.", type: "boolean", defaultValue: "true"},
		{name: "followOutput", description: "Stay pinned to the bottom when data is appended and the viewport is already near the end.", type: "boolean", defaultValue: "false"},
		{name: "followOutputThreshold", description: "Pixel threshold used to decide whether the viewport is already at the bottom.", type: "number", defaultValue: "1"},
		{name: "preserveItemState", description: "Preserve React state in children mode by keeping all children mounted and hiding non-visible items.", type: "boolean", defaultValue: "false"},
		{name: "stickyIndices", description: "Always-sticky item indexes, commonly used for group headers.", type: "number[]", defaultValue: "-"},
		{name: "groupCounts", description: "GroupedVirtuoso-style group sizes used to infer sticky group header indexes.", type: "number[]", defaultValue: "-"},
		{name: "accessibility", description: "ARIA semantics and row metadata for list/grid/table scenarios.", type: "boolean | VirtualAccessibilityOptions", defaultValue: "false"},
		{name: "maxBrowserScrollHeight", description: "Maximum physical browser scroll height used to map massive logical ranges.", type: "number", defaultValue: "10,000,000"},
		{name: "onScroll", description: "Fires with the full scroll state when scrolling changes.", type: "(scrollState: ScrollState) => void", defaultValue: "-"},
		{name: "onScrollStart", description: "Fires when scrolling starts.", type: "() => void", defaultValue: "-"},
		{name: "onScrollEnd", description: "Fires when scrolling ends.", type: "() => void", defaultValue: "-"},
		{name: "onItemsRendered", description: "Fires when the rendered and visible item ranges change.", type: "(info: ItemsRenderedInfo) => void", defaultValue: "-"},
		{name: "prefixCls", description: "CSS class prefix.", type: "string", defaultValue: "\"scroll-bar\""},
		{name: "scrollBarSize", description: "Scrollbar thickness.", type: "number", defaultValue: "6"},
		{name: "scrollBarHidden", description: "Hide custom scrollbars.", type: "boolean", defaultValue: "false"},
		{name: "scrollBarAutoHideTimeout", description: "Delay before auto-hiding the scrollbar.", type: "number", defaultValue: "1000"},
		{name: "renderView", description: "Custom render function for the scroll view.", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderViewDefault"},
		{name: "renderTrackHorizontal", description: "Custom render function for the horizontal track.", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderTrackHorizontalDefault"},
		{name: "renderTrackVertical", description: "Custom render function for the vertical track.", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderTrackVerticalDefault"},
		{name: "renderThumbHorizontal", description: "Custom render function for the horizontal thumb.", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderThumbHorizontalDefault"},
		{name: "renderThumbVertical", description: "Custom render function for the vertical thumb.", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderThumbVerticalDefault"},
	],
	zh: [
		{name: "width", description: "滚动视区宽度。", type: "number", defaultValue: "-"},
		{name: "height", description: "滚动视区高度。", type: "number", defaultValue: "-"},
		{name: "style", description: "外层容器内联样式。", type: "CSSProperties", defaultValue: "-"},
		{name: "className", description: "外层容器 className。", type: "string", defaultValue: "-"},
		{name: "isVirtual", description: "是否启用虚拟渲染。", type: "boolean", defaultValue: "true"},
		{name: "itemCount", description: "按索引渲染的数据总数，适合超大列表避免创建完整 children 数组。", type: "number", defaultValue: "children.length"},
		{name: "renderItem", description: "与 itemCount 配合使用的惰性渲染函数。", type: "(index: number) => ReactElement", defaultValue: "-"},
		{name: "itemKey", description: "按索引生成稳定 key。", type: "(index: number) => Key", defaultValue: "index"},
		{name: "itemHeight", description: "单条数据默认高度。", type: "number", defaultValue: "20"},
		{name: "estimatedItemHeight", description: "未测量行的预估高度；用于虚拟区间估算，优先级高于 itemHeight。", type: "number", defaultValue: "itemHeight"},
		{name: "heightCacheLimit", description: "最多保留的已测量行高数量，用于限制超大列表内存。", type: "number", defaultValue: "-"},
		{name: "overscan", description: "可视区外额外渲染的条目数量。", type: "number", defaultValue: "1"},
		{name: "overscanPixels", description: "可视区前后按像素额外渲染的范围。", type: "number | { before: number; after: number }", defaultValue: "-"},
		{name: "adaptiveOverscan", description: "根据滚动方向、距离和速度动态扩大 overscan。", type: "boolean | AdaptiveOverscanOptions", defaultValue: "false"},
		{name: "maxRenderedItems", description: "虚拟模式下最多渲染的条目数量；不会裁掉真实可视区。", type: "number", defaultValue: "500"},
		{name: "scrollSeek", description: "高速滚动时使用轻量占位项，降低重行渲染成本。", type: "boolean | ScrollSeekOptions", defaultValue: "false"},
		{name: "scrollMode", description: "wheel 输入策略；native 在可行时使用浏览器原生滚动管线。", type: "\"controlled\" | \"native\"", defaultValue: "\"controlled\""},
		{name: "maintainVisibleContentPosition", description: "数据或测量变化时保持当前可见条目锚定。", type: "boolean", defaultValue: "true"},
		{name: "followOutput", description: "已在底部附近时，追加数据后继续贴住底部。", type: "boolean", defaultValue: "false"},
		{name: "followOutputThreshold", description: "判断“已在底部”的像素阈值。", type: "number", defaultValue: "1"},
		{name: "preserveItemState", description: "children 模式下保留 React 行状态；会挂载全部 children 并隐藏非可视项。", type: "boolean", defaultValue: "false"},
		{name: "stickyIndices", description: "始终吸顶的条目索引，常用于分组头。", type: "number[]", defaultValue: "-"},
		{name: "groupCounts", description: "GroupedVirtuoso 风格的每组数量，用于推导分组头吸顶索引。", type: "number[]", defaultValue: "-"},
		{name: "accessibility", description: "列表、网格、表格场景的 ARIA 语义和行信息。", type: "boolean | VirtualAccessibilityOptions", defaultValue: "false"},
		{name: "maxBrowserScrollHeight", description: "用于映射超大逻辑滚动范围的浏览器物理滚动容器最大高度。", type: "number", defaultValue: "10,000,000"},
		{name: "onScroll", description: "滚动状态变化时触发。", type: "(scrollState: ScrollState) => void", defaultValue: "-"},
		{name: "onScrollStart", description: "开始滚动时触发。", type: "() => void", defaultValue: "-"},
		{name: "onScrollEnd", description: "滚动结束时触发。", type: "() => void", defaultValue: "-"},
		{name: "onItemsRendered", description: "实际渲染区间和可见区间变化时触发。", type: "(info: ItemsRenderedInfo) => void", defaultValue: "-"},
		{name: "prefixCls", description: "样式前缀。", type: "string", defaultValue: "\"scroll-bar\""},
		{name: "scrollBarSize", description: "滚动条粗细。", type: "number", defaultValue: "6"},
		{name: "scrollBarHidden", description: "是否隐藏自定义滚动条。", type: "boolean", defaultValue: "false"},
		{name: "scrollBarAutoHideTimeout", description: "滚动条自动隐藏延迟。", type: "number", defaultValue: "1000"},
		{name: "renderView", description: "自定义滚动视图渲染函数。", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderViewDefault"},
		{name: "renderTrackHorizontal", description: "自定义水平滚动轨渲染函数。", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderTrackHorizontalDefault"},
		{name: "renderTrackVertical", description: "自定义垂直滚动轨渲染函数。", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderTrackVerticalDefault"},
		{name: "renderThumbHorizontal", description: "自定义水平滚动滑块渲染函数。", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderThumbHorizontalDefault"},
		{name: "renderThumbVertical", description: "自定义垂直滚动滑块渲染函数。", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderThumbVerticalDefault"},
	],
}

const COPY = {
	en: {
		nav: ["Overview", "Cases", "Playground", "Demos", "API"],
		navLabel: "Primary navigation",
		homeLabel: "better-scrollbar home",
		heroTitle: "Virtual scrolling, engineered for impossible lists",
		heroDesc:
			"better-scrollbar turns huge React datasets into a precise, responsive scroll surface with dynamic heights, anchored updates, custom tracks and real interaction demos.",
		primaryCta: "Explore demos",
		secondaryCta: "View GitHub",
		languageLabel: "Language",
		languageMenuLabel: "Choose language",
		languageTrigger: "Language",
		languageOptions: {
			en: "English",
			zh: "Chinese",
		},
		themeLabel: "Theme",
		themeToLight: "Switch to light theme",
		themeToDark: "Switch to dark theme",
		githubText: "GitHub",
		githubLabel: "Open GitHub repository",
		licenseLabel: "MIT",
		consoleTitle: "Live virtual range",
		consoleSubtitle: "50,000,000 rows / 18 mounted nodes",
		consoleStatus: "Overscan stable",
		consoleVisible: "Visible 48,238,102 - 48,238,126",
		consoleDom: "DOM window",
		consoleOffset: "Offset Y",
		consoleVelocity: "velocity",
		consoleRows: [
			"Order stream / Tokyo",
			"Metric shard / Singapore",
			"Customer batch / Seoul",
			"Log replay / Mumbai",
			"Ledger row / Sydney",
			"Trace packet / Osaka",
		],
		proof: [
			{label: "Rows", value: "50M", detail: "stress scale"},
			{label: "Mounted DOM", value: "18-42", detail: "windowed render"},
			{label: "Height mode", value: "Dynamic", detail: "measured lazily"},
		],
		casesTitle: "Performance cases that expose real failure modes",
		casesDesc:
			"Dynamic measurement, stable anchors, recycled row state, adaptive overscan and sticky groups are shown as live cases, not screenshots.",
		caseCards: [
			{title: "Anchor-safe mutation", desc: "Insert or delete around the viewport without losing the reader's position.", icon: CheckCircle2},
			{title: "Adaptive range control", desc: "Watch visible range, rendered DOM count and scroll offset update under pressure.", icon: Gauge},
			{title: "Composable render slots", desc: "Keep scrollbars, rows and status surfaces fully customizable.", icon: Zap},
		],
		playgroundTitle: "Scenario playground",
		playgroundDesc:
			"Combine presets and props on the same 50 million row dataset. The stage below is the actual component workflow.",
		playgroundContainerTitle: "Interactive prop laboratory",
		playgroundContainerDesc:
			"Switch presets, mutate rows, jump through the list and inspect the generated props snapshot.",
		demosTitle: "Demo workstation",
		demosDesc:
			"Pick one focused demo at a time. The selected surface stays large enough to inspect scrollbar behavior and row state.",
		demoSelectLabel: "Demo selector",
		demoContainerTitle: "Active demo",
		demos: {
			dynamic: {
				title: "Dynamic height",
				desc: "Lazy row measurement for unpredictable item heights at 50 million row scale.",
			},
			shadow: {
				title: "Shadow affordance",
				desc: "Directional shadow hints reveal hidden scroll content without extra chrome.",
			},
			drag: {
				title: "Drag sorting",
				desc: "SortableJS controls only the mounted window while virtual order persists.",
			},
			custom: {
				title: "Custom styling",
				desc: "Replace the scroll container and track visuals while keeping fast updates.",
			},
			million: {
				title: "Huge list",
				desc: "A high-pressure list showing range, DOM count and quick jumps.",
			},
		},
		apiTitle: "API props",
		apiDesc:
			"An Ant Design style reference for the current VirtualScrollBar props, including parameter name, usage, type and default value.",
		apiHeaders: {
			name: "Property",
			description: "Description",
			type: "Type",
			defaultValue: "Default",
		},
		footer: "Built for React interfaces where scrolling is product infrastructure.",
	},
	zh: {
		nav: ["概览", "案例", "实验台", "Demo", "API"],
		navLabel: "主导航",
		homeLabel: "better-scrollbar 首页",
		heroTitle: "为不可能列表而生的虚拟滚动",
		heroDesc:
			"better-scrollbar 将超大 React 数据集变成精准、响应式的滚动界面，支持动态高度、锚点更新、自定义轨道和真实交互演示。",
		primaryCta: "查看 Demo",
		secondaryCta: "打开 GitHub",
		languageLabel: "语言",
		languageMenuLabel: "选择语言",
		languageTrigger: "语言",
		languageOptions: {
			en: "English",
			zh: "中文",
		},
		themeLabel: "主题",
		themeToLight: "切换浅色主题",
		themeToDark: "切换暗黑主题",
		githubText: "GitHub",
		githubLabel: "打开 GitHub 仓库",
		licenseLabel: "MIT",
		consoleTitle: "实时虚拟区间",
		consoleSubtitle: "5000 万行 / 18 个挂载节点",
		consoleStatus: "Overscan 稳定",
		consoleVisible: "可见 48,238,102 - 48,238,126",
		consoleDom: "DOM 窗口",
		consoleOffset: "Y 偏移",
		consoleVelocity: "速度",
		consoleRows: [
			"订单流 / 东京",
			"指标分片 / 新加坡",
			"客户批次 / 首尔",
			"日志回放 / 孟买",
			"账本行 / 悉尼",
			"链路包 / 大阪",
		],
		proof: [
			{label: "数据行", value: "5000万", detail: "压力规模"},
			{label: "挂载 DOM", value: "18-42", detail: "窗口渲染"},
			{label: "高度策略", value: "动态", detail: "惰性测量"},
		],
		casesTitle: "把真实失败模式暴露出来的性能案例",
		casesDesc:
			"动态测量、稳定锚点、回收状态、自适应 overscan 和吸顶分组都以可交互案例呈现，而不是静态截图。",
		caseCards: [
			{title: "锚点安全变更", desc: "在视口周围插入或删除数据时，阅读位置不丢失。", icon: CheckCircle2},
			{title: "自适应区间控制", desc: "观察可见区间、DOM 数量和滚动偏移如何在压力下更新。", icon: Gauge},
			{title: "可组合渲染插槽", desc: "滚动条、行内容和状态面板都能保持完全自定义。", icon: Zap},
		],
		playgroundTitle: "场景实验台",
		playgroundDesc:
			"在同一份 5000 万行数据上组合预设和 props，下方就是实际组件工作流。",
		playgroundContainerTitle: "交互式 props 实验室",
		playgroundContainerDesc:
			"切换预设、变更数据、快速跳转，并查看生成的 props 快照。",
		demosTitle: "Demo 工作台",
		demosDesc:
			"一次聚焦一个 demo，让被选中的界面保持足够大，便于观察滚动条行为和行状态。",
		demoSelectLabel: "Demo 选择器",
		demoContainerTitle: "当前 Demo",
		demos: {
			dynamic: {
				title: "动态高度",
				desc: "面对 5000 万行不可预测高度，按需测量并回填高度缓存。",
			},
			shadow: {
				title: "阴影提示",
				desc: "用方向阴影提示隐藏内容，不增加多余操作负担。",
			},
			drag: {
				title: "拖拽排序",
				desc: "SortableJS 只管理挂载窗口，虚拟顺序仍能持久化。",
			},
			custom: {
				title: "自定义样式",
				desc: "替换滚动容器和轨道视觉，同时保持轻量更新。",
			},
			million: {
				title: "高性能大列表",
				desc: "展示区间、DOM 数量和快速跳转的高压列表。",
			},
		},
		apiTitle: "API Props 说明",
		apiDesc:
			"参考 Ant Design 的参数表形式，按当前 VirtualScrollBar Props 汇总参数、说明、类型和默认值。",
		apiHeaders: {
			name: "参数",
			description: "说明",
			type: "类型",
			defaultValue: "默认值",
		},
		footer: "为把滚动当成产品基础设施的 React 界面而构建。",
	},
} satisfies Record<LocaleMode, {
	nav: string[]
	navLabel: string
	homeLabel: string
	heroTitle: string
	heroDesc: string
	primaryCta: string
	secondaryCta: string
	languageLabel: string
	languageMenuLabel: string
	languageTrigger: string
	languageOptions: Record<LocaleMode, string>
	themeLabel: string
	themeToLight: string
	themeToDark: string
	githubText: string
	githubLabel: string
	licenseLabel: string
	consoleTitle: string
	consoleSubtitle: string
	consoleStatus: string
	consoleVisible: string
	consoleDom: string
	consoleOffset: string
	consoleVelocity: string
	consoleRows: string[]
	proof: Array<{label: string, value: string, detail: string}>
	casesTitle: string
	casesDesc: string
	caseCards: Array<{title: string, desc: string, icon: React.ComponentType<React.SVGProps<SVGSVGElement>>}>
	playgroundTitle: string
	playgroundDesc: string
	playgroundContainerTitle: string
	playgroundContainerDesc: string
	demosTitle: string
	demosDesc: string
	demoSelectLabel: string
	demoContainerTitle: string
	demos: Record<DemoId, {title: string, desc: string}>
	apiTitle: string
	apiDesc: string
	apiHeaders: {
		name: string
		description: string
		type: string
		defaultValue: string
	}
	footer: string
}>

function SiteIcon({ className }: { className?: string }) {
	return (
		<svg
			className={ cn("size-8 shrink-0", className) }
			viewBox="0 0 32 32"
			aria-hidden="true"
			focusable="false"
		>
			<rect width="32" height="32" rx="6" fill="#2563eb"/>
			<path d="M10 8h12v3H10zm0 6h8v3h-8zm0 6h12v3H10z" fill="white"/>
		</svg>
	)
}

function Header({
	copy,
	theme,
	locale,
	onThemeChange,
	onLocaleChange,
}: {
	copy: typeof COPY[LocaleMode]
	theme: ThemeMode
	locale: LocaleMode
	onThemeChange: () => void
	onLocaleChange: (locale: LocaleMode) => void
}) {
	return (
		<header className="sticky top-0 z-50 border-b border-border/80 bg-background/88 shadow-[0_1px_0_hsl(var(--border)/0.65),0_10px_40px_hsl(var(--background)/0.52)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/76">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				<a className="flex min-w-0 items-center gap-3 text-foreground" href="#overview" aria-label={ copy.homeLabel }>
					<SiteIcon/>
					<span className="truncate text-sm font-semibold">better-scrollbar</span>
				</a>
				<nav className="hidden items-center gap-1 md:flex" aria-label={ copy.navLabel }>
					{ copy.nav.map((item, index) => (
						<a
							key={ item }
							className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
							href={ ["#overview", "#cases", "#playground", "#demos", "#api"][index] }
						>
							{ item }
						</a>
					)) }
				</nav>
				<div className="flex shrink-0 items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button type="button" size="sm" variant="outline" aria-label={ copy.languageLabel }>
								<Languages data-icon="inline-start"/>
								<span className="hidden sm:inline">{ copy.languageTrigger }</span>
								<span className="hidden font-mono text-xs sm:inline">{ locale.toUpperCase() }</span>
								<ChevronDown data-icon="inline-end"/>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>{ copy.languageMenuLabel }</DropdownMenuLabel>
							<DropdownMenuSeparator/>
							<DropdownMenuRadioGroup
								value={ locale }
								onValueChange={ (nextLocale: string) => {
									if (nextLocale === "en" || nextLocale === "zh") {
										onLocaleChange(nextLocale)
									}
								} }
							>
								<DropdownMenuRadioItem value="en">{ copy.languageOptions.en }</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="zh">{ copy.languageOptions.zh }</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button type="button" size="icon-sm" variant="outline" onClick={ onThemeChange } aria-label={ copy.themeLabel }>
								{ theme === "dark" ? <Sun data-icon="inline-start"/> : <Moon data-icon="inline-start"/> }
							</Button>
						</TooltipTrigger>
						<TooltipContent>{ theme === "dark" ? copy.themeToLight : copy.themeToDark }</TooltipContent>
					</Tooltip>
					<Button className="hidden sm:inline-flex" variant="outline" size="sm" asChild>
						<a href="https://github.com/kampiu/better-scrollbar" aria-label={ copy.githubLabel }>
							<GithubIcon/>
							{ copy.githubText }
						</a>
					</Button>
					<Button className="sm:hidden" variant="outline" size="icon-sm" asChild>
						<a href="https://github.com/kampiu/better-scrollbar" aria-label={ copy.githubLabel }>
							<GithubIcon/>
						</a>
					</Button>
				</div>
			</div>
		</header>
	)
}

function LiveConsole({ copy }: { copy: typeof COPY[LocaleMode] }) {
	return (
		<div className="relative overflow-hidden rounded-lg border border-border/80 bg-card/78 shadow-site-panel shadow-site-line">
			<div className="flex items-center justify-between gap-4 border-b border-border/80 px-4 py-3">
				<div className="min-w-0">
					<div className="truncate text-sm font-semibold text-card-foreground">{ copy.consoleTitle }</div>
					<div className="mt-1 truncate text-xs text-muted-foreground">{ copy.consoleSubtitle }</div>
				</div>
				<Badge variant="success">{ copy.consoleStatus }</Badge>
			</div>
			<div className="grid gap-0 lg:grid-cols-[1fr_148px]">
				<div className="relative min-w-0 p-4">
					<div className="absolute inset-x-4 top-16 h-14 rounded-md border border-primary/40 bg-primary/10 shadow-[0_0_32px_hsl(var(--primary)/0.14)] animate-console-scan"/>
					<div className="flex flex-col gap-2">
						{ CONSOLE_ROW_META.map((row, index) => (
							<div
								key={ row.index }
								className="grid h-12 grid-cols-[112px_minmax(0,1fr)_64px] items-center gap-3 rounded-md border border-border/70 bg-background/48 px-3 text-xs font-medium"
							>
								<span className="font-mono text-muted-foreground">{ row.index }</span>
								<span className="min-w-0 truncate text-card-foreground">{ copy.consoleRows[index] }</span>
								<span className={ cn(
									"h-1.5 rounded-full",
									row.tone === "primary" && "bg-primary/80",
									row.tone === "accent" && "bg-accent/80",
									row.tone === "success" && "bg-success/80",
									row.tone === "warning" && "bg-warning/80",
									row.tone === "muted" && "bg-muted-foreground/40",
								) } style={ {width: row.width} }/>
								{ index === 2 && (
									<span className="absolute right-7 h-8 w-1 rounded-full bg-accent shadow-[0_0_18px_hsl(var(--accent)/0.7)] animate-rail-pulse"/>
								) }
							</div>
						)) }
					</div>
				</div>
				<div className="border-t border-border/80 bg-secondary/38 p-4 lg:border-l lg:border-t-0">
					<div className="flex flex-col gap-4">
						<div>
							<div className="text-xs font-medium text-muted-foreground">{ copy.consoleVisible }</div>
							<div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
								<div className="h-full w-[58%] rounded-full bg-primary"/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
							<div className="rounded-md border border-border bg-card/70 p-3">
								<span className="text-xs text-muted-foreground">{ copy.consoleDom }</span>
								<strong className="mt-1 block font-mono text-lg text-card-foreground">24</strong>
							</div>
							<div className="rounded-md border border-border bg-card/70 p-3">
								<span className="text-xs text-muted-foreground">{ copy.consoleOffset }</span>
								<strong className="mt-1 block font-mono text-lg text-card-foreground">8.42e8</strong>
							</div>
						</div>
						<div className="flex items-center justify-between rounded-md border border-border bg-card/70 px-3 py-2 text-xs">
							<span className="text-muted-foreground">{ copy.consoleVelocity }</span>
							<span className="font-mono text-accent">+260k/s</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

function Hero({ copy }: { copy: typeof COPY[LocaleMode] }) {
	return (
		<section id="overview" className="relative scroll-mt-16 overflow-hidden">
			<div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(var(--primary)/0.13),transparent_34%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.32)_65%,hsl(var(--background)))]"/>
			<div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.28)_1px,transparent_1px)] bg-[size:54px_54px] opacity-30"/>
			<div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.82fr_1fr] lg:px-8 lg:py-20">
				<div className="flex min-w-0 flex-col gap-8">
					<div className="flex flex-col gap-6">
						<h1 className="max-w-3xl text-4xl font-semibold leading-[1.04] text-foreground sm:text-5xl lg:text-6xl">
							{ copy.heroTitle }
						</h1>
						<p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
							{ copy.heroDesc }
						</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<Button size="lg" asChild>
							<a href="#demos">
								{ copy.primaryCta }
								<ArrowRight data-icon="inline-end"/>
							</a>
						</Button>
						<Button variant="outline" size="lg" asChild>
							<a href="https://github.com/kampiu/better-scrollbar">
								<GithubIcon/>
								{ copy.secondaryCta }
							</a>
						</Button>
					</div>
				</div>
				<div className="min-w-0 lg:row-span-2">
					<LiveConsole copy={ copy }/>
				</div>
				<div className="grid gap-3 sm:grid-cols-3 lg:col-start-1 lg:row-start-2">
					{ copy.proof.map((item) => (
						<div key={ item.label } className="rounded-lg border border-border/75 bg-card/62 p-4 shadow-site-line backdrop-blur">
							<div className="text-xs font-medium text-muted-foreground">{ item.label }</div>
							<div className="mt-2 text-2xl font-semibold text-foreground">{ item.value }</div>
							<div className="mt-1 text-xs text-muted-foreground">{ item.detail }</div>
						</div>
					)) }
				</div>
				<a
					className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-md border border-border bg-card/80 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground md:flex"
					href="#cases"
				>
					{ copy.nav[1] }
					<ChevronDown className="size-3.5"/>
				</a>
			</div>
		</section>
	)
}

function SectionIntro({ title, desc }: { title: string, desc: string }) {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:px-8">
			<h2 className="max-w-3xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{ title }</h2>
			<p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{ desc }</p>
		</div>
	)
}

function CasesSection({ copy }: { copy: typeof COPY[LocaleMode] }) {
	return (
		<section id="cases" className="scroll-mt-16 border-t border-border/70 bg-background py-16 sm:py-20">
			<SectionIntro title={ copy.casesTitle } desc={ copy.casesDesc }/>
			<div className="mx-auto mt-8 grid w-full max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
				{ copy.caseCards.map((card) => {
					const Icon = card.icon

					return (
						<Card key={ card.title } className="bg-card/74 shadow-site-line">
							<CardHeader>
								<div className="flex size-9 items-center justify-center rounded-md bg-primary/12 text-primary">
									<Icon className="size-5"/>
								</div>
								<CardTitle className="text-base">{ card.title }</CardTitle>
								<CardDescription className="leading-6">{ card.desc }</CardDescription>
							</CardHeader>
						</Card>
					)
				}) }
			</div>
			<div className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<OptimizationCases/>
			</div>
		</section>
	)
}

function PlaygroundSection({ copy }: { copy: typeof COPY[LocaleMode] }) {
	return (
		<section id="playground" className="scroll-mt-16 border-t border-border/70 bg-secondary/18 py-16 sm:py-20">
			<SectionIntro title={ copy.playgroundTitle } desc={ copy.playgroundDesc }/>
			<div className="mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<Container
					title={ copy.playgroundContainerTitle }
					desc={ copy.playgroundContainerDesc }
					className="min-w-0 [--container-height:900px]"
				>
					<ScenarioPlayground/>
				</Container>
			</div>
		</section>
	)
}

function DemoButton({
	demo,
	active,
	copy,
	onClick,
}: {
	demo: DemoMeta
	active: boolean
	copy: typeof COPY[LocaleMode]["demos"][DemoId]
	onClick: () => void
}) {
	const Icon = demo.icon

	return (
		<button
			type="button"
			className={ cn(
				"flex min-w-0 items-start gap-3 rounded-lg border p-4 text-left transition-all",
				active
					? "border-primary bg-primary/10 text-foreground shadow-site-line"
					: "border-border bg-card/64 text-muted-foreground hover:border-border/90 hover:bg-card",
			) }
			onClick={ onClick }
		>
			<span className={ cn(
				"mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md",
				active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
			) }>
				<Icon className="size-4"/>
			</span>
			<span className="min-w-0">
				<span className="block truncate text-sm font-semibold text-foreground">{ copy.title }</span>
				<span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">{ copy.desc }</span>
			</span>
		</button>
	)
}

function DemosSection({ copy }: { copy: typeof COPY[LocaleMode] }) {
	const [activeDemoId, setActiveDemoId] = useState<DemoId>("dynamic")
	const activeDemo = useMemo(() => DEMOS.find((demo) => demo.id === activeDemoId) ?? DEMOS[0], [activeDemoId])
	const ActiveDemo = activeDemo.component
	const activeCopy = copy.demos[activeDemo.id]

	return (
		<section id="demos" className="scroll-mt-16 border-t border-border/70 bg-background py-16 sm:py-20">
			<SectionIntro title={ copy.demosTitle } desc={ copy.demosDesc }/>
			<div className="mx-auto mt-8 grid w-full max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
				<aside className="min-w-0">
					<div className="mb-3 flex items-center justify-between gap-3">
						<div className="text-sm font-semibold text-foreground">{ copy.demoSelectLabel }</div>
						<ToggleGroup
							type="single"
							value={ activeDemoId }
							onValueChange={ (nextDemo: string) => {
								if (DEMOS.some((demo) => demo.id === nextDemo)) {
									setActiveDemoId(nextDemo as DemoId)
								}
							} }
							className="hidden"
							aria-label={ copy.demoSelectLabel }
						>
							{ DEMOS.map((demo) => (
								<ToggleGroupItem key={ demo.id } value={ demo.id }>{ copy.demos[demo.id].title }</ToggleGroupItem>
							)) }
						</ToggleGroup>
					</div>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
						{ DEMOS.map((demo) => (
							<DemoButton
								key={ demo.id }
								demo={ demo }
								active={ demo.id === activeDemo.id }
								copy={ copy.demos[demo.id] }
								onClick={ () => setActiveDemoId(demo.id) }
							/>
						)) }
					</div>
				</aside>
				<Container
					title={ `${ copy.demoContainerTitle } · ${ activeCopy.title }` }
					desc={ activeCopy.desc }
					className="min-w-0 [--container-height:680px]"
				>
					<ActiveDemo/>
				</Container>
			</div>
		</section>
	)
}

function ApiSection({ copy, locale }: { copy: typeof COPY[LocaleMode], locale: LocaleMode }) {
	return (
		<section id="api" className="scroll-mt-16 border-t border-border/70 bg-secondary/18 py-16 sm:py-20">
			<SectionIntro title={ copy.apiTitle } desc={ copy.apiDesc }/>
			<div className="mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="overflow-hidden rounded-lg border border-border bg-card/72 shadow-site-line">
					<Table>
						<TableHeader>
							<TableRow className="bg-secondary/52 hover:bg-secondary/52">
								<TableHead className="min-w-[168px] text-foreground">{ copy.apiHeaders.name }</TableHead>
								<TableHead className="min-w-[320px] text-foreground">{ copy.apiHeaders.description }</TableHead>
								<TableHead className="min-w-[280px] text-foreground">{ copy.apiHeaders.type }</TableHead>
								<TableHead className="min-w-[150px] text-foreground">{ copy.apiHeaders.defaultValue }</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{ API_PROPS[locale].map((prop) => (
								<TableRow key={ prop.name }>
									<TableCell className="font-mono text-sm font-semibold text-primary">{ prop.name }</TableCell>
									<TableCell className="max-w-[420px] text-sm leading-6 text-muted-foreground">{ prop.description }</TableCell>
									<TableCell>
										<code className="whitespace-nowrap rounded-md border border-border bg-background/64 px-2 py-1 font-mono text-xs text-foreground">
											{ prop.type }
										</code>
									</TableCell>
									<TableCell>
										<code className="whitespace-nowrap rounded-md border border-border bg-background/64 px-2 py-1 font-mono text-xs text-muted-foreground">
											{ prop.defaultValue }
										</code>
									</TableCell>
								</TableRow>
							)) }
						</TableBody>
					</Table>
				</div>
			</div>
		</section>
	)
}

function Index({theme, locale, onThemeChange, onLocaleChange}: IndexProps) {
	const copy = COPY[locale]

	return (
		<main className="min-h-screen bg-background text-foreground">
			<Header
				copy={ copy }
				theme={ theme }
				locale={ locale }
				onThemeChange={ onThemeChange }
				onLocaleChange={ onLocaleChange }
			/>
			<Hero copy={ copy }/>
			<CasesSection copy={ copy }/>
			<PlaygroundSection copy={ copy }/>
			<DemosSection copy={ copy }/>
			<ApiSection copy={ copy } locale={ locale }/>
			<footer className="border-t border-border bg-card/54">
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
					<div className="flex items-center gap-3">
						<SiteIcon className="size-7"/>
						<span>{ copy.footer }</span>
					</div>
					<div className="flex items-center gap-3">
						<span>{ copy.licenseLabel }</span>
						<Separator orientation="vertical" className="h-4"/>
						<a className="transition-colors hover:text-foreground" href="https://github.com/kampiu/better-scrollbar" aria-label={ copy.githubLabel }>
							{ copy.githubText }
						</a>
					</div>
				</div>
			</footer>
		</main>
	)
}

export default Index
