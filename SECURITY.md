# Security Policy

## Supported versions

Security fixes are applied to the latest version on the default branch.

## Reporting a vulnerability

Please use this repository's private GitHub security advisory workflow. Do not open a public issue for a vulnerability that could expose users, credentials, or local files.

Include the affected revision, a minimal reproduction, impact, and any known mitigation. Do not include credential values or private endpoint details in the report.

## Security boundary

Pi Evidence Debug is a local Pi extension. It provides guardrails for a subset of file and shell operations, but it is not an operating-system sandbox. Users should run it only in repositories they trust and should review changes before accepting them.
