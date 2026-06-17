import type { ScenarioConfig, ScenarioPreset } from "./types"

export const BASE_SCENARIO_CONFIG: ScenarioConfig = {
	heightMode: "fixed",
	overscan: 4,
	overscanPixels: 0,
	adaptiveOverscan: false,
	scrollSeek: false,
	maintainVisibleContentPosition: true,
	followOutput: false,
	grouped: false,
	accessibilityMode: "none",
	styleMode: "standard",
	dragEnabled: false,
	maxBrowserScrollHeight: 1_200_000
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
	{
		id: "baseline",
		label: "基础大列表",
		description: "固定高度、基础 overscan，观察 5000 万行 indexed rendering 的默认成本。",
		config: BASE_SCENARIO_CONFIG
	},
	{
		id: "dynamic",
		label: "动态高度",
		description: "按可见 DOM 测量真实高度，验证估算高度和缓存回填对滚动稳定性的影响。",
		config: {
			...BASE_SCENARIO_CONFIG,
			heightMode: "dynamic",
			overscan: 6
		}
	},
	{
		id: "fast",
		label: "快速滚动",
		description: "启用自适应 overscan 与滚动占位，观察高速滚动下 DOM 数和空白风险。",
		config: {
			...BASE_SCENARIO_CONFIG,
			overscan: 2,
			adaptiveOverscan: true,
			scrollSeek: true
		}
	},
	{
		id: "chat",
		label: "聊天追加",
		description: "开启底部跟随和锚点保持，模拟历史消息插入与新消息追加。",
		config: {
			...BASE_SCENARIO_CONFIG,
			followOutput: true,
			maintainVisibleContentPosition: true
		}
	},
	{
		id: "grouped",
		label: "分组表格",
		description: "启用 groupCounts、grid ARIA 和安全物理滚动高度，验证超大表格语义。",
		config: {
			...BASE_SCENARIO_CONFIG,
			grouped: true,
			accessibilityMode: "grid",
			maxBrowserScrollHeight: 1_200_000
		}
	},
	{
		id: "drag",
		label: "拖拽排序",
		description: "只在当前可见窗口内拖拽排序，验证虚拟列表与行交互并存。",
		config: {
			...BASE_SCENARIO_CONFIG,
			dragEnabled: true,
			overscan: 4
		}
	},
	{
		id: "styled",
		label: "自定义滚动条",
		description: "自定义滚动容器和滚动条样式，观察进度驱动的轻量样式变化。",
		config: {
			...BASE_SCENARIO_CONFIG,
			styleMode: "custom"
		}
	}
]

export function getScenarioPreset(id: ScenarioPreset["id"]) {
	return SCENARIO_PRESETS.find((preset) => preset.id === id) ?? SCENARIO_PRESETS[0]
}
