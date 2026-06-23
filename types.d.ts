import type { DOMWindow } from "jsdom"

declare const window: Window

declare const globalThis: {
	window: DOMWindow
}
