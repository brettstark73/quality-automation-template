#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Setting up Quality Automation Template...\n')

// Check if we're in a git repository
try {
  execSync('git status', { stdio: 'ignore' })
} catch (error) {
  console.error('❌ This must be run in a git repository')
  console.log('Run "git init" first, then try again.')
  process.exit(1)
}

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json')
let packageJson = {}

if (fs.existsSync(packageJsonPath)) {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  console.log('✅ Found existing package.json')
} else {
  console.log('📦 Creating new package.json')
  packageJson = {
    name: path.basename(process.cwd()),
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {}
  }
}

// Add quality automation scripts
console.log('📝 Adding quality automation scripts...')
packageJson.scripts = {
  ...packageJson.scripts,
  prepare: 'husky install',
  'format': 'prettier --write .',
  'format:check': 'prettier --check .'
}

// Add devDependencies
console.log('📦 Adding devDependencies...')
packageJson.devDependencies = {
  ...packageJson.devDependencies,
  husky: '^8.0.0',
  'lint-staged': '^15.0.0',
  prettier: '^3.0.0'
}

// Add lint-staged configuration
console.log('⚙️ Adding lint-staged configuration...')
packageJson['lint-staged'] = {
  'package.json': ['prettier --write'],
  '**/*.{js,jsx,ts,tsx}': ['prettier --write'],
  '**/*.{html,css,scss}': ['prettier --write'],
  '**/*.{json,md,yml,yaml}': ['prettier --write']
}

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
console.log('✅ Updated package.json')

// Create .github/workflows directory if it doesn't exist
const workflowDir = path.join(process.cwd(), '.github', 'workflows')
if (!fs.existsSync(workflowDir)) {
  fs.mkdirSync(workflowDir, { recursive: true })
  console.log('📁 Created .github/workflows directory')
}

// Copy workflow file if it doesn't exist
const workflowFile = path.join(workflowDir, 'quality.yml')
if (!fs.existsSync(workflowFile)) {
  const templateWorkflow = fs.readFileSync(
    path.join(__dirname, '.github/workflows/quality.yml'),
    'utf8'
  )
  fs.writeFileSync(workflowFile, templateWorkflow)
  console.log('✅ Added GitHub Actions workflow')
}

// Copy Prettier config if it doesn't exist
const prettierrcPath = path.join(process.cwd(), '.prettierrc')
if (!fs.existsSync(prettierrcPath)) {
  const templatePrettierrc = fs.readFileSync(
    path.join(__dirname, '.prettierrc'),
    'utf8'
  )
  fs.writeFileSync(prettierrcPath, templatePrettierrc)
  console.log('✅ Added Prettier configuration')
}

// Copy .prettierignore if it doesn't exist
const prettierignorePath = path.join(process.cwd(), '.prettierignore')
if (!fs.existsSync(prettierignorePath)) {
  const templatePrettierignore = fs.readFileSync(
    path.join(__dirname, '.prettierignore'),
    'utf8'
  )
  fs.writeFileSync(prettierignorePath, templatePrettierignore)
  console.log('✅ Added Prettier ignore file')
}

console.log('\n🎉 Quality automation setup complete!')
console.log('\n📋 Next steps:')
console.log('1. Run: npm install')
console.log('2. Run: npm run prepare')
console.log('3. Commit your changes to activate the workflow')
console.log('\n✨ Your project now has:')
console.log('  • Prettier code formatting')
console.log('  • Pre-commit hooks via Husky')
console.log('  • GitHub Actions quality checks')
console.log('  • Lint-staged for efficient processing')