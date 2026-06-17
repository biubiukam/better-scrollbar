import React, { useCallback, useRef, useState, useEffect } from "react"
import raf from "../raf"
import { createVirtualHeightIndexStore } from "../virtualRange"

export interface UseHeightsOptions {
	itemCount: number
	estimatedItemHeight: number
	heightCacheLimit?: number
}

const DEFAULT_HEIGHT_CACHE_LIMIT = 50_000

function normalizeHeightCacheLimit(heightCacheLimit: number | undefined) {
	if (heightCacheLimit === undefined) {
		return DEFAULT_HEIGHT_CACHE_LIMIT
	}

	if (heightCacheLimit === Number.POSITIVE_INFINITY || !Number.isFinite(heightCacheLimit)) {
		return Number.POSITIVE_INFINITY
	}

	return Math.max(Math.floor(heightCacheLimit), 0)
}

function getResizeObserverEntryHeight(entry: ResizeObserverEntry, element: HTMLElement) {
	const contentRectHeight = entry.contentRect?.height
	if (typeof contentRectHeight === "number" && Number.isFinite(contentRectHeight) && contentRectHeight > 0) {
		return contentRectHeight
	}

	return element.offsetHeight
}

export default ({itemCount, estimatedItemHeight, heightCacheLimit}: UseHeightsOptions) => {
	const safeItemCount = Math.max(Math.floor(itemCount), 0)
	const safeEstimatedItemHeight = Math.max(estimatedItemHeight, 1)
	const safeHeightCacheLimit = normalizeHeightCacheLimit(heightCacheLimit)
	const instanceRef = useRef<Map<React.Key, HTMLElement>>(new Map())
	const heightsRef = useRef<Map<React.Key, number>>(new Map())
	const keyIndexRef = useRef<Map<React.Key, number>>(new Map())
	const indexKeyRef = useRef<Map<number, React.Key>>(new Map())
	const keyElementRef = useRef<Map<React.Key, HTMLElement>>(new Map())
	const elementKeyRef = useRef<Map<HTMLElement, React.Key>>(new Map())
	const resizeObserverRef = useRef<ResizeObserver | null>(null)
	const heightIndexRef = useRef(createVirtualHeightIndexStore({
		itemCount: safeItemCount,
		estimatedItemHeight: safeEstimatedItemHeight,
		maxMeasuredItems: safeHeightCacheLimit
	}))
	const heightIndexOptionsRef = useRef({
		itemCount: safeItemCount,
		estimatedItemHeight: safeEstimatedItemHeight,
		heightCacheLimit: safeHeightCacheLimit
	})
	const [updatedMark, setUpdatedMark] = useState(0)
	const collectRafRef = useRef<number>(-1)

	const cancelRaf = useCallback(() => {
		raf.cancel(collectRafRef.current)
		collectRafRef.current = -1
	}, [])

	const getHeightsByIndexSnapshot = useCallback((nextItemCount?: number) => {
		const heightsByIndex = new Map<number, number>()

		heightsRef.current.forEach((height, key) => {
			const index = keyIndexRef.current.get(key)
			if (index === undefined || (nextItemCount !== undefined && index >= nextItemCount)) {
				return
			}

			heightsByIndex.set(index, height)
		})

		return heightsByIndex
	}, [])

	if (
		heightIndexOptionsRef.current.itemCount !== safeItemCount ||
		heightIndexOptionsRef.current.estimatedItemHeight !== safeEstimatedItemHeight ||
		heightIndexOptionsRef.current.heightCacheLimit !== safeHeightCacheLimit
	) {
		heightIndexRef.current.reset({
			itemCount: safeItemCount,
			estimatedItemHeight: safeEstimatedItemHeight,
			measuredHeights: getHeightsByIndexSnapshot(safeItemCount),
			maxMeasuredItems: safeHeightCacheLimit
		})
		heightIndexOptionsRef.current = {
			itemCount: safeItemCount,
			estimatedItemHeight: safeEstimatedItemHeight,
			heightCacheLimit: safeHeightCacheLimit
		}
	}

	const unobserveKey = useCallback((key: React.Key) => {
		const element = keyElementRef.current.get(key)
		if (element) {
			resizeObserverRef.current?.unobserve?.(element)
			keyElementRef.current.delete(key)
			elementKeyRef.current.delete(element)
		}
	}, [])

	const clearMeasuredIndex = useCallback((key: React.Key) => {
		const index = keyIndexRef.current.get(key)
		if (index !== undefined && indexKeyRef.current.get(index) === key) {
			indexKeyRef.current.delete(index)
			heightIndexRef.current.deleteMeasuredHeight(index)
		}
	}, [])

	const deleteCachedHeight = useCallback((key: React.Key) => {
		heightsRef.current.delete(key)
		instanceRef.current.delete(key)
		unobserveKey(key)
		clearMeasuredIndex(key)
		keyIndexRef.current.delete(key)
	}, [clearMeasuredIndex, unobserveKey])

	const evictHeightCacheOverflow = useCallback((protectedKey?: React.Key) => {
		if (safeHeightCacheLimit === Number.POSITIVE_INFINITY) {
			return false
		}

		let hasChanges = false
		while (heightsRef.current.size > safeHeightCacheLimit) {
			let evicted = false
			const cachedKeys = Array.from(heightsRef.current.keys())

			for (let index = 0; index < cachedKeys.length; index++) {
				const key = cachedKeys[index]
				if (key === protectedKey || instanceRef.current.has(key)) {
					continue
				}

				deleteCachedHeight(key)
				hasChanges = true
				evicted = true
				break
			}

			if (!evicted) {
				break
			}
		}

		return hasChanges
	}, [deleteCachedHeight, safeHeightCacheLimit])

	const rememberMeasuredHeight = useCallback((key: React.Key, index: number, height: number) => {
		heightsRef.current.delete(key)
		heightsRef.current.set(key, height)
		heightIndexRef.current.setMeasuredHeight(index, height)
		return evictHeightCacheOverflow(key)
	}, [evictHeightCacheOverflow])

	const collectHeight = useCallback(
		() => {
			cancelRaf()

			const doCollect = () => {
				let hasChanges = false

				instanceRef.current.forEach((element, key) => {
					if (element?.isConnected) {
						const { offsetHeight } = element
						const currentHeight = heightsRef.current.get(key)
						if (currentHeight !== offsetHeight) {
							const index = keyIndexRef.current.get(key)
							if (index !== undefined) {
								rememberMeasuredHeight(key, index, offsetHeight)
							}
							hasChanges = true
						}
					}
				})

				if (hasChanges) {
					setUpdatedMark((v) => v + 1)
				}
			}

			collectRafRef.current = raf(() => {
				doCollect()
			})
		},
		[cancelRaf, rememberMeasuredHeight]
	)

	const getResizeObserver = useCallback(() => {
		if (resizeObserverRef.current || typeof ResizeObserver === "undefined") {
			return resizeObserverRef.current
		}

		resizeObserverRef.current = new ResizeObserver((entries) => {
			if (entries.length === 0) {
				collectHeight()
				return
			}

			let hasChanges = false
			entries.forEach((entry) => {
				const key = elementKeyRef.current.get(entry.target as HTMLElement)
				if (key === undefined) {
					return
					}

					const element = instanceRef.current.get(key)
					/* v8 ignore start -- protects stale ResizeObserver entries during DOM detach */
					if (!element?.isConnected) {
						return
					}
					/* v8 ignore stop */

					const offsetHeight = getResizeObserverEntryHeight(entry, element)

				if (heightsRef.current.get(key) !== offsetHeight) {
					const index = keyIndexRef.current.get(key)
					if (index !== undefined) {
						rememberMeasuredHeight(key, index, offsetHeight)
					}
					hasChanges = true
				}
			})

			if (hasChanges) {
				setUpdatedMark((v) => v + 1)
			}
		})

		return resizeObserverRef.current
	}, [collectHeight, rememberMeasuredHeight])

	const setInstanceRef = useCallback(
		(key: React.Key, index: number, instance: HTMLElement | null) => {
			const previousIndex = keyIndexRef.current.get(key)
			if (previousIndex !== undefined && previousIndex !== index && indexKeyRef.current.get(previousIndex) === key) {
				indexKeyRef.current.delete(previousIndex)
				heightIndexRef.current.deleteMeasuredHeight(previousIndex)
			}

			const previousKeyAtIndex = indexKeyRef.current.get(index)
			if (previousKeyAtIndex !== undefined && previousKeyAtIndex !== key) {
				heightIndexRef.current.deleteMeasuredHeight(index)
			}

			keyIndexRef.current.set(key, index)
			indexKeyRef.current.set(index, key)
			unobserveKey(key)
			if (instance) {
				instanceRef.current.set(key, instance)
				keyElementRef.current.set(key, instance)
				elementKeyRef.current.set(instance, key)
				const resizeObserver = getResizeObserver()
				resizeObserver?.observe(instance)
				const cachedHeight = heightsRef.current.get(key)
				if (cachedHeight !== undefined) {
					rememberMeasuredHeight(key, index, cachedHeight)
				} else if (!resizeObserver) {
					collectHeight()
				}
			} else {
				instanceRef.current.delete(key)
				unobserveKey(key)
			}
		},
		[collectHeight, getResizeObserver, rememberMeasuredHeight, unobserveKey]
	)

	const pruneHeights = useCallback((keys?: React.Key[], itemCount?: number) => {
		const keySet = keys ? new Set(keys) : undefined
		let hasChanges = false

		heightsRef.current.forEach((_, key) => {
			const index = keyIndexRef.current.get(key)
			const removedByKey = keySet ? !keySet.has(key) : false
			const removedByIndex = itemCount !== undefined && index !== undefined && index >= itemCount

			if (removedByKey || removedByIndex) {
				heightsRef.current.delete(key)
				instanceRef.current.delete(key)
				unobserveKey(key)
				clearMeasuredIndex(key)
				keyIndexRef.current.delete(key)
				hasChanges = true
			}
		})

		if (hasChanges) {
			setUpdatedMark((v) => v + 1)
		}
	}, [clearMeasuredIndex, unobserveKey])

	// 清理函数
	useEffect(() => {
		return () => {
			cancelRaf()
			resizeObserverRef.current?.disconnect()
			resizeObserverRef.current = null
			keyElementRef.current.clear()
			elementKeyRef.current.clear()
		}
	}, [cancelRaf])

	// 返回优化后的API
	return {
		setInstanceRef,
		collectHeight,
		pruneHeights,
		heightIndex: heightIndexRef.current,
		updatedMark
	}
}
