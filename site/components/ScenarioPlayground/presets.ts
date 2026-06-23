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
	styleMode: "standard",
	dragEnabled: false,
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
	{
		id: "baseline",
		config: BASE_SCENARIO_CONFIG
	},
	{
		id: "dynamic",
		config: {
			...BASE_SCENARIO_CONFIG,
			heightMode: "dynamic",
			overscan: 6
		}
	},
	{
		id: "fast",
		config: {
			...BASE_SCENARIO_CONFIG,
			overscan: 2,
			adaptiveOverscan: true,
			scrollSeek: true
		}
	},
	{
		id: "chat",
		config: {
			...BASE_SCENARIO_CONFIG,
			followOutput: true,
			maintainVisibleContentPosition: true
		}
	},
	{
		id: "grouped",
		config: {
			...BASE_SCENARIO_CONFIG,
			grouped: true,
		}
	},
	{
		id: "drag",
		config: {
			...BASE_SCENARIO_CONFIG,
			dragEnabled: true,
			overscan: 4
		}
	},
	{
		id: "styled",
		config: {
			...BASE_SCENARIO_CONFIG,
			styleMode: "custom"
		}
	}
]

export function getScenarioPreset(id: ScenarioPreset["id"]) {
	return SCENARIO_PRESETS.find((preset) => preset.id === id) ?? SCENARIO_PRESETS[0]
}
