export interface VirtualHeightIndexOptions {
	itemCount: number
	estimatedItemHeight: number
	measuredHeights?: Map<number, number>
	blockSize?: number
	maxMeasuredItems?: number
}

export interface VirtualRangeOptions {
	scrollOffset: number
	viewportSize: number
	overscan: number | VirtualOverscanRange
	overscanPixels?: number | VirtualOverscanRange
	maxItems?: number
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

export interface VirtualHeightIndexStore extends VirtualHeightIndex {
	setMeasuredHeight: (index: number, height: number) => VirtualHeightIndexStore
	deleteMeasuredHeight: (index: number) => VirtualHeightIndexStore
	reset: (options: VirtualHeightIndexOptions) => VirtualHeightIndexStore
}

export interface VirtualOverscanRange {
	before: number
	after: number
}

const DEFAULT_BLOCK_SIZE = 512

function normalizeMaxMeasuredItems(maxMeasuredItems: number | undefined) {
	if (maxMeasuredItems === undefined || maxMeasuredItems === Number.POSITIVE_INFINITY) {
		return Number.POSITIVE_INFINITY
	}

	if (!Number.isFinite(maxMeasuredItems)) {
		return Number.POSITIVE_INFINITY
	}

	return Math.max(Math.floor(maxMeasuredItems), 0)
}

function normalizeOverscanRange(overscan: number | VirtualOverscanRange) {
	return typeof overscan === "number"
		? {
				before: Math.max(Math.floor(overscan), 0),
				after: Math.max(Math.floor(overscan), 0)
			}
		: {
				before: Math.max(Math.floor(overscan.before), 0),
				after: Math.max(Math.floor(overscan.after), 0)
			}
}

function normalizeMaxItems(maxItems: number | undefined) {
	if (maxItems === undefined || !Number.isFinite(maxItems)) {
		return Number.POSITIVE_INFINITY
	}

	return Math.max(Math.floor(maxItems), 0)
}

class FenwickTree {
	private tree: number[]

	constructor(size: number) {
		this.tree = Array.from({ length: Math.max(size, 0) + 1 }, () => 0)
	}

	add(index: number, delta: number) {
		for (
			let nextIndex = index + 1;
			nextIndex < this.tree.length;
			nextIndex += nextIndex & -nextIndex
		) {
			this.tree[nextIndex] += delta
		}
	}

	sumBefore(index: number) {
		let sum = 0
		for (
			let nextIndex = Math.min(Math.max(index, 0), this.tree.length - 1);
			nextIndex > 0;
			nextIndex -= nextIndex & -nextIndex
		) {
			sum += this.tree[nextIndex]
		}
		return sum
	}
}

class BlockVirtualHeightIndex implements VirtualHeightIndexStore {
	totalHeight = 0

	private count = 0

	private estimatedHeight = 1

	private blockSize = DEFAULT_BLOCK_SIZE

	private maxMeasuredItems = Number.POSITIVE_INFINITY

	private measuredHeights = new Map<number, number>()

	private blocks = new Map<number, Map<number, number>>()

	private blockDeltas: FenwickTree | null = null

	constructor(options: VirtualHeightIndexOptions) {
		this.reset(options)
	}

	reset({
		itemCount,
		estimatedItemHeight,
		measuredHeights = new Map<number, number>(),
		blockSize = DEFAULT_BLOCK_SIZE,
		maxMeasuredItems
	}: VirtualHeightIndexOptions) {
		this.count = Math.max(Math.floor(itemCount), 0)
		this.estimatedHeight = Math.max(estimatedItemHeight, 1)
		this.blockSize = Math.max(Math.floor(blockSize), 1)
		this.maxMeasuredItems = normalizeMaxMeasuredItems(maxMeasuredItems)
		this.totalHeight = this.count * this.estimatedHeight
		this.measuredHeights = new Map()
		this.blocks = new Map()
		this.blockDeltas = null

		measuredHeights.forEach((height, index) => {
			this.setMeasuredHeight(index, height)
		})

		return this
	}

	setMeasuredHeight(index: number, height: number) {
		if (!this.isValidIndex(index) || !Number.isFinite(height) || height <= 0) {
			return this
		}

		const safeIndex = Math.floor(index)
		const previousHeight = this.measuredHeights.get(safeIndex)
		const previousDelta =
			previousHeight === undefined ? 0 : previousHeight - this.estimatedHeight
		const nextDelta = height - this.estimatedHeight
		const deltaChange = nextDelta - previousDelta
		if (deltaChange === 0 && previousHeight === height) {
			this.measuredHeights.delete(safeIndex)
			this.measuredHeights.set(safeIndex, height)
			return this
		}

		const blockIndex = this.getBlockIndex(safeIndex)
		let block = this.blocks.get(blockIndex)
		if (!block) {
			block = new Map()
			this.blocks.set(blockIndex, block)
		}

		this.measuredHeights.delete(safeIndex)
		this.measuredHeights.set(safeIndex, height)
		block.set(safeIndex, height)
		this.getBlockDeltas().add(blockIndex, deltaChange)
		this.totalHeight += deltaChange
		this.evictOverflowMeasuredHeights()

		return this
	}

