# better-scrollbar Monorepo 迁移规划

> 从单 React 包拆分为 core / react / vue 三包架构的完整可执行方案
>
> 基于对仓库 17 个源文件（2697 行代码）的逐行分析生成
>
> better-scrollbar v1.1.0 · pnpm@10.11.0 · Vite 5 · TypeScript 5.3

---

## 一、现有代码库分析

### 1.1 项目概况

| 维度                     | 数据 |
| ------------------------ | ---- |
| 源文件总数               | 17   |
| 总代码行数               | 2697 |
| 可直接提取到 Core 的文件 | 5    |
| 可提取的纯函数           | 22   |
| 测试用例数               | 143  |
| 覆盖率要求               | 100% |

### 1.2 代码分层分析

以下是对现有 17 个源文件的逐一分析，按「是否依赖 React」分为两类。核心发现：约 24% 的代码行数可直接提取为框架无关的 Core 层。

#### 框架无关代码（可提取到 Core）— 641 行

| 文件                        | 行数 | 职责                                 |
| --------------------------- | ---: | ------------------------------------ |
| `src/virtualRange.ts`       |  460 | Fenwick 树 + 虚拟高度索引 + 范围计算 |
| `src/scrollUtil.ts`         |   16 | 滚动条滑块尺寸计算 (`getSpinSize`)   |
| `src/stickyUtils.ts`        |   24 | 分组 sticky 索引推导                 |
| `src/raf.ts`                |   56 | `requestAnimationFrame` 封装         |
| `src/styles/ScrollBar.less` |   85 | 全部 CSS 样式                        |

#### React 耦合代码 — 2056 行

| 文件                                     | 行数 | 职责                                               |
| ---------------------------------------- | ---: | -------------------------------------------------- |
| `src/ScrollBar.tsx`                      | 1441 | 主组件 — 虚拟滚动 + 锚点维护 + 滚动状态机          |
| `src/types.ts`                           |  237 | 全部 TypeScript 类型（混合了 React 类型）          |
| `src/defaultRenderElements.tsx`          |   50 | 默认 render 函数（返回 JSX）                       |
| `src/utils.ts`                           |   38 | DOM 工具 + `findDOMNode` + `getPageXY`             |
| `src/components/ScrollBar.tsx`           |  275 | 滚动条基础组件（拖拽 / 可见性 / 触控）             |
| `src/components/VerticalScrollBar.tsx`   |   10 | 垂直滚动条组件壳                                   |
| `src/components/HorizontalScrollBar.tsx` |   10 | 水平滚动条组件壳                                   |
| `src/components/Item.tsx`                |   43 | 虚拟列表行包装组件                                 |
| `src/hooks/useHeights.ts`                |  399 | 高度测量 Hook（ResizeObserver + MutationObserver） |
| `src/hooks/useResizeObserver.ts`         |   32 | 容器尺寸监听 Hook                                  |
| `src/index.ts`                           |   19 | 包入口文件                                         |

### 1.3 ScrollBar.tsx 中可提取的纯函数（22 个）

主组件 `ScrollBar.tsx`（1441 行）是拆分的核心难点。其中包含大量与框架无关的纯计算函数，可全部提取到 Core 层。

