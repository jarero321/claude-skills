import type { SkillManifest } from "./skill.interface.ts";

export interface SkillRegistry {
  fetchAvailable(): Promise<SkillManifest[]>;
  search(query: string): Promise<SkillManifest[]>;
  findByName(name: string): Promise<SkillManifest | null>;
}
