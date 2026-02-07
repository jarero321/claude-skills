import type { SkillManifest } from "./skill.interface.ts";
import type { McpManifest } from "./mcp-service.interface.ts";
import type { PluginManifest } from "./plugin-service.interface.ts";

export interface SkillRegistry {
  fetchAvailable(): Promise<SkillManifest[]>;
  search(query: string): Promise<SkillManifest[]>;
  findByName(name: string): Promise<SkillManifest | null>;
  fetchMcps(): Promise<McpManifest[]>;
  findMcpByName(name: string): Promise<McpManifest | null>;
  fetchPlugins(): Promise<PluginManifest[]>;
  findPluginByName(name: string): Promise<PluginManifest | null>;
}
