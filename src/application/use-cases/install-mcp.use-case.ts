import type { McpService, McpManifest } from "../../domain/interfaces/index.ts";
import type { ProgressReporter } from "./install-skill.use-case.ts";

export interface InstallMcpResult {
  success: boolean;
  mcp?: McpManifest;
  error?: string;
}

export class InstallMcpUseCase {
  constructor(private readonly mcpService: McpService) {}

  async execute(name: string, progress: ProgressReporter): Promise<InstallMcpResult> {
    progress.start(`Searching for MCP "${name}"...`);

    const manifest = await this.mcpService.findByName(name);

    if (!manifest) {
      progress.stop(`MCP "${name}" not found in registry`);
      return { success: false, error: `MCP "${name}" not found in registry` };
    }

    progress.stop(`Found MCP: ${manifest.name}`);

    const isInstalled = await this.mcpService.isInstalled(name);
    if (isInstalled) {
      return { success: false, error: `MCP "${name}" is already installed` };
    }

    progress.start(`Installing ${manifest.name}...`);

    try {
      await this.mcpService.install(manifest);
      progress.stop(`Installed ${manifest.name}`);
      return { success: true, mcp: manifest };
    } catch (error) {
      progress.stop(`Failed to install MCP`);
      return {
        success: false,
        error: `Failed to install MCP: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}
