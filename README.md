# better-scrollbar

![NPM License](https://img.shields.io/npm/l/better-scrollbar)
![NPM Version](https://img.shields.io/npm/v/better-scrollbar)
[![Coverage Status](https://coveralls.io/repos/github/kampiu/better-scrollbar/badge.svg?branch=master)](https://coveralls.io/github/kampiu/better-scrollbar?branch=master)

Highly customizable, high-performance React virtual scrolling with custom
horizontal and vertical scrollbars.

## Features

- Children mode for regular React lists.
- Indexed rendering with `itemCount + renderItem` for very large data sets.
- Dynamic-height measurement with a shared `ResizeObserver`.
- Custom scrollbar tracks, thumbs, and view wrappers.
- Scroll anchoring, bottom-following output, sticky rows, and ARIA metadata.
- Optional native wheel/trackpad scrolling when the browser can represent the
  full physical scroll range.

## Installation

```bash
pnpm add better-scrollbar
```

```bash
npm install better-scrollbar
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

## Custom Rendering

```tsx
import type { HTMLProps } from "react"
import ScrollBar, { type RenderElement } from "better-scrollbar"

const renderThumb: RenderElement<HTMLProps<HTMLDivElement>> = (props) => (
	<div
		{...props}
		style={{
			...props?.style,
			background: "rgba(37, 99, 235, 0.7)",
			borderRadius: 999
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

- [VirtualScrollBar API](docs/virtual-scrollbar-api.md)
- [Virtual list optimization practices](docs/virtual-list-optimization.md)
- [Contributing guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## Local Development

This repository uses pnpm and commits `pnpm-lock.yaml` for reproducible installs.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run site:dev
```

`pnpm run build` writes package artifacts to `dist`, including ESM, CJS, UMD,
CSS, source maps, and type declarations.

Build the documentation/demo site:

```bash
pnpm run site:build
```

The site build writes to `dist-site` so it does not overwrite package artifacts.

## License

MIT
