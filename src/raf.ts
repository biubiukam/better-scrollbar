/* v8 ignore start -- non-browser fallback is replaced by jsdom requestAnimationFrame in tests */
let raf = (callback: FrameRequestCallback) => +setTimeout(callback, 16)
let caf = (num: number) => clearTimeout(num)
/* v8 ignore stop */

if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
	raf = (callback: FrameRequestCallback) =>
		window.requestAnimationFrame(callback)
	caf = (handle: number) => window.cancelAnimationFrame(handle)
}

let rafUUID = 0

const rafIds = new Map<number, number>()

function cleanup(id: number) {
	rafIds.delete(id)
}

const wrapperRaf = (callback: () => void, times = 1): number => {
	rafUUID += 1
	const id = rafUUID
	
	function callRef(leftTimes: number) {
		if (leftTimes === 0) {
			// Clean up
			cleanup(id)
			
			// Trigger
			callback()
		} else {
			// Next raf
			const realId = raf(() => {
				callRef(leftTimes - 1)
			})
			
			// Bind real raf id
			rafIds.set(id, realId)
		}
	}
	
	callRef(times)
	
	return id
}

wrapperRaf.cancel = (id: number) => {
	const realId = rafIds.get(id)
	cleanup(id)
	if (typeof realId === "number") {
		caf(realId)
	}
}

export default wrapperRaf
