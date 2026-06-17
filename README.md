# better-scrollbar

![NPM License](https://img.shields.io/npm/l/better-scrollbar)
![NPM Version](https://img.shields.io/npm/v/better-scrollbar)
[![Coverage Status](https://coveralls.io/repos/github/kampiu/better-scrollbar/badge.svg?branch=master)](https://coveralls.io/github/kampiu/better-scrollbar?branch=master)

Highly customizable, high-performance virtual list for big data rendering.

Feel free to provide feedback if there are any issues, and promptly synchronize problem handling.

## Installation
```bash
npm install better-scrollbar --save
```

## Usage

For the complete user-facing API, including every prop type and default value, see [docs/virtual-scrollbar-api.md](docs/virtual-scrollbar-api.md).

```javascript
import React, { Component } from "react"
import ScrollBar from "better-scrollbar"
import "better-scrollbar/dist/BetterScrollbar.min.css"

class App extends Component {
  render() {
    return (
      <ScrollBar style={{ width: 500, height: 300 }}>
        <p>Some great content...</p>
      </ScrollBar>
    )
  }
}
```

The `<ScrollBar>` component is completely customizable. Check out the following code:

```javascript
import React, { Component } from "react"
import ScrollBar from "better-scrollbar"
import "better-scrollbar/dist/BetterScrollbar.min.css"

class CustomScrollBar extends Component {
  render() {
    return (
      <ScrollBar
        width={this.props.width}
        height={this.props.height}
        onScroll={this.handleScroll}
        onScrollStart={this.handleScrollStart}
        onScrollEnd={this.handleScrollEnd}
        renderView={this.renderView}
        renderTrackHorizontal={this.renderTrackHorizontal}
        renderTrackVertical={this.renderTrackVertical}
        renderThumbHorizontal={this.renderThumbHorizontal}
        renderThumbVertical={this.renderThumbVertical}
        scrollBarHidden
        scrollBarAutoHideTimeout={1000}
        {...this.props}
      />
    )
  }
}
```

### 50 million rows

```tsx
import ScrollBar from "better-scrollbar"

const ROW_COUNT = 50_000_000

export default () => (
  <ScrollBar
    width={720}
    height={420}
    itemCount={ROW_COUNT}
    estimatedItemHeight={32}
    heightCacheLimit={50_000}
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
```

For massive logical ranges, `scrollMode="native"` stays native only while the
browser can represent the full scroll height. When `maxBrowserScrollHeight`
compresses the physical range, wheel input automatically uses the controlled
path so each wheel delta still maps to the exact logical offset. `scrollSeek`
placeholders are intentionally not measured as row heights, and
`maxRenderedItems` also protects `isVirtual={false}` / `preserveItemState`
from accidentally mounting very large DOM trees. Pass
`maxRenderedItems={Infinity}` only when rendering every item is intentional.

### If you are a tree level structure, you can use the following code:

```tsx
import React from "react"
import ScrollBar from "better-scrollbar"
import "better-scrollbar/dist/BetterScrollbar.min.css"

interface Node {
  id: string
  name: string
  next?: Array<Node>
}

const renderList = (props: Node): Array<JSX.Element> => {
  const component = <div>{ props.name }</div>
  const nodesList = [component]

  if (props?.next && props?.next) {
    props?.next?.map((node) => nodesList.push(...renderList(node)))
  }
  return nodesList
}

export default () => {
  const tree: Node = {id: "1", name: "demo"}
  return (
    <div>
      <ScrollBar width={ 500 } height={ 200 }>
        { renderList(tree) }
      </ScrollBar>
    </div>
  )
}
```

## Examples

Run the simple example:
```bash
# Make sure that you've installed the dependencies
npm install
npm run site:dev
```


## License

MIT
