import type { ProgressReporter } from "@cjarero183006/cli-builder/interfaces";
import { wrapError } from "@cjarero183006/cli-builder/utils";
import type { PluginService, PluginManifest } from "../../domain/interfaces/index.ts";

export interface InstallPluginResult {
  success: boolean;
  plugin?: PluginManifest;
  error?: string;
}

export class InstallPluginUseCase {
  constructor(private readonly pluginService: PluginService) {}

  async findManifest(name: string, progress: ProgressReporter): Promise<PluginManifest | null> {
    progress.start(`Searching for plugin "${name}"...`);
    const manifest = await this.pluginService.findByName(name);

    if (!manifest) {
      progress.stop(`Plugin "${name}" not found in registry`);
      return null;
    }

    progress.stop(`Found plugin: ${manifest.name}`);
    return manifest;
  }

  async execute(name: string, progress: ProgressReporter): Promise<InstallPluginResult> {
    const manifest = await this.findManifest(name, progress);

    if (!manifest) {
      return { success: false, error: `Plugin "${name}" not found in registry` };
    }

    const isInstalled = await this.pluginService.isInstalled(name);
    if (isInstalled) {
      return { success: false, error: `Plugin "${name}" is already installed` };
    }

    progress.start(`Installing ${manifest.name}...`);

    try {
      await this.pluginService.install(manifest);
      progress.stop(`Installed ${manifest.name}`);
      return { success: true, plugin: manifest };
    } catch (error) {
      progress.stop(`Failed to install plugin`);
      return { success: false, error: wrapError(error, "Failed to install plugin") };
    }
  }
}
