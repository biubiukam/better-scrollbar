# Contributing

Thanks for taking the time to improve `better-scrollbar`! This guide covers the
development workflow and conventions used in this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Issues](#reporting-issues)
- [Commit Convention](#commit-convention)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code.

## Development Setup

### Prerequisites

- Node.js >= 18
- [pnpm](https://pnpm.io/) (managed via Corepack)

### Getting Started

```bash
git clone https://github.com/biubiukam/better-scrollbar.git
cd better-scrollbar
corepack enable
pnpm install --frozen-lockfile
```

### Useful Commands

```bash
pnpm run typecheck       # Type check the entire project
pnpm run test            # Run tests with coverage
pnpm run test:dev        # Run tests in watch mode
pnpm run build           # Build the library
pnpm run site:dev        # Start the docs site dev server
pnpm run site:build      # Build the docs site
```

## Project Structure

```
src/
├── ScrollBar.tsx           # Main component
├── index.ts                # Public entry point
├── types.ts                # Public TypeScript types
├── virtualRange.ts         # Virtual height index (Fenwick tree)
├── scrollUtil.ts           # Scrollbar geometry calculations
├── stickyUtils.ts          # Sticky row utilities
├── raf.ts                  # requestAnimationFrame scheduler
├── utils.ts                # Internal helpers
├── defaultRenderElements.tsx
├── components/             # Internal sub-components
│   ├── ScrollBar.tsx       # Scrollbar track/thumb component
│   ├── VerticalScrollBar.tsx
│   ├── HorizontalScrollBar.tsx
│   └── Item.tsx
├── hooks/                  # React hooks
│   ├── useHeights.ts
│   └── useResizeObserver.ts
└── styles/                 # Component styles (Less)

site/                       # Documentation / demo site (Vite + React)
test/                       # Test files (Vitest)
docs/                       # Additional documentation
```

## Making Changes

1. Create a feature branch from `master`:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Make your changes with clear, focused commits.
3. Ensure type checking and tests pass:
   ```bash
   pnpm run typecheck && pnpm run test
   ```
4. Open a pull request targeting `master`.

## Testing

Tests are written with [Vitest](https://vitest.dev/) and
[@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/).

- Unit tests for core algorithms (e.g., `virtualRange.ts`) should not depend on
  DOM simulation.
- Component tests use `jsdom` and `@testing-library/react`.
- Run snapshot updates when intentional output changes occur:
  ```bash
  pnpm run test:update
  ```

## Pull Request Guidelines

- Keep changes focused on **one** bug fix, feature, or documentation update.
- Add or update tests for behavior changes.
- Update `README.md` or `docs/` when public APIs or usage examples change.
- Run all verification commands before opening a pull request.
- Do not commit generated output (e.g., `dist/`, `coverage/`) unless it is
  intentionally part of the package or site release.
- Ensure there are no TypeScript errors or unresolved lint warnings in your
  changes.

## Reporting Issues

### Bug Reports

When reporting a bug, include:

- The `better-scrollbar` package version.
- React and React DOM versions.
- Browser and operating system.
- A minimal reproduction (CodeSandbox / StackBlitz preferred) or a small code
  sample.
- Expected behavior vs. actual behavior.

### Feature Requests

Feature requests are welcome. Please describe the use case and motivation before
proposing a specific API surface.

## Commit Convention

This project follows a lightweight conventional commit style:

```
type: short description

Optional body with more detail.
```

Common types:

| Type | Usage |
| --- | --- |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `chore` | Tooling, CI, or dependency updates |
| `perf` | Performance improvement |

Examples:

```
feat: add groupCounts prop for automatic sticky group headers
fix: prevent scroll anchor jump when rows above viewport resize
docs: update API reference with scrollSeek options
```
