import React, {
	FC,
	useCallback,
	useLayoutEffect,
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

	useLayoutEffect(() => {
		if (!viewRef.current) {
			return undefined
		}

		sortableInstance.current = Sortable.create(viewRef.current, {
			animation: 120,
			draggable: ".drag-million-item",
			ghostClass: "drag-million-ghost",
			chosenClass: "drag-million-chosen"
		})

		return () => {
			sortableInstance.current?.destroy()
			sortableInstance.current = null
		}
	}, [])

	const renderView = useCallback((props?: PropsWithChildren<HTMLProps<HTMLDivElement>>) => {
		return (
			<div { ...props } ref={ viewRef }>
				{ props?.children }
			</div>
		)
	}, [])

	const renderItem = useCallback((index: number) => {
		return (
			<div className="drag-million-item" style={{height: FIXED_MILLION_ROW_HEIGHT}}>
				<span className="drag-million-index">#{ (index + 1).toLocaleString() }</span>
				<span className="drag-million-title">Sortable row { (index % 512) + 1 }</span>
				<span className="drag-million-meta">{ FIXED_MILLION_ROW_HEIGHT }px</span>
			</div>
		)
	}, [])

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
					onItemsRendered={ setItemsRendered }
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
