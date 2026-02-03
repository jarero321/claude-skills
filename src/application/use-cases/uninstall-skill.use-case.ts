import type { FileService } from "../../domain/interfaces/index.ts";

export interface UninstallSkillResult {
  success: boolean;
  error?: string;
}

export interface ProgressReporter {
  start(message: string): void;
  stop(message: string): void;
}

export class UninstallSkillUseCase {
  constructor(private readonly fileService: FileService) {}

  async execute(skillName: string, progress: ProgressReporter): Promise<UninstallSkillResult> {
    if (!this.fileService.skillExists(skillName)) {
      return { success: false, error: `Skill "${skillName}" is not installed` };
    }

    progress.start(`Removing ${skillName}...`);

    try {
      await this.fileService.removeSkill(skillName);
      progress.stop(`Removed ${skillName}`);
      return { success: true };
    } catch (error) {
      progress.stop(`Failed to remove ${skillName}`);
      return { success: false, error: `Failed to remove skill: ${error instanceof Error ? error.message : "Unknown error"}` };
    }
  }
}
