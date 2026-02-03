import type { SkillRegistry, SkillManifest } from "../../domain/interfaces/index.ts";

const REGISTRY_URL = "https://raw.githubusercontent.com/jarero321/claude-skills/main/registry.json";

interface RegistryData {
  version: string;
  skills: SkillManifest[];
}

export class RegistryServiceImpl implements SkillRegistry {
  private cache: SkillManifest[] | null = null;

  async fetchAvailable(): Promise<SkillManifest[]> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const response = await fetch(REGISTRY_URL);

      if (!response.ok) {
        throw new Error(`Failed to fetch registry: ${response.statusText}`);
      }

      const data = (await response.json()) as RegistryData;
      this.cache = data.skills;
      return data.skills;
    } catch (error) {
      throw new Error(`Failed to fetch skill registry: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
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
}
