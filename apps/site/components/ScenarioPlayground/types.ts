export type ScenarioPresetId =
	| "baseline"
	| "dynamic"
	| "fast"
	| "chat"
	| "grouped"
	| "drag"
	| "styled"

export type HeightMode = "fixed" | "dynamic"
export type StyleMode = "standard" | "custom"

export interface ScenarioConfig {
	heightMode: HeightMode
	overscan: number
	overscanPixels: number
	adaptiveOverscan: boolean
	scrollSeek: boolean
	maintainVisibleContentPosition: boolean
	followOutput: boolean
	grouped: boolean
	styleMode: StyleMode
	dragEnabled: boolean
}

export interface ScenarioPreset {
	id: ScenarioPresetId
	config: ScenarioConfig
}
