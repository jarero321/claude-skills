import { homedir } from "os";
import { join } from "path";
import { mkdir, readFile, writeFile, rm } from "fs/promises";
import { existsSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import type {
  McpService,
  McpManifest,
  InstalledMcp,
  ClaudeSettings,
  SkillRegistry,
} from "../../domain/interfaces/index.ts";

const execAsync = promisify(exec);

const CLAUDE_DIR = join(homedir(), ".claude");
const CLAUDE_SETTINGS_PATH = join(CLAUDE_DIR, "settings.json");
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

    await execAsync(`git clone ${manifest.repository} ${installPath}`);

    if (manifest.install.build) {
      await execAsync(manifest.install.build, { cwd: installPath });
    }

    if (manifest.install.install) {
      await execAsync(manifest.install.install, { cwd: installPath });
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
    await mkdir(CLAUDE_DIR, { recursive: true });

    if (!existsSync(CLAUDE_SETTINGS_PATH)) {
      return {};
    }

    try {
      const content = await readFile(CLAUDE_SETTINGS_PATH, "utf-8");
      return JSON.parse(content) as ClaudeSettings;
    } catch {
      return {};
    }
  }

  async writeClaudeSettings(settings: ClaudeSettings): Promise<void> {
    await mkdir(CLAUDE_DIR, { recursive: true });
    await writeFile(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
  }
}
