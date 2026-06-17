import React, {
	FC,
	useCallback,
	useRef,
	useState
} from "react"
import type { HTMLProps, PropsWithChildren } from "react"
import VirtualScrollBar from "../../../src"
import type { ItemsRenderedInfo } from "../../../src"
import Sortable from "sortablejs"
import {
	FIXED_MILLION_ROW_HEIGHT,
	INITIAL_ITEMS_RENDERED,
	MILLION_ROW_COUNT,
	formatVirtualRange,
	getRenderedCount
} from "../sharedMillion"
import "./index.less"

export const DragAndDrop: FC = () => {
	const viewRef = useRef<HTMLDivElement | null>(null)
	const sortableInstance = useRef<Sortable | null>(null)
	const [itemsRendered, setItemsRendered] = useState<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const itemsRenderedRef = useRef<ItemsRenderedInfo>(INITIAL_ITEMS_RENDERED)
	const [rowOrder, setRowOrder] = useState<Record<number, number>>({})
	const nativeDragPositionRef = useRef<number | null>(null)
	const nativeDragCommittedRef = useRef(false)
	const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
	const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

	const onItemsRendered = useCallback((nextItemsRendered: ItemsRenderedInfo) => {
		itemsRenderedRef.current = nextItemsRendered
		setItemsRendered(nextItemsRendered)
	}, [])

	const moveVisibleRow = useCallback((oldIndex?: number, newIndex?: number) => {
		if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
			return
		}

		const {startIndex} = itemsRenderedRef.current
		const renderedCount = getRenderedCount(itemsRenderedRef.current)
		if (oldIndex < 0 || newIndex < 0 || oldIndex >= renderedCount || newIndex >= renderedCount) {
			return
		}

		setRowOrder((currentOrder) => {
			const nextOrder = {...currentOrder}
			const targetIndices = Array.from({length: renderedCount}, (_, offset) => startIndex + offset)
			const sourceIndices = targetIndices.map((index) => currentOrder[index] ?? index)
			const [movedSourceIndex] = sourceIndices.splice(oldIndex, 1)
			sourceIndices.splice(newIndex, 0, movedSourceIndex)

			targetIndices.forEach((targetIndex, offset) => {
				const sourceIndex = sourceIndices[offset]
				if (sourceIndex === targetIndex) {
					delete nextOrder[targetIndex]
				} else {
					nextOrder[targetIndex] = sourceIndex
				}
			})

			return nextOrder
		})
	}, [])

	const commitVisibleRowMove = useCallback((oldIndex?: number, newIndex?: number) => {
		if (nativeDragPositionRef.current !== null) {
			if (nativeDragCommittedRef.current) {
				return
			}
			nativeDragCommittedRef.current = true
		}

		moveVisibleRow(oldIndex, newIndex)
	}, [moveVisibleRow])

	const onDragEnd = useCallback((event: { oldIndex?: number, newIndex?: number }) => {
		commitVisibleRowMove(event.oldIndex, event.newIndex)
	}, [commitVisibleRowMove])

	const getRenderedPosition = useCallback((index: number) => {
		return index - itemsRenderedRef.current.startIndex
	}, [])

	const onNativeDragStart = useCallback((index: number) => (event: React.DragEvent<HTMLDivElement>) => {
		const renderedPosition = getRenderedPosition(index)
		if (renderedPosition < 0 || renderedPosition >= getRenderedCount(itemsRenderedRef.current)) {
			return
		}

		nativeDragPositionRef.current = renderedPosition
		nativeDragCommittedRef.current = false
		setDraggingIndex(index)
		setDropTargetIndex(index)
		event.dataTransfer.effectAllowed = "move"
		event.dataTransfer.setData("text/plain", String(index))
	}, [getRenderedPosition])

	const onNativeDragOver = useCallback((index: number) => (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		event.dataTransfer.dropEffect = "move"
		setDropTargetIndex(index)
	}, [])

	const onNativeDrop = useCallback((index: number) => (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		commitVisibleRowMove(nativeDragPositionRef.current ?? undefined, getRenderedPosition(index))
		setDraggingIndex(null)
		setDropTargetIndex(null)
	}, [commitVisibleRowMove, getRenderedPosition])

	const onNativeDragEnd = useCallback(() => {
		setDraggingIndex(null)
		setDropTargetIndex(null)
	}, [])

	const bindSortableView = useCallback((node: HTMLDivElement | null) => {
		if (viewRef.current === node) {
			return
		}

		if (sortableInstance.current) {
			sortableInstance.current?.destroy()
			sortableInstance.current = null
		}

		viewRef.current = node

		if (!node) {
			return
		}

		sortableInstance.current = Sortable.create(node, {
			animation: 120,
			draggable: ".drag-million-item",
			ghostClass: "drag-million-ghost",
			chosenClass: "drag-million-chosen",
			onEnd: onDragEnd
		})
	}, [onDragEnd])

	const renderView = useCallback((props?: PropsWithChildren<HTMLProps<HTMLDivElement>>) => {
		return (
			<div { ...props } ref={ bindSortableView }>
				{ props?.children }
			</div>
		)
	}, [bindSortableView])

	const renderItem = useCallback((index: number) => {
		const sourceIndex = rowOrder[index] ?? index
		const className = [
			"drag-million-item",
			draggingIndex === index ? "drag-million-item--dragging" : "",
			dropTargetIndex === index && draggingIndex !== index ? "drag-million-item--drop-target" : ""
		].filter(Boolean).join(" ")

		return (
			<div
				className={ className }
				draggable
				style={{height: FIXED_MILLION_ROW_HEIGHT}}
				onDragStart={ onNativeDragStart(index) }
				onDragOver={ onNativeDragOver(index) }
				onDrop={ onNativeDrop(index) }
				onDragEnd={ onNativeDragEnd }
			>
				<span className="drag-million-index">#{ (sourceIndex + 1).toLocaleString() }</span>
				<span className="drag-million-title">Sortable row { (sourceIndex % 512) + 1 }</span>
				<span className="drag-million-meta">{ FIXED_MILLION_ROW_HEIGHT }px</span>
			</div>
		)
	}, [
		draggingIndex,
		dropTargetIndex,
		onNativeDragEnd,
		onNativeDragOver,
		onNativeDragStart,
		onNativeDrop,
		rowOrder
	])

	const getItemKey = useCallback((index: number) => `drag-million-${ index }`, [])

	return (
		<div className="drag-million-wrapper">
			<div className="drag-million-head">
				<div>
					<div className="drag-million-title-main">拖拽</div>
					<div className="drag-million-subtitle">{ MILLION_ROW_COUNT.toLocaleString() } rows / Sortable visible window</div>
				</div>
				<div className="drag-million-state">DOM { getRenderedCount(itemsRendered) }</div>
			</div>
			<div className="drag-million-list">
				<VirtualScrollBar
					itemCount={ MILLION_ROW_COUNT }
					itemKey={ getItemKey }
					itemHeight={ FIXED_MILLION_ROW_HEIGHT }
					estimatedItemHeight={ FIXED_MILLION_ROW_HEIGHT }
					overscan={ 4 }
					renderItem={ renderItem }
					renderView={ renderView }
					onItemsRendered={ onItemsRendered }
				/>
			</div>
			<div className="drag-million-result">
				<span>Total: { MILLION_ROW_COUNT.toLocaleString() }</span>
				<span>Visible: { formatVirtualRange({
					startIndex: itemsRendered.visibleStartIndex,
					endIndex: itemsRendered.visibleEndIndex
				}) }</span>
				<span>Rendered: { formatVirtualRange(itemsRendered) }</span>
			</div>
		</div>
	)
}

export default DragAndDrop
