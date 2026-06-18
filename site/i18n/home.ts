export type LocaleMode = "en" | "zh"
export type DemoId = "dynamic" | "shadow" | "drag" | "custom" | "million"
export type SupportLevel = "full" | "documented" | "partial" | "app"
export type ComparisonAdvantageId = "indexedScale" | "boundedHeights" | "productScrollUx"
export type ComparisonLibraryId = "better-scrollbar" | "tanstack" | "virtuoso" | "react-window" | "react-virtualized"
export type ComparisonCriterionId =
	| "massiveRange"
	| "dynamicMeasurement"
	| "boundedCache"
	| "anchoredMutation"
	| "customScrollbar"
	| "stickyAccessibility"
export type ComparisonSourceId =
	| "localBuild"
	| "bundlephobia"
	| "tanstackDocs"
	| "virtuosoDocs"
	| "reactWindowGuide"
	| "reactVirtualizedCellMeasurer"

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
	consoleDom: string
	consoleOffset: string
	consoleVelocity: string
	consoleRows: string[]
	proof: Array<{ label: string, value: string, detail: string }>
	casesTitle: string
	casesDesc: string
	comparisonTitle: string
	comparisonDesc: string
	comparisonChartLabel: string
	comparisonBundleLabel: string
	comparisonBenchmarkNote: string
	comparisonMethod: string
	comparisonAdvantageTitle: string
	comparisonAdvantages: Record<ComparisonAdvantageId, { title: string, desc: string }>
	comparisonMatrixTitle: string
	comparisonSourceTitle: string
	comparisonHeaders: {
		library: string
		score: string
		bundle: string
		basis: string
		criterion: string
		weight: string
	}
	comparisonSupportLabels: Record<SupportLevel, string>
	comparisonLibraries: Record<ComparisonLibraryId, {
		bundleLabel: string
		scoreBasis: string
		source: string
	}>
	comparisonCriteria: Record<ComparisonCriterionId, { label: string }>
	comparisonSources: Record<ComparisonSourceId, { detail: string }>
	playgroundTitle: string
	playgroundDesc: string
	playgroundContainerTitle: string
	playgroundContainerDesc: string
	demosTitle: string
	demosDesc: string
	demoSelectLabel: string
	demoContainerTitle: string
	demos: Record<DemoId, { title: string, desc: string }>
	apiTitle: string
	apiDesc: string
	apiHeaders: {
		name: string
		description: string
		type: string
		defaultValue: string
	}
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
		{ name: "itemHeight", description: "Default row height.", type: "number", defaultValue: "20" },
		{ name: "estimatedItemHeight", description: "Estimated height for unmeasured rows. Overrides itemHeight for virtual range estimation.", type: "number", defaultValue: "itemHeight" },
		{ name: "heightCacheLimit", description: "Maximum measured row heights retained in memory.", type: "number", defaultValue: "-" },
		{ name: "overscan", description: "Extra item count rendered outside the visible range.", type: "number", defaultValue: "1" },
		{ name: "overscanPixels", description: "Extra pixel range rendered before and after the viewport.", type: "number | { before: number; after: number }", defaultValue: "-" },
		{ name: "adaptiveOverscan", description: "Expand overscan dynamically by scroll direction and speed.", type: "boolean | AdaptiveOverscanOptions", defaultValue: "false" },
		{ name: "maxRenderedItems", description: "Maximum rendered items in virtual mode. The real visible range is never clipped.", type: "number", defaultValue: "500" },
		{ name: "scrollSeek", description: "Render lightweight placeholders while scrolling fast.", type: "boolean | ScrollSeekOptions", defaultValue: "false" },
		{ name: "scrollMode", description: "Wheel input strategy. Native uses the browser scroll pipeline when possible.", type: "\"controlled\" | \"native\"", defaultValue: "\"controlled\"" },
		{ name: "maintainVisibleContentPosition", description: "Keep the current visible item anchored when data or measurements change.", type: "boolean", defaultValue: "true" },
		{ name: "followOutput", description: "Stay pinned to the bottom when data is appended and the viewport is already near the end.", type: "boolean", defaultValue: "false" },
		{ name: "followOutputThreshold", description: "Pixel threshold used to decide whether the viewport is already at the bottom.", type: "number", defaultValue: "1" },
		{ name: "preserveItemState", description: "Preserve React state in children mode by keeping all children mounted and hiding non-visible items.", type: "boolean", defaultValue: "false" },
		{ name: "stickyIndices", description: "Always-sticky item indexes, commonly used for group headers.", type: "number[]", defaultValue: "-" },
		{ name: "groupCounts", description: "GroupedVirtuoso-style group sizes used to infer sticky group header indexes.", type: "number[]", defaultValue: "-" },
		{ name: "accessibility", description: "ARIA semantics and row metadata for list/grid/table scenarios.", type: "boolean | VirtualAccessibilityOptions", defaultValue: "false" },
		{ name: "maxBrowserScrollHeight", description: "Maximum physical browser scroll height used to map massive logical ranges.", type: "number", defaultValue: "10,000,000" },
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
		{ name: "itemHeight", description: "单条数据默认高度。", type: "number", defaultValue: "20" },
		{ name: "estimatedItemHeight", description: "未测量行的预估高度；用于虚拟区间估算，优先级高于 itemHeight。", type: "number", defaultValue: "itemHeight" },
		{ name: "heightCacheLimit", description: "最多保留的已测量行高数量，用于限制超大列表内存。", type: "number", defaultValue: "-" },
		{ name: "overscan", description: "可视区外额外渲染的条目数量。", type: "number", defaultValue: "1" },
		{ name: "overscanPixels", description: "可视区前后按像素额外渲染的范围。", type: "number | { before: number; after: number }", defaultValue: "-" },
		{ name: "adaptiveOverscan", description: "根据滚动方向、距离和速度动态扩大 overscan。", type: "boolean | AdaptiveOverscanOptions", defaultValue: "false" },
		{ name: "maxRenderedItems", description: "虚拟模式下最多渲染的条目数量；不会裁掉真实可视区。", type: "number", defaultValue: "500" },
		{ name: "scrollSeek", description: "高速滚动时使用轻量占位项，降低重行渲染成本。", type: "boolean | ScrollSeekOptions", defaultValue: "false" },
		{ name: "scrollMode", description: "wheel 输入策略；native 在可行时使用浏览器原生滚动管线。", type: "\"controlled\" | \"native\"", defaultValue: "\"controlled\"" },
		{ name: "maintainVisibleContentPosition", description: "数据或测量变化时保持当前可见条目锚定。", type: "boolean", defaultValue: "true" },
		{ name: "followOutput", description: "已在底部附近时，追加数据后继续贴住底部。", type: "boolean", defaultValue: "false" },
		{ name: "followOutputThreshold", description: "判断“已在底部”的像素阈值。", type: "number", defaultValue: "1" },
		{ name: "preserveItemState", description: "children 模式下保留 React 行状态；会挂载全部 children 并隐藏非可视项。", type: "boolean", defaultValue: "false" },
		{ name: "stickyIndices", description: "始终吸顶的条目索引，常用于分组头。", type: "number[]", defaultValue: "-" },
		{ name: "groupCounts", description: "GroupedVirtuoso 风格的每组数量，用于推导分组头吸顶索引。", type: "number[]", defaultValue: "-" },
		{ name: "accessibility", description: "列表、网格、表格场景的 ARIA 语义和行信息。", type: "boolean | VirtualAccessibilityOptions", defaultValue: "false" },
		{ name: "maxBrowserScrollHeight", description: "用于映射超大逻辑滚动范围的浏览器物理滚动容器最大高度。", type: "number", defaultValue: "10,000,000" },
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
		nav: ["Overview", "Cases", "Compare", "Playground", "Demos", "API"],
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
		consoleSubtitle: "100,000,000 rows / 18 mounted nodes",
		consoleStatus: "Overscan stable",
		consoleVisible: "Visible 98,238,102 - 98,238,126",
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
			{ label: "Rows", value: "100M", detail: "stress scale" },
			{ label: "Mounted DOM", value: "18-42", detail: "windowed render" },
			{ label: "Height mode", value: "Dynamic", detail: "measured lazily" },
		],
		casesTitle: "Four cases, one scroll engine",
		casesDesc:
			"Scale, measurement, mutation and product shell behavior are each shown as a live card.",
		comparisonTitle: "Source-backed performance comparison",
		comparisonDesc:
			"Same scenario, same criteria: 100 million logical rows, dynamic heights, mutation-safe anchors, custom scrollbar UX and production controls. Scores are weighted feature coverage, not raw runtime benchmark results.",
		comparisonChartLabel: "Scenario fit score",
		comparisonBundleLabel: "Package impact",
		comparisonBenchmarkNote: "not an FPS benchmark",
		comparisonMethod:
			"Method: official docs define capability support, Bundlephobia API provides competitor gzip sizes, and the local Vite library build provides better-scrollbar size.",
		comparisonAdvantageTitle: "Why this scenario favors better-scrollbar",
		comparisonAdvantages: {
			indexedScale: {
				title: "100M rows without allocating every child",
				desc: "itemCount, renderItem and maxBrowserScrollHeight let the site model huge indexed datasets directly.",
			},
			boundedHeights: {
				title: "Dynamic heights stay bounded",
				desc: "estimatedItemHeight, measured rows and heightCacheLimit keep unpredictable content measurable without unbounded memory growth.",
			},
			productScrollUx: {
				title: "Product scroll UX is included",
				desc: "Custom tracks, anchored mutations, followOutput, sticky groups and accessibility props are first-class API surface.",
			},
		},
		comparisonMatrixTitle: "Same-scenario capability matrix",
		comparisonSourceTitle: "Data sources",
		comparisonHeaders: {
			library: "Library",
			score: "Score",
			bundle: "Bundle",
			basis: "Basis",
			criterion: "Criterion",
			weight: "Weight",
		},
		comparisonSupportLabels: {
			full: "Built-in",
			documented: "Documented",
			partial: "Partial",
			app: "App-owned",
		},
		comparisonLibraries: {
			"better-scrollbar": {
				bundleLabel: "11.2 kB JS gzip (+0.4 kB CSS)",
				scoreBasis: "Native props cover the 100M dynamic-row scenario shown on this site.",
				source: "Local Vite library build",
			},
			virtuoso: {
				bundleLabel: "18.6 kB gzip",
				scoreBasis: "Strong batteries-included virtualization, message list and grouped list support.",
				source: "Bundlephobia API",
			},
			tanstack: {
				bundleLabel: "7.2 kB gzip",
				scoreBasis: "Headless virtualizer with documented measurement and direct DOM update options.",
				source: "Bundlephobia API",
			},
			"react-virtualized": {
				bundleLabel: "27.2 kB gzip",
				scoreBasis: "Broad legacy component surface, with CellMeasurer cache caveats for dynamic sizing.",
				source: "Bundlephobia API",
			},
			"react-window": {
				bundleLabel: "6.5 kB gzip",
				scoreBasis: "Very small list primitive; advanced dynamic and product UX behavior is mostly app-owned.",
				source: "Bundlephobia API",
			},
		},
		comparisonCriteria: {
			massiveRange: { label: "Massive logical range mapping" },
			dynamicMeasurement: { label: "Dynamic row measurement" },
			boundedCache: { label: "Bounded height cache" },
			anchoredMutation: { label: "Anchored inserts and appends" },
			customScrollbar: { label: "Custom scrollbar slots" },
			stickyAccessibility: { label: "Sticky groups and accessibility props" },
		},
		comparisonSources: {
			localBuild: { detail: "better-scrollbar size uses pnpm run build, then gzip of dist/ScrollBar.min.js and dist/ScrollBar.min.css in this checkout." },
			bundlephobia: { detail: "Competitor package gzip sizes use Bundlephobia API snapshots for react-window 2.2.7, @tanstack/react-virtual 3.14.3, react-virtuoso 4.18.7 and react-virtualized 9.22.6." },
			tanstackDocs: { detail: "Capability checks use documented measureElement and virtualizer options." },
			virtuosoDocs: { detail: "Capability checks use its documented variable-size, grouped, message list and table/grid features." },
			reactWindowGuide: { detail: "Capability checks use documented FixedSizeList and VariableSizeList behavior." },
			reactVirtualizedCellMeasurer: { detail: "Dynamic-height caveats use the official CellMeasurer cache documentation." },
		},
		playgroundTitle: "Scenario playground",
		playgroundDesc:
			"Combine presets and props on the same 100 million row dataset. The stage below is the actual component workflow.",
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
				desc: "Lazy row measurement for unpredictable item heights at 100 million row scale.",
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
		nav: ["概览", "案例", "对比", "实验台", "Demo", "API"],
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
		consoleSubtitle: "1 亿行 / 18 个挂载节点",
		consoleStatus: "Overscan 稳定",
		consoleVisible: "可见 98,238,102 - 98,238,126",
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
			{ label: "数据行", value: "1亿", detail: "压力规模" },
			{ label: "挂载 DOM", value: "18-42", detail: "窗口渲染" },
			{ label: "高度策略", value: "动态", detail: "惰性测量" },
		],
		casesTitle: "四个案例，一个滚动内核",
		casesDesc:
			"规模、测量、变更和产品壳各占一张卡，用真实交互说明能力。",
		comparisonTitle: "有来源的性能场景对比",
		comparisonDesc:
			"以同一个场景、同一组指标对比：1 亿逻辑行、动态高度、变更时锚点稳定、自定义滚动条体验和生产级控制项。评分是加权功能覆盖，不是原始运行时跑分。",
		comparisonChartLabel: "场景适配评分",
		comparisonBundleLabel: "包体积影响",
		comparisonBenchmarkNote: "不是 FPS 基准测试",
		comparisonMethod:
			"方法：能力支持以官方文档为依据，竞品 gzip 体积来自 Bundlephobia API，better-scrollbar 体积来自本仓库 Vite 组件库本地构建。",
		comparisonAdvantageTitle: "为什么这个场景更适合 better-scrollbar",
		comparisonAdvantages: {
			indexedScale: {
				title: "1 亿行不需要分配全部 children",
				desc: "itemCount、renderItem 与 maxBrowserScrollHeight 让站点可以直接建模超大索引数据集。",
			},
			boundedHeights: {
				title: "动态高度缓存可控",
				desc: "estimatedItemHeight、按需测量和 heightCacheLimit 让不可预测内容可测量，同时避免缓存无限增长。",
			},
			productScrollUx: {
				title: "产品级滚动体验内置",
				desc: "自定义轨道、锚点变更、followOutput、吸顶分组和无障碍 props 都是公开 API。",
			},
		},
		comparisonMatrixTitle: "同场景能力矩阵",
		comparisonSourceTitle: "数据来源",
		comparisonHeaders: {
			library: "组件库",
			score: "评分",
			bundle: "体积",
			basis: "依据",
			criterion: "指标",
			weight: "权重",
		},
		comparisonSupportLabels: {
			full: "内置",
			documented: "文档支持",
			partial: "部分支持",
			app: "业务实现",
		},
		comparisonLibraries: {
			"better-scrollbar": {
				bundleLabel: "JS gzip 11.2 kB（+ CSS 0.4 kB）",
				scoreBasis: "内置 props 覆盖本站展示的 1 亿动态行场景。",
				source: "本地 Vite 组件库构建",
			},
			virtuoso: {
				bundleLabel: "gzip 18.6 kB",
				scoreBasis: "开箱即用能力强，覆盖消息列表、分组列表等场景。",
				source: "Bundlephobia API",
			},
			tanstack: {
				bundleLabel: "gzip 7.2 kB",
				scoreBasis: "Headless virtualizer，文档覆盖测量和直接 DOM 更新选项。",
				source: "Bundlephobia API",
			},
			"react-virtualized": {
				bundleLabel: "gzip 27.2 kB",
				scoreBasis: "老牌组件覆盖面广，但动态尺寸依赖 CellMeasurer 缓存约束。",
				source: "Bundlephobia API",
			},
			"react-window": {
				bundleLabel: "gzip 6.5 kB",
				scoreBasis: "非常轻量的列表原语；复杂动态高度和产品体验能力主要由业务侧实现。",
				source: "Bundlephobia API",
			},
		},
		comparisonCriteria: {
			massiveRange: { label: "超大逻辑滚动范围映射" },
			dynamicMeasurement: { label: "动态行高测量" },
			boundedCache: { label: "有界高度缓存" },
			anchoredMutation: { label: "插入与追加时锚点稳定" },
			customScrollbar: { label: "自定义滚动条插槽" },
			stickyAccessibility: { label: "吸顶分组与无障碍 props" },
		},
		comparisonSources: {
			localBuild: { detail: "better-scrollbar 体积来自当前仓库 pnpm run build 后，对 dist/ScrollBar.min.js 与 dist/ScrollBar.min.css 的 gzip 计算。" },
			bundlephobia: { detail: "竞品 gzip 体积来自 Bundlephobia API：react-window 2.2.7、@tanstack/react-virtual 3.14.3、react-virtuoso 4.18.7、react-virtualized 9.22.6。" },
			tanstackDocs: { detail: "能力判断参考其 measureElement 与 virtualizer options 官方文档。" },
			virtuosoDocs: { detail: "能力判断参考其动态高度、分组、消息列表以及 table/grid 官方说明。" },
			reactWindowGuide: { detail: "能力判断参考 FixedSizeList 与 VariableSizeList 的公开说明。" },
			reactVirtualizedCellMeasurer: { detail: "动态高度限制参考官方 CellMeasurer 缓存文档。" },
		},
		playgroundTitle: "场景实验台",
		playgroundDesc:
			"在同一份 1 亿行数据上组合预设和 props，下方就是实际组件工作流。",
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
				desc: "面对 1 亿行不可预测高度，按需测量并回填高度缓存。",
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
}

export function getHomeCopy(locale: LocaleMode) {
	return HOME_COPY[locale]
}
