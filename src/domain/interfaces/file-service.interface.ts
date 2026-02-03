import type { InstalledSkill, SkillManifest } from "./skill.interface.ts";

export interface FileService {
  getSkillsDir(): string;
  ensureSkillsDir(): Promise<void>;
  listInstalled(): Promise<InstalledSkill[]>;
  readManifest(skillPath: string): Promise<SkillManifest | null>;
  writeManifest(skillPath: string, manifest: InstalledSkill): Promise<void>;
  removeSkill(skillName: string): Promise<void>;
  skillExists(skillName: string): boolean;
  hasSkillFile(skillPath: string): boolean;
}
