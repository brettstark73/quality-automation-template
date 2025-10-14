#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const {
  detectProjectLanguages,
  getPrimaryLanguage,
  isMultiLanguageProject,
  getDetectedLanguages,
} = require('./lib/detectors')

const {
  STYLELINT_EXTENSIONS,
  getDefaultDevDependencies,
  getDefaultLintStaged,
  getDefaultScripts,
} = require('./config/defaults')

const javascriptSetup = require('./config/languages/javascript')
const pythonSetup = require('./config/languages/python')

const STYLELINT_EXTENSION_SET = new Set(STYLELINT_EXTENSIONS)
const STYLELINT_DEFAULT_TARGET = `**/*.{${STYLELINT_EXTENSIONS.join(',')}}`
const STYLELINT_EXTENSION_GLOB = `*.{${STYLELINT_EXTENSIONS.join(',')}}`
const STYLELINT_SCAN_EXCLUDES = new Set([
  '.git',
  '.github',
  '.husky',
  '.next',
  '.nuxt',
  '.output',
  '.turbo',
  '.vercel',
  '.cache',
  '.pnpm-store',
  'coverage',
  'node_modules',
])
const MAX_STYLELINT_SCAN_DEPTH = 4

const safeReadDir = dir => {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
}

const isStylelintFile = fileName => {
  const ext = path.extname(fileName).slice(1).toLowerCase()
  return STYLELINT_EXTENSION_SET.has(ext)
}

const directoryContainsStylelintFiles = (dir, depth = 0) => {
  if (depth > MAX_STYLELINT_SCAN_DEPTH) {
    return false
  }

  const entries = safeReadDir(dir)
  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      continue
    }

    const entryPath = path.join(dir, entry.name)

    if (entry.isFile() && isStylelintFile(entry.name)) {
      return true
    }

    if (entry.isDirectory()) {
      if (STYLELINT_SCAN_EXCLUDES.has(entry.name)) {
        continue
      }
      if (directoryContainsStylelintFiles(entryPath, depth + 1)) {
        return true
      }
    }
  }

  return false
}

const findStylelintTargets = rootDir => {
  const entries = safeReadDir(rootDir)
  const targets = new Set()
  let hasRootCss = false

  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      continue
    }

    const entryPath = path.join(rootDir, entry.name)

    if (entry.isFile()) {
      if (isStylelintFile(entry.name)) {
        hasRootCss = true
      }
      continue
    }

    if (!entry.isDirectory()) {
      continue
    }

    if (STYLELINT_SCAN_EXCLUDES.has(entry.name)) {
      continue
    }

    if (directoryContainsStylelintFiles(entryPath)) {
      targets.add(entry.name)
    }
  }

  const resolvedTargets = []

  if (hasRootCss) {
    resolvedTargets.push(STYLELINT_EXTENSION_GLOB)
  }

  Array.from(targets)
    .sort()
    .forEach(dir => {
      resolvedTargets.push(`${dir}/**/${STYLELINT_EXTENSION_GLOB}`)
    })

  if (!resolvedTargets.length) {
    return [STYLELINT_DEFAULT_TARGET]
  }

  return resolvedTargets
}

const patternIncludesStylelintExtension = pattern => {
  const lower = pattern.toLowerCase()
  return STYLELINT_EXTENSIONS.some(ext => lower.includes(`.${ext}`))
}