	deleteMeasuredHeight(index: number) {
		if (!this.isValidIndex(index)) {
			return this
		}

		const safeIndex = Math.floor(index)
		const previousHeight = this.measuredHeights.get(safeIndex)
		if (previousHeight === undefined) {
			return this
		}

		this.removeMeasuredHeight(safeIndex, previousHeight)

		return this
	}

	getOffset = (index: number) => {
		const safeIndex = Math.max(Math.min(Math.floor(index), this.count), 0)
		if (this.isFixedHeight()) {
			return safeIndex * this.estimatedHeight
		}

		const blockIndex = this.getBlockIndex(safeIndex)
		/* v8 ignore next -- blockDeltas always exists when !isFixedHeight() */
		const previousBlockDelta = this.blockDeltas?.sumBefore(blockIndex) ?? 0
		const currentBlockDelta = this.getCurrentBlockDeltaBefore(blockIndex, safeIndex)

		return safeIndex * this.estimatedHeight + previousBlockDelta + currentBlockDelta
	}

	getRange = ({
		scrollOffset,
		viewportSize,
		overscan,
		overscanPixels,
		maxItems
	}: VirtualRangeOptions): VirtualRangeResult => {
		if (this.count === 0) {
			return {
				scrollHeight: this.totalHeight,
				start: 0,
				end: -1,
				visibleStartIndex: 0,
				visibleEndIndex: -1,
				offset: 0
			}
		}

		const safeViewportSize = Math.max(viewportSize, 0)
		const safeOverscan = normalizeOverscanRange(overscan)
		const safeOverscanPixels =
			overscanPixels === undefined ? null : normalizeOverscanRange(overscanPixels)
		if (this.isFixedHeight()) {
			return this.getFixedHeightRange({
				scrollOffset,
				safeViewportSize,
				safeOverscan,
				safeOverscanPixels,
				maxItems: normalizeMaxItems(maxItems)
			})
		}

		const visibleStartIndex = this.findIndex(scrollOffset)
		const visibleEndOffset =
			safeViewportSize > 0 ? scrollOffset + safeViewportSize - 1 : scrollOffset
		const visibleEndIndex = this.findIndex(visibleEndOffset)
		let start = Math.max(visibleStartIndex - safeOverscan.before, 0)
		let end = Math.min(visibleEndIndex + safeOverscan.after, this.count - 1)

		if (safeOverscanPixels) {
			start = Math.min(
				start,
				this.findIndex(Math.max(scrollOffset - safeOverscanPixels.before, 0))
			)
			end = Math.max(end, this.findIndex(visibleEndOffset + safeOverscanPixels.after))
		}

		const cappedRange = this.capRangeToMaxItems({
			start,
			end,
			visibleStartIndex,
			visibleEndIndex,
			maxItems: normalizeMaxItems(maxItems)
		})
		start = cappedRange.start
		end = cappedRange.end

		return {
			scrollHeight: this.totalHeight,
			start,
			end,
			visibleStartIndex,
			visibleEndIndex,
			offset: this.getOffset(start)
		}
	}

	private findIndex(offset: number) {
		const targetOffset = Math.max(Math.min(offset, Math.max(this.totalHeight - 1, 0)), 0)
		let left = 0
		let right = this.count - 1
		let result = 0

		while (left <= right) {
			const middle = Math.floor((left + right) / 2)
			if (this.getOffset(middle + 1) > targetOffset) {
				result = middle
				right = middle - 1
			} else {
				left = middle + 1
			}
		}

		return result
	}

