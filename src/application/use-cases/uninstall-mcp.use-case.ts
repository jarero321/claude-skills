import type { McpService } from "../../domain/interfaces/index.ts";
import type { ProgressReporter } from "./install-skill.use-case.ts";

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
      return {
        success: false,
        error: `Failed to uninstall MCP: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}
