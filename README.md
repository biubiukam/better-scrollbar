# better-scrollbar

[![NPM Version](https://img.shields.io/npm/v/better-scrollbar)](https://www.npmjs.com/package/better-scrollbar)
[![NPM License](https://img.shields.io/npm/l/better-scrollbar)](./LICENSE)
[![Coverage Status](https://coveralls.io/repos/github/biubiukam/better-scrollbar/badge.svg?branch=master)](https://coveralls.io/github/biubiukam/better-scrollbar?branch=master)

A highly customizable, high-performance virtual scrollbar for rendering large
data sets. Ships framework-specific adapters for **React** and **Vue 3**, built
on a shared framework-agnostic core.

## Packages

| Package                                     | Description                                                  | Version                                                                                                               |
| ------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| [`@better-scrollbar/core`](packages/core)   | Framework-neutral algorithms and utilities                   | [![npm](https://img.shields.io/npm/v/@better-scrollbar/core)](https://www.npmjs.com/package/@better-scrollbar/core)   |
| [`@better-scrollbar/react`](packages/react) | React adapter (component, hooks, render props)               | [![npm](https://img.shields.io/npm/v/@better-scrollbar/react)](https://www.npmjs.com/package/@better-scrollbar/react) |
| [`@better-scrollbar/vue`](packages/vue)     | Vue 3 adapter (component, composables)                       | [![npm](https://img.shields.io/npm/v/@better-scrollbar/vue)](https://www.npmjs.com/package/@better-scrollbar/vue)     |
| [`better-scrollbar`](.)                     | Compatibility wrapper — re-exports `@better-scrollbar/react` | [![npm](https://img.shields.io/npm/v/better-scrollbar)](https://www.npmjs.com/package/better-scrollbar)               |

> **Migrating from v1?** The `better-scrollbar` package continues to export the
> same React API. No changes are required unless you want to switch to the
> scoped `@better-scrollbar/react` import.

## Features

- **Children mode** for regular lists with familiar JSX / slot syntax.
- **Indexed rendering** with `itemCount` + `renderItem` / scoped slot for
  massive data sets (millions of rows).
- **Dynamic height measurement** via a shared `ResizeObserver` with LRU cache.
- **Custom scrollbar** tracks, thumbs, and view wrappers through render props
  (React) or slots (Vue).
- **Scroll anchoring** that preserves visible position during prepend and resize.
- **Bottom-following output** for log and chat-style views.
- **Sticky rows** and group headers with `stickyIndices` / `groupCounts`.
- **Native scroll mode** that delegates to the browser when possible.
- **Scroll seek** placeholders during fast scrolling for expensive row renderers.
- **Adaptive overscan** that expands pre-rendering toward the scroll direction.
- **Accessibility** with built-in `role="list"` / `role="listitem"` and ARIA
  position metadata.

## Quick Start

### React

```bash
pnpm add @better-scrollbar/react @better-scrollbar/core
```

```tsx
import ScrollBar from "@better-scrollbar/react"
import "@better-scrollbar/react/styles/ScrollBar.less"

export default function BasicList() {
	return (
		<ScrollBar width={500} height={300} itemHeight={32}>
			<div key="a">Row A</div>
			<div key="b">Row B</div>
			<div key="c">Row C</div>
		</ScrollBar>
	)
}
```

### Vue 3

```bash
pnpm add @better-scrollbar/vue @better-scrollbar/core
```

```vue
<script setup>
import { BScrollBar } from "@better-scrollbar/vue"
import "@better-scrollbar/vue/styles/ScrollBar.less"
</script>

<template>
	<BScrollBar :item-count="10000" :estimated-item-height="32" :height="400">
		<template #default="{ index }">
			<div>Row {{ index }}</div>
		</template>
	</BScrollBar>
</template>
```

## Documentation

- [React API Reference](packages/react/README.md) — full props, types, and ref API.
- [Vue API Reference](packages/vue/README.md) — props, events, exposed methods, and composables.
- [Core API Reference](packages/core/README.md) — algorithms, virtual height index, and shared types.
- [Detailed API Reference](docs/virtual-scrollbar-api.md) — comprehensive props table with defaults.
- [Optimization Practices](docs/virtual-list-optimization.md) — design decisions and industry references.
- [Contributing](CONTRIBUTING.md) — development setup and pull request guidelines.
- [Security Policy](SECURITY.md) — vulnerability reporting.
- [Changelog](CHANGELOG.md) — release history.

## Monorepo Structure

```
better-scrollbar/
├── packages/
│   ├── core/       # @better-scrollbar/core — algorithms, types, utilities
│   ├── react/      # @better-scrollbar/react — React component & hooks
│   └── vue/        # @better-scrollbar/vue — Vue 3 component & composables
├── apps/
│   └── site/       # Documentation site (React)
├── src/
│   └── index.ts    # Compatibility re-export (better-scrollbar → @better-scrollbar/react)
├── test/           # Shared test suites
└── docs/           # Design docs and detailed API reference
```

## Local Development

This repository uses [pnpm](https://pnpm.io/) workspaces and
[Turborepo](https://turbo.build/) for task orchestration.

```bash
corepack enable
pnpm install --frozen-lockfile
```

| Command               | Description                             |
| --------------------- | --------------------------------------- |
| `pnpm run build`      | Build all packages via Turborepo        |
| `pnpm run dev`        | Start dev mode for all packages         |
| `pnpm run typecheck`  | Type-check all packages                 |
| `pnpm run lint`       | Lint all source files with ESLint       |
| `pnpm run test`       | Run tests with coverage                 |
| `pnpm run clean`      | Remove all build artifacts              |
| `pnpm run site:dev`   | Start the documentation site dev server |
| `pnpm run site:build` | Build the documentation site            |

## Browser Support

Any browser that supports
[ResizeObserver](https://caniuse.com/resizeobserver) (Chrome 64+, Firefox 69+,
Safari 13.1+, Edge 79+). A polyfill is included as a fallback for older
environments.

## License

[MIT](./LICENSE)
