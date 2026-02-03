import { homedir } from "os";
import { join } from "path";
import { mkdir, readdir, readFile, writeFile, rm } from "fs/promises";
import { existsSync } from "fs";
import type { FileService, InstalledSkill, SkillManifest } from "../../domain/interfaces/index.ts";

const SKILLS_DIR = join(homedir(), ".claude", "skills");
const MANIFEST_FILE = ".manifest.json";
const SKILL_FILE = "SKILL.md";

export class FileServiceImpl implements FileService {
  getSkillsDir(): string {
    return SKILLS_DIR;
  }

  async ensureSkillsDir(): Promise<void> {
    await mkdir(SKILLS_DIR, { recursive: true });
  }

  async listInstalled(): Promise<InstalledSkill[]> {
    await this.ensureSkillsDir();

    const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
    const skills: InstalledSkill[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillPath = join(SKILLS_DIR, entry.name);
      const manifestPath = join(skillPath, MANIFEST_FILE);

      if (existsSync(manifestPath)) {
        try {
          const content = await readFile(manifestPath, "utf-8");
          const manifest = JSON.parse(content) as InstalledSkill;
          skills.push(manifest);
        } catch {
          continue;
        }
      }
    }

    return skills;
  }

  async readManifest(skillPath: string): Promise<SkillManifest | null> {
    const manifestPath = join(skillPath, MANIFEST_FILE);

    if (!existsSync(manifestPath)) {
      return null;
    }

    try {
      const content = await readFile(manifestPath, "utf-8");
      return JSON.parse(content) as SkillManifest;
    } catch {
      return null;
    }
  }

  async writeManifest(skillPath: string, manifest: InstalledSkill): Promise<void> {
    const manifestPath = join(skillPath, MANIFEST_FILE);
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  }

  async removeSkill(skillName: string): Promise<void> {
    const skillPath = join(SKILLS_DIR, skillName);

    if (existsSync(skillPath)) {
      await rm(skillPath, { recursive: true, force: true });
    }
  }

  skillExists(skillName: string): boolean {
    const skillPath = join(SKILLS_DIR, skillName);
    return existsSync(skillPath);
  }

  hasSkillFile(skillPath: string): boolean {
    const skillFilePath = join(skillPath, SKILL_FILE);
    return existsSync(skillFilePath);
  }
}
