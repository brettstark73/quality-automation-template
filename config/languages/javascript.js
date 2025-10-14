'use strict'

const fs = require('fs')
const path = require('path')

const JS_LINT_EXTENSIONS = '.js,.jsx,.mjs,.cjs,.html'
const TS_LINT_EXTENSIONS = '.js,.jsx,.mjs,.cjs,.ts,.tsx,.html'

const JS_LINT_STAGED_PATTERN = '**/*.{js,jsx,mjs,cjs,html}'
const TS_LINT_STAGED_PATTERN = '**/*.{js,jsx,ts,tsx,mjs,cjs,html}'

const baseDevDependencies = {
  husky: '^9.1.4',
  'lint-staged': '^15.2.10',
  prettier: '^3.3.3',
  eslint: '^9.12.0',
  'eslint-plugin-security': '^3.0.1',
  globals: '^15.9.0',
  stylelint: '^16.8.0',
  'stylelint-config-standard': '^37.0.0',
}

const typeScriptDevDependencies = {
  '@typescript-eslint/eslint-plugin': '^8.9.0',
  '@typescript-eslint/parser': '^8.9.0',
}

/**
 * Get JavaScript/TypeScript-specific npm scripts
 * @param {Object} options - Configuration options
 * @param {boolean} options.typescript - Whether project uses TypeScript
 * @param {Array<string>} options.stylelintTargets - Stylelint target patterns
 * @returns {Object} - Scripts to add to package.json
 */
function getScripts({ typescript, stylelintTargets }) {
  const extensions = typescript ? TS_LINT_EXTENSIONS : JS_LINT_EXTENSIONS
  const stylelintTarget =
    stylelintTargets.length === 1
      ? stylelintTargets[0]
      : `{${stylelintTargets.join(',')}}`

  return {
    lint: `eslint . --ext ${extensions} && stylelint "${stylelintTarget}" --allow-empty-input`,
    'lint:fix': `eslint . --ext ${extensions} --fix && stylelint "${stylelintTarget}" --fix --allow-empty-input`,
  }
}

/**
 * Get JavaScript/TypeScript dev dependencies
 * @param {Object} options - Configuration options
 * @param {boolean} options.typescript - Whether project uses TypeScript
 * @returns {Object} - Dev dependencies to add to package.json
 */
function getDevDependencies({ typescript }) {
  const devDeps = { ...baseDevDependencies }
  if (typescript) {
    Object.assign(devDeps, typeScriptDevDependencies)
  }
  return devDeps
}

/**
 * Get lint-staged configuration for JavaScript/TypeScript
 * @param {Object} options - Configuration options
 * @param {boolean} options.typescript - Whether project uses TypeScript
 * @param {Array<string>} options.stylelintTargets - Stylelint target patterns
 * @returns {Object} - lint-staged configuration
 */
function getLintStagedConfig({ typescript, stylelintTargets }) {
  const pattern = typescript ? TS_LINT_STAGED_PATTERN : JS_LINT_STAGED_PATTERN

  const lintStaged = {
    'package.json': ['prettier --write'],
    [pattern]: ['eslint --fix', 'prettier --write'],
    '**/*.{json,md,yml,yaml}': ['prettier --write'],
  }

  stylelintTargets.forEach(target => {
    lintStaged[target] = ['stylelint --fix', 'prettier --write']
  })

  return lintStaged
}

/**
 * Setup JavaScript/TypeScript-specific files
 * @param {string} projectDir - Project directory path
 * @param {Object} options - Setup options
 * @param {boolean} options.typescript - Whether project uses TypeScript
 */
