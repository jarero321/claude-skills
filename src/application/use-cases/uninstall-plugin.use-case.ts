import type { ProgressReporter } from "@cjarero183006/cli-builder/interfaces";
import { wrapError } from "@cjarero183006/cli-builder/utils";
import type { PluginService } from "../../domain/interfaces/index.ts";

export interface UninstallPluginResult {
  success: boolean;
  error?: string;
}

export class UninstallPluginUseCase {
  constructor(private readonly pluginService: PluginService) {}

  async execute(name: string, progress: ProgressReporter): Promise<UninstallPluginResult> {
    const isInstalled = await this.pluginService.isInstalled(name);

    if (!isInstalled) {
      return { success: false, error: `Plugin "${name}" is not installed` };
    }

    const manifest = await this.pluginService.findByName(name);
    if (!manifest) {
      return { success: false, error: `Plugin "${name}" not found in registry` };
    }

    progress.start(`Uninstalling ${name}...`);

    try {
      await this.pluginService.uninstall(name, manifest);
      progress.stop(`Uninstalled ${name}`);
      return { success: true };
    } catch (error) {
      progress.stop(`Failed to uninstall plugin`);
      return { success: false, error: wrapError(error, "Failed to uninstall plugin") };
    }
  }
}
