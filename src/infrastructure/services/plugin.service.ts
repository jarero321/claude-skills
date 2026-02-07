import { homedir } from "os";
import { join } from "path";
import { mkdir, readFile, writeFile, rm, chmod } from "fs/promises";
import { existsSync } from "fs";
import { execSafe, escapeShellArg } from "@cjarero183006/cli-builder/utils";
import type {
  PluginService,
  PluginManifest,
  InstalledPlugin,
  SkillRegistry,
} from "../../domain/interfaces/index.ts";

const CLAUDE_DIR = join(homedir(), ".claude");
const SETTINGS_PATH = join(CLAUDE_DIR, "settings.json");
const PLUGIN_INSTALL_DIR = join(CLAUDE_DIR, "plugins");

interface ClaudeUserSettings {
  [key: string]: unknown;
}

export class PluginServiceImpl implements PluginService {
  constructor(private readonly registry: SkillRegistry) {}

  async listAvailable(): Promise<PluginManifest[]> {
    return this.registry.fetchPlugins();
  }

  async findByName(name: string): Promise<PluginManifest | null> {
    return this.registry.findPluginByName(name);
  }

  async install(manifest: PluginManifest): Promise<void> {
    await mkdir(PLUGIN_INSTALL_DIR, { recursive: true });

    const installPath = join(PLUGIN_INSTALL_DIR, manifest.name);

    if (existsSync(installPath)) {
      await rm(installPath, { recursive: true, force: true });
    }

    await execSafe(`git clone ${escapeShellArg(manifest.repository)} ${escapeShellArg(installPath)}`);

    for (const script of manifest.install.scripts) {
      const scriptPath = join(installPath, script);
      if (existsSync(scriptPath)) {
        await chmod(scriptPath, 0o755);
      }
    }

    const settings = await this.readSettings();

    const settingsValue = { ...manifest.config.settingsValue };

    if (typeof settingsValue.command === "string" && settingsValue.command.startsWith("./")) {
      settingsValue.command = join(installPath, settingsValue.command);
    }

    settings[manifest.config.settingsKey] = settingsValue;

    await this.writeSettings(settings);
  }

  async update(name: string, manifest: PluginManifest): Promise<void> {
    const installPath = join(PLUGIN_INSTALL_DIR, name);

    if (!existsSync(installPath)) {
      throw new Error(`Plugin "${name}" installation directory not found`);
    }

    await execSafe("git pull", { cwd: installPath });

    for (const script of manifest.install.scripts) {
      const scriptPath = join(installPath, script);
      if (existsSync(scriptPath)) {
        await chmod(scriptPath, 0o755);
      }
    }

    const settings = await this.readSettings();

    const settingsValue = { ...manifest.config.settingsValue };

    if (typeof settingsValue.command === "string" && settingsValue.command.startsWith("./")) {
      settingsValue.command = join(installPath, settingsValue.command);
    }

    settings[manifest.config.settingsKey] = settingsValue;

    await this.writeSettings(settings);
  }

  async uninstall(name: string, manifest: PluginManifest): Promise<void> {
    const installPath = join(PLUGIN_INSTALL_DIR, name);

    if (existsSync(installPath)) {
      await rm(installPath, { recursive: true, force: true });
    }

    const settings = await this.readSettings();

    if (manifest.config.settingsKey in settings) {
      delete settings[manifest.config.settingsKey];
      await this.writeSettings(settings);
    }
  }

  async listInstalled(): Promise<InstalledPlugin[]> {
    const available = await this.listAvailable();
    const installed: InstalledPlugin[] = [];

    for (const manifest of available) {
      const installPath = join(PLUGIN_INSTALL_DIR, manifest.name);
      if (existsSync(installPath)) {
        installed.push({
          name: manifest.name,
          path: installPath,
          installedAt: "",
          type: manifest.type,
        });
      }
    }

    return installed;
  }

  async isInstalled(name: string): Promise<boolean> {
    const installPath = join(PLUGIN_INSTALL_DIR, name);
    return existsSync(installPath);
  }

  private async readSettings(): Promise<ClaudeUserSettings> {
    if (!existsSync(SETTINGS_PATH)) {
      return {};
    }

    try {
      const content = await readFile(SETTINGS_PATH, "utf-8");
      return JSON.parse(content) as ClaudeUserSettings;
    } catch {
      return {};
    }
  }

  private async writeSettings(settings: ClaudeUserSettings): Promise<void> {
    await mkdir(CLAUDE_DIR, { recursive: true });
    await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
  }
}
