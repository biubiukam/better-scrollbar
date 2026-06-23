import { unref } from "vue"
import type { MaybeRef } from "../types"

export function resolveValue<T>(value: MaybeRef<T>): T {
	return unref(value)
}

export function resolveNumber(value: MaybeRef<number | undefined>, fallback: number) {
	const resolved = resolveValue(value)

	if (typeof resolved !== "number" || !Number.isFinite(resolved)) {
		return fallback
	}

	return resolved
}
