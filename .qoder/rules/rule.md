---
trigger: always_on
alwaysApply: true
---
# Enhanced Cursor Rules - Programming Assistant Guidelines

## Core Principles
1. **Be objective and direct:**
   - Avoid long didactic explanations unless specifically requested
   - Focus on direct solutions to problems
   - Provide concise, actionable responses

2. **Test everything:**
   - Always create and run automated tests (unit/integration) for new modules or functions
   - Report test results immediately
   - Include test coverage reports when relevant

3. **Git workflow:**
   - **IMPORTANT**: Only commit and push after Rodrigo validates the fix in production and gives explicit approval
   - When approved, create descriptive commits following conventional commits format
   - Push to remote repository
   - Auto-update `CHANGELOG.md` and `README.md` with changes

## Environment-Specific Guidelines

### Windows PowerShell
- Use PowerShell-compatible commands and syntax
- Prefer `New-Item` over `touch`, `Get-ChildItem` over `ls`
- Handle path separators with `Join-Path` or `[System.IO.Path]::Combine()`
- Use `Set-ExecutionPolicy` guidance for script execution
- Leverage PowerShell modules and cmdlets for file operations
- Use `$env:` for environment variables access

### macOS Bash/Zsh
- Use homebrew for package management recommendations
- Leverage built-in Unix tools and commands
- Handle case-sensitive file system considerations
- Use `~/.zshrc` or `~/.bash_profile` for environment setup
- Prefer `pbcopy`/`pbpaste` for clipboard operations

### Linux
- Consider different distributions and package managers (apt, yum, pacman)
- Use appropriate systemd commands for service management
- Handle permissions with `chmod`/`chown` appropriately
- Leverage shell scripting for automation tasks
- Use distribution-specific paths and conventions

## Language & Framework Best Practices

### Python
- Follow PEP 8 style guidelines
- Use virtual environments (venv, conda, poetry)
- Implement proper error handling with try/except blocks
- Use type hints for better code documentation
- Leverage dataclasses and pydantic for data validation
- Include docstrings in Google/NumPy format
- Use `black` for formatting, `flake8` for linting
- Implement logging instead of print statements

### React/Node.js
- Use functional components with hooks over class components
- Implement proper error boundaries
- Use TypeScript for type safety
- Follow React best practices (keys, state management, useEffect cleanup)
- Use proper dependency arrays in useEffect
- Implement code splitting and lazy loading
- Use ESLint + Prettier for code quality
- Handle async operations with proper error handling

### HTML/CSS/JavaScript
- Use semantic HTML5 elements
- Implement responsive design with mobile-first approach
- Use CSS Grid and Flexbox appropriately
- Follow BEM methodology for CSS naming
- Use CSS custom properties (variables) for theming
- Implement proper accessibility (ARIA labels, keyboard navigation)
- Use modern JavaScript features (ES6+)
- Implement proper error handling in async/await

### Additional Framework Guidelines
- **Next.js**: Use App Router, implement proper SEO, utilize server components
- **Vue.js**: Use Composition API, implement proper reactivity
- **Angular**: Follow Angular style guide, use services for data management
- **Express.js**: Implement proper middleware, error handling, and security
- **Django/Flask**: Follow MVC patterns, use proper ORM practices

## Development Workflow Enhancements

### Branch Management
- Use semantic branch names: `feature/`, `fix/`, `chore/`, `docs/`
- Implement branch protection rules
- Use pull request templates
- Follow GitFlow or GitHub Flow patterns

### Code Quality
- Set up pre-commit hooks for linting and formatting
- Use conventional commits for consistent commit messages
- Implement automated dependency updates (Dependabot/Renovate)
- Use semantic versioning for releases
- Include security scanning in CI/CD pipelines

### Documentation
- Maintain up-to-date API documentation (OpenAPI/Swagger)
- Include inline code documentation (JSDoc, docstrings)
- Create comprehensive README files
- Document architecture decisions (ADRs)
- Include usage examples and getting started guides

### Testing Strategy
- Implement unit tests with high coverage (>80%)
- Include integration and end-to-end tests
- Use appropriate testing frameworks (Jest, pytest, Cypress)
- Mock external dependencies properly
- Include performance and load testing for critical paths

### CI/CD Pipeline
- Automate build, test, and deployment processes
- Use environment-specific configurations
- Implement proper secret management
- Include database migrations in deployment pipeline
- Use blue-green or canary deployments for zero-downtime

### Security Best Practices
- Implement proper authentication and authorization
- Use HTTPS everywhere
- Validate and sanitize all inputs
- Follow OWASP security guidelines
- Regular security audits and dependency scanning
- Implement proper logging and monitoring

## Communication Guidelines
- Use Portuguese for communication
- Address as "Rodrigo"
- Provide moderate opinions with brief pros/cons
- Suggest improvements when appropriate
- Offer alternatives without imposing preferences
- Include performance considerations when relevant

## Continuous Improvement
- Monitor code quality metrics
- Suggest refactoring opportunities
- Recommend new tools and practices
- Keep up with latest framework updates
- Implement feedback loops for code reviews
- Suggest architectural improvements when needed