// Input validation and sanitization functions
const validateAndSanitizeInput = input => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }
  const normalized = input.trim()
  if (normalized.length === 0) {
    return null
  }
  const sanitized = normalized.replace(/[<>'"&]/g, '')
  return sanitized
}

// CLI argument parsing with validation
const args = process.argv.slice(2)
const sanitizedArgs = args
  .map(arg => validateAndSanitizeInput(arg))
  .filter(Boolean)
const isUpdateMode = sanitizedArgs.includes('--update')

console.log(
  `🚀 ${isUpdateMode ? 'Updating' : 'Setting up'} Quality Automation...\n`
)

// Check if we're in a git repository
try {
  execSync('git status', { stdio: 'ignore' })
} catch {
  console.error('❌ This must be run in a git repository')
  console.log('Run "git init" first, then try again.')
  process.exit(1)
}

// Detect project languages
const projectDir = process.cwd()
const detection = detectProjectLanguages(projectDir)
const detectedLanguages = getDetectedLanguages(detection)
const primaryLanguage = getPrimaryLanguage(detection)
const isMultiLang = isMultiLanguageProject(detection)

console.log(`🔍 Detected language(s): ${detectedLanguages.join(', ')}`)
if (primaryLanguage) {
  console.log(`📌 Primary language: ${primaryLanguage}`)
}
if (isMultiLang) {
  console.log('ℹ️ Multi-language project detected')
}
console.log()

// Handle Python projects
if (detection.languages.python) {
  console.log('🐍 Setting up Python quality automation...')

  const projectName = validateAndSanitizeInput(path.basename(projectDir)) || 'my-project'

  pythonSetup.setupFiles(projectDir, { projectName })

  // Install Python dependencies
  const shouldInstall = !sanitizedArgs.includes('--no-install')
  if (shouldInstall) {
    pythonSetup.installDependencies(projectDir)
  } else {
    console.log('⏭️ Skipping Python dependency installation (--no-install)')
  }

  console.log()
}

// Handle JavaScript/TypeScript projects
if (detection.languages.javascript) {
  console.log('📦 Setting up JavaScript/TypeScript quality automation...')

  // Check if package.json exists
  const packageJsonPath = path.join(projectDir, 'package.json')
  let packageJson = {}

  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8')
      if (packageJsonContent.trim().length === 0) {
        console.error('❌ package.json is empty')
        console.log('Please add valid JSON content to package.json and try again.')
        process.exit(1)
      }

      packageJson = JSON.parse(packageJsonContent)

      if (typeof packageJson !== 'object' || packageJson === null) {
        console.error('❌ package.json must contain a valid JSON object')
        console.log('Please fix the package.json structure and try again.')
        process.exit(1)
      }

      if (packageJson.name && typeof packageJson.name === 'string') {
        packageJson.name =
          validateAndSanitizeInput(packageJson.name) || 'my-project'
      }

      console.log('✅ Found existing package.json')
    } catch (error) {
      console.error(`❌ Error parsing package.json: ${error.message}`)
      console.log('Please fix the JSON syntax in package.json and try again.')
      console.log('Common issues: trailing commas, missing quotes, unclosed brackets')
      process.exit(1)
    }
  } else {
    console.log('📦 Creating new package.json')
    const projectName =
      validateAndSanitizeInput(path.basename(projectDir)) || 'my-project'
    packageJson = {
      name: projectName,
      version: '1.0.0',
      description: '',
      main: 'index.js',
      scripts: {},
    }
  }

  const usesTypeScript = detection.languages.typescript
  if (usesTypeScript) {
    console.log(
      '🔍 Detected TypeScript configuration; enabling TypeScript lint defaults'
    )
  }

  const stylelintTargets = findStylelintTargets(projectDir)
  const usingDefaultStylelintTarget =
    stylelintTargets.length === 1 &&
    stylelintTargets[0] === STYLELINT_DEFAULT_TARGET
  if (!usingDefaultStylelintTarget) {
    console.log(`🔍 Detected stylelint targets: ${stylelintTargets.join(', ')}`)
  }

  // Add quality automation scripts
  console.log('📝 Adding quality automation scripts...')
  packageJson.scripts = packageJson.scripts || {}
  const defaultScripts = getDefaultScripts({
    typescript: usesTypeScript,
    stylelintTargets,
  })

  // If multi-language Python project, add Python scripts too
  if (detection.languages.python) {
    const pythonScripts = pythonSetup.getScripts()
    Object.assign(defaultScripts, pythonScripts)
  }

  Object.entries(defaultScripts).forEach(([name, command]) => {
    if (!packageJson.scripts[name]) {
      packageJson.scripts[name] = command
    }
  })

  // Ensure husky prepare script
  const prepareScript = packageJson.scripts.prepare
  if (!prepareScript) {
    packageJson.scripts.prepare = 'husky'
  } else if (prepareScript.includes('husky install')) {
    packageJson.scripts.prepare = prepareScript.replace(/husky install/g, 'husky')
  } else if (!prepareScript.includes('husky')) {
    packageJson.scripts.prepare = `${prepareScript} && husky`
  }

  // Add devDependencies
  console.log('📦 Adding devDependencies...')
  packageJson.devDependencies = packageJson.devDependencies || {}
  const defaultDevDependencies = getDefaultDevDependencies({
    typescript: usesTypeScript,
  })
  Object.entries(defaultDevDependencies).forEach(([dependency, version]) => {
    if (!packageJson.devDependencies[dependency]) {
      packageJson.devDependencies[dependency] = version
    }
  })

  // Add lint-staged configuration
  console.log('⚙️ Adding lint-staged configuration...')
  const lintStagedConfig = packageJson['lint-staged'] || {}
  const defaultLintStaged = getDefaultLintStaged({
    typescript: usesTypeScript,
    stylelintTargets,
  })
  const stylelintTargetSet = new Set(stylelintTargets)
  const hasExistingCssPatterns = Object.keys(lintStagedConfig).some(
    patternIncludesStylelintExtension
  )

  if (hasExistingCssPatterns) {
    console.log(
      'ℹ️ Detected existing lint-staged CSS globs; preserving current CSS targets'
    )
  }

  Object.entries(defaultLintStaged).forEach(([pattern, commands]) => {
    const isStylelintPattern = stylelintTargetSet.has(pattern)
    if (isStylelintPattern && hasExistingCssPatterns) {
      return
    }
    if (!lintStagedConfig[pattern]) {
      lintStagedConfig[pattern] = commands
      return
    }
    const existing = Array.isArray(lintStagedConfig[pattern])
      ? [...lintStagedConfig[pattern]]
      : [lintStagedConfig[pattern]]
    const merged = [...existing]
    commands.forEach(command => {
      if (!merged.includes(command)) {
        merged.push(command)
      }
    })
    lintStagedConfig[pattern] = merged
  })
  packageJson['lint-staged'] = lintStagedConfig

  // Write updated package.json
  try {
    const jsonString = JSON.stringify(packageJson, null, 2)
    if (jsonString.length === 0) {
      throw new Error('Generated package.json is empty')
    }
    fs.writeFileSync(packageJsonPath, jsonString)
    console.log('✅ Updated package.json')
  } catch (error) {
    console.error(`❌ Error writing package.json: ${error.message}`)
    process.exit(1)
  }

  // Ensure Node toolchain pinning
  const nvmrcPath = path.join(projectDir, '.nvmrc')
  if (!fs.existsSync(nvmrcPath)) {
    fs.writeFileSync(nvmrcPath, '20\n')
    console.log('✅ Added .nvmrc (Node 20)')
  }

  const npmrcPath = path.join(projectDir, '.npmrc')
  if (!fs.existsSync(npmrcPath)) {
    fs.writeFileSync(npmrcPath, 'engine-strict = true\n')
    console.log('✅ Added .npmrc (engine-strict)')
  }

  // Create .github/workflows directory
  const workflowDir = path.join(projectDir, '.github', 'workflows')
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true })
    console.log('📁 Created .github/workflows directory')
  }

  // Setup JavaScript-specific files
  javascriptSetup.setupFiles(projectDir, { typescript: usesTypeScript })

  // Ensure engines/volta pins
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    pkg.engines = { node: '>=20', ...(pkg.engines || {}) }
    pkg.volta = { node: '20.11.1', npm: '10.2.4', ...(pkg.volta || {}) }
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2))
    console.log('✅ Ensured engines and Volta pins in package.json')
  } catch (e) {
    console.warn('⚠️ Could not update engines/volta in package.json:', e.message)
  }

  console.log()
}

