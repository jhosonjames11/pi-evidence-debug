# Contributing

Thank you for improving Pi Evidence Debug.

## Development setup

Use Node.js 22 or newer, then install contributor dependencies:

```bash
npm install --legacy-peer-deps
npm run check
```

The extension itself is loaded by Pi from `index.ts`; the local dependency installation is only for contributor tests and type checking.

## Contribution rules

- Keep the extension provider-agnostic.
- Do not add credential values, personal filesystem paths, organization-specific endpoints, or session artifacts.
- Add or update a deterministic test before changing behavior.
- Preserve the evidence-first policy: unconfirmed risks belong in reporting, not source edits.
- Keep README.md and README.zh-CN.md equivalent when user-facing behavior changes.
- Run `npm run check` before opening a pull request.

## Pull requests

Describe the bug or requirement, the evidence that reproduces it, the verification command, and any remaining risk. Avoid including secrets, private endpoints, or local paths in issues, commits, or pull requests.
