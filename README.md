# better-scrollbar

[![NPM Version](https://img.shields.io/npm/v/better-scrollbar)](https://www.npmjs.com/package/better-scrollbar)
[![NPM License](https://img.shields.io/npm/l/better-scrollbar)](./LICENSE)
[![Coverage Status](https://coveralls.io/repos/github/biubiukam/better-scrollbar/badge.svg?branch=master)](https://coveralls.io/github/biubiukam/better-scrollbar?branch=master)

A highly customizable, high-performance React virtual scrollbar component for
rendering large data sets with custom horizontal and vertical scrollbars.

## Features

- **Children mode** for regular React lists with familiar JSX syntax.
- **Indexed rendering** with `itemCount` + `renderItem` for massive data sets
  (millions of rows).
- **Dynamic height measurement** via a shared `ResizeObserver` with LRU cache.
- **Custom scrollbar** tracks, thumbs, and view wrappers through render props.
- **Scroll anchoring** that preserves visible position during prepend and resize.
- **Bottom-following output** for log and chat-style views.
- **Sticky rows** and group headers with `stickyIndices` / `groupCounts`.
- **Native scroll mode** that delegates to the browser when possible.
- **Scroll seek** placeholders during fast scrolling for expensive row renderers.
- **Adaptive overscan** that expands pre-rendering toward the scroll direction.
- **Accessibility** with built-in `role="list"` / `role="listitem"` and ARIA
  position metadata.

## Requirements

- React >= 16.9.0
- Node >= 18 (for development)

## Installation

```bash
# pnpm (recommended)
pnpm add better-scrollbar

# npm
npm install better-scrollbar

# yarn
yarn add better-scrollbar
```

## Quick Start

```tsx
import ScrollBar from "better-scrollbar"
import "better-scrollbar/dist/ScrollBar.min.css"

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

## Indexed Rendering

Use indexed rendering when the data set is too large to allocate as a full
children array.

```tsx
import ScrollBar from "better-scrollbar"
import "better-scrollbar/dist/ScrollBar.min.css"

const ROW_COUNT = 50_000_000

export default function HugeList() {
  return (
    <ScrollBar
      width={720}
      height={420}
      itemCount={ROW_COUNT}
      estimatedItemHeight={32}
      heightCacheLimit={50_000}
      overscan={2}
      overscanPixels={320}
      maxRenderedItems={500}
      scrollMode="native"
      adaptiveOverscan
      scrollSeek={{ velocityThreshold: 2, exitVelocityThreshold: 0.8 }}
      renderItem={(index) => (
        <div key={index} style={{ height: 32 }}>
          Row {index.toLocaleString()}
        </div>
      )}
    />
  )
}
```

For massive logical ranges, `scrollMode="native"` stays native only while the
browser can represent the full scroll height. When the component compresses the
physical browser range through `maxBrowserScrollHeight`, wheel input falls back
to the controlled path so each delta still maps to the exact logical offset.

## Custom Scrollbar

```tsx
import type { HTMLProps } from "react"
import ScrollBar, { type RenderElement } from "better-scrollbar"
import "better-scrollbar/dist/ScrollBar.min.css"

const renderThumb: RenderElement<HTMLProps<HTMLDivElement>> = (props) => (
  <div
    {...props}
    style={{
      ...props?.style,
      background: "rgba(37, 99, 235, 0.7)",
      borderRadius: 999,
    }}
  />
)

export default function CustomScrollbar() {
  return (
    <ScrollBar
      width={500}
      height={300}
      scrollBarSize={8}
      renderThumbVertical={renderThumb}
      renderThumbHorizontal={renderThumb}
    >
      <div style={{ width: 900, height: 600 }}>Large content</div>
    </ScrollBar>
  )
}
```

## Documentation

- [API Reference](docs/virtual-scrollbar-api.md) — full props, types, and ref
  API.
- [Optimization Practices](docs/virtual-list-optimization.md) — design
  decisions and industry references.
- [Contributing](CONTRIBUTING.md) — development setup and pull request
  guidelines.
- [Security Policy](SECURITY.md) — vulnerability reporting.
- [Changelog](CHANGELOG.md) — release history.

## Local Development

This repository uses [pnpm](https://pnpm.io/) and commits `pnpm-lock.yaml` for
reproducible installs.

```bash
corepack enable
pnpm install --frozen-lockfile
```

Available scripts:

| Command | Description |
| --- | --- |
| `pnpm run typecheck` | Run TypeScript type checking |
| `pnpm run test` | Run tests with coverage |
| `pnpm run build` | Build the library to `dist/` |
| `pnpm run site:dev` | Start the documentation site dev server |
| `pnpm run site:build` | Build the documentation site to `dist-site/` |

### Build Outputs

`pnpm run build` produces the following artifacts in `dist/`:

- `better-scrollbar.es.mjs` — ES module
- `better-scrollbar.cjs` — CommonJS module
- `ScrollBar.min.js` — UMD bundle
- `ScrollBar.min.css` — Minified styles
- `types/` — TypeScript declarations

## Browser Support

Any browser that supports
[ResizeObserver](https://caniuse.com/resizeobserver) (Chrome 64+, Firefox 69+,
Safari 13.1+, Edge 79+). A polyfill is included as a fallback for older
environments.

## License

[MIT](./LICENSE)
