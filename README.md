<div align="center">

# Claude Skills

**The package manager for Claude Code agent skills**

[![npm version](https://img.shields.io/npm/v/@cjarero183006/claude-skills?style=flat-square&color=00d4ff)](https://www.npmjs.com/package/@cjarero183006/claude-skills)
[![License](https://img.shields.io/badge/license-MIT-7c3aed?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-f472b6?style=flat-square)](package.json)

<br />

Install, manage, and discover skills that extend Claude Code's capabilities.

[Getting Started](#getting-started) · [Commands](#commands) · [Creating Skills](#creating-skills) · [Registry](#registry)

</div>

---

## Overview

Claude Skills is a CLI tool that brings package management to Claude Code agent skills. Think of it as npm for AI agent capabilities - install pre-built skills from a registry or create your own.

```
┌─────────────────────────────────────┐
│  🎨 Claude Skills Manager           │
│  ─────────────────────────────────  │
│                                     │
│  📦 Install skill                   │
│  🗑️  Uninstall skill                │
│  📋 List installed                  │
│  🔍 Search skills                   │
│  🔌 MCP Servers                     │
│  🔄 Check updates                   │
│  👋 Exit                            │
│                                     │
└─────────────────────────────────────┘
```

## Getting Started

### Installation

```bash
# Using npm
npm install -g @cjarero183006/claude-skills

# Using bun
bun add -g @cjarero183006/claude-skills
```

### Quick Start

```bash
# Launch interactive mode
claude-skills interactive

# Or use commands directly
claude-skills search git
claude-skills install gitflow
claude-skills list
```

## Commands

### Skills Management

| Command | Description |
|---------|-------------|
| `install <name>` | Install a skill from the registry |
| `install --repo <url>` | Install from a Git repository |
| `uninstall <name>` | Remove an installed skill |
| `list` | Show all installed skills |
| `search <query>` | Search available skills |
| `outdated` | Check for skill updates |
| `validate <path>` | Validate a skill directory |

### MCP Servers

| Command | Description |
|---------|-------------|
| `mcp list` | List available MCP servers |
| `mcp install <name>` | Install an MCP server |
| `mcp uninstall <name>` | Remove an MCP server |
| `mcp outdated` | Check for MCP updates |

### Examples

```bash
# Install a skill by name
claude-skills install atomic-commits

# Install from GitHub
claude-skills install --repo https://github.com/user/my-skill

# Search for documentation skills
claude-skills search docs

# Check what needs updating
claude-skills outdated
```

## Available Skills

| Skill | Description | Tags |
|-------|-------------|------|
| `gitflow` | Git Flow branching strategy automation | git, workflow |
| `jira-ticket` | JIRA ticket template generator | jira, agile |
| `atomic-commits` | Conventional commits with GitFlow | git, commits |
| `dev-docs` | Professional README generator | docs, markdown |

> Browse more at [registry.json](registry.json) or use `claude-skills search`

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

### Publishing

1. Create a GitHub repository for your skill
2. Submit a PR to add it to the registry
3. Users can install via `claude-skills install your-skill`

## Registry

The registry is a JSON file containing all available skills and MCP servers:

```json
{
  "version": "2.0.0",
  "skills": [...],
  "mcps": [...]
}
```

### Adding to Registry

1. Fork this repository
2. Add your skill to `registry.json`
3. Submit a pull request

## Architecture

```
src/
├── application/          # Use cases
│   └── use-cases/
├── domain/               # Core interfaces
│   └── interfaces/
├── infrastructure/       # Implementations
│   ├── cli/              # CLI prompts & commands
│   └── services/         # File, Git, Registry services
└── index.ts              # Entry point
```

The project follows Clean Architecture principles with clear separation between domain logic and infrastructure.

## Development

```bash
# Clone and install
git clone https://github.com/jarero321/claude-skills
cd claude-skills
bun install

# Run in development
bun run dev

# Build
bun run build

# Test
bun run test
```

## Requirements

- Node.js >= 18
- Git (for installing from repositories)

## License

MIT © [Carlos](https://github.com/jarero321)

---

<div align="center">

**[Report Bug](https://github.com/jarero321/claude-skills/issues)** · **[Request Feature](https://github.com/jarero321/claude-skills/issues)**

</div>