function setupFiles(projectDir, { typescript }) {
  const templateDir = path.join(__dirname, '../../')

  // Copy Prettier config if it doesn't exist
  const prettierrcPath = path.join(projectDir, '.prettierrc')
  if (!fs.existsSync(prettierrcPath)) {
    const templatePrettierrc = fs.readFileSync(
      path.join(templateDir, '.prettierrc'),
      'utf8'
    )
    fs.writeFileSync(prettierrcPath, templatePrettierrc)
    console.log('✅ Added Prettier configuration')
  }

  // Copy ESLint config if it doesn't exist
  const eslintConfigPath = path.join(projectDir, 'eslint.config.cjs')
  const templateEslintPath = path.join(
    templateDir,
    typescript ? 'eslint.config.ts.cjs' : 'eslint.config.cjs'
  )
  const templateEslint = fs.readFileSync(templateEslintPath, 'utf8')

  if (!fs.existsSync(eslintConfigPath)) {
    fs.writeFileSync(eslintConfigPath, templateEslint)
    console.log(
      `✅ Added ESLint configuration${typescript ? ' (TypeScript-aware)' : ''}`
    )
  } else if (typescript) {
    const existingConfig = fs.readFileSync(eslintConfigPath, 'utf8')
    if (!existingConfig.includes('@typescript-eslint')) {
      fs.writeFileSync(eslintConfigPath, templateEslint)
      console.log('♻️ Updated ESLint configuration with TypeScript support')
    }
  }

  const legacyEslintrcPath = path.join(projectDir, '.eslintrc.json')
  if (fs.existsSync(legacyEslintrcPath)) {
    console.log(
      'ℹ️ Detected legacy .eslintrc.json; ESLint 9 prefers eslint.config.cjs. Consider removing the legacy file after verifying the new config.'
    )
  }

  // Copy Stylelint config if it doesn't exist
  const stylelintrcPath = path.join(projectDir, '.stylelintrc.json')
  if (!fs.existsSync(stylelintrcPath)) {
    const templateStylelint = fs.readFileSync(
      path.join(templateDir, '.stylelintrc.json'),
      'utf8'
    )
    fs.writeFileSync(stylelintrcPath, templateStylelint)
    console.log('✅ Added Stylelint configuration')
  }

  // Copy .prettierignore if it doesn't exist
  const prettierignorePath = path.join(projectDir, '.prettierignore')
  if (!fs.existsSync(prettierignorePath)) {
    const templatePrettierignore = fs.readFileSync(
      path.join(templateDir, '.prettierignore'),
      'utf8'
    )
    fs.writeFileSync(prettierignorePath, templatePrettierignore)
    console.log('✅ Added Prettier ignore file')
  }

  // Copy ESLint ignore if it doesn't exist
  const eslintignorePath = path.join(projectDir, '.eslintignore')
  if (!fs.existsSync(eslintignorePath)) {
    const templateEslintIgnore = fs.readFileSync(
      path.join(templateDir, '.eslintignore'),
      'utf8'
    )
    fs.writeFileSync(eslintignorePath, templateEslintIgnore)
    console.log('✅ Added ESLint ignore file')
  }

  // Copy GitHub Actions workflow if it doesn't exist
  const workflowFile = path.join(
    projectDir,
    '.github/workflows/quality.yml'
  )
  if (!fs.existsSync(workflowFile)) {
    const templateWorkflow = fs.readFileSync(
      path.join(templateDir, '.github/workflows/quality.yml'),
      'utf8'
    )
    fs.writeFileSync(workflowFile, templateWorkflow)
    console.log('✅ Added GitHub Actions workflow')
  }

  // Setup Husky pre-commit hook
  try {
    const huskyDir = path.join(projectDir, '.husky')
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir, { recursive: true })
    }
    const preCommitPath = path.join(huskyDir, 'pre-commit')
    if (!fs.existsSync(preCommitPath)) {
      const hook =
        '#!/bin/sh\n. "$(dirname "$0")/_/husky.sh"\n\n# Run lint-staged on staged files\nnpx --no -- lint-staged\n'
      fs.writeFileSync(preCommitPath, hook)
      fs.chmodSync(preCommitPath, 0o755)
      console.log('✅ Added Husky pre-commit hook (lint-staged)')
    }
  } catch (e) {
    console.warn('⚠️ Could not create Husky pre-commit hook:', e.message)
  }
}

module.exports = {
  getScripts,
  getDevDependencies,
  getLintStagedConfig,
  setupFiles,
  JS_LINT_EXTENSIONS,
  TS_LINT_EXTENSIONS,
}