| 函数名                             | 所在文件        | 行号    | 分类        |
| ---------------------------------- | --------------- | ------- | ----------- |
| `toSafeOverscan`                   | ScrollBar.tsx   | 79-81   | overscan    |
| `getAdaptiveOverscanOptions`       | ScrollBar.tsx   | 83-98   | overscan    |
| `getEffectiveOverscan`             | ScrollBar.tsx   | 100-127 | overscan    |
| `getDeviceScale`                   | ScrollBar.tsx   | 129-136 | env         |
| `isSameScrollState`                | ScrollBar.tsx   | 163-171 | state       |
| `isSameItemsRenderedInfo`          | ScrollBar.tsx   | 173-179 | state       |
| `getSafeBrowserScrollHeight`       | ScrollBar.tsx   | 181-187 | scroll      |
| `getSafeMaxRenderedItems`          | ScrollBar.tsx   | 189-195 | scroll      |
| `resolveOverscanConfig`            | ScrollBar.tsx   | 197-215 | overscan    |
| `resolveFollowOutputThreshold`     | ScrollBar.tsx   | 217-227 | scroll      |
| `getLogicalScrollWindowStart`      | ScrollBar.tsx   | 229-253 | scroll      |
| `normalizeStickyIndices`           | ScrollBar.tsx   | 255-259 | sticky      |
| `getActiveStickyIndex`             | ScrollBar.tsx   | 261-287 | sticky      |
| `getNextStickyIndex`               | ScrollBar.tsx   | 289-307 | sticky      |
| `getStickyOverlayOffset`           | ScrollBar.tsx   | 309-337 | sticky      |
| `getScrollSeekOptions`（逻辑部分） | ScrollBar.tsx   | 138-161 | scroll-seek |
| `getPageXY`                        | utils.ts        | 31-37   | dom         |
| `isDOM`                            | utils.ts        | 4-6     | dom         |
| `getSpinSize`                      | scrollUtil.ts   | 1-15    | scrollbar   |
| `getStickyIndicesFromGroups`       | stickyUtils.ts  | 1-24    | sticky      |
| `raf` (wrapperRaf)                 | raf.ts          | 1-55    | env         |
| `virtualRange` 全部                | virtualRange.ts | 1-460   | virtual     |

---

## 二、目标架构设计

### 2.1 三层包架构

#### `@better-scrollbar/core` — 零框架依赖

包含所有纯算法、数据结构、状态机和 DOM 工具。任何 JS 运行时都能使用。

**包含内容：**

- VirtualHeightIndex（Fenwick 树）
- ScrollEngine 状态机
- 16 个纯计算函数
- rAF 封装
- DOM 工具
- 框架无关类型
- CSS 样式

#### `@better-scrollbar/react` — peerDeps: react, core

React 绑定层。将 core 的命令式 API 接入 React 的声明式模型。

**包含内容：**

- ScrollBar 组件
- useHeights Hook
- useResizeObserver Hook
- Item 组件
- 滚动条子组件
- 默认渲染函数
- React 特有类型

#### `@better-scrollbar/vue` — peerDeps: vue, core

Vue 3 绑定层。使用 Composition API 将 core 接入 Vue 响应式系统。

**包含内容：**

- BScrollBar.vue
- useScrollBar composable
- useHeights composable
- 滚动条子组件
- Vue 特有类型

### 2.2 核心设计: ScrollEngine 状态机

> **关键设计决策：** ScrollBar.tsx 中 1441 行代码的核心挑战在于，滚动状态管理逻辑与 React hooks 深度耦合。解决方案是提取一个框架无关的 `ScrollEngine` 类，封装所有命令式的滚动状态管理。

ScrollEngine 是一个纯 TypeScript 类，不依赖任何框架。它管理滚动位置、虚拟范围、锚点维护等核心逻辑。React / Vue 适配器只需订阅其状态变更并驱动 UI 更新。

| 成员                    | 类型 | 职责                                               |
| ----------------------- | ---- | -------------------------------------------------- |
| `scrollState`           | 属性 | 当前滚动状态 (x, y, scrollHeight, clientHeight 等) |
| `heightIndex`           | 属性 | VirtualHeightIndex 实例引用                        |
| `updateScrollOffset()`  | 方法 | 处理滚动偏移更新 (wheel/drag/programmatic)         |
| `handleWheel()`         | 方法 | 处理 wheel 事件，计算滚动量                        |
| `scrollTo()`            | 方法 | 编程式滚动到指定位置                               |
| `getVisibleRange()`     | 方法 | 获取当前可视范围 (start, end, offset)              |
| `getAnchorSnapshot()`   | 方法 | 获取锚点快照用于内容位置维护                       |
| `restoreAnchor()`       | 方法 | 从快照恢复锚点位置                                 |
| `logicalToPhysicalY()`  | 方法 | 逻辑 → 物理坐标映射（大数据集）                    |
| `physicalToLogicalY()`  | 方法 | 物理 → 逻辑坐标映射                                |
| `getStickyState()`      | 方法 | 获取当前 sticky 元素状态                           |
| `getScrollSeekState()`  | 方法 | 获取快速滚动占位状态                               |
| `on('stateChange', cb)` | 事件 | 滚动状态变更通知                                   |
| `on('rangeChange', cb)` | 事件 | 可视范围变更通知                                   |
| `destroy()`             | 方法 | 清理资源 (rAF / 定时器)                            |

