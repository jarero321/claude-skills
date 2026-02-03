<div align="center">

# Claude Skills

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)

[![npm version](https://img.shields.io/npm/v/@cjarero183006/claude-skills?style=flat-square&color=00d4ff)](https://www.npmjs.com/package/@cjarero183006/claude-skills)
[![License](https://img.shields.io/badge/license-MIT-7c3aed?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-62%20passed-brightgreen?style=flat-square)](package.json)

**The package manager for Claude Code agent skills and MCP servers**

Install, manage, and discover skills that extend Claude Code's capabilities.

[Getting Started](#getting-started) · [Commands](#commands) · [MCP Servers](#mcp-servers) · [Creating Skills](#creating-skills) · [Architecture](#architecture)

</div>

---

## Overview

Claude Skills is a CLI tool that brings package management to Claude Code agent skills. Think of it as **npm for AI agent capabilities** - install pre-built skills from a registry, manage MCP (Model Context Protocol) servers, or create and share your own.

```
┌─────────────────────────────────────┐
│  Claude Skills Manager              │
│  ─────────────────────────────────  │
│                                     │
│  > Install skill                    │
│    Uninstall skill                  │
│    List installed                   │
│    Search skills                    │
│    MCP Servers                      │
│    Check updates                    │
│    Exit                             │
│                                     │
└─────────────────────────────────────┘
```

## Features

| Feature | Description |
|---------|-------------|
| **Skills Management** | Install, uninstall, search, and update Claude Code skills |
| **MCP Server Support** | Install and configure Model Context Protocol servers |
| **Interactive Mode** | User-friendly menu-driven interface |
| **Registry System** | Centralized skill and MCP discovery |
| **Env Var Wizard** | Guided configuration for MCP environment variables |
| **Validation** | Verify skill structure before publishing |

## Getting Started

### Prerequisites

- Node.js >= 18
- Git (for installing from repositories)

### Installation

```bash
# Using npm
npm install -g @cjarero183006/claude-skills

# Using bun
bun add -g @cjarero183006/claude-skills

# Using pnpm
pnpm add -g @cjarero183006/claude-skills
```

### Quick Start

```bash
# Launch interactive mode (default)
claude-skills

# Or use commands directly
claude-skills search git
claude-skills install gitflow
claude-skills list
```

## Commands

### Skills Management

| Command | Description | Example |
|---------|-------------|---------|
| `install <name>` | Install a skill from the registry | `claude-skills install gitflow` |
| `install --repo <url>` | Install from a Git repository | `claude-skills install --repo https://github.com/user/skill` |
| `uninstall <name>` | Remove an installed skill | `claude-skills uninstall gitflow` |
| `list` | Show all installed skills | `claude-skills list` |
| `search <query>` | Search available skills | `claude-skills search docs` |
| `outdated` | Check for skill updates | `claude-skills outdated` |
| `validate <path>` | Validate a skill directory | `claude-skills validate ./my-skill` |
| `interactive` | Launch interactive mode | `claude-skills interactive` |

### MCP Server Commands

| Command | Description | Example |
|---------|-------------|---------|
| `mcp list` | List available MCP servers | `claude-skills mcp list` |
| `mcp install <name>` | Install an MCP server | `claude-skills mcp install repo-monitor` |
| `mcp uninstall <name>` | Remove an MCP server | `claude-skills mcp uninstall repo-monitor` |
| `mcp outdated` | Check for MCP updates | `claude-skills mcp outdated` |

### Options

| Flag | Description |
|------|-------------|
| `-r, --repo <url>` | Git repository URL for direct installation |
| `-h, --help` | Show help message |

## Available Skills

| Skill | Description | Tags |
|-------|-------------|------|
| `gitflow` | Git Flow branching strategy automation | git, workflow, release |
| `jira-ticket` | JIRA ticket template generator | jira, agile, scrum |
| `atomic-commits` | Conventional commits with GitFlow | git, commits, conventional |
| `dev-docs` | Professional README generator | docs, markdown, badges |

> Browse all available skills with `claude-skills search` or check [registry.json](registry.json)

## MCP Servers

MCP (Model Context Protocol) servers extend Claude's capabilities by providing external tools and data sources.

### Available MCPs

| MCP | Description | Language |
|-----|-------------|----------|
| `repo-monitor` | GitHub repository monitoring for issues, PRs and releases | Go |

### Environment Variables

When installing an MCP server that requires configuration, the CLI provides an interactive wizard:

```
┌  Configure repo-monitor
│
◇  GITHUB_TOKEN (required)
│  GitHub personal access token for API access
│  > ********
│
◇  REPO_OWNER (optional)
│  Default repository owner/organization
│  > myorg
│
└  Configuration complete!
```

## Creating Skills

Skills are directories containing a `skill.md` file that defines Claude's behavior.

### Skill Structure

```
my-skill/
├── skill.md          # Main skill definition (required)
├── manifest.json     # Skill metadata (required)
└── examples/         # Usage examples (optional)
    └── example.md
```

### manifest.json

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "description": "What this skill does",
  "author": "your-name",
  "tags": ["tag1", "tag2"],
  "license": "MIT"
}
```

### skill.md

```markdown
# My Skill

<skill-description>
A brief description of what this skill enables Claude to do.
</skill-description>

## When to Use

- Scenario 1
- Scenario 2

## Instructions

Step-by-step instructions for Claude...
```

### Validating Your Skill

Before publishing, validate your skill structure:

```bash
claude-skills validate ./my-skill
```

### Publishing to Registry

1. Create a GitHub repository for your skill
2. Fork this repository
3. Add your skill to `registry.json`
4. Submit a pull request

## Architecture

The project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── application/              # Use cases (business logic)
│   └── use-cases/
│       ├── install-skill.use-case.ts
│       ├── uninstall-skill.use-case.ts
│       ├── list-skills.use-case.ts
│       ├── search-skills.use-case.ts
│       ├── check-outdated.use-case.ts
│       ├── install-mcp.use-case.ts
│       └── uninstall-mcp.use-case.ts
│
├── domain/                   # Core interfaces & types
│   └── interfaces/
│       ├── skill.interface.ts
│       ├── file-service.interface.ts
│       ├── git-service.interface.ts
│       ├── registry.interface.ts
│       └── mcp-service.interface.ts
│
├── infrastructure/           # Implementations
│   ├── cli/                  # CLI prompts, commands & UI
│   │   ├── commands.ts
│   │   ├── prompts.ts
│   │   └── index.ts
│   └── services/             # Service implementations
│       ├── file.service.ts
│       ├── git.service.ts
│       ├── registry.service.ts
│       ├── mcp.service.ts
│       └── skill-validator.service.ts
│
├── __tests__/                # Test suites
│   ├── application/
│   └── infrastructure/
│
└── index.ts                  # Entry point
```

### Key Design Decisions

| Aspect | Decision |
|--------|----------|
| **Architecture** | Clean Architecture with dependency injection |
| **Testing** | Vitest with 62 passing tests |
| **Build** | tsup for ESM output with type declarations |
| **CLI UI** | @clack/prompts for interactive elements |
| **Styling** | chalk + gradient-string for terminal output |

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/jarero321/claude-skills
cd claude-skills

# Install dependencies
bun install

# Run in development mode
bun run dev
```

### Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Run in development mode |
| `bun run build` | Build for production |
| `bun run test` | Run tests in watch mode |
| `bun run test:run` | Run tests once |
| `bun run test:coverage` | Run tests with coverage |

### Tech Stack

| Technology | Purpose |
|------------|---------|
| TypeScript | Type-safe development |
| tsup | Build & bundling |
| Vitest | Testing framework |
| @clack/prompts | Interactive CLI prompts |
| chalk | Terminal styling |
| gradient-string | Colorful banners |
| figlet | ASCII art text |

## Registry Format

The registry (`registry.json`) contains available skills and MCP servers:

```json
{
  "version": "2.0.0",
  "skills": [
    {
      "name": "skill-name",
      "description": "What it does",
      "version": "1.0.0",
      "author": "author-name",
      "repository": "https://github.com/...",
      "tags": ["tag1", "tag2"],
      "license": "MIT"
    }
  ],
  "mcps": [
    {
      "name": "mcp-name",
      "description": "What it does",
      "repository": "https://github.com/...",
      "language": "go",
      "version": "1.0.0",
      "install": {
        "type": "binary",
        "build": "make build"
      },
      "config": {
        "command": "./bin/mcp-server",
        "envVars": [...]
      }
    }
  ]
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Carlos](https://github.com/jarero321)

---

<div align="center">

**[Report Bug](https://github.com/jarero321/claude-skills/issues)** · **[Request Feature](https://github.com/jarero321/claude-skills/issues)**

</div>
