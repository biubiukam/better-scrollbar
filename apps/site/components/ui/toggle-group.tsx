import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
	VariantProps<typeof toggleVariants> & {
		spacing?: string
	}
>({
	size: "default",
	variant: "default",
	spacing: "0px"
})

function ToggleGroup({
	className,
	variant,
	size,
	spacing = "0px",
	children,
	...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
	VariantProps<typeof toggleVariants> & {
		spacing?: string
	}) {
	return (
		<ToggleGroupPrimitive.Root
			data-slot="toggle-group"
			data-variant={variant}
			data-size={size}
			style={{ "--toggle-group-gap": spacing } as React.CSSProperties}
			className={cn(
				"flex w-fit items-center gap-[var(--toggle-group-gap)] rounded-md",
				className
			)}
			{...props}
		>
			<ToggleGroupContext.Provider value={{ variant, size, spacing }}>
				{children}
			</ToggleGroupContext.Provider>
		</ToggleGroupPrimitive.Root>
	)
}

function ToggleGroupItem({
	className,
	children,
	variant,
	size,
	...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
	const context = React.useContext(ToggleGroupContext)

	return (
		<ToggleGroupPrimitive.Item
			data-slot="toggle-group-item"
			data-spacing={context.spacing}
			className={cn(
				toggleVariants({
					variant: context.variant || variant,
					size: context.size || size
				}),
				"w-auto min-w-0 shrink-0 px-3 focus-visible:relative",
				"data-[spacing='0px']:rounded-none data-[spacing='0px']:first:rounded-l-md data-[spacing='0px']:last:rounded-r-md data-[spacing='0px']:data-[variant=outline]:border-l-0 data-[spacing='0px']:data-[variant=outline]:first:border-l",
				className
			)}
			{...props}
		>
			{children}
		</ToggleGroupPrimitive.Item>
	)
}

export { ToggleGroup, ToggleGroupItem }