### 2.3 包间依赖关系

依赖方向严格单向：react/vue → core。Core 不知道上层框架的存在。

| 包                           | dependencies              | peerDependencies                         | 构建产物                      |
| ---------------------------- | ------------------------- | ---------------------------------------- | ----------------------------- |
| `@better-scrollbar/core`     | 无                        | 无                                       | ESM + CJS + UMD + .d.ts + CSS |
| `@better-scrollbar/react`    | 无                        | `react >=16.9`, `@better-scrollbar/core` | ESM + CJS + .d.ts             |
| `@better-scrollbar/vue`      | 无                        | `vue >=3.3`, `@better-scrollbar/core`    | ESM + CJS + .d.ts             |
| `better-scrollbar`（兼容包） | `@better-scrollbar/react` | `react >=16.9`                           | re-export 入口                |

---

## 三、目标目录结构

```
better-scrollbar/                 # monorepo root
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── package.json                   # workspace root (private)
│
├── packages/
│   ├── core/                      # @better-scrollbar/core
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       ├── types.ts           # 框架无关类型
│   │       ├── virtualRange.ts    # Fenwick 树 + 高度索引
│   │       ├── algorithms.ts      # 16 个纯函数
│   │       ├── scrollEngine.ts    # 滚动状态机
│   │       ├── scrollUtil.ts      # 滚动条尺寸计算
│   │       ├── stickyUtils.ts     # sticky 索引推导
│   │       ├── dom.ts             # isDOM, getPageXY
│   │       ├── raf.ts             # rAF 封装
│   │       └── styles/
│   │           └── ScrollBar.less
│   │
│   ├── react/                     # @better-scrollbar/react
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       ├── types.ts           # React 特有类型
│   │       ├── ScrollBar.tsx       # 主组件 (使用 core)
│   │       ├── defaultRenderElements.tsx
│   │       ├── hooks/
│   │       │   ├── useHeights.ts
│   │       │   └── useResizeObserver.ts
│   │       └── components/
│   │           ├── ScrollBar.tsx
│   │           ├── VerticalScrollBar.tsx
│   │           ├── HorizontalScrollBar.tsx
│   │           └── Item.tsx
│   │
│   └── vue/                       # @better-scrollbar/vue
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── src/
│           ├── index.ts
│           ├── types.ts
│           ├── BScrollBar.vue
│           ├── BScrollBarItem.vue
│           ├── composables/
│           │   ├── useScrollBar.ts
│           │   ├── useHeights.ts
│           │   └── useResizeObserver.ts
│           └── components/
│               ├── ScrollBarTrack.vue
│               ├── VerticalScrollBar.vue
│               └── HorizontalScrollBar.vue
│
├── apps/
│   └── site/                      # 官方文档站 (React)
│       ├── package.json
│       └── ...
│
└── test/                          # 或分散到各 packages
    └── ...
```

---

## 四、类型系统拆分方案

当前 `types.ts` 混合了框架无关类型和 React 特有类型。以下是精确的拆分方案。

### `core/src/types.ts` — 框架无关类型

| 类型                              | 说明                                      |
| --------------------------------- | ----------------------------------------- |
| `ScrollState`                     | 滚动状态（去除 React 导入，改用原始类型） |
| `ScrollOffset`                    | 滚动偏移目标                              |
| `ItemsRenderedInfo`               | 渲染范围信息                              |
| `AdaptiveOverscanOptions`         | 自适应 overscan 选项                      |
| `OverscanRange`                   | overscan 范围                             |
| `OverscanConfig`                  | overscan 完整配置                         |
| `FollowOutputOptions`             | 追踪输出选项                              |
| `ScrollSeekOptions`（纯数据部分） | 快速滚动选项（placeholder 改为泛型）      |
| `ScrollEngineOptions`             | 新增: 引擎初始化选项                      |
| `ScrollEngineState`               | 新增: 引擎状态快照                        |