	private getFixedHeightRange({
		scrollOffset,
		safeViewportSize,
		safeOverscan,
		safeOverscanPixels,
		maxItems
	}: {
		scrollOffset: number
		safeViewportSize: number
		safeOverscan: VirtualOverscanRange
		safeOverscanPixels: VirtualOverscanRange | null
		maxItems: number
	}): VirtualRangeResult {
		const visibleStartIndex = this.findFixedHeightIndex(scrollOffset)
		const visibleEndOffset =
			safeViewportSize > 0 ? scrollOffset + safeViewportSize - 1 : scrollOffset
		const visibleEndIndex = this.findFixedHeightIndex(visibleEndOffset)
		let start = Math.max(visibleStartIndex - safeOverscan.before, 0)
		let end = Math.min(visibleEndIndex + safeOverscan.after, this.count - 1)

		if (safeOverscanPixels) {
			start = Math.min(
				start,
				this.findFixedHeightIndex(Math.max(scrollOffset - safeOverscanPixels.before, 0))
			)
			end = Math.max(
				end,
				this.findFixedHeightIndex(visibleEndOffset + safeOverscanPixels.after)
			)
		}

		const cappedRange = this.capRangeToMaxItems({
			start,
			end,
			visibleStartIndex,
			visibleEndIndex,
			maxItems
		})
		start = cappedRange.start
		end = cappedRange.end

		return {
			scrollHeight: this.totalHeight,
			start,
			end,
			visibleStartIndex,
			visibleEndIndex,
			offset: start * this.estimatedHeight
		}
	}

	private findFixedHeightIndex(offset: number) {
		const targetOffset = Math.max(Math.min(offset, Math.max(this.totalHeight - 1, 0)), 0)

		return Math.min(Math.floor(targetOffset / this.estimatedHeight), this.count - 1)
	}

	private getCurrentBlockDeltaBefore(blockIndex: number, index: number) {
		const block = this.blocks.get(blockIndex)
		if (!block) {
			return 0
		}

		let delta = 0
		block.forEach((height, measuredIndex) => {
			if (measuredIndex < index) {
				delta += height - this.estimatedHeight
			}
		})

		return delta
	}

	private getBlockIndex(index: number) {
		return Math.floor(index / this.blockSize)
	}

	private isValidIndex(index: number) {
		return Number.isInteger(index) && index >= 0 && index < this.count
	}

	private isFixedHeight() {
		return this.measuredHeights.size === 0
	}

	private getBlockDeltas() {
		if (!this.blockDeltas) {
			this.blockDeltas = new FenwickTree(Math.ceil(this.count / this.blockSize))
		}

		return this.blockDeltas
	}

	private capRangeToMaxItems({
		start,
		end,
		visibleStartIndex,
		visibleEndIndex,
		maxItems
	}: {
		start: number
		end: number
		visibleStartIndex: number
		visibleEndIndex: number
		maxItems: number
	}) {
		if (end < start || maxItems === Number.POSITIVE_INFINITY) {
			return { start, end }
		}

		const visibleCount = visibleEndIndex - visibleStartIndex + 1
		const safeMaxItems = Math.max(maxItems, visibleCount)
		if (end - start + 1 <= safeMaxItems) {
			return { start, end }
		}

		const extraBudget = safeMaxItems - visibleCount
		const availableBefore = visibleStartIndex - start
		const availableAfter = end - visibleEndIndex
		let before = Math.min(availableBefore, Math.floor(extraBudget / 2))
		const after = Math.min(availableAfter, extraBudget - before)
		before = Math.min(availableBefore, extraBudget - after)

		return {
			start: visibleStartIndex - before,
			end: visibleEndIndex + after
		}
	}

	private evictOverflowMeasuredHeights() {
		while (this.measuredHeights.size > this.maxMeasuredItems) {
			const oldestIndex = this.measuredHeights.keys().next().value
			/* v8 ignore start -- size above the limit guarantees an oldest measured index */
			if (oldestIndex === undefined) {
				return
			}
			/* v8 ignore stop */

			const previousHeight = this.measuredHeights.get(oldestIndex)
			/* v8 ignore start -- oldestIndex comes from measuredHeights keys */
			if (previousHeight === undefined) {
				return
			}
			/* v8 ignore stop */

			this.removeMeasuredHeight(oldestIndex, previousHeight)
		}
	}

	private removeMeasuredHeight(index: number, previousHeight: number) {
		const blockIndex = this.getBlockIndex(index)
		const block = this.blocks.get(blockIndex)
		block?.delete(index)
		if (block?.size === 0) {
			this.blocks.delete(blockIndex)
		}

		this.measuredHeights.delete(index)
		this.blockDeltas?.add(blockIndex, this.estimatedHeight - previousHeight)
		this.totalHeight -= previousHeight - this.estimatedHeight
	}
}

export function createVirtualHeightIndexStore(
	options: VirtualHeightIndexOptions
): VirtualHeightIndexStore {
	return new BlockVirtualHeightIndex(options)
}

export function createVirtualHeightIndex(options: VirtualHeightIndexOptions): VirtualHeightIndex {
	return createVirtualHeightIndexStore(options)
}
