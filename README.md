<div align="center">

```
      _                 _                 _    _ _ _
  ___| | __ _ _   _  __| | ___   ___| | _(_) | |___
 / __| |/ _` | | | |/ _` |/ _ \ / __| |/ / | | / __|
| (__| | (_| | |_| | (_| |  __/ \__ \   <| | | \__ \
 \___|_|\__,_|\__,_|\__,_|\___| |___/_|\_\_|_|_|___/
```

### I got tired of manually copying skills between projects. So I built this.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)

[![npm version](https://img.shields.io/npm/v/@cjarero183006/claude-skills?style=flat-square&color=00d4ff)](https://www.npmjs.com/package/@cjarero183006/claude-skills)
[![npm downloads](https://img.shields.io/npm/dm/@cjarero183006/claude-skills?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/@cjarero183006/claude-skills)
[![License](https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-62%20passed-brightgreen?style=flat-square)](package.json)

**npm for Claude Code agent skills**

[Quick Start](#quick-start) · [Commands](#commands) · [MCP Servers](#mcp-servers) · [Create Your Own](#creating-skills)

</div>

---

## Why I Built This

Claude Code skills are powerful but there's no easy way to:
- Share skills between projects
- Discover what others have built
- Install MCP servers without manual config

I wanted `npm install` but for AI agent capabilities. So I built it.

---

## Demo

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

---

## Quick Start

```bash
# Run directly
npx @cjarero183006/claude-skills

# Or install globally
npm install -g @cjarero183006/claude-skills
claude-skills
```

That's it. Interactive menu guides you through everything.

---

## Commands

### Skills

| Command | What it does |
|---------|--------------|
| `install <name>` | Install from registry |
| `install --repo <url>` | Install from GitHub |
| `uninstall <name>` | Remove a skill |
| `list` | Show installed |
| `search <query>` | Find skills |
| `outdated` | Check for updates |

### MCP Servers

| Command | What it does |
|---------|--------------|
| `mcp list` | Available MCP servers |
| `mcp install <name>` | Install with guided config |
| `mcp uninstall <name>` | Remove MCP server |

---

## Available Skills

| Skill | What it does |
|-------|--------------|
| `gitflow` | Git Flow branching automation |
| `jira-ticket` | JIRA ticket template generator |
| `atomic-commits` | Conventional commits with GitFlow |
| `dev-docs` | Professional README generator |

> Browse all: `claude-skills search`

---

## MCP Servers

MCP servers extend Claude's capabilities with external tools.

### Available MCPs

| MCP | What it does | Language |
|-----|--------------|----------|
| `repo-monitor` | GitHub monitoring: PRs, CI, rollbacks | Go |

### Environment Variables

The CLI walks you through configuration:

```
┌  Configure repo-monitor
│
◇  GITHUB_TOKEN (required)
│  > ********
│
◇  REPO_OWNER (optional)
│  > myorg
│
└  Configuration complete!
```

---

## Creating Skills

Skills are just directories with a `skill.md` and `manifest.json`.

```
my-skill/
├── skill.md          # What Claude should do
├── manifest.json     # Metadata
└── examples/         # Optional examples
```

### manifest.json

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "description": "What this skill does",
  "author": "your-name",
  "tags": ["tag1", "tag2"]
}
```

### Validate before publishing

```bash
claude-skills validate ./my-skill
```

---

## Architecture

Clean Architecture with dependency injection:

```
src/
├── application/      # Use cases
├── domain/           # Interfaces
├── infrastructure/   # CLI, services
└── __tests__/        # 62 tests
```

| Aspect | Choice |
|--------|--------|
| Architecture | Clean Architecture |
| Testing | Vitest (62 passing) |
| Build | tsup (ESM) |
| CLI UI | @clack/prompts |
| Styling | chalk + gradient-string |

---

## Development

```bash
git clone https://github.com/jarero321/claude-skills
cd claude-skills
bun install
bun run dev
```

| Script | What it does |
|--------|--------------|
| `bun run dev` | Development mode |
| `bun run build` | Production build |
| `bun run test` | Watch mode |
| `bun run test:run` | Single run |

---

## License

MIT

---

<div align="center">

**[Report Bug](https://github.com/jarero321/claude-skills/issues)** · **[Request Feature](https://github.com/jarero321/claude-skills/issues)**

</div>
