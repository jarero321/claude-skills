import type { FileService, SkillRegistry, InstalledSkill, SkillManifest } from "../../domain/interfaces/index.ts";

export interface OutdatedSkill {
  name: string;
  installedVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
}

export interface CheckOutdatedResult {
  skills: OutdatedSkill[];
  totalInstalled: number;
  outdatedCount: number;
}

export class CheckOutdatedUseCase {
  constructor(
    private readonly fileService: FileService,
    private readonly registry: SkillRegistry
  ) {}

  async execute(): Promise<CheckOutdatedResult> {
    const installed = await this.fileService.listInstalled();
    const available = await this.registry.fetchAvailable();

    const availableMap = new Map<string, SkillManifest>();
    for (const skill of available) {
      availableMap.set(skill.name, skill);
    }

    const skills: OutdatedSkill[] = [];

    for (const installedSkill of installed) {
      const registrySkill = availableMap.get(installedSkill.name);

      if (registrySkill) {
        const hasUpdate = this.isNewerVersion(installedSkill.version, registrySkill.version);
        skills.push({
          name: installedSkill.name,
          installedVersion: installedSkill.version,
          latestVersion: registrySkill.version,
          hasUpdate,
        });
      } else {
        skills.push({
          name: installedSkill.name,
          installedVersion: installedSkill.version,
          latestVersion: "not in registry",
          hasUpdate: false,
        });
      }
    }

    const outdatedCount = skills.filter((s) => s.hasUpdate).length;

    return {
      skills,
      totalInstalled: installed.length,
      outdatedCount,
    };
  }

  private isNewerVersion(installed: string, latest: string): boolean {
    if (installed === "custom" || latest === "not in registry") {
      return false;
    }

    const installedParts = installed.split(".").map(Number);
    const latestParts = latest.split(".").map(Number);

    for (let i = 0; i < 3; i++) {
      const installedPart = installedParts[i] ?? 0;
      const latestPart = latestParts[i] ?? 0;

      if (latestPart > installedPart) {
        return true;
      }
      if (latestPart < installedPart) {
        return false;
      }
    }

    return false;
  }
}
