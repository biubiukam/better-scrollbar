import React from "react"

export function SectionIntro({ title, desc }: { title: string, desc: string }) {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:px-8">
			<h2 className="max-w-3xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{title}</h2>
			<p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{desc}</p>
		</div>
	)
}
