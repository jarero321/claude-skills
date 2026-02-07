import { join } from "path";
import { tmpdir } from "os";
import type { ProgressReporter } from "@cjarero183006/cli-builder/interfaces";
import { wrapError } from "@cjarero183006/cli-builder/utils";
import type { FileService, GitService, SkillRegistry, InstalledSkill, SkillManifest } from "../../domain/interfaces/index.ts";

export interface InstallSkillInput {
  skillName?: string;
  repoUrl?: string;
}

export interface InstallSkillResult {
  success: boolean;
  skill?: InstalledSkill;
  error?: string;
}

export type { ProgressReporter };

export class InstallSkillUseCase {
  constructor(
    private readonly fileService: FileService,
    private readonly gitService: GitService,
    private readonly registry: SkillRegistry
  ) {}

  async execute(input: InstallSkillInput, progress: ProgressReporter): Promise<InstallSkillResult> {
    let manifest: SkillManifest | null = null;
    let repoUrl: string;
    let skillName: string;

    if (input.repoUrl) {
      repoUrl = input.repoUrl;
      skillName = this.extractSkillNameFromUrl(repoUrl);
      manifest = {
        name: skillName,
        description: "Installed from custom repository",
        version: "custom",
        author: "unknown",
        repository: repoUrl,
        tags: [],
      };
    } else if (input.skillName) {
      progress.start(`Searching for skill "${input.skillName}"...`);

      manifest = await this.registry.findByName(input.skillName);

      if (!manifest) {
        progress.stop(`Skill "${input.skillName}" not found in registry`);
        return { success: false, error: `Skill "${input.skillName}" not found in registry` };
      }

      repoUrl = manifest.repository;
      skillName = manifest.name;
      progress.stop(`Found skill: ${manifest.name}`);
    } else {
      return { success: false, error: "Either skillName or repoUrl must be provided" };
    }

    if (this.fileService.skillExists(skillName)) {
      return { success: false, error: `Skill "${skillName}" is already installed` };
    }

    const skillsDir = this.fileService.getSkillsDir();
    const destPath = join(skillsDir, skillName);

    await this.fileService.ensureSkillsDir();

    progress.start(`Cloning ${skillName}...`);

    const monorepoPath = manifest.path;

    try {
      if (monorepoPath) {
        const tmpDir = join(tmpdir(), `claude-skill-${skillName}-${Date.now()}`);
        await this.gitService.clone(repoUrl, tmpDir);

        const sourcePath = join(tmpDir, monorepoPath);
        await this.fileService.copyDir(sourcePath, destPath);
        await this.fileService.removeDir(tmpDir);
      } else {
        await this.gitService.clone(repoUrl, destPath);
      }
    } catch (error) {
      progress.stop(`Failed to clone repository`);
      return { success: false, error: wrapError(error, "Failed to clone repository") };
    }

    progress.stop(`Cloned ${skillName}`);

    if (!this.fileService.hasSkillFile(destPath)) {
      await this.fileService.removeSkill(skillName);
      return { success: false, error: `Repository does not contain a valid SKILL.md file` };
    }

    const installedSkill: InstalledSkill = {
      ...manifest,
      installedAt: new Date().toISOString(),
      path: destPath,
    };

    await this.fileService.writeManifest(destPath, installedSkill);

    return { success: true, skill: installedSkill };
  }

  private extractSkillNameFromUrl(url: string): string {
    const parts = url.replace(/\.git$/, "").split("/");
    return parts[parts.length - 1] ?? "unknown-skill";
  }
}
