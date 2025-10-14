# Create Quality Automation 🚀

Bootstrap quality automation in any project with GitHub Actions, pre-commit hooks, linting, and code formatting. **Now supports JavaScript, TypeScript, AND Python!**

## ✨ Features

- **🌐 Multi-Language Support** - JavaScript, TypeScript, and Python in one tool
- **🔧 Automatic Detection** - Detects your project type and configures accordingly
- **🪝 Pre-commit Hooks** - Husky (JS/TS) or pre-commit (Python) - automatic quality checks
- **⚡ Smart Processing** - Only process changed files for speed
- **🤖 GitHub Actions** - Automated quality checks in CI/CD for all languages
- **📦 One Command Setup** - `npx create-quality-automation@latest`
- **🔄 TypeScript Smart** - Auto-detects and configures TypeScript projects
- **🐍 Python Modern** - Black, Ruff, isort, mypy with pyproject.toml
- **🆕 Modern Tooling** - ESLint 9, Ruff, latest dependencies
- **🔒 Security Automation** - npm audit and secrets scanning

## 🚀 Quick Start

### For JavaScript/TypeScript Projects

```bash
# Navigate to your project (must be a git repository)
cd your-js-project/

# Bootstrap quality automation
npx create-quality-automation@latest

# Install new dependencies
npm install

# Set up pre-commit hooks
npm run prepare
```

### For Python Projects

```bash
# Navigate to your Python project (must be a git repository)
cd your-python-project/

# Bootstrap quality automation
npx create-quality-automation@latest

# Install Python dependencies
python3 -m pip install -r requirements-dev.txt

# Set up pre-commit hooks
pre-commit install
```

### For Multi-Language Projects

The tool automatically detects both JavaScript/TypeScript AND Python and configures quality automation for both!

```bash
# Navigate to your polyglot project
cd your-fullstack-project/

# Bootstrap quality automation for all detected languages
npx create-quality-automation@latest

# JavaScript/TypeScript setup
npm install && npm run prepare

# Python setup
python3 -m pip install -r requirements-dev.txt
pre-commit install
```

**That's it!** Your project now has comprehensive quality automation.

### Update Existing Setup

```bash
# Update to latest configurations
npx create-quality-automation@latest --update

# Install any new dependencies
npm install

# Verify everything works
npm run lint
```

### New Project from Scratch

```bash
# Create new project
mkdir my-awesome-project && cd my-awesome-project
git init
npm init -y

# Add quality automation
npx create-quality-automation@latest
npm install && npm run prepare

# Start coding with quality tools active!
echo "console.log('Hello, quality world!')" > index.js
git add . && git commit -m "feat: initial commit with quality tools"
```

## 📁 What Gets Added to Your Project

### JavaScript/TypeScript Projects

```
your-js-project/
├── .github/workflows/
│   └── quality.yml              # GitHub Actions workflow
├── .editorconfig                # Editor defaults
├── eslint.config.cjs            # ESLint flat config
├── .prettierrc                  # Prettier configuration
├── .prettierignore              # Files to ignore
├── .stylelintrc.json            # Stylelint config
├── .husky/                      # Pre-commit hooks
├── .nvmrc                       # Node version
├── .npmrc                       # npm config
└── package.json                 # Updated with scripts
```

### Python Projects

```
your-python-project/
├── .github/workflows/
│   └── quality-python.yml       # GitHub Actions workflow
├── .editorconfig                # Editor defaults
├── pyproject.toml               # Black, Ruff, isort, mypy config
├── .pre-commit-config.yaml      # Pre-commit hooks
├── requirements-dev.txt         # Dev dependencies
└── tests/                       # Test directory
```

### Multi-Language Projects

Both sets of files are created, and package.json gets Python helper scripts!

## ⚙️ Configuration

### Node Version

- This template pins Node to version 20 for local dev and CI.
- Tools included:
  - `.nvmrc` → auto-switch with `nvm use`
  - `package.json` → `engines.node ">=20"` and Volta pin for Node/npm
  - `.npmrc` → `engine-strict = true` to enforce engine checks

Conservative behavior:

- The setup script adds engines/Volta pins if they are missing, but does not overwrite your existing values.
- This avoids unexpectedly changing repos already pinned to another Node version.

### Prettier Configuration (`.prettierrc`)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Lint-staged Configuration (in `package.json`)

