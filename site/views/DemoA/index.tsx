import React from "react"
import Shadow from "../../examplex/Shadow"
import RandomHeight from "../../examplex/RandomHeight"
import DragAndDrop from "../../examplex/DragAndDrop"
import CustomStyles from "../../examplex/CustomStyles"
import MillionRows from "../../examplex/MillionRows"
import Container from "../../components/Container"
import styles from "./index.module.less"
import GithubIcon from "./Github"

function Index() {
	
	return (
		<div className={ styles.layout }>
			<div className={ styles.layoutWrapper }>
				<div className={ styles.layoutHeader }>React 版本滚动条 <a
					href="https://github.com/kampiu/better-scrollbar"><GithubIcon/></a></div>
				<div>
					滚动原理参考 <a
					href="https://github.com/malte-wessel/react-custom-scrollbars">react-custom-scrollbars</a> ，其中针对虚拟滚动以及原仓库中的issue有针对性改动。
				</div>
			</div>
			<div className={ styles.layoutSection }>
				<div className={ styles.layoutHeader }>案例</div>
				
				<div className={ styles.containerWrapper }>
					<Container
						title="动态高度"
						desc="5000万行动态高度按索引惰性渲染，支持行数变化和快速定位。"
						className={ styles.container }
					>
						<RandomHeight/>
					</Container>
					<Container
						title="阴影滚动条"
						desc="5000万行固定高度列表中，通过阴影提示滚动区域仍有遮挡内容。"
						className={ styles.container }
					>
						<Shadow/>
					</Container>
					<Container
						title="拖拽"
						desc="结合SortableJs实现虚拟窗口内拖拽，拖拽库只管理当前可见DOM。"
						className={ styles.container }
					>
						<DragAndDrop/>
					</Container>
					<Container
						title="高度自定义样式"
						desc="5000万行下自定义滚动容器和滚动条样式，样式状态按滚动进度轻量更新。"
						className={ styles.container }
					>
						<CustomStyles/>
					</Container>
					<Container
						title="高性能大列表"
						desc="构造5000万行不定高数据场景，展示惰性渲染、实时区间、DOM数量和快速跳转。"
						className={ styles.container }
					>
						<MillionRows/>
					</Container>
				</div>
			</div>
		
		</div>
	)
}

export default Index
