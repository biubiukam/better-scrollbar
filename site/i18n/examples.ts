import type { ScenarioPresetId } from "../components/ScenarioPlayground/types"

type SiteLocaleMode = "en" | "zh"

export interface ExampleCopy {
	jumpPoints: string[]
	shared: {
		idle: string
		scrolling: string
		rows: string
		visible: string
		rendered: string
		total: string
		totalRows: string
		visibleRange: string
		height: string
		y: string
		yOffset: string
		fps: string
		quickLocate: string
	}
	cases: {
		massiveRange: {
			title: string
			desc: string
			proofLabel: string
		}
		dynamicMeasurement: {
			title: string
			desc: string
			proofLabel: string
			jumpMiddle: string
		}
		anchorMutation: {
			title: string
			desc: string
			proofLabel: string
			jumpMiddle: string
			prepend: string
			history: string
			batch: (index: number) => string
			anchor: string
		}
		groupedProductShell: {
			title: string
				desc: string
				proofLabel: string
				jumpGroup: string
				group: (index: number) => string
			items: (count: number) => string
			sticky: string
			grid: string
		}
	}
	scenarioDemos: {
		agent: {
			title: string
			subtitle: string
			actions: {
				scrollTop: string
				scrollBottom: string
				triggerAgent: string
				triggerAgentLoading: string
			}
			metrics: {
				messages: string
				anchors: string
				follow: string
			}
			rows: {
				user: string
				assistant: string
				tool: string
				toolResponse: string
				context: string
					code: string
					thinking: string
					thinkingDetails: string
					thinkingCollapse: string
					thinkingExpand: string
					toolInput: string
					toolOutput: string
					token: string
			}
			logs: {
				initial: string
				simulating: string
				simulated: string
				top: string
				bottom: string
			}
		}
		audit: {
			title: string
			subtitle: string
			actions: {
				jumpRisk: string
				jumpMiddle: string
				jumpLatest: string
				switchNative: string
				switchControlled: string
			}
			metrics: {
				rows: string
				mode: string
			}
			rows: {
				ledger: string
				transfer: string
				settlement: string
				risk: string
				cleared: string
			}
			logs: {
				initial: string
				risk: string
				middle: string
				latest: string
				native: string
				controlled: string
			}
		}
		media: {
			title: string
			subtitle: string
			actions: {
				switchQuery: string
				fastScroll: string
				toggleDensity: string
				resetView: string
			}
			metrics: {
				query: string
				seek: string
			}
			rows: {
				asset: string
				collection: string
				heavy: string
				preview: string
				scrolling: string
			}
			logs: {
				initial: string
				query: string
				density: string
				fastScroll: string
				reset: string
			}
		}
		rules: {
			title: string
			subtitle: string
			actions: {
				enqueue: string
				promote: string
				pause: string
				reset: string
			}
			metrics: {
				queue: string
				draggable: string
			}
			rows: {
				rule: string
				segment: string
				running: string
				waiting: string
				paused: string
			}
			logs: {
				initial: string
				enqueued: string
				promoted: string
				paused: string
				reset: string
				reordered: string
			}
		}
	}
	scenario: {
		kicker: string
		title: string
		desc: string
		baseRows: string
		controlsLabel: string
		presets: Record<ScenarioPresetId, {
			label: string
			description: string
		}>
			fields: {
				heightMode: string
				overscanPixels: string
				styleMode: string
				physicalScrollRange: string
			}
		heightOptions: {
			fixed: string
			dynamic: string
		}
			styleOptions: {
			standard: string
			custom: string
		}
		toggles: {
			adaptiveOverscan: string
			scrollSeek: string
			maintainVisibleContentPosition: string
			followOutput: string
			grouped: string
			dragEnabled: string
		}
		actions: {
			jumpTo: (label: string) => string
			fastScroll: string
			prependRowsLabel: string
			prependRowsAria: string
			appendRowsLabel: string
			appendRowsAria: string
			deleteVisibleRow: string
			resetMutations: string
		}
		metrics: {
			total: string
			visible: string
			rendered: string
			y: string
			fps: string
		}
		panels: {
			propsSnapshot: string
			eventLog: string
		}
		rows: {
			group: (index: number) => string
			rows: string
			sticky: string
			history: string
			prependedBatch: (index: number) => string
			anchor: string
			order: (index: number) => string
			scrolling: string
		}
			logs: {
			initial: string
			switchPreset: (label: string) => string
			jumpTo: (label: string) => string
			fastScroll: string
			prependRows: string
			appendRows: string
			deleteVisibleRow: (index: string) => string
			resetMutations: string
			dragSort: string
		}
	}
}

