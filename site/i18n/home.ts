import { EXAMPLE_COPY } from "./examples"
import type { ExampleCopy } from "./examples"

export type LocaleMode = "en" | "zh"
export type DemoId = "agent" | "audit" | "media" | "rules"

export interface HomeApiPropRow {
	name: string
	description: string
	type: string
	defaultValue: string
}

export interface HomeCopy {
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
	consoleOffset: string
	consoleVelocity: string
	consoleRows: string[]
	proof: Array<{ label: string, value: string, detail: string }>
	casesTitle: string
	casesDesc: string
	playgroundTitle: string
	playgroundDesc: string
	demosTitle: string
	demosDesc: string
	demoSelectLabel: string
	demos: Record<DemoId, { title: string, desc: string }>
	apiTitle: string
	apiDesc: string
	apiHeaders: {
		name: string
		description: string
		type: string
		defaultValue: string
	}
	examples: ExampleCopy
	footer: string
}

export const HOME_API_PROPS: Record<LocaleMode, HomeApiPropRow[]> = {
	en: [
		{ name: "width", description: "Scroll viewport width.", type: "number", defaultValue: "-" },
		{ name: "height", description: "Scroll viewport height.", type: "number", defaultValue: "-" },
		{ name: "style", description: "Inline style for the outer container.", type: "CSSProperties", defaultValue: "-" },
		{ name: "className", description: "Class name for the outer container.", type: "string", defaultValue: "-" },
		{ name: "isVirtual", description: "Enable virtual rendering.", type: "boolean", defaultValue: "true" },
		{ name: "itemCount", description: "Total indexed item count. Use this for huge lists without building a children array.", type: "number", defaultValue: "children.length" },
		{ name: "renderItem", description: "Lazy renderer used with itemCount.", type: "(index: number) => ReactElement", defaultValue: "-" },
		{ name: "itemKey", description: "Stable key generator for indexed items.", type: "(index: number) => Key", defaultValue: "index" },
		{ name: "estimatedItemHeight", description: "Estimated height for unmeasured rows. Used for virtual range estimation.", type: "number", defaultValue: "20" },
		{ name: "overscan", description: "Extra item count or full overscan config (items, pixels, adaptive) rendered outside the visible range.", type: "number | OverscanConfig", defaultValue: "1" },
		{ name: "scrollSeek", description: "Render lightweight placeholders while scrolling fast.", type: "boolean | ScrollSeekOptions", defaultValue: "false" },
		{ name: "maintainVisibleContentPosition", description: "Keep the current visible item anchored when data or measurements change.", type: "boolean", defaultValue: "true" },
		{ name: "followOutput", description: "Stay pinned to the bottom when data is appended. Pass true or { threshold } for custom threshold.", type: "boolean | FollowOutputOptions", defaultValue: "false" },
		{ name: "stickyIndices", description: "Always-sticky item indexes, commonly used for group headers. Use getStickyIndicesFromGroups() for grouped lists.", type: "number[]", defaultValue: "-" },
		{ name: "onScroll", description: "Fires with the full scroll state when scrolling changes.", type: "(scrollState: ScrollState) => void", defaultValue: "-" },
		{ name: "onScrollStart", description: "Fires when scrolling starts.", type: "() => void", defaultValue: "-" },
		{ name: "onScrollEnd", description: "Fires when scrolling ends.", type: "() => void", defaultValue: "-" },
		{ name: "onItemsRendered", description: "Fires when the rendered and visible item ranges change.", type: "(info: ItemsRenderedInfo) => void", defaultValue: "-" },
		{ name: "prefixCls", description: "CSS class prefix.", type: "string", defaultValue: "\"scroll-bar\"" },
		{ name: "scrollBarSize", description: "Scrollbar thickness.", type: "number", defaultValue: "6" },
		{ name: "scrollBarHidden", description: "Hide custom scrollbars.", type: "boolean", defaultValue: "false" },
		{ name: "scrollBarAutoHideTimeout", description: "Delay before auto-hiding the scrollbar.", type: "number", defaultValue: "1000" },
		{ name: "renderView", description: "Custom render function for the scroll view.", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderViewDefault" },
		{ name: "renderTrackHorizontal", description: "Custom render function for the horizontal track.", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderTrackHorizontalDefault" },
		{ name: "renderTrackVertical", description: "Custom render function for the vertical track.", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderTrackVerticalDefault" },
		{ name: "renderThumbHorizontal", description: "Custom render function for the horizontal thumb.", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderThumbHorizontalDefault" },
		{ name: "renderThumbVertical", description: "Custom render function for the vertical thumb.", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderThumbVerticalDefault" },
	],
	zh: [
		{ name: "width", description: "滚动视区宽度。", type: "number", defaultValue: "-" },
		{ name: "height", description: "滚动视区高度。", type: "number", defaultValue: "-" },
		{ name: "style", description: "外层容器内联样式。", type: "CSSProperties", defaultValue: "-" },
		{ name: "className", description: "外层容器 className。", type: "string", defaultValue: "-" },
		{ name: "isVirtual", description: "是否启用虚拟渲染。", type: "boolean", defaultValue: "true" },
		{ name: "itemCount", description: "按索引渲染的数据总数，适合超大列表避免创建完整 children 数组。", type: "number", defaultValue: "children.length" },
		{ name: "renderItem", description: "与 itemCount 配合使用的惰性渲染函数。", type: "(index: number) => ReactElement", defaultValue: "-" },
		{ name: "itemKey", description: "按索引生成稳定 key。", type: "(index: number) => Key", defaultValue: "index" },
		{ name: "estimatedItemHeight", description: "未测量行的预估高度，用于虚拟区间估算。", type: "number", defaultValue: "20" },
		{ name: "overscan", description: "可视区外额外渲染的条目数量，或完整 overscan 配置（items、pixels、adaptive）。", type: "number | OverscanConfig", defaultValue: "1" },
		{ name: "scrollSeek", description: "高速滚动时使用轻量占位项，降低重行渲染成本。", type: "boolean | ScrollSeekOptions", defaultValue: "false" },
		{ name: "maintainVisibleContentPosition", description: "数据或测量变化时保持当前可见条目锚定。", type: "boolean", defaultValue: "true" },
		{ name: "followOutput", description: "已在底部附近时，追加数据后继续贴住底部。传 true 或 { threshold } 自定义阈值。", type: "boolean | FollowOutputOptions", defaultValue: "false" },
		{ name: "stickyIndices", description: "始终吸顶的条目索引，常用于分组头。可配合 getStickyIndicesFromGroups() 使用。", type: "number[]", defaultValue: "-" },
		{ name: "onScroll", description: "滚动状态变化时触发。", type: "(scrollState: ScrollState) => void", defaultValue: "-" },
		{ name: "onScrollStart", description: "开始滚动时触发。", type: "() => void", defaultValue: "-" },
		{ name: "onScrollEnd", description: "滚动结束时触发。", type: "() => void", defaultValue: "-" },
		{ name: "onItemsRendered", description: "实际渲染区间和可见区间变化时触发。", type: "(info: ItemsRenderedInfo) => void", defaultValue: "-" },
		{ name: "prefixCls", description: "样式前缀。", type: "string", defaultValue: "\"scroll-bar\"" },
		{ name: "scrollBarSize", description: "滚动条粗细。", type: "number", defaultValue: "6" },
		{ name: "scrollBarHidden", description: "是否隐藏自定义滚动条。", type: "boolean", defaultValue: "false" },
		{ name: "scrollBarAutoHideTimeout", description: "滚动条自动隐藏延迟。", type: "number", defaultValue: "1000" },
		{ name: "renderView", description: "自定义滚动视图渲染函数。", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderViewDefault" },
		{ name: "renderTrackHorizontal", description: "自定义水平滚动轨渲染函数。", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderTrackHorizontalDefault" },
		{ name: "renderTrackVertical", description: "自定义垂直滚动轨渲染函数。", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderTrackVerticalDefault" },
		{ name: "renderThumbHorizontal", description: "自定义水平滚动滑块渲染函数。", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderThumbHorizontalDefault" },
		{ name: "renderThumbVertical", description: "自定义垂直滚动滑块渲染函数。", type: "RenderElement<HTMLProps<HTMLDivElement>>", defaultValue: "renderThumbVerticalDefault" },
	],
}

export const HOME_COPY: Record<LocaleMode, HomeCopy> = {
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
		consoleSubtitle: "100,000,000 indexed rows / live range",
		consoleStatus: "Overscan stable",
		consoleVisible: "Visible 98,238,102 - 98,238,126",
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
			{ label: "Rows", value: "100M", detail: "stress scale" },
			{ label: "Height mode", value: "Dynamic", detail: "measured lazily" },
		],
		casesTitle: "Four cases, one scroll engine",
		casesDesc:
			"Scale, measurement, mutation and product shell behavior are each shown as a live card.",
		playgroundTitle: "Scenario playground",
		playgroundDesc:
			"Combine presets and props on the same 100 million row dataset. The stage below is the actual component workflow.",
		demosTitle: "Scenario demo workstation",
		demosDesc:
			"Pick one product scenario at a time. Each surface keeps the existing demo rhythm while combining multiple scroll capabilities.",
		demoSelectLabel: "Demo selector",
		demos: {
			agent: {
				title: "Agent conversation",
				desc: "Dynamic messages, anchored history, bottom following and structured tool output in one flow.",
			},
			audit: {
				title: "Audit log",
				desc: "100M indexed rows, precise jumps and native or controlled scrolling.",
			},
			media: {
				title: "Rich media search",
				desc: "scrollSeek, adaptive overscan and heavy result rows under fast search-result scanning.",
			},
			rules: {
				title: "Rule queue",
				desc: "Draggable visible rows, live row status and virtualized interaction state.",
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
		examples: EXAMPLE_COPY.en,
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
		consoleSubtitle: "1 亿 indexed rows / 实时区间",
		consoleStatus: "Overscan 稳定",
		consoleVisible: "可见 98,238,102 - 98,238,126",
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
			{ label: "数据行", value: "1亿", detail: "压力规模" },
			{ label: "高度策略", value: "动态", detail: "惰性测量" },
		],
		casesTitle: "四个案例，一个滚动内核",
		casesDesc:
			"规模、测量、变更和产品壳各占一张卡，用真实交互说明能力。",
		playgroundTitle: "场景实验台",
		playgroundDesc:
			"在同一份 1 亿行数据上组合预设和 props，下方就是实际组件工作流。",
		demosTitle: "场景 Demo 工作台",
		demosDesc:
			"一次聚焦一个产品场景，保持原有演示节奏，同时让每个场景承载多项滚动能力。",
		demoSelectLabel: "Demo 选择器",
		demos: {
			agent: {
				title: "Agent 对话",
				desc: "动态消息、历史锚点、底部跟随和结构化工具输出在同一条流里演示。",
			},
			audit: {
				title: "审计日志",
				desc: "1 亿 indexed rows、精确跳转，以及 native/controlled 滚动切换。",
			},
			media: {
				title: "富媒体搜索",
				desc: "高速结果流里展示 scrollSeek、自适应 overscan 和重行渲染优化。",
			},
			rules: {
				title: "规则编排",
				desc: "可拖拽可交互的虚拟任务队列，证明长列表不只用来展示。",
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
		examples: EXAMPLE_COPY.zh,
		footer: "为把滚动当成产品基础设施的 React 界面而构建。",
	},
}

export function getHomeCopy(locale: LocaleMode) {
	return HOME_COPY[locale]
}
