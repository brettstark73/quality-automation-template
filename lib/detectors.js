'use strict'

const fs = require('fs')
const path = require('path')

/**
 * Detects which programming languages are used in a project
 * @param {string} projectDir - Path to the project directory
 * @returns {Object} - Object with language flags and detected files
 */
function detectProjectLanguages(projectDir) {
  const detectedLanguages = {
    javascript: false,
    typescript: false,
    python: false,
    rust: false,
    go: false,
  }

  const detectedFiles = {
    javascript: [],
    python: [],
    rust: [],
    go: [],
  }

  // JavaScript/Node.js detection
  const packageJsonPath = path.join(projectDir, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    detectedLanguages.javascript = true
    detectedFiles.javascript.push('package.json')
  }

  // TypeScript detection
  const tsconfigCandidates = ['tsconfig.json', 'tsconfig.base.json']
  for (const tsconfig of tsconfigCandidates) {
    const tsconfigPath = path.join(projectDir, tsconfig)
    if (fs.existsSync(tsconfigPath)) {
      detectedLanguages.typescript = true
      detectedFiles.javascript.push(tsconfig)
      break
    }
  }

  // Also check for typescript dependency
  if (detectedLanguages.javascript) {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, 'utf8')
      )
      const hasTypeScriptDep =
        (packageJson.devDependencies &&
          packageJson.devDependencies.typescript) ||
        (packageJson.dependencies && packageJson.dependencies.typescript)
      if (hasTypeScriptDep) {
        detectedLanguages.typescript = true
      }
    } catch (e) {
      // Ignore parse errors, already validated in main setup
    }
  }

  // Python detection
  const pythonFiles = [
    'requirements.txt',
    'pyproject.toml',
    'setup.py',
    'setup.cfg',
    'Pipfile',
    'poetry.lock',
    'conda.yml',
    'environment.yml',
  ]

  for (const file of pythonFiles) {
    const filePath = path.join(projectDir, file)
    if (fs.existsSync(filePath)) {
      detectedLanguages.python = true
      detectedFiles.python.push(file)
    }
  }

  // Rust detection
  const cargoTomlPath = path.join(projectDir, 'Cargo.toml')
  if (fs.existsSync(cargoTomlPath)) {
    detectedLanguages.rust = true
    detectedFiles.rust.push('Cargo.toml')
  }

  // Go detection
  const goModPath = path.join(projectDir, 'go.mod')
  if (fs.existsSync(goModPath)) {
    detectedLanguages.go = true
    detectedFiles.go.push('go.mod')
  }

  return {
    languages: detectedLanguages,
    files: detectedFiles,
  }
}

/**
 * Gets the primary language of the project
 * @param {Object} detectionResult - Result from detectProjectLanguages
 * @returns {string|null} - Primary language or null
 */
function getPrimaryLanguage(detectionResult) {
  const { languages } = detectionResult

  // Priority order: JavaScript (most common), Python, Rust, Go
  if (languages.javascript) return 'javascript'
  if (languages.python) return 'python'
  if (languages.rust) return 'rust'
  if (languages.go) return 'go'

  return null
}

/**
 * Checks if project uses multiple languages
 * @param {Object} detectionResult - Result from detectProjectLanguages
 * @returns {boolean}
 */
function isMultiLanguageProject(detectionResult) {
  const { languages } = detectionResult
  const languageCount = Object.values(languages).filter(Boolean).length
  return languageCount > 1
}

/**
 * Gets all detected languages as an array
 * @param {Object} detectionResult - Result from detectProjectLanguages
 * @returns {string[]}
 */
function getDetectedLanguages(detectionResult) {
  const { languages } = detectionResult
  return Object.keys(languages).filter(lang => languages[lang])
}

module.exports = {
  detectProjectLanguages,
  getPrimaryLanguage,
  isMultiLanguageProject,
  getDetectedLanguages,
}
