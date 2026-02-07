import type { ProgressReporter } from "@cjarero183006/cli-builder/interfaces";
import { wrapError } from "@cjarero183006/cli-builder/utils";
import type { PluginService, PluginManifest } from "../../domain/interfaces/index.ts";

export interface UpdatePluginResult {
  success: boolean;
  plugin?: PluginManifest;
  error?: string;
}

export class UpdatePluginUseCase {
  constructor(private readonly pluginService: PluginService) {}

  async execute(name: string, progress: ProgressReporter): Promise<UpdatePluginResult> {
    progress.start(`Updating plugin "${name}"...`);

    const isInstalled = await this.pluginService.isInstalled(name);
    if (!isInstalled) {
      progress.stop(`Plugin "${name}" is not installed`);
      return { success: false, error: `Plugin "${name}" is not installed` };
    }

    const manifest = await this.pluginService.findByName(name);
    if (!manifest) {
      progress.stop(`Plugin "${name}" not found in registry`);
      return { success: false, error: `Plugin "${name}" not found in registry` };
    }

    try {
      await this.pluginService.update(name, manifest);
      progress.stop(`Updated ${manifest.name}`);
      return { success: true, plugin: manifest };
    } catch (error) {
      progress.stop(`Failed to update plugin`);
      return { success: false, error: wrapError(error, "Failed to update plugin") };
    }
  }
}
