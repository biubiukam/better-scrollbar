import React from "react"
import { cn } from "@/lib/utils"

export function SiteIcon({ className }: { className?: string }) {
	return (
		<svg
			className={cn("size-8 shrink-0", className)}
			viewBox="0 0 32 32"
			aria-hidden="true"
			focusable="false"
		>
			<rect width="32" height="32" rx="6" fill="#2563eb" />
			<path d="M10 8h12v3H10zm0 6h8v3h-8zm0 6h12v3H10z" fill="white" />
		</svg>
	)
}
