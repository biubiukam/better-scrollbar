const MIN_SIZE = 25
/**
 * @description Calculates the scrollbar thumb size.
 * @param {number} containerSize Viewport size on the scrollbar axis.
 * @param {number} scrollRange Full scrollable content size on the scrollbar axis.
 */
export function getSpinSize(containerSize: number = 0, scrollRange: number = 0) {
	let baseSize = (containerSize / scrollRange) * 100
	if (isNaN(baseSize)) {
		baseSize = 0
	}
	baseSize = Math.max(baseSize, MIN_SIZE)
	baseSize = Math.min(baseSize, containerSize / 2)
	return Math.floor(baseSize)
}
