import type { ProgressReporter } from "@cjarero183006/cli-builder/interfaces";
import { wrapError } from "@cjarero183006/cli-builder/utils";
import type { McpService, McpManifest } from "../../domain/interfaces/index.ts";

export interface InstallMcpResult {
  success: boolean;
  mcp?: McpManifest;
  error?: string;
}

export interface InstallMcpOptions {
  name: string;
  envVars?: Record<string, string>;
}

export class InstallMcpUseCase {
  constructor(private readonly mcpService: McpService) {}

  async findManifest(name: string, progress: ProgressReporter): Promise<McpManifest | null> {
    progress.start(`Searching for MCP "${name}"...`);
    const manifest = await this.mcpService.findByName(name);

    if (!manifest) {
      progress.stop(`MCP "${name}" not found in registry`);
      return null;
    }

    progress.stop(`Found MCP: ${manifest.name}`);
    return manifest;
  }

  async execute(options: InstallMcpOptions, progress: ProgressReporter): Promise<InstallMcpResult> {
    const { name, envVars } = options;

    const manifest = await this.findManifest(name, progress);

    if (!manifest) {
      return { success: false, error: `MCP "${name}" not found in registry` };
    }

    const isInstalled = await this.mcpService.isInstalled(name);
    if (isInstalled) {
      return { success: false, error: `MCP "${name}" is already installed` };
    }

    progress.start(`Installing ${manifest.name}...`);

    try {
      await this.mcpService.install(manifest, envVars);
      progress.stop(`Installed ${manifest.name}`);
      return { success: true, mcp: manifest };
    } catch (error) {
      progress.stop(`Failed to install MCP`);
      return { success: false, error: wrapError(error, "Failed to install MCP") };
    }
  }
}
