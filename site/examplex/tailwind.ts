export function cn(...classes: Array<string | false | null | undefined>) {
	return classes.filter(Boolean).join(" ")
}

export const demoTw = {
	shell: "flex h-full w-full flex-col bg-card text-card-foreground",
	head: "flex items-start justify-between gap-3 border-b border-border px-3.5 py-3",
	title: "text-base font-semibold leading-6 text-card-foreground",
	subtitle: "mt-0.5 text-xs leading-5 text-muted-foreground",
	state: "shrink-0 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-center text-xs leading-4 text-muted-foreground",
	stateActive: "border-primary/40 bg-primary/10 text-primary",
	metricGrid: "grid gap-2 border-b border-border bg-muted/30 p-3",
	metric: "min-w-0 rounded-md border border-border bg-card px-2.5 py-2",
	metricLabel: "block text-xs leading-4 text-muted-foreground",
	metricValue: "block truncate text-[15px] font-semibold leading-6 text-card-foreground",
	list: "min-h-[260px] flex-1 border-b border-border",
	listTall: "min-h-[360px] flex-1 border-b border-border",
	toolbar: "flex flex-wrap items-center gap-2 border-t border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground",
	result: "flex flex-wrap items-center gap-x-3 gap-y-2 px-3.5 py-2.5 text-xs text-muted-foreground",
	button: "h-7 shrink-0 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-card-foreground hover:bg-muted",
	buttonDanger: "h-6 rounded-md border border-destructive/35 bg-card px-2 text-xs text-destructive hover:bg-destructive/10",
	control: "h-8 w-full rounded-md border border-border bg-card px-2.5 text-xs leading-4 text-card-foreground",
	row: "flex w-full items-center justify-between gap-3 border-t border-border bg-card px-3.5 text-[13px] text-muted-foreground",
	gridRow: "grid w-full items-center gap-2.5 border-t border-border bg-card px-3.5 text-[13px] text-muted-foreground",
	rowIndex: "shrink-0 font-semibold text-card-foreground",
	rowTitle: "min-w-0 truncate text-muted-foreground",
	rowMeta: "shrink-0 text-xs text-muted-foreground",
}

export const toneRowTw: Record<string, string> = {
	alert: "border-l-[3px] border-l-destructive bg-destructive/10",
	focus: "border-l-[3px] border-l-primary bg-primary/10",
	warm: "border-l-[3px] border-l-warning bg-warning/10",
	plain: "bg-card",
	group: "border-l-[3px] border-l-success bg-success/10 text-card-foreground",
}

export const caseTw = {
	grid: "grid w-full grid-cols-1 gap-4 lg:grid-cols-2",
	card: "flex h-[520px] min-w-0 flex-col overflow-hidden rounded-lg border border-border/80 bg-card text-card-foreground shadow-site-line",
	head: "relative min-h-[132px] shrink-0 border-b border-border bg-muted/20 px-[18px] py-4",
	index: "inline-flex h-6 w-8 items-center justify-center rounded-md border border-border bg-card text-xs font-bold tabular-nums text-card-foreground",
	title: "mt-2 text-lg font-bold leading-6 text-card-foreground",
	desc: "mt-1.5 max-w-[280px] text-[13px] leading-5 text-muted-foreground",
	proof: "absolute right-4 top-4 grid min-w-[104px] justify-items-end gap-0.5 tabular-nums",
	proofValue: "text-2xl font-bold leading-7 text-card-foreground",
	proofLabel: "text-[11px] uppercase leading-4 text-muted-foreground",
	body: "flex min-h-0 flex-1 flex-col bg-card",
	toolbar: "flex min-h-[42px] shrink-0 items-center gap-2 overflow-x-auto border-b border-border bg-muted/25 px-3 py-2",
	list: "h-[238px] shrink-0 border-b border-border bg-card",
	stats: "grid min-h-[66px] flex-1 grid-cols-1 gap-2 bg-muted/20 px-3 py-2.5 text-xs leading-4 text-muted-foreground tabular-nums sm:grid-cols-3 sm:items-center",
	row: "flex w-full items-center justify-between gap-3 border-t border-border bg-card px-3.5 text-[13px] text-muted-foreground tabular-nums",
	rowMain: "flex min-w-0 items-center gap-2.5",
	rowIndex: "shrink-0 font-bold text-card-foreground",
	rowTitle: "min-w-0 truncate font-medium text-muted-foreground",
	rowMeta: "flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-muted-foreground",
	groupRow: "border-l-[3px] border-l-success bg-success text-success-foreground [&_*]:text-success-foreground",
	button: "h-7 shrink-0 rounded-md border border-border bg-card px-2.5 text-xs font-semibold text-card-foreground hover:bg-muted",
	accentPrimary: "border-t-2 border-t-primary",
	accentSky: "border-t-2 border-t-accent",
	accentWarning: "border-t-2 border-t-warning",
	accentSuccess: "border-t-2 border-t-success",
}