```json
{
  "lint-staged": {
    "package.json": ["prettier --write"],
    "**/*.{js,jsx,mjs,cjs,html}": ["eslint --fix", "prettier --write"],
    "**/*.{css,scss,sass,less,pcss}": ["stylelint --fix", "prettier --write"],
    "**/*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

If the setup script detects TypeScript (via a `typescript` dependency or a `tsconfig` file), the `**/*.{js,jsx,mjs,cjs,html}` pattern automatically expands to include `.ts` and `.tsx`.

The CLI scans your repository for existing CSS, Sass, Less, and PostCSS files so Stylelint targets only the directories you already use. If you have custom CSS globs in `lint-staged`, the setup script keeps them instead of overwriting them with broad defaults.

## 🔧 Customization

### Extending ESLint/Stylelint

- ESLint flat config lives in `eslint.config.cjs`. Adjust the exported array to tweak rules—for example, update the final rule block to warn on console usage:
  ```js
  // eslint.config.cjs
  module.exports = [
    /* ...existing entries... */
    {
      files: ['**/*.{js,jsx,mjs,cjs,html}'],
      rules: {
        // existing rules...
        'no-console': 'warn',
      },
    },
  ]
  ```
  When TypeScript is detected the script writes a variant with `@typescript-eslint`; customize the `files: ['**/*.{ts,tsx}']` block in the same way.
- Stylelint rules live in `.stylelintrc.json`; example to relax specificity:
  ```json
  {
    "extends": ["stylelint-config-standard"],
    "rules": { "no-descending-specificity": null }
  }
  ```

### Adding TypeScript Support

1. Add TypeScript to your project: `npm install --save-dev typescript`
2. Re-run the setup script (`npm run setup` or `node setup.js`) to enable `@typescript-eslint` linting and TypeScript-aware lint-staged patterns.
3. Update workflow to include type checking:
   ```yaml
   - name: TypeScript Check
     run: npx tsc --noEmit
   ```

### Adding Testing

- The template ships with an integration smoke test (`npm test`) that exercises `setup.js` end-to-end.
- Replace or extend `tests/setup.test.js` with your project’s preferred test runner (Jest, Vitest, Playwright, etc.).
- Keep the `test` script aligned with your chosen framework so CI executes the same checks.

## 📜 Available Scripts

### JavaScript/TypeScript Projects

- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check if files are formatted (used in CI)
- `npm run prepare` - Set up Husky hooks (run after npm install)
- `npm run lint` / `npm run lint:fix` - ESLint + Stylelint
- `npm test` - Runs tests (customize per project)

### Python Projects

- `black .` - Format all Python files
- `black --check .` - Check formatting
- `ruff check .` - Lint Python code
- `ruff check --fix .` - Auto-fix linting issues
- `isort .` - Sort imports
- `mypy .` - Type checking
- `pytest` - Run tests
- `pre-commit run --all-files` - Run all pre-commit hooks

### Multi-Language Projects

When both JavaScript and Python are detected, package.json includes helper scripts:

- `npm run python:format` - Format Python code
- `npm run python:lint` - Lint Python code
- `npm run python:quality` - Run all Python quality checks

## 🤖 GitHub Actions Workflow

The workflow runs on:

- Push to `main`, `master`, or `develop` branches
- Pull requests to those branches

It performs:

- ✅ Prettier formatting check
- ✅ ESLint and Stylelint checks
- ✅ Blocking security audit (npm audit)
- ✅ Hardcoded secrets scanning

## 🛠️ Troubleshooting

### "husky not found" Error

Run `npm run prepare` after installing dependencies.

### Prettier Conflicts with Other Formatters

Add conflicting formatters to `.prettierignore` or configure them to work together.

### GitHub Actions Not Running

Ensure your repository has Actions enabled in Settings > Actions.

### Vercel Runtime (Note)

- Prefer auto‑detection of Node from `package.json` `engines` when deploying to Vercel.
- Avoid hard‑coding a `runtime` value in `vercel.json` unless confirmed against current Vercel docs — incorrect values can break deploys.
- The template pins Node 20 for local/CI via `.nvmrc`, `engines`, and optional Volta; this is independent of Vercel’s runtime.

## 🔄 Updating

To update an existing project:

```bash
npx create-quality-automation@latest --update
npm install
```

The tool safely merges new configurations without overwriting your customizations.

## 🤝 Contributing

Want to improve this template?

1. Fork the repository
2. Make your changes
3. Test with a sample project
4. Submit a pull request

## 📄 License

MIT License - feel free to use in any project!

## 🙋‍♂️ Support

If you run into issues:

1. Check the troubleshooting section above
2. Review the GitHub Actions logs
3. Open an issue in this repository

---

**Made with ❤️ to make code quality effortless**
