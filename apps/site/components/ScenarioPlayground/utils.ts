import {
	ESTIMATED_MILLION_ROW_HEIGHT,
	FIXED_MILLION_ROW_HEIGHT,
	MILLION_ROW_COUNT
} from "../ExampleSupport/sharedMillion"
import type { ScenarioConfig } from "./types"

export const SCENARIO_GROUP_BLOCK_SIZE = 100_000
export const SCENARIO_GROUP_COUNT = MILLION_ROW_COUNT / SCENARIO_GROUP_BLOCK_SIZE
export const SCENARIO_GROUP_ITEM_COUNT = SCENARIO_GROUP_BLOCK_SIZE - 1

export function getScenarioGroupCounts() {
	return Array.from({ length: SCENARIO_GROUP_COUNT }, () => SCENARIO_GROUP_ITEM_COUNT)
}

export function getScenarioEstimatedHeight(config: ScenarioConfig) {
	return config.heightMode === "dynamic" ? ESTIMATED_MILLION_ROW_HEIGHT : FIXED_MILLION_ROW_HEIGHT
}

export function getScenarioPropsSnapshot(config: ScenarioConfig, itemCount: number) {
	return [
		`itemCount: ${itemCount.toLocaleString()}`,
		`heightMode: ${config.heightMode}`,
		`estimatedItemHeight: ${getScenarioEstimatedHeight(config)}`,
		`overscan: ${config.overscan}${config.overscanPixels ? ` (pixels: ${config.overscanPixels})` : ""}${config.adaptiveOverscan ? " (adaptive)" : ""}`,
		`scrollSeek: ${config.scrollSeek ? "enabled" : "disabled"}`,
		`maintainVisibleContentPosition: ${config.maintainVisibleContentPosition ? "enabled" : "disabled"}`,
		`followOutput: ${config.followOutput ? "enabled" : "disabled"}`,
		`stickyIndices: ${config.grouped ? "enabled" : "disabled"}`,
		`styleMode: ${config.styleMode}`,
		`dragEnabled: ${config.dragEnabled ? "enabled" : "disabled"}`
	]
}

export function getBoundedOverscan(value: number) {
	if (!Number.isFinite(value)) {
		return 4
	}

	return Math.min(Math.max(Math.round(value), 0), 40)
}

export function getBoundedOverscanPixels(value: number) {
	if (!Number.isFinite(value)) {
		return 0
	}

	return Math.min(Math.max(Math.round(value), 0), 600)
}
