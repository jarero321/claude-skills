export interface McpInstallConfig {
  type: "binary" | "npm" | "script";
  build?: string;
  install?: string;
}

export interface McpEnvVar {
  name: string;
  description: string;
  required?: boolean;
  default?: string;
  secret?: boolean;
}

export interface McpConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  envVars?: McpEnvVar[];
}

export interface McpManifest {
  name: string;
  description: string;
  repository: string;
  language: string;
  version?: string;
  install: McpInstallConfig;
  config: McpConfig;
}

export interface InstalledMcp {
  name: string;
  path: string;
  installedAt: string;
  config: McpConfig;
}

export interface ClaudeSettingsMcpServer {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface ClaudeSettings {
  mcpServers?: Record<string, ClaudeSettingsMcpServer>;
  [key: string]: unknown;
}

export interface McpService {
  listAvailable(): Promise<McpManifest[]>;
  findByName(name: string): Promise<McpManifest | null>;
  install(manifest: McpManifest, envVars?: Record<string, string>): Promise<void>;
  uninstall(name: string): Promise<void>;
  listInstalled(): Promise<InstalledMcp[]>;
  isInstalled(name: string): Promise<boolean>;
  readClaudeSettings(): Promise<ClaudeSettings>;
  writeClaudeSettings(settings: ClaudeSettings): Promise<void>;
}
