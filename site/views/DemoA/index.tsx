import React from "react"
import Shadow from "../../examplex/Shadow"
import RandomHeight from "../../examplex/RandomHeight"
import DragAndDrop from "../../examplex/DragAndDrop"
import CustomStyles from "../../examplex/CustomStyles"
import MillionRows from "../../examplex/MillionRows"
import OptimizationCases from "../../examplex/OptimizationCases/OptimizationCases"
import Container from "../../components/Container"
import styles from "./index.module.less"
import GithubIcon from "./Github"

interface IndexProps {
	theme: "light" | "dark"
	onThemeChange: () => void
}

function Index({theme, onThemeChange}: IndexProps) {
	
	return (
		<main className={ styles.layout }>
			<section className={ styles.hero }>
				<div className={ styles.heroCopy }>
					<div className={ styles.heroEyebrow }>better-scrollbar</div>
					<h1>React 虚拟滚动条</h1>
					<p>
						面向超大数据量的虚拟滚动演示，当前案例统一使用 5000 万行规模，并保留动态高度、拖拽、阴影和自定义渲染能力。
					</p>
				</div>
				<div className={ styles.heroActions }>
					<button className={ styles.themeButton } type="button" onClick={ onThemeChange }>
						{ theme === "dark" ? "Light" : "Dark" }
					</button>
					<a
						className={ styles.repoButton }
						href="https://github.com/kampiu/better-scrollbar"
						aria-label="Open GitHub repository"
					>
						<GithubIcon/>
						<span>GitHub</span>
					</a>
				</div>
			</section>
			<section className={ styles.layoutSection }>
				<div className={ styles.sectionHeading }>
					<div>
						<h2>优化亮点案例</h2>
						<p>五个卡片分别展示动态高度、锚点稳定、状态持久化、自适应 overscan，以及吸顶分组/ARIA/超大滚动范围，数据规模统一为 5000 万行。</p>
					</div>
				</div>
				<OptimizationCases/>
			</section>
			<section className={ styles.layoutSection }>
				<div className={ styles.sectionHeading }>
					<div>
						<h2>案例</h2>
						<p>每个卡片都有固定展示区域，滚动指标会截断显示，避免超长数字引发页面跳动。</p>
					</div>
				</div>
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
			</section>
		</main>
	)
}

export default Index