export const EXAMPLE_COPY: Record<SiteLocaleMode, ExampleCopy> = {
	en: {
		jumpPoints: ["Start", "25%", "Middle", "75%", "End"],
		shared: {
			idle: "Idle",
			scrolling: "Scrolling",
			rows: "rows",
			visible: "Visible",
			rendered: "Rendered",
			total: "Total",
			totalRows: "Total rows",
			visibleRange: "Visible range",
			height: "Height",
			y: "Y",
			yOffset: "Y offset",
			fps: "FPS",
			quickLocate: "Quick locate",
		},
		cases: {
			massiveRange: {
				title: "100M row range",
				desc: "Describe indexes without allocating children.",
				proofLabel: "indexed rows",
			},
			dynamicMeasurement: {
				title: "Dynamic height measurement",
				desc: "Estimate first, then backfill from real DOM.",
				proofLabel: "cache cap",
				jumpMiddle: "Jump to middle",
			},
			anchorMutation: {
				title: "Anchored mutation",
				desc: "Change data without moving the reader.",
				proofLabel: "prepended",
				jumpMiddle: "Jump to middle",
				prepend: "Insert 20",
				history: "History",
				batch: (index) => `Batch ${index}`,
				anchor: "anchor",
			},
			groupedProductShell: {
				title: "Grouped product shell",
					desc: "Sticky rows, ARIA and scrollbar styling work together.",
					proofLabel: "groups",
					jumpGroup: "Jump across groups",
					group: (index) => `Group ${index}`,
				items: (count) => `${count} items`,
				sticky: "sticky",
				grid: "grid",
			},
		},
			scenarioDemos: {
			agent: {
				title: "Agent conversation / AI tool call flow",
				subtitle: "A six-message incident conversation with one-click simulation, collapsible thinking, structured tools and forced bottom following.",
				actions: {
					scrollTop: "Scroll top",
					scrollBottom: "Scroll bottom",
					triggerAgent: "Trigger Agent chat",
					triggerAgentLoading: "Agent running",
				},
				metrics: {
					messages: "Messages",
					anchors: "Anchor",
					follow: "Follow",
				},
				rows: {
					user: "User",
					assistant: "Assistant",
					tool: "Tool call",
					toolResponse: "Tool response",
					context: "Context",
						code: "Code block",
						thinking: "Thinking",
						thinkingDetails: "Reading trace samples, deployment diffs, retry-policy changes, payment authorization spans, user impact notes and rollback thresholds before writing a safe recommendation.",
						thinkingCollapse: "Collapse",
						thinkingExpand: "Expand",
						toolInput: "Tool input",
						toolOutput: "Tool output",
						token: "tokens",
				},
				logs: {
					initial: "6-message agent stream initialized",
					simulating: "Simulating agent conversation",
					simulated: "Complete agent conversation simulated",
					top: "Scrolled to the first message",
					bottom: "Scrolled to latest output",
				},
			},
			audit: {
				title: "Audit log / transaction explorer",
				subtitle: "100M indexed records, exact jumps and native or controlled scroll mode.",
				actions: {
					jumpRisk: "Jump risk",
					jumpMiddle: "Jump middle",
					jumpLatest: "Jump latest",
					switchNative: "Switch native",
					switchControlled: "Switch controlled",
				},
				metrics: {
					rows: "Indexed rows",
					mode: "Scroll mode",
				},
				rows: {
					ledger: "Ledger",
					transfer: "Transfer",
					settlement: "Settlement",
					risk: "Risk review",
					cleared: "Cleared",
				},
				logs: {
					initial: "100M audit index ready",
					risk: "Located high-risk transaction",
					middle: "Jumped to middle ledger range",
					latest: "Jumped to latest settlement range",
					native: "scrollMode: native",
					controlled: "scrollMode: controlled",
				},
			},
			media: {
				title: "Rich media library / search results",
				subtitle: "scrollSeek, adaptive overscan and expensive preview rows keep heavy result browsing responsive.",
				actions: {
					switchQuery: "Switch query",
					fastScroll: "Fast scroll",
					toggleDensity: "Toggle density",
					resetView: "Reset view",
				},
				metrics: {
					query: "Query",
					seek: "Seek",
				},
				rows: {
					asset: "Asset",
					collection: "Collection",
					heavy: "heavy row",
					preview: "preview",
					scrolling: "Loading preview...",
				},
				logs: {
					initial: "Media result stream ready",
					query: "Search query switched",
					density: "Result density toggled",
					fastScroll: "Fast result scan simulated",
					reset: "Search surface reset",
				},
			},
			rules: {
				title: "Automation rules / task queue sorting",
				subtitle: "Virtual rows keep drag sorting, row status and queue operations interactive inside the visible range.",
				actions: {
					enqueue: "Enqueue",
					promote: "Promote priority",
					pause: "Pause batch",
					reset: "Reset queue",
				},
				metrics: {
					queue: "Queue",
					draggable: "Drag",
				},
				rows: {
					rule: "Rule",
					segment: "Segment",
					running: "Running",
					waiting: "Waiting",
					paused: "Paused",
				},
				logs: {
					initial: "Rule queue mounted",
					enqueued: "New task enqueued",
					promoted: "Visible priority promoted",
					paused: "Visible batch paused",
					reset: "Queue reset",
					reordered: "Visible window reordered",
				},
			},
		},
		scenario: {
			kicker: "All-in-one props playground",
			title: "100M virtual list playground",
			desc: "Combine scenario presets and form props to inspect range, scroll and interaction behavior on the same 100M row dataset.",
			baseRows: "Base rows",
			controlsLabel: "Scenario controls",
			presets: {
				baseline: {
					label: "Base list",
					description: "Fixed heights and basic overscan show the default cost of indexed rendering at 100M rows.",
				},
				dynamic: {
					label: "Dynamic height",
					description: "Measure visible row heights and validate how estimates plus cache backfill affect scroll stability.",
				},
				fast: {
					label: "Fast scroll",
					description: "Adaptive overscan and scroll placeholders expose range stability and blank-space risk under high velocity.",
				},
				chat: {
					label: "Chat append",
					description: "Bottom following and anchored positioning simulate history inserts and new message appends.",
				},
				grouped: {
					label: "Grouped grid",
					description: "groupCounts, grid ARIA and a safe physical scroll height validate massive table semantics.",
				},
				drag: {
					label: "Drag sorting",
					description: "Drag only the current visible window to verify virtual rows and row interactions can coexist.",
				},
				styled: {
					label: "Custom scrollbar",
					description: "Custom view and scrollbar styling show lightweight progress-driven visual updates.",
				},
			},
				fields: {
					heightMode: "Height mode",
					overscanPixels: "Pixel overscan",
					styleMode: "Style mode",
					physicalScrollRange: "Physical scroll range",
				},
			heightOptions: {
				fixed: "Fixed height",
				dynamic: "Dynamic height",
			},
				styleOptions: {
				standard: "Standard",
				custom: "Custom scrollbar",
			},
			toggles: {
				adaptiveOverscan: "Adaptive overscan",
				scrollSeek: "Scroll placeholder",
				maintainVisibleContentPosition: "Keep anchor",
				followOutput: "Follow bottom",
				grouped: "Sticky groups",
				dragEnabled: "Window drag",
			},
			actions: {
				jumpTo: (label) => `Jump to ${label}`,
				fastScroll: "Fast scroll",
				prependRowsLabel: "Insert 20",
				prependRowsAria: "Insert 20 above",
				appendRowsLabel: "Append 100",
				appendRowsAria: "Append 100 at bottom",
				deleteVisibleRow: "Delete first row",
				resetMutations: "Reset changes",
			},
			metrics: {
				total: "Total",
				visible: "Visible",
				rendered: "Rendered",
				y: "Y",
				fps: "FPS",
			},
			panels: {
				propsSnapshot: "Current props snapshot",
				eventLog: "Event log",
			},
			rows: {
				group: (index) => `Group ${index}`,
				rows: "rows",
				sticky: "sticky",
				history: "History",
				prependedBatch: (index) => `Prepended batch ${index}`,
				anchor: "anchor",
				order: (index) => `Order ${index}`,
				scrolling: "Scrolling...",
			},
				logs: {
				initial: "Loaded base list preset",
				switchPreset: (label) => `Switched preset: ${label}`,
				jumpTo: (label) => `Jumped to ${label}`,
				fastScroll: "Fast downward scroll stress test",
				prependRows: "Inserted 20 rows above",
				appendRows: "Appended 100 rows at bottom",
				deleteVisibleRow: (index) => `Deleted first visible row #${index}`,
				resetMutations: "Reset data changes",
				dragSort: "Sorted visible window by drag",
			},
		},
	},
	zh: {
		jumpPoints: ["起点", "25%", "中段", "75%", "末尾"],
		shared: {
			idle: "Idle",
			scrolling: "Scrolling",
			rows: "rows",
			visible: "Visible",
			rendered: "Rendered",
			total: "Total",
			totalRows: "总行数",
			visibleRange: "可见范围",
			height: "Height",
			y: "Y",
			yOffset: "Y 偏移",
			fps: "FPS",
			quickLocate: "快速定位",
		},
		cases: {
			massiveRange: {
				title: "1 亿行 Range",
				desc: "只描述索引，不分配 children。",
				proofLabel: "索引行数",
			},
			dynamicMeasurement: {
				title: "动态高度测量",
				desc: "先估算，再用真实 DOM 回填。",
				proofLabel: "cache cap",
				jumpMiddle: "跳到中段",
			},
			anchorMutation: {
				title: "锚点稳定变更",
				desc: "变更数据，不移动读者。",
				proofLabel: "prepended",
				jumpMiddle: "跳到中段",
				prepend: "插入 20",
				history: "History",
				batch: (index) => `Batch ${index}`,
				anchor: "anchor",
			},
			groupedProductShell: {
				title: "分组产品壳",
					desc: "吸顶、ARIA、滚动条外观同场工作。",
					proofLabel: "groups",
					jumpGroup: "跨组跳转",
					group: (index) => `Group ${index}`,
				items: (count) => `${count} items`,
				sticky: "sticky",
				grid: "grid",
			},
		},
			scenarioDemos: {
			agent: {
				title: "Agent 对话 / AI 工具调用流",
				subtitle: "6 条真实 Agent 事故会话，支持一键模拟、可折叠思考、结构化工具调用和强制底部跟随。",
				actions: {
					scrollTop: "滚动到顶部",
					scrollBottom: "滚动到底部",
					triggerAgent: "触发 Agent 对话",
					triggerAgentLoading: "Agent 对话执行中",
				},
				metrics: {
					messages: "消息",
					anchors: "锚点",
					follow: "跟随",
				},
				rows: {
					user: "用户",
					assistant: "助手",
					tool: "工具调用",
					toolResponse: "工具响应",
					context: "上下文",
						code: "代码块",
						thinking: "思考中",
						thinkingDetails: "正在读取追踪样本、部署差异、重试策略变更、支付授权热点、用户影响面和回滚阈值，再把可验证证据整理成安全建议。",
						thinkingCollapse: "收起",
						thinkingExpand: "展开",
						toolInput: "工具输入",
						toolOutput: "工具输出",
						token: "tokens",
				},
				logs: {
					initial: "6 条 Agent 流已初始化",
					simulating: "正在模拟 Agent 对话",
					simulated: "完整 Agent 对话已模拟",
					top: "已滚动到第一条消息",
					bottom: "已滚动到最新输出",
				},
			},
			audit: {
				title: "审计日志 / 交易流水查询器",
				subtitle: "1 亿条 indexed records、精确跳转，并可切换 native 或 controlled 滚动。",
				actions: {
					jumpRisk: "跳到高风险",
					jumpMiddle: "跳到中段",
					jumpLatest: "跳到最新",
					switchNative: "切换 native",
					switchControlled: "切换 controlled",
				},
				metrics: {
					rows: "索引行数",
					mode: "滚动模式",
				},
				rows: {
					ledger: "账本",
					transfer: "转账",
					settlement: "清结算",
					risk: "风控复核",
					cleared: "已核验",
				},
				logs: {
					initial: "1 亿审计索引已就绪",
					risk: "已定位高风险交易",
					middle: "已跳转到中段流水",
					latest: "已跳转到最新清结算",
					native: "scrollMode: native",
					controlled: "scrollMode: controlled",
				},
			},
			media: {
				title: "富媒体素材库 / 搜索结果流",
				subtitle: "用 scrollSeek、自适应 overscan 和重行渲染优化，支撑图片预览密集的搜索结果流。",
				actions: {
					switchQuery: "切换搜索词",
					fastScroll: "快速滚动",
					toggleDensity: "切换密度",
					resetView: "重置视图",
				},
				metrics: {
					query: "搜索词",
					seek: "Seek",
				},
				rows: {
					asset: "素材",
					collection: "合集",
					heavy: "重行渲染",
					preview: "预览",
					scrolling: "预览加载中...",
				},
				logs: {
					initial: "素材结果流已就绪",
					query: "搜索词已切换",
					density: "结果密度已切换",
					fastScroll: "已模拟快速浏览",
					reset: "搜索界面已重置",
				},
			},
			rules: {
				title: "自动化规则编排 / 任务队列排序",
				subtitle: "在虚拟列表的可见窗口内承载拖拽排序、行状态和任务队列操作。",
				actions: {
					enqueue: "追加任务",
					promote: "提升优先级",
					pause: "暂停批次",
					reset: "重置队列",
				},
				metrics: {
					queue: "队列",
					draggable: "拖拽",
				},
				rows: {
					rule: "规则",
					segment: "分段",
					running: "执行中",
					waiting: "等待中",
					paused: "已暂停",
				},
				logs: {
					initial: "规则队列已挂载",
					enqueued: "新任务已入队",
					promoted: "可见优先级已提升",
					paused: "可见批次已暂停",
					reset: "队列已重置",
					reordered: "可见窗口已重排",
				},
			},
		},
		scenario: {
			kicker: "All-in-one props playground",
			title: "1 亿行虚拟列表实验台",
			desc: "通过场景预设和表单组合 props，观察同一份 1 亿行数据在不同虚拟滚动策略下的区间、滚动和交互表现。",
			baseRows: "Base rows",
			controlsLabel: "场景配置",
			presets: {
				baseline: {
					label: "基础大列表",
					description: "固定高度、基础 overscan，观察 1 亿行 indexed rendering 的默认成本。",
				},
				dynamic: {
					label: "动态高度",
					description: "按可见行测量真实高度，验证估算高度和缓存回填对滚动稳定性的影响。",
				},
				fast: {
					label: "快速滚动",
					description: "启用自适应 overscan 与滚动占位，观察高速滚动下区间稳定性和空白风险。",
				},
				chat: {
					label: "聊天追加",
					description: "开启底部跟随和锚点保持，模拟历史消息插入与新消息追加。",
				},
				grouped: {
					label: "分组表格",
					description: "启用 groupCounts、grid ARIA 和安全物理滚动高度，验证超大表格语义。",
				},
				drag: {
					label: "拖拽排序",
					description: "只在当前可见窗口内拖拽排序，验证虚拟列表与行交互并存。",
				},
				styled: {
					label: "自定义滚动条",
					description: "自定义滚动容器和滚动条样式，观察进度驱动的轻量样式变化。",
				},
			},
				fields: {
					heightMode: "高度策略",
					overscanPixels: "像素 overscan",
					styleMode: "样式模式",
					physicalScrollRange: "物理滚动范围",
				},
			heightOptions: {
				fixed: "固定高度",
				dynamic: "动态高度",
			},
				styleOptions: {
				standard: "标准",
				custom: "自定义滚动条",
			},
			toggles: {
				adaptiveOverscan: "自适应 overscan",
				scrollSeek: "滚动占位",
				maintainVisibleContentPosition: "锚点保持",
				followOutput: "底部跟随",
				grouped: "吸顶分组",
				dragEnabled: "窗口拖拽",
			},
			actions: {
				jumpTo: (label) => `跳到${label}`,
				fastScroll: "快速下滚",
				prependRowsLabel: "插入 20",
				prependRowsAria: "上方插入 20 条",
				appendRowsLabel: "追加 100",
				appendRowsAria: "底部追加 100 条",
				deleteVisibleRow: "删除首行",
				resetMutations: "重置变更",
			},
			metrics: {
				total: "Total",
				visible: "Visible",
				rendered: "Rendered",
				y: "Y",
				fps: "FPS",
			},
			panels: {
				propsSnapshot: "当前 props 快照",
				eventLog: "事件日志",
			},
			rows: {
				group: (index) => `Group ${index}`,
				rows: "rows",
				sticky: "sticky",
				history: "History",
				prependedBatch: (index) => `Prepended batch ${index}`,
				anchor: "anchor",
				order: (index) => `Order ${index}`,
				scrolling: "Scrolling...",
			},
				logs: {
				initial: "加载基础大列表预设",
				switchPreset: (label) => `切换预设：${label}`,
				jumpTo: (label) => `跳转到 ${label}`,
				fastScroll: "快速下滚压力测试",
				prependRows: "上方插入 20 条",
				appendRows: "底部追加 100 条",
				deleteVisibleRow: (index) => `删除可见首行 #${index}`,
				resetMutations: "重置数据变更",
				dragSort: "窗口内拖拽排序",
			},
		},
	},
}

export const DEFAULT_EXAMPLE_COPY = EXAMPLE_COPY.zh
