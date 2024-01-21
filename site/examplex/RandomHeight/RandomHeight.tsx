import React, { useCallback, useRef, useState } from "react"
import { VirtualScrollBar } from "../../../src"
import "./index.less"
import css from "dom-css"

let uuid = 0
const MockData = Array.from({length: 5000}, (_) => {
	uuid++
	return {
		id: uuid,
	}
})

const shadowTopStyle: React.CSSProperties = {
	position: "absolute",
	top: 0,
	left: 0,
	right: 0,
	height: 10,
	background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 2%, rgba(0, 0, 0, 0) 100%)"
}
const shadowBottomStyle: React.CSSProperties = {
	position: "absolute",
	bottom: 0,
	left: 0,
	right: 0,
	height: 10,
	background: "linear-gradient(to top, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0) 100%)"
}

function RandomHeight() {
	
	const shadowTop = useRef<HTMLDivElement>({} as HTMLDivElement)
	const shadowBottom = useRef<HTMLDivElement>({} as HTMLDivElement)
	const [scrollState, setScrollState] = useState({
		x: 0,
		y: 0,
		isScrolling: false,
		scrollHeight: 0,
		scrollWidth: 0,
		clientWidth: 0,
		clientHeight: 0
	})
	const [dataSource, setDataSource] = useState(MockData)
	
	const onRemove = useCallback((node) => {
		setDataSource(preState => {
			return preState.filter(item => item.id !== node.id)
		})
	}, [])
	
	const onInsertBefore = useCallback((index: number) => {
		setDataSource(preState => {
			uuid++
			preState.splice(Math.max(index, 0), 0, {
				id: uuid
			})
			return [...preState]
		})
	}, [])
	
	const onInsertAfter = useCallback((index) => {
		setDataSource(preState => {
			preState.splice(index, 0, {
				id: preState[preState.length - 1].id + 1
			})
			return preState
		})
	}, [])
	
	const onScroll = useCallback((state) => {
		setScrollState(state)
		const shadowTopOpacity = 1 / 20 * Math.min(state.y, 20)
		const bottomScrollTop = state.scrollHeight - state.clientHeight
		const shadowBottomOpacity = 1 / 20 * (bottomScrollTop - Math.max(state.y, bottomScrollTop - 20))
		if (shadowTop.current) {
			css(shadowTop.current, {opacity: shadowTopOpacity})
		}
		if (shadowBottom.current) {
			css(shadowBottom.current, {opacity: shadowBottomOpacity})
		}
	}, [])
	
	return (
		<div className="wrapper">
			<div className="list">
				<VirtualScrollBar
					onScroll={ onScroll }
				>
					{
						dataSource.map((item, index) => (
							<div key={ item.id } className="item">
								No.{ item.id }
								<span>
								<div className="button error" onClick={ () => onRemove(item) }>Remove</div>
								<div className="button primary"
								     onClick={ () => onInsertBefore(index) }>Insert Before</div>
								<div className="button primary"
								     onClick={ () => onInsertAfter(index) }>Insert After</div>
							</span>
							</div>
						))
					}
				</VirtualScrollBar>
				<div
					ref={ shadowTop }
					style={ shadowTopStyle }/>
				<div
					ref={ shadowBottom }
					style={ shadowBottomStyle }/>
			</div>
			<div className="result">
				<div className="result-item">数据量 {dataSource.length}  <span style={{marginLeft: "auto"}}>{ scrollState.isScrolling ? "滚动中" : "停止滚动" }</span></div>
				<div className="result-item">滚动位置 <span>Y: { scrollState.y }</span> <span>X: { scrollState.x }</span></div>
				<div className="result-item">滚动内容大小 <span>Width: { scrollState.scrollWidth }</span> <span>Height: { scrollState.scrollHeight }</span></div>
				<div className="result-item">视区内容大小 <span>Width: { scrollState.clientWidth }</span> <span>Height: { scrollState.clientHeight }</span></div>
			</div>
		</div>
	)
}

export default RandomHeight