### `react/src/types.ts` — React 特有类型

| 类型                    | 说明                                |
| ----------------------- | ----------------------------------- |
| `RenderElement<Props>`  | React 渲染回调（返回 ReactElement） |
| `RenderItem`            | React 行渲染器                      |
| `ScrollSeekPlaceholder` | React 占位符渲染器                  |
| `VirtualScrollBarProps` | 组件 Props（extends core 类型）     |
| `VirtualScrollBarRef`   | 组件 Ref 类型                       |
| `ScrollBarProps`        | 滚动条组件 Props                    |
| `ScrollBarRef`          | 滚动条组件 Ref                      |

---

## 五、分阶段执行计划

总预估工期：**9-15 天**。每阶段可独立交付和验证。

| 阶段 | 内容         | 预估工期 |
| ---- | ------------ | -------- |
| P0   | 基础设施搭建 | 1-2 天   |
| P1   | Core 包提取  | 2-3 天   |
| P2   | React 包重构 | 2-3 天   |
| P3   | Vue 包创建   | 3-5 天   |
| P4   | 站点 & 发布  | 1-2 天   |

### P0: 基础设施搭建（1-2 天）

1. 初始化 pnpm workspace (`pnpm-workspace.yaml`)
2. 安装 Turborepo 作为构建编排器
3. 建立 `packages/` 目录结构 (core, react, vue)
4. 迁移官方站点到 `apps/site/`，并作为独立 workspace app
5. 迁移根 `package.json` 为 workspace root
6. 配置统一的 TypeScript 基础配置 (`tsconfig.base.json`)
7. 配置统一的 ESLint / Prettier 规则

### P1: Core 包提取（2-3 天）

1. 创建 `packages/core/package.json` (`@better-scrollbar/core`)
2. 迁移 `virtualRange.ts` → `core/src/virtualRange.ts`
3. 迁移 `scrollUtil.ts` → `core/src/scrollUtil.ts`
4. 迁移 `stickyUtils.ts` → `core/src/stickyUtils.ts`
5. 迁移 `raf.ts` → `core/src/raf.ts`
6. 迁移 `styles/` → `core/src/styles/`
7. 从 `ScrollBar.tsx` 提取 16 个纯函数到 `core/src/algorithms.ts`
8. 从 `utils.ts` 提取 `isDOM`, `getPageXY` 到 `core/src/dom.ts`
9. 创建 `core/src/types.ts`（框架无关类型）
10. 创建 ScrollEngine 状态机类（封装滚动状态管理逻辑）
11. 配置 Vite 构建（ESM + CJS + UMD）
12. 迁移 `virtualRange.test.ts` 到 core 包

### P2: React 包重构（2-3 天）

1. 创建 `packages/react/package.json` (`@better-scrollbar/react`)
2. 设置对 `@better-scrollbar/core` 的 peerDependency
3. 重构 `ScrollBar.tsx` 使用 core 的 ScrollEngine
4. 保留 `hooks/` 中的 React Hooks
5. 保留 `components/` 中的 React 组件
6. 重构 `types.ts` 仅保留 React 特有类型（继承 core 类型）
7. 保留 `defaultRenderElements.tsx`
8. 配置 Vite 构建（external: react, react-dom, core）
9. 迁移 React 相关测试到 react 包
10. 保持向后兼容的 `better-scrollbar` 包（re-export）

### P3: Vue 包创建（3-5 天）

1. 创建 `packages/vue/package.json` (`@better-scrollbar/vue`)
2. 设置对 `@better-scrollbar/core` 的 peerDependency
3. 基于 ScrollEngine 实现 Vue 3 Composition API 版本
4. 实现 `useScrollBar` composable（对标 React 的 ScrollBar 组件）
5. 实现 `useHeights` composable（对标 React 的 useHeights hook）
6. 实现 Vue 组件: `BScrollBar.vue`, `BScrollBarItem.vue`
7. 实现 Vue 的 scrollbar 子组件（Vertical / Horizontal）
8. 编写 Vue 单元测试
9. 配置 Vite 构建（external: vue, core）

