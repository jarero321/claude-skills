import type { ProgressReporter } from "@cjarero183006/cli-builder/interfaces";
import { wrapError } from "@cjarero183006/cli-builder/utils";
import type { McpService, McpManifest } from "../../domain/interfaces/index.ts";

export interface UpdateMcpResult {
  success: boolean;
  mcp?: McpManifest;
  error?: string;
}

export class UpdateMcpUseCase {
  constructor(private readonly mcpService: McpService) {}

  async execute(name: string, progress: ProgressReporter): Promise<UpdateMcpResult> {
    progress.start(`Updating MCP "${name}"...`);

    const isInstalled = await this.mcpService.isInstalled(name);
    if (!isInstalled) {
      progress.stop(`MCP "${name}" is not installed`);
      return { success: false, error: `MCP "${name}" is not installed` };
    }

    const manifest = await this.mcpService.findByName(name);
    if (!manifest) {
      progress.stop(`MCP "${name}" not found in registry`);
      return { success: false, error: `MCP "${name}" not found in registry` };
    }

    try {
      await this.mcpService.update(name, manifest);
      progress.stop(`Updated ${manifest.name}`);
      return { success: true, mcp: manifest };
    } catch (error) {
      progress.stop(`Failed to update MCP`);
      return { success: false, error: wrapError(error, "Failed to update MCP") };
    }
  }
}
