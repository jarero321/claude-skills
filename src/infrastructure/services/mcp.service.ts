import { homedir } from "os";
import { join } from "path";
import { mkdir, readFile, writeFile, rm } from "fs/promises";
import { existsSync } from "fs";
import { execSafe, escapeShellArg } from "@cjarero183006/cli-builder/utils";
import type {
  McpService,
  McpManifest,
  InstalledMcp,
  ClaudeSettings,
  SkillRegistry,
} from "../../domain/interfaces/index.ts";

const CLAUDE_DIR = join(homedir(), ".claude");
const CLAUDE_CONFIG_PATH = join(homedir(), ".claude.json");
const MCP_INSTALL_DIR = join(CLAUDE_DIR, "mcp-servers");

export class McpServiceImpl implements McpService {
  constructor(private readonly registry: SkillRegistry) {}

  async listAvailable(): Promise<McpManifest[]> {
    return this.registry.fetchMcps();
  }

  async findByName(name: string): Promise<McpManifest | null> {
    return this.registry.findMcpByName(name);
  }

  async install(manifest: McpManifest, envVars?: Record<string, string>): Promise<void> {
    await mkdir(MCP_INSTALL_DIR, { recursive: true });

    const installPath = join(MCP_INSTALL_DIR, manifest.name);

    if (existsSync(installPath)) {
      await rm(installPath, { recursive: true, force: true });
    }

    await execSafe(`git clone ${escapeShellArg(manifest.repository)} ${escapeShellArg(installPath)}`);

    if (manifest.install.build) {
      await execSafe(manifest.install.build, { cwd: installPath });
    }

    if (manifest.install.install) {
      await execSafe(manifest.install.install, { cwd: installPath });
    }

    const settings = await this.readClaudeSettings();

    if (!settings.mcpServers) {
      settings.mcpServers = {};
    }

    const command = manifest.config.command.startsWith("./")
      ? join(installPath, manifest.config.command)
      : manifest.config.command;

    const mergedEnv = {
      ...manifest.config.env,
      ...envVars,
    };

    settings.mcpServers[manifest.name] = {
      command,
      args: manifest.config.args,
      env: Object.keys(mergedEnv).length > 0 ? mergedEnv : undefined,
    };

    await this.writeClaudeSettings(settings);
  }

  async uninstall(name: string): Promise<void> {
    const installPath = join(MCP_INSTALL_DIR, name);

    if (existsSync(installPath)) {
      await rm(installPath, { recursive: true, force: true });
    }

    const settings = await this.readClaudeSettings();

    if (settings.mcpServers && settings.mcpServers[name]) {
      delete settings.mcpServers[name];
      await this.writeClaudeSettings(settings);
    }
  }

  async listInstalled(): Promise<InstalledMcp[]> {
    const settings = await this.readClaudeSettings();
    const installed: InstalledMcp[] = [];

    if (!settings.mcpServers) {
      return installed;
    }

    for (const [name, config] of Object.entries(settings.mcpServers)) {
      const installPath = join(MCP_INSTALL_DIR, name);
      installed.push({
        name,
        path: existsSync(installPath) ? installPath : config.command,
        installedAt: "",
        config,
      });
    }

    return installed;
  }

  async isInstalled(name: string): Promise<boolean> {
    const settings = await this.readClaudeSettings();
    return settings.mcpServers !== undefined && name in settings.mcpServers;
  }

  async readClaudeSettings(): Promise<ClaudeSettings> {
    if (!existsSync(CLAUDE_CONFIG_PATH)) {
      return {};
    }

    try {
      const content = await readFile(CLAUDE_CONFIG_PATH, "utf-8");
      return JSON.parse(content) as ClaudeSettings;
    } catch {
      return {};
    }
  }

  async writeClaudeSettings(settings: ClaudeSettings): Promise<void> {
    await writeFile(CLAUDE_CONFIG_PATH, JSON.stringify(settings, null, 2), "utf-8");
  }
}
