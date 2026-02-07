<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,5,30&height=180&section=header&text=claude-skills&fontSize=36&fontColor=fff&animation=fadeIn&fontAlignY=32" />

<div align="center">

![Build](https://img.shields.io/github/actions/workflow/status/jarero321/claude-skills/ci.yml?branch=main&style=for-the-badge)
![npm](https://img.shields.io/npm/v/@cjarero183006/claude-skills?style=for-the-badge)
![Downloads](https://img.shields.io/npm/dm/@cjarero183006/claude-skills?style=for-the-badge&color=7c3aed)
![License](https://img.shields.io/github/license/jarero321/claude-skills?style=for-the-badge)

**CLI for installing, managing and discovering Claude Code Agent Skills.**

[Quick Start](#quick-start) •
[Commands](#commands) •
[Available Skills](#available-skills) •
[MCP Servers](#mcp-servers) •
[Creating Skills](#creating-skills)

</div>

---

## Features

| Feature | Description |
|:--------|:------------|
| **Interactive UI** | Menu-driven interface powered by @clack/prompts |
| **Skills Registry** | Install, search, and update skills from a central registry |
| **MCP Management** | Install MCP servers with guided configuration wizard |
| **Plugin System** | Install and manage plugins for extended functionality |
| **GitHub Install** | Install skills directly from any GitHub repository |
| **Outdated Check** | Detect and update outdated skills, MCPs, and plugins |

## Tech Stack

<div align="center">

**Languages & Frameworks**

<img src="https://skillicons.dev/icons?i=ts,nodejs&perline=8" alt="languages" />

**Infrastructure & Tools**

<img src="https://skillicons.dev/icons?i=bun,githubactions,npm&perline=8" alt="infra" />

</div>

## Why I Built This

Claude Code skills are powerful but there's no easy way to:
- Share skills between projects
- Discover what others have built
- Install MCP servers without manual config

I wanted `npm install` but for AI agent capabilities. So I built it.

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
│    Plugins                          │
│    Check updates                    │
│    Exit                             │
│                                     │
└─────────────────────────────────────┘
```

---

## Commands

### Skills

| Command | Description |
|:--------|:------------|
| `install <name>` | Install from registry |
| `install --repo <url>` | Install from GitHub |
| `uninstall <name>` | Remove a skill |
| `list` | Show installed skills |
| `search <query>` | Find skills in registry |
| `outdated` | Check for updates |
| `validate <path>` | Validate a skill directory |

### MCP Servers

| Command | Description |
|:--------|:------------|
| `mcp list` | Available MCP servers |
| `mcp install <name>` | Install with guided config |
| `mcp uninstall <name>` | Remove MCP server |
| `mcp update <name>` | Update MCP server |
| `mcp outdated` | Check for outdated MCPs |

### Plugins

| Command | Description |
|:--------|:------------|
| `plugin list` | Available plugins |
| `plugin install <name>` | Install plugin |
| `plugin uninstall <name>` | Remove plugin |
| `plugin update <name>` | Update plugin |

---

## Available Skills

| Skill | Description |
|:------|:------------|
| `gitflow` | Git Flow branching automation |
| `jira-ticket` | JIRA ticket template generator |
| `atomic-commits` | Conventional commits with GitFlow |
| `dev-docs` | Professional README generator |

> Browse all: `claude-skills search`

---

## MCP Servers

MCP servers extend Claude's capabilities with external tools.

| MCP | Description | Language |
|:----|:------------|:---------|
| `repo-monitor` | GitHub monitoring: PRs, CI, drift, rollbacks | Go |

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
├── application/      # Use cases (install, uninstall, search, update)
├── domain/           # Interfaces and contracts
├── infrastructure/   # CLI, services, registry
└── __tests__/        # 62 tests
```

| Aspect | Choice |
|:-------|:-------|
| **Architecture** | Clean Architecture with DI |
| **Testing** | Vitest (62 passing) |
| **Build** | tsup (ESM) |
| **CLI UI** | @clack/prompts via cli-builder |
| **Styling** | chalk + gradient-string |

---

## Development

```bash
git clone https://github.com/jarero321/claude-skills.git
cd claude-skills
bun install
bun run dev
```

| Script | Description |
|:-------|:------------|
| `bun run dev` | Development mode |
| `bun run build` | Production build |
| `bun run test` | Watch mode |
| `bun run test:run` | Single test run |
| `bun run test:coverage` | Coverage report |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**[Report Bug](https://github.com/jarero321/claude-skills/issues)** · **[Request Feature](https://github.com/jarero321/claude-skills/issues)**

</div>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,5,30&height=120&section=footer" />
