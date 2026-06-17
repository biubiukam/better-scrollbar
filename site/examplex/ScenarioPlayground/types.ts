export type ScenarioPresetId =
	| "baseline"
	| "dynamic"
	| "fast"
	| "chat"
	| "grouped"
	| "drag"
	| "styled"

export type HeightMode = "fixed" | "dynamic"
export type AccessibilityMode = "none" | "list" | "grid"
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
	accessibilityMode: AccessibilityMode
	styleMode: StyleMode
	dragEnabled: boolean
	maxBrowserScrollHeight: number
}

export interface ScenarioPreset {
	id: ScenarioPresetId
	label: string
	description: string
	config: ScenarioConfig
}
