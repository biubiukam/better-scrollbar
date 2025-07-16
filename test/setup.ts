import { beforeAll } from "vitest"

// 设置 ResizeObserver polyfill
window.ResizeObserver = require("resize-observer-polyfill")

// 可以在这里添加更多的全局测试配置
beforeAll(() => {
	// 全局测试设置
})
