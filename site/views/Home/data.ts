import React from "react"
import { Activity, Boxes, Layers3, Sparkles } from "lucide-react"
import { AgentConversationDemo } from "../../examplex/AgentConversationCase"
import { AuditLogDemo } from "../../examplex/AuditLogCase"
import { MediaSearchDemo } from "../../examplex/MediaSearchCase"
import { RuleQueueDemo } from "../../examplex/RuleQueueCase"
import type { DemoId } from "../../i18n/home"
import type { ExampleCopy } from "../../i18n/examples"

export interface DemoMeta {
	id: DemoId
	tone: "primary" | "accent" | "success" | "warning" | "secondary"
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
	component: React.ComponentType<{ copy?: ExampleCopy }>
}

export const NAV_HREFS = ["#overview", "#cases", "#playground", "#demos", "#api"]

export const DEMOS: DemoMeta[] = [
	{ id: "agent", tone: "primary", icon: Activity, component: AgentConversationDemo },
	{ id: "audit", tone: "secondary", icon: Boxes, component: AuditLogDemo },
	{ id: "media", tone: "success", icon: Sparkles, component: MediaSearchDemo },
	{ id: "rules", tone: "warning", icon: Layers3, component: RuleQueueDemo },
]

export const CONSOLE_ROW_META = [
	{ index: "98,238,102", width: "76%", tone: "primary" },
	{ index: "98,238,103", width: "54%", tone: "muted" },
	{ index: "98,238,104", width: "68%", tone: "success" },
	{ index: "98,238,105", width: "48%", tone: "warning" },
	{ index: "98,238,106", width: "72%", tone: "muted" },
	{ index: "98,238,107", width: "60%", tone: "accent" },
] as const
