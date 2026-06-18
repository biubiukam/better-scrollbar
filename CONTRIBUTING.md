# Contributing

Thanks for taking the time to improve `better-scrollbar`.

## Development Setup

This repository uses pnpm. Install dependencies from the committed lockfile:

```bash
corepack enable
pnpm install --frozen-lockfile
```

Useful commands:

```bash
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run site:dev
pnpm run site:build
```

## Pull Request Guidelines

- Keep changes focused on one bug fix, feature, or documentation update.
- Add or update tests for behavior changes.
- Update `README.md` or `docs/` when public APIs or examples change.
- Run the relevant verification commands before opening a pull request.
- Do not commit generated output unless it is intentionally part of the package or site release.

## Reporting Issues

When reporting a bug, include:

- The package version.
- React and React DOM versions.
- Browser and operating system.
- A minimal reproduction or a small code sample.
- Expected behavior and actual behavior.

Feature requests are welcome, but please describe the use case before proposing a specific API.