// Setup shared files (language-agnostic)
console.log('📄 Setting up shared configuration files...')

const editorconfigPath = path.join(projectDir, '.editorconfig')
if (!fs.existsSync(editorconfigPath)) {
  const templateEditorconfig = fs.readFileSync(
    path.join(__dirname, '.editorconfig'),
    'utf8'
  )
  fs.writeFileSync(editorconfigPath, templateEditorconfig)
  console.log('✅ Added .editorconfig')
}

// Show completion message
console.log('\n🎉 Quality automation setup complete!')
console.log('\n📋 Next steps:')

if (detection.languages.javascript) {
  console.log('JavaScript/TypeScript:')
  console.log('  1. Run: npm install')
  console.log('  2. Run: npm run prepare')
  console.log('  3. Test with: npm run lint')
}

if (detection.languages.python) {
  console.log('Python:')
  console.log('  1. Run: python3 -m pip install -r requirements-dev.txt')
  console.log('  2. Run: pre-commit install')
  console.log('  3. Test with: black --check . && ruff check .')
}

console.log('\n4. Commit your changes to activate the workflows')

console.log('\n✨ Your project now has:')
if (detection.languages.javascript) {
  console.log('  • Prettier code formatting (JavaScript/TypeScript)')
  console.log('  • ESLint + Stylelint')
  console.log('  • Husky pre-commit hooks')
}
if (detection.languages.python) {
  console.log('  • Black code formatting (Python)')
  console.log('  • Ruff linting')
  console.log('  • isort import sorting')
  console.log('  • pre-commit hooks')
}
console.log('  • GitHub Actions quality checks')
console.log('  • EditorConfig for consistency')
console.log()

if (!primaryLanguage) {
  console.warn('⚠️ No supported languages detected.')
  console.log('Supported: JavaScript, TypeScript, Python')
  console.log('Create a package.json (JS) or requirements.txt/pyproject.toml (Python) and re-run.')
}
