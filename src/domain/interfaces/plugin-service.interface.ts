export interface PluginInstallConfig {
  scripts: string[];
}

export interface PluginSettingsConfig {
  settingsKey: string;
  settingsValue: Record<string, unknown>;
}

export interface PluginManifest {
  name: string;
  description: string;
  repository: string;
  version?: string;
  author: string;
  type: string;
  install: PluginInstallConfig;
  config: PluginSettingsConfig;
}

export interface InstalledPlugin {
  name: string;
  path: string;
  installedAt: string;
  type: string;
}

export interface PluginService {
  listAvailable(): Promise<PluginManifest[]>;
  findByName(name: string): Promise<PluginManifest | null>;
  install(manifest: PluginManifest): Promise<void>;
  update(name: string, manifest: PluginManifest): Promise<void>;
  uninstall(name: string, manifest: PluginManifest): Promise<void>;
  listInstalled(): Promise<InstalledPlugin[]>;
  isInstalled(name: string): Promise<boolean>;
}