### P4: 站点 & 发布（1-2 天）

1. 更新 `apps/site/` 引用从 `@better-scrollbar/react` 导入
2. 配置 Turborepo 的 pipeline（build 依赖关系）
3. 配置 changesets 进行版本管理和发布
4. 更新 CI/CD（GitHub Actions）
5. 更新 README 文档
6. 配置 npm scope 发布（`@better-scrollbar/*`）
7. 发布 v2.0.0（breaking change: 包名变更）

---

## 六、Monorepo 工具链选型

| 工具     | 选型                          | 理由                                             |
| -------- | ----------------------------- | ------------------------------------------------ |
| 包管理器 | pnpm（已在用）                | 原生 workspace 支持，幽灵依赖防护，磁盘效率高    |
| 构建编排 | Turborepo                     | 增量构建缓存，任务依赖图，远程缓存支持，配置简洁 |
| 构建工具 | Vite（已在用）                | 每个 package 独立 vite.config，library mode 输出 |
| 版本管理 | changesets                    | monorepo 标准选择，自动 changelog，联动版本升级  |
| 类型检查 | TypeScript project references | 增量编译，包间类型依赖自动解析                   |
| 测试     | Vitest（已在用）              | 与 Vite 生态一致，workspace 原生支持             |
| Lint     | ESLint + Prettier（已在用）   | 根配置 + 包级覆盖                                |
| CI/CD    | GitHub Actions                | matrix 策略并行构建各包                          |

### 6.1 关键配置文件

#### `pnpm-workspace.yaml`

```yaml
packages:
    - "packages/*"
    - "apps/*"
```

#### `turbo.json`

```json
{
	"tasks": {
		"build": {
			"dependsOn": ["^build"],
			"outputs": ["dist/**"]
		},
		"test": {
			"dependsOn": ["build"]
		},
		"typecheck": {
			"dependsOn": ["^build"]
		},
		"dev": {
			"persistent": true
		}
	}
}
```

---

## 七、Vue 适配器设计方案

Vue 包遵循 Vue 3 Composition API 惯例，API 设计尽量与 React 版对齐，但尊重 Vue 生态的命名和使用习惯。

### 7.1 React vs Vue API 对照表

| React API                            | Vue API                        | 说明                                          |
| ------------------------------------ | ------------------------------ | --------------------------------------------- |
| `<ScrollBar>`                        | `<BScrollBar>`                 | 主组件，Vue 使用 SFC                          |
| `<Item>`                             | `<BScrollBarItem>`             | 行包装组件                                    |
| `useHeights` hook                    | `useHeights` composable        | 高度测量（ref/watch 替代 useState/useEffect） |
| `useResizeObserver` hook             | `useResizeObserver` composable | 容器尺寸监听（onMounted/onUnmounted）         |
| `forwardRef` + `useImperativeHandle` | `defineExpose`                 | 暴露组件方法                                  |
| `useRef`                             | `ref()` / `shallowRef()`       | DOM 引用和可变值                              |
| `useState` + `useCallback`           | `ref()` + `computed()`         | 响应式状态                                    |
| `useEffect`                          | `watch` / `watchEffect`        | 副作用                                        |
| `useLayoutEffect`                    | `onMounted` + `nextTick`       | 同步 DOM 副作用                               |
| `useMemo`                            | `computed()`                   | 派生计算                                      |
| `children` / `renderItem`            | `slot` / `#default="{item}"`   | 内容渲染                                      |
| `ScrollEngine.on()`                  | `ScrollEngine.on()`            | 共享 core 事件系统                            |

### 7.2 Vue 组件 API 设计

```vue
<template>
	<BScrollBar
		:item-count="100000"
		:estimated-item-height="40"
		:height="600"
		@scroll="onScroll"
		@scroll-start="onScrollStart"
		@scroll-end="onScrollEnd"
	>
		<template #default="{ index }">
			<div :key="index" class="row">Row {{ index }}</div>
		</template>
	</BScrollBar>
</template>

<script setup lang="ts">
import { BScrollBar } from "@better-scrollbar/vue"
import type { ScrollState } from "@better-scrollbar/core"

function onScroll(state: ScrollState) {
	/* ... */
}
function onScrollStart() {
	/* ... */
}
function onScrollEnd() {
	/* ... */
}
</script>
```

