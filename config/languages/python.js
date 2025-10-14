'use strict'

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

/**
 * Get Python-specific scripts for package.json (if mixed project)
 * or for documentation purposes
 * @returns {Object} - Scripts that can be added
 */
function getScripts() {
  return {
    'python:format': 'black . && isort .',
    'python:format:check': 'black --check . && isort --check-only .',
    'python:lint': 'ruff check .',
    'python:lint:fix': 'ruff check --fix .',
    'python:type': 'mypy .',
    'python:test': 'pytest',
    'python:quality': 'npm run python:format:check && npm run python:lint',
  }
}

/**
 * Get Python project configuration for pyproject.toml
 * @param {Object} options - Configuration options
 * @param {string} options.projectName - Name of the project
 * @returns {string} - pyproject.toml content
 */
function getPyprojectToml({ projectName = 'my-project' }) {
  return `[project]
name = "${projectName}"
version = "0.1.0"
description = "A Python project with quality automation"
readme = "README.md"
requires-python = ">=3.9"

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[tool.black]
line-length = 88
target-version = ['py39', 'py310', 'py311', 'py312']
include = '\\.pyi?$'
extend-exclude = '''
/(
  # directories
  \\.eggs
  | \\.git
  | \\.hg
  | \\.mypy_cache
  | \\.tox
  | \\.venv
  | build
  | dist
)/
'''

[tool.isort]
profile = "black"
line_length = 88
multi_line_output = 3
include_trailing_comma = true
force_grid_wrap = 0
use_parentheses = true
ensure_newline_before_comments = true

[tool.ruff]
line-length = 88
target-version = "py39"

[tool.ruff.lint]
select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
    "UP", # pyupgrade
]
ignore = [
    "E501", # line too long (handled by black)
]

[tool.ruff.lint.per-file-ignores]
"__init__.py" = ["F401"]

[tool.mypy]
python_version = "3.9"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = false
disallow_incomplete_defs = false
check_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "-ra -q --strict-markers"
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "integration: marks tests as integration tests",
]
`
}

/**
 * Get pre-commit configuration
 * @returns {string} - .pre-commit-config.yaml content
 */
function getPreCommitConfig() {
  return `# Pre-commit hooks for Python quality automation
# See https://pre-commit.com for more information

repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-json
      - id: check-toml
      - id: check-merge-conflict
      - id: debug-statements

  - repo: https://github.com/psf/black
    rev: 24.8.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9
    hooks:
      - id: ruff
        args: [--fix]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.11.2
    hooks:
      - id: mypy
        additional_dependencies: []
        args: [--ignore-missing-imports]
`
}

/**
 * Get requirements.txt content for development dependencies
 * @returns {string} - requirements-dev.txt content
 */
function getDevRequirements() {
  return `# Development and quality automation dependencies
black>=24.0.0
ruff>=0.6.0
isort>=5.13.0
mypy>=1.11.0
pytest>=8.0.0
pytest-cov>=5.0.0
pre-commit>=3.8.0
`
}

/**
 * Get GitHub Actions workflow for Python
 * @returns {string} - quality-python.yml content
 */
function getGitHubWorkflow() {
  return `name: Python Quality Checks

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.9", "3.10", "3.11", "3.12"]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python $\{{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: $\{{ matrix.python-version }}
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements-dev.txt
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi

      - name: Format check (Black)
        run: black --check .

      - name: Import sort check (isort)
        run: isort --check-only .

      - name: Lint (Ruff)
        run: ruff check .

      - name: Type check (mypy)
        run: mypy .
        continue-on-error: true  # Don't fail build on type errors initially

      - name: Run tests
        run: pytest --cov --cov-report=xml --cov-report=term

      - name: Security check
        run: |
          pip install safety
          safety check --json || true  # Don't fail build, just report
`
}

/**
 * Setup Python-specific files
 * @param {string} projectDir - Project directory path
 * @param {Object} options - Setup options
 * @param {string} options.projectName - Name of the project
 */
function setupFiles(projectDir, { projectName }) {
  // Create pyproject.toml if it doesn't exist
  const pyprojectPath = path.join(projectDir, 'pyproject.toml')
  if (!fs.existsSync(pyprojectPath)) {
    const pyprojectContent = getPyprojectToml({ projectName })
    fs.writeFileSync(pyprojectPath, pyprojectContent)
    console.log('✅ Added pyproject.toml (Black, Ruff, isort, mypy config)')
  } else {
    console.log('ℹ️ pyproject.toml already exists, skipping')
  }

  // Create .pre-commit-config.yaml if it doesn't exist
  const preCommitPath = path.join(projectDir, '.pre-commit-config.yaml')
  if (!fs.existsSync(preCommitPath)) {
    const preCommitContent = getPreCommitConfig()
    fs.writeFileSync(preCommitPath, preCommitContent)
    console.log('✅ Added .pre-commit-config.yaml')
  }

  // Create requirements-dev.txt if it doesn't exist
  const reqsDevPath = path.join(projectDir, 'requirements-dev.txt')
  if (!fs.existsSync(reqsDevPath)) {
    const reqsContent = getDevRequirements()
    fs.writeFileSync(reqsDevPath, reqsContent)
    console.log('✅ Added requirements-dev.txt')
  }

  // Create GitHub Actions workflow
  const workflowDir = path.join(projectDir, '.github', 'workflows')
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true })
  }

  const workflowFile = path.join(workflowDir, 'quality-python.yml')
  if (!fs.existsSync(workflowFile)) {
    const workflowContent = getGitHubWorkflow()
    fs.writeFileSync(workflowFile, workflowContent)
    console.log('✅ Added GitHub Actions workflow (quality-python.yml)')
  }

  // Create tests directory if it doesn't exist
  const testsDir = path.join(projectDir, 'tests')
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true })
    const initFile = path.join(testsDir, '__init__.py')
    fs.writeFileSync(initFile, '# Test suite\n')
    console.log('✅ Created tests/ directory')
  }
}

/**
 * Install Python dependencies and setup pre-commit
 * @param {string} projectDir - Project directory path
 */
function installDependencies(projectDir) {
  console.log('📦 Installing Python dependencies...')

  try {
    // Check if pip is available
    execSync('python3 --version', { stdio: 'ignore' })

    // Install development dependencies
    console.log('Installing from requirements-dev.txt...')
    execSync('python3 -m pip install -r requirements-dev.txt', {
      cwd: projectDir,
      stdio: 'inherit',
    })

    // Setup pre-commit hooks
    console.log('Setting up pre-commit hooks...')
    execSync('pre-commit install', {
      cwd: projectDir,
      stdio: 'inherit',
    })

    console.log('✅ Python dependencies installed successfully')
  } catch (error) {
    console.warn('⚠️ Could not install Python dependencies automatically')
    console.log('Please run these commands manually:')
    console.log('  python3 -m pip install -r requirements-dev.txt')
    console.log('  pre-commit install')
  }
}

module.exports = {
  getScripts,
  getPyprojectToml,
  getPreCommitConfig,
  getDevRequirements,
  getGitHubWorkflow,
  setupFiles,
  installDependencies,
}
