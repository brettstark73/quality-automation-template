# Quality Automation Template 🚀

A comprehensive, reusable template for setting up quality automation in any project with GitHub Actions, Husky pre-commit hooks, lint-staged, and Prettier formatting.

## ✨ Features

- **🔧 Prettier Code Formatting** - Consistent code style across your project
- **🪝 Husky Pre-commit Hooks** - Automatic quality checks before commits
- **⚡ Lint-staged Processing** - Only process changed files for speed
- **🤖 GitHub Actions** - Automated quality checks in CI/CD
- **📦 Easy Setup** - One command installation script
- **🔄 Configurable** - Easily customize for your project needs

## 🚀 Quick Start

### Option 1: Interactive Setup (Recommended)

1. **Clone or download** this template to your machine
2. **Navigate to your project** directory (must be a git repository)
3. **Run the setup script:**
   ```bash
   node /path/to/quality-automation-template/setup.js
   ```
4. **Install dependencies:**
   ```bash
   npm install
   ```
5. **Initialize Husky:**
   ```bash
   npm run prepare
   ```

### Option 2: Manual Setup

1. **Copy template files** to your project:
   ```bash
   cp -r quality-automation-template/.github ./
   cp quality-automation-template/.prettierrc ./
   cp quality-automation-template/.prettierignore ./
   ```

2. **Update your package.json** (add the scripts and dependencies from the template)

3. **Install and setup:**
   ```bash
   npm install
   npm run prepare
   ```

## 📁 What Gets Added to Your Project

```
your-project/
├── .github/
│   └── workflows/
│       └── quality.yml          # GitHub Actions workflow
├── .prettierrc                  # Prettier configuration
├── .prettierignore             # Files to ignore in formatting
├── .husky/                     # Pre-commit hooks (created after setup)
└── package.json                # Updated with scripts and dependencies
```

## ⚙️ Configuration

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
    "**/*.{js,jsx,ts,tsx}": ["prettier --write"],
    "**/*.{html,css,scss}": ["prettier --write"],
    "**/*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

## 🔧 Customization

### Adding ESLint
1. Install ESLint: `npm install --save-dev eslint`
2. Update `.github/workflows/quality.yml`:
   ```yaml
   - name: Run ESLint
     run: npx eslint . --ext .js,.jsx,.ts,.tsx
   ```
3. Update `lint-staged` in `package.json`:
   ```json
   "**/*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
   ```

### Adding TypeScript Support
1. Install TypeScript: `npm install --save-dev typescript`
2. Update workflow to include type checking:
   ```yaml
   - name: TypeScript Check
     run: npx tsc --noEmit
   ```

### Adding Testing
1. Update the `test` script in `package.json`
2. The GitHub Actions workflow will automatically run your tests

## 📜 Available Scripts

After setup, your project will have these scripts:

- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check if files are formatted (used in CI)
- `npm run prepare` - Set up Husky hooks (run after npm install)

## 🤖 GitHub Actions Workflow

The workflow runs on:
- Push to `main`, `master`, or `develop` branches
- Pull requests to those branches

It performs:
- ✅ Prettier formatting check
- ✅ Linting (if configured)
- ✅ Testing (if configured)  
- ✅ Security audit

## 🛠️ Troubleshooting

### "husky not found" Error
Run `npm run prepare` after installing dependencies.

### Prettier Conflicts with Other Formatters
Add conflicting formatters to `.prettierignore` or configure them to work together.

### GitHub Actions Not Running
Ensure your repository has Actions enabled in Settings > Actions.

## 🔄 Updating the Template

To update an existing project with new template features:
1. Re-run the setup script
2. Review and merge any conflicts
3. Update dependencies: `npm update`

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