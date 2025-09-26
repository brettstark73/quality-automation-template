# Repository Guidelines

## Project Structure & Module Organization
- Root hosts `setup.js` (Node-based bootstrapper) and `package.json` templates the target project with Husky, lint-staged, and quality configs.
- Configuration files (`.prettierrc`, `.eslintrc.json`, `.stylelintrc.json`, ignore lists) define the baseline style enforced by the setup script.
- GitHub Actions workflow lives in `.github/workflows/quality.yml`; adjust this file to extend CI checks.
- Template docs reside in `README.md`; keep it aligned with any workflow or tooling changes.

## Build, Test, and Development Commands
- `npm run setup` — runs the bootstrap script against the current repo.
- `npm run prepare` — installs Husky hooks; run after dependency installs.
- `npm run format` / `npm run format:check` — applies or verifies Prettier formatting.
- `npm run lint` / `npm run lint:fix` — executes ESLint on JS/TS/HTML and Stylelint on CSS/SCSS; `lint:fix` auto-corrects when possible.
- `npm test` — placeholder; replace with your project’s test runner and keep CI in sync.

## Coding Style & Naming Conventions
- Prettier enforces 2-space indentation, single quotes, no semicolons, 80-character wrap, `trailingComma: es5`, and `arrowParens: avoid`.
- ESLint extends `eslint:recommended`; add rule adjustments in `.eslintrc.json` rather than per-file overrides.
- Stylelint extends `stylelint-config-standard`; prefer BEM-style class names for clarity in shared CSS.
- Commit hook runs lint-staged; keep staged changes passing format/lint before committing.

## Testing Guidelines
- Configure your preferred framework (Jest, Vitest, Playwright, etc.) and wire it to `npm test` for local use and CI reuse.
- Name test files `<component>.test.{js,ts}` alongside source or within a `__tests__` directory for larger modules.
- Target meaningful coverage of quality automation scripts and custom workflow steps when they exist.

## Commit & Pull Request Guidelines
- Follow the existing history pattern: `Type: concise summary` (e.g., `Docs: clarify setup fallback`). Optional scopes belong before the colon.
- Keep commits focused on a single concern; run formatting/linting before staging.
- Pull requests must describe the motivation, summarize key changes, list verification steps (commands run, screenshots if UI), and reference related issues.
- Ensure CI passes on the feature branch before requesting review; include notes for follow-up work when deferring tasks.

## Automation & CI Notes
- Quality workflow pins Node 20 with npm cache; update both `volta` and `.nvmrc` if versions change.
- CI runs Prettier, ESLint (`--max-warnings=0`), Stylelint, and a non-blocking `npm audit`; extend here for project-specific tests or type checks.
