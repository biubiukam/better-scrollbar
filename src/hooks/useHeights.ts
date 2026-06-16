import { findDOMNode } from "../utils"
import React, { useCallback, useRef, useState, useEffect } from "react"
import raf from "../raf"

export default () => {
	const instanceRef = useRef<Map<React.Key, HTMLElement>>(new Map())
	const heightsRef = useRef<Map<React.Key, number>>(new Map())
	const keyIndexRef = useRef<Map<React.Key, number>>(new Map())
	const [updatedMark, setUpdatedMark] = useState(0)
	const collectRafRef = useRef<number>(-1)

	// 新增：防抖相关状态
	const lastUpdateTimeRef = useRef<number>(0)
	const pendingUpdateRef = useRef<boolean>(false)
	const DEBOUNCE_DELAY = 16 // 约60fps

	// 新增：缓存上次的高度快照，避免不必要的更新
	const lastHeightsSnapshotRef = useRef<Map<React.Key, number>>(new Map())

	const cancelRaf = useCallback(() => {
		raf.cancel(collectRafRef.current)
		collectRafRef.current = -1
	}, [])

	// 新增：检查是否需要更新
	const shouldUpdate = useCallback(() => {
		const currentHeights = heightsRef.current
		const lastSnapshot = lastHeightsSnapshotRef.current

		// 如果数量不同，肯定需要更新
		if (currentHeights.size !== lastSnapshot.size) {
			return true
		}

		// 检查是否有高度变化
		let hasChanges = false
		currentHeights.forEach((height, key) => {
			if (lastSnapshot.get(key) !== height) {
				hasChanges = true
			}
		})

		return hasChanges
	}, [])

	// 新增：更新高度快照
	const updateHeightsSnapshot = useCallback(() => {
		const newSnapshot = new Map(heightsRef.current)
		lastHeightsSnapshotRef.current = newSnapshot
	}, [])

	// 优化：带防抖的收集函数
	const collectHeight = useCallback(
		(sync = false, forceUpdate = false) => {
			cancelRaf()

			const now = Date.now()

			const doCollect = () => {
				let hasChanges = false

				// 只遍历当前实例中的元素
				instanceRef.current.forEach((element, key) => {
					if (element?.isConnected) {
						const htmlElement = findDOMNode<HTMLElement>(element)
						const { offsetHeight } = htmlElement || {}

						if (htmlElement && offsetHeight !== undefined) {
							const currentHeight = heightsRef.current.get(key)
							if (currentHeight !== offsetHeight) {
								heightsRef.current.set(key, offsetHeight)
								hasChanges = true
							}
						}
					}
				})

				// 只在有变化时更新状态
				if (hasChanges || forceUpdate) {
					if (shouldUpdate()) {
						updateHeightsSnapshot()
						setUpdatedMark((v) => v + 1)
					}
				}

				lastUpdateTimeRef.current = now
				pendingUpdateRef.current = false
			}

			if (sync) {
				doCollect()
			} else {
				// 防抖逻辑：如果距离上次更新时间过短，则延迟执行
				if (!forceUpdate && now - lastUpdateTimeRef.current < DEBOUNCE_DELAY) {
					if (!pendingUpdateRef.current) {
						pendingUpdateRef.current = true
						collectRafRef.current = raf(() => {
							doCollect()
						})
					}
				} else {
					collectRafRef.current = raf(() => {
						doCollect()
					})
				}
			}
		},
		[cancelRaf, shouldUpdate, updateHeightsSnapshot]
	)

	const setInstanceRef = useCallback(
		(key: React.Key, index: number, instance: HTMLElement | null) => {
			keyIndexRef.current.set(key, index)
			if (instance) {
				instanceRef.current.set(key, instance)
				// 新元素添加时强制更新
				collectHeight(false, true)
			} else {
				instanceRef.current.delete(key)
			}
		},
		[collectHeight]
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
				keyIndexRef.current.delete(key)
				hasChanges = true
			}
		})

		if (hasChanges) {
			updateHeightsSnapshot()
			setUpdatedMark((v) => v + 1)
		}
	}, [updateHeightsSnapshot])

	const getHeightsByIndex = useCallback((itemCount?: number) => {
		const heightsByIndex = new Map<number, number>()

		heightsRef.current.forEach((height, key) => {
			const index = keyIndexRef.current.get(key)
			if (index === undefined || (itemCount !== undefined && index >= itemCount)) {
				return
			}

			heightsByIndex.set(index, height)
		})

		return heightsByIndex
	}, [])

	// 新增：批量更新高度
	const batchUpdateHeights = useCallback(
		(updates: Map<React.Key, number>) => {
			let hasChanges = false

			updates.forEach((height, key) => {
				const currentHeight = heightsRef.current.get(key)
				if (currentHeight !== height) {
					heightsRef.current.set(key, height)
					hasChanges = true
				}
			})

			if (hasChanges) {
				updateHeightsSnapshot()
				setUpdatedMark((v) => v + 1)
			}
		},
		[updateHeightsSnapshot]
	)

	// 清理函数
	useEffect(() => {
		return () => {
			cancelRaf()
		}
	}, [cancelRaf])

	// 返回优化后的API
	return {
		setInstanceRef,
		collectHeight,
		pruneHeights,
		getHeightsByIndex,
		batchUpdateHeights,
		heights: heightsRef.current,
		updatedMark
	}
}