---

## 八、向后兼容与迁移策略

> ⚠️ **Breaking Change 处理：** 包名从 `better-scrollbar` 变更为 `@better-scrollbar/react` 是一个 breaking change。以下是平滑迁移的策略。

| 策略                       | 说明                                                                              |
| -------------------------- | --------------------------------------------------------------------------------- |
| 保留 `better-scrollbar` 包 | 发布一个瘦包装包，re-export `@better-scrollbar/react` 的全部 API，标记 deprecated |
| 语义化版本                 | `better-scrollbar@2.0.0` 内部变为 re-export 包，提示用户迁移                      |
| codemod 脚本               | 提供 jscodeshift 迁移脚本，自动将 import 路径从旧包名替换为新包名                 |
| CSS 路径兼容               | Core 包导出 CSS 时保持相同的类名前缀 `scroll-bar-*`                               |
| TypeScript 路径映射        | 新包 re-export 所有旧包的公开类型，确保类型签名一致                               |
| CHANGELOG                  | 详细记录变更和迁移步骤，提供 before/after 代码示例                                |

---

## 九、风险与注意事项

### 🔴 高风险：ScrollBar.tsx 拆分风险

1441 行的主组件中，React hooks 与滚动逻辑深度交织。提取 ScrollEngine 时需确保锚点恢复、scroll seek、follow output 等边缘场景的行为完全一致。

**应对措施：** 先写满覆盖的 E2E 测试（快照对比），再开始拆分。

### 🟡 中风险：Vue 生态差异

React 使用 `useLayoutEffect` 做同步 DOM 副作用；Vue 中需用 `onMounted` + `nextTick` + `watch flush: post` 模拟。ResizeObserver / MutationObserver 的生命周期管理在 Vue 中需特别注意 `onUnmounted` 清理。

### 🟡 中风险：包体积变化

拆分后 React 用户需同时安装 core + react 两个包。确保 core 包被 tree-shake 友好，使用 ESM + `sideEffects` 标记。CSS 样式应从 core 包导入，避免重复打包。

### 🟢 低风险：CI/CD 复杂度

Monorepo 需要处理包间依赖的构建顺序。Turborepo 的 `dependsOn: ["^build"]` 可自动处理。changesets 需配置 linked 组确保版本联动。

---

## 十、测试策略

| 层级  | 测试类型 | 工具                            | 覆盖内容                                          |
| ----- | -------- | ------------------------------- | ------------------------------------------------- |
| Core  | 单元测试 | Vitest                          | virtualRange / algorithms / ScrollEngine 状态转换 |
| Core  | 快照测试 | Vitest                          | 确保拆分前后计算结果完全一致                      |
| React | 组件测试 | Vitest + @testing-library/react | ScrollBar 组件行为 / hooks                        |
| React | 回归快照 | Vitest                          | 与当前 ScrollBar.test.tsx 快照对比                |
| Vue   | 组件测试 | Vitest + @vue/test-utils        | BScrollBar 组件行为 / composables                 |
| 集成  | E2E      | Playwright（可选）              | 实际浏览器中的滚动交互验证                        |
| CI    | 矩阵测试 | GitHub Actions                  | 每包独立测试 + 跨包集成测试                       |

---

## 十一、发布策略

| 包名                      | 首发版本 | npm scope           | 发布条件                                |
| ------------------------- | -------- | ------------------- | --------------------------------------- |
| `@better-scrollbar/core`  | 1.0.0    | `@better-scrollbar` | core 稳定后发布                         |
| `@better-scrollbar/react` | 2.0.0    | `@better-scrollbar` | 与 core 同步发布                        |
| `@better-scrollbar/vue`   | 1.0.0    | `@better-scrollbar` | Vue 适配完成后发布                      |
| `better-scrollbar`        | 2.0.0    | -                   | re-export 包，标记 deprecated migration |

> 💡 **版本联动：** 使用 changesets 的 linked 配置将 core 和 react 关联，确保 core 的 breaking change 会触发 react/vue 的 major 版本升级。
