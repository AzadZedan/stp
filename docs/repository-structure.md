# Repository Structure

This repository has been organized into clear sections:

## Core Application

- `server.js`: sync API entry point.
- `main.js`: extended API server entry point.
- `market.js`: market module.
- `wallet.js`: wallet module.
- `src/`: application source code (AI agent module).
- `server/`: TypeScript server variant.
- `lib/`: shared runtime libraries.

## Interfaces and Assets

- `public/`: static web assets.
- `docs/`: all human-facing project documentation.
- `locales/`: localization resources.

## Automation

- `scripts/`: operational scripts and repository maintenance tools.
- `.github/workflows/`: CI/CD automation.

## Generated Consolidation Artifacts

- `artifacts/merged/extensions/`: merged content grouped by file extension.
- `artifacts/merged/repository-unified.json`: single unified JSON containing indexed source/docs and PR-related files.
- `artifacts/merged/pull-requests.md`: merged PR and merge-resolution documents.
- `artifacts/merged/merge-summary.json`: compact merge output summary.

## Legacy / External Bundles (kept for compatibility)

- `actions-runner/`: self-hosted runner binary bundle.
- `git/`: embedded Git source snapshot.
- `stampcoin-platform/`: historical mirrored project folder.

Note: external/legacy bundles were excluded from validation and merge generation where appropriate to avoid mixing third-party/vendor payloads with project source.
