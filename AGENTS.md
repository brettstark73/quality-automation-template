# Repository Guidelines

## Structure & Scope
- `setup.js` is the published CLI (`create-quality-automation`) used via `npx`; it detects `--update`, TypeScript presence, and writes configs idempotently.
- `config/defaults.js` centralises script, dependency, and lint-staged templates; adjust versions there first.
- Flat ESLint configs (`eslint.config.cjs`, `eslint.config.ts.cjs`), `.editorconfig`, Stylelint/Prettier files, and `.husky/` assets ship with the npm package (see `package.json:files`).
- Documentation lives in `README.md` and `CHANGELOG.md`; keep both aligned with any behavioural change.

## Development & QA Commands
- `npm test` runs the integration smoke tests for both JS and TS fixtures; add scenarios here before modifying setup behaviour.
- `npm run lint`, `npm run lint:fix`, `npm run format`, and `npm run format:check` keep sources consistent.
- `npm run setup` executes the CLI against the repo itself for manual verification; prefer this plus `npm test` before releases.
- Use `npm pack` to inspect the publishable tarball locally.

## Coding Standards
- ESLint uses flat config; edit rule sets inside `eslint.config.cjs` (and `eslint.config.ts.cjs` for TS-specific tweaks) instead of per-file overrides.
- Prettier dictates 2-space, single quotes, 80 line width; Stylelint extends `stylelint-config-standard`.
- Maintain idempotent behaviour in `setup.js`; any new file copy or script mutation must safely merge with existing consumer state.

## Release Process
- Update `CHANGELOG.md` and bump `package.json`/`package-lock.json` versions via `npm version`.
- Run `npm test`, `npm run lint`, and `npm run format:check` before tagging.
- Tag the release (`git tag vX.Y.Z`) and push tags; publish with `npm publish --access public`.
- Announce new usage (e.g., `npx create-quality-automation@latest --update`) in README when behaviour shifts.

## Pull Request Expectations
- Keep commits focused; follow the conventional summary style (`Template: …`, `Docs: …`).
- Document validation steps (commands run, npm pack hash) in PR descriptions.
- Note optional clean-up, like removing `.eslintignore` when consumers fully adopt flat config, rather than forcing it.
