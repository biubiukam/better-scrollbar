/**
 * Derives sticky group header indexes from an array of group sizes.
 * Each group contributes one header at the start, followed by groupCount items.
 *
 * @example
 * // 3 groups with 4, 2, 3 items each → headers at [0, 5, 8]
 * getStickyIndicesFromGroups([4, 2, 3])
 */
export function getStickyIndicesFromGroups(groupCounts: number[]): number[] {
	if (!groupCounts.length) {
		return []
	}

	const stickyIndexes: number[] = []
	let nextGroupHeaderIndex = 0

	for (const groupCount of groupCounts) {
		stickyIndexes.push(nextGroupHeaderIndex)
		nextGroupHeaderIndex += Math.max(Math.floor(groupCount), 0) + 1
	}

	return stickyIndexes
}
