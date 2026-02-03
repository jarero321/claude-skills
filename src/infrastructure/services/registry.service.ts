import type { SkillRegistry, SkillManifest, McpManifest } from "../../domain/interfaces/index.ts";

const REGISTRY_URL = "https://raw.githubusercontent.com/jarero321/claude-skills/main/registry.json";

interface RegistryData {
  version: string;
  skills: SkillManifest[];
  mcps?: McpManifest[];
}

export class RegistryServiceImpl implements SkillRegistry {
  private cache: RegistryData | null = null;

  private async fetchRegistry(): Promise<RegistryData> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const response = await fetch(REGISTRY_URL);

      if (!response.ok) {
        throw new Error(`Failed to fetch registry: ${response.statusText}`);
      }

      const data = (await response.json()) as RegistryData;
      this.cache = data;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch skill registry: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async fetchAvailable(): Promise<SkillManifest[]> {
    const data = await this.fetchRegistry();
    return data.skills;
  }

  async search(query: string): Promise<SkillManifest[]> {
    const skills = await this.fetchAvailable();
    const lowerQuery = query.toLowerCase();

    return skills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(lowerQuery) ||
        skill.description.toLowerCase().includes(lowerQuery) ||
        skill.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async findByName(name: string): Promise<SkillManifest | null> {
    const skills = await this.fetchAvailable();
    return skills.find((skill) => skill.name === name) ?? null;
  }

  async fetchMcps(): Promise<McpManifest[]> {
    const data = await this.fetchRegistry();
    return data.mcps ?? [];
  }

  async findMcpByName(name: string): Promise<McpManifest | null> {
    const mcps = await this.fetchMcps();
    return mcps.find((mcp) => mcp.name === name) ?? null;
  }
}
