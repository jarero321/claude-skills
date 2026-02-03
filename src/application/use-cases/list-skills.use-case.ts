import type { FileService, InstalledSkill } from "../../domain/interfaces/index.ts";

export class ListSkillsUseCase {
  constructor(private readonly fileService: FileService) {}

  async execute(): Promise<InstalledSkill[]> {
    return this.fileService.listInstalled();
  }
}
