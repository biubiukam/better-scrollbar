export interface VirtualHeightIndexOptions {
	itemCount: number
	estimatedItemHeight: number
	measuredHeights?: Map<number, number>
}

export interface VirtualRangeOptions {
	scrollOffset: number
	viewportSize: number
	overscan: number | VirtualOverscanRange
}

export interface VirtualRangeResult {
	scrollHeight: number
	start: number
	end: number
	visibleStartIndex: number
	visibleEndIndex: number
	offset: number
}

export interface VirtualHeightIndex {
	totalHeight: number
	getOffset: (index: number) => number
	getRange: (options: VirtualRangeOptions) => VirtualRangeResult
}

export interface VirtualOverscanRange {
	before: number
	after: number
}

function upperBound(values: number[], target: number) {
	let left = 0
	let right = values.length

	while (left < right) {
		const middle = Math.floor((left + right) / 2)
		if (values[middle] < target) {
			left = middle + 1
		} else {
			right = middle
		}
	}

	return left
}

export function createVirtualHeightIndex({
	itemCount,
	estimatedItemHeight,
	measuredHeights = new Map<number, number>()
}: VirtualHeightIndexOptions): VirtualHeightIndex {
	const count = Math.max(Math.floor(itemCount), 0)
	const estimatedHeight = Math.max(estimatedItemHeight, 1)
	const measuredIndexes: number[] = []
	const prefixDeltas: number[] = [0]
	let currentDelta = 0

	Array.from(measuredHeights.entries())
		.filter(([index, height]) => {
			return Number.isInteger(index) && index >= 0 && index < count && Number.isFinite(height) && height > 0
		})
		.sort(([indexA], [indexB]) => indexA - indexB)
		.forEach(([index, height]) => {
			measuredIndexes.push(index)
			currentDelta += height - estimatedHeight
			prefixDeltas.push(currentDelta)
		})

	const getMeasuredDeltaBefore = (index: number) => {
		const measuredCountBeforeIndex = upperBound(measuredIndexes, index)
		return prefixDeltas[measuredCountBeforeIndex]
	}

	const getOffset = (index: number) => {
		const safeIndex = Math.max(Math.min(Math.floor(index), count), 0)
		return safeIndex * estimatedHeight + getMeasuredDeltaBefore(safeIndex)
	}

	const totalHeight = getOffset(count)

	const findIndex = (offset: number) => {
		if (count === 0) {
			return -1
		}

		const targetOffset = Math.max(Math.min(offset, Math.max(totalHeight - 1, 0)), 0)
		let left = 0
		let right = count - 1
		let result = 0

		while (left <= right) {
			const middle = Math.floor((left + right) / 2)
			if (getOffset(middle + 1) > targetOffset) {
				result = middle
				right = middle - 1
			} else {
				left = middle + 1
			}
		}

		return result
	}

	const getRange = ({scrollOffset, viewportSize, overscan}: VirtualRangeOptions): VirtualRangeResult => {
		if (count === 0) {
			return {
				scrollHeight: totalHeight,
				start: 0,
				end: -1,
				visibleStartIndex: 0,
				visibleEndIndex: -1,
				offset: 0
			}
		}

		const safeViewportSize = Math.max(viewportSize, 0)
		const safeOverscan = typeof overscan === "number"
			? {
				before: Math.max(Math.floor(overscan), 0),
				after: Math.max(Math.floor(overscan), 0),
			}
			: {
				before: Math.max(Math.floor(overscan.before), 0),
				after: Math.max(Math.floor(overscan.after), 0),
			}
		const visibleStartIndex = findIndex(scrollOffset)
		const visibleEndOffset = safeViewportSize > 0
			? scrollOffset + safeViewportSize - 1
			: scrollOffset
		const visibleEndIndex = findIndex(visibleEndOffset)
		const start = Math.max(visibleStartIndex - safeOverscan.before, 0)
		const end = Math.min(visibleEndIndex + safeOverscan.after, count - 1)

		return {
			scrollHeight: totalHeight,
			start,
			end,
			visibleStartIndex,
			visibleEndIndex,
			offset: getOffset(start)
		}
	}

	return {
		totalHeight,
		getOffset,
		getRange
	}
}
