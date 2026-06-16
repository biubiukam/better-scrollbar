import React, { type PropsWithChildren } from "react"
import clsx from "clsx"
import styles from "./Container.module.less"

interface ContainerProps {
	title?: string
	desc?: string
	className?: string
}

function Container({title, desc, className, children}: PropsWithChildren<ContainerProps>) {
	return (
		<div className={ clsx(styles.container, className) }>
			{ (title || desc) && (
				<div className={ styles.containerHeader }>
					{ title && <h3>{ title }</h3> }
					{ desc && <p>{ desc }</p> }
				</div>
			) }
			<div className={ styles.containerWrapper }>{ children }</div>
		</div>
	)
}

export default Container
