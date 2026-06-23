# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

Security fixes target the latest published version of `better-scrollbar`.
Older major versions will not receive backports unless explicitly stated.

## Reporting a Vulnerability

**Please do not open a public issue for suspected security vulnerabilities.**

Report security concerns through one of the following channels, in order of
preference:

1. **GitHub Security Advisories** — use the "Report a vulnerability" button on
   the [Security tab](https://github.com/biubiukam/better-scrollbar/security/advisories/new)
   of the repository (preferred).
2. **Email** — contact the maintainer through the email address listed on the
   maintainer's [GitHub profile](https://github.com/biubiukam).

### What to Include

- Affected version(s) or commit hash.
- Steps to reproduce the issue.
- Impact assessment and any known workarounds.
- Whether the issue is already publicly disclosed.

### Response Timeline

- **Acknowledgment**: within 72 hours of the report.
- **Initial assessment**: within 7 days.
- **Fix or mitigation**: best effort within 30 days for confirmed vulnerabilities.

The maintainer will coordinate disclosure timing with the reporter. Credit will
be given to reporters in the release notes unless they prefer to remain
anonymous.

## Scope

This policy covers the `better-scrollbar` npm package source code. Third-party
dependencies are managed through Dependabot and are outside the direct scope of
this policy; however, reports about transitive vulnerabilities that affect
`better-scrollbar` users are welcome.
