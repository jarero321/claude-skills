import type { ProgressReporter } from "@cjarero183006/cli-builder/interfaces";
import { wrapError } from "@cjarero183006/cli-builder/utils";
import type { FileService } from "../../domain/interfaces/index.ts";

export interface UninstallSkillResult {
  success: boolean;
  error?: string;
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
      return { success: false, error: wrapError(error, "Failed to remove skill") };
    }
  }
}
