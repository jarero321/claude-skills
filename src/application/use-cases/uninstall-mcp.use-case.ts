import type { ProgressReporter } from "@cjarero183006/cli-builder/interfaces";
import { wrapError } from "@cjarero183006/cli-builder/utils";
import type { McpService } from "../../domain/interfaces/index.ts";

export interface UninstallMcpResult {
  success: boolean;
  error?: string;
}

export class UninstallMcpUseCase {
  constructor(private readonly mcpService: McpService) {}

  async execute(name: string, progress: ProgressReporter): Promise<UninstallMcpResult> {
    const isInstalled = await this.mcpService.isInstalled(name);

    if (!isInstalled) {
      return { success: false, error: `MCP "${name}" is not installed` };
    }

    progress.start(`Uninstalling ${name}...`);

    try {
      await this.mcpService.uninstall(name);
      progress.stop(`Uninstalled ${name}`);
      return { success: true };
    } catch (error) {
      progress.stop(`Failed to uninstall MCP`);
      return { success: false, error: wrapError(error, "Failed to uninstall MCP") };
    }
  }
}
