import { describe, it, expect, vi, beforeEach } from "vitest";
import { CheckOutdatedUseCase } from "../../application/use-cases/check-outdated.use-case.ts";
import type { FileService, SkillRegistry, InstalledSkill, SkillManifest } from "../../domain/interfaces/index.ts";

describe("CheckOutdatedUseCase", () => {
  let useCase: CheckOutdatedUseCase;
  let mockFileService: FileService;
  let mockRegistry: SkillRegistry;

  const installedSkills: InstalledSkill[] = [
    {
      name: "skill-a",
      description: "Skill A",
      version: "1.0.0",
      author: "carlos",
      repository: "https://github.com/test/skill-a",
      tags: [],
      installedAt: "2024-01-01",
      path: "/path/to/skill-a",
    },
    {
      name: "skill-b",
      description: "Skill B",
      version: "2.0.0",
      author: "carlos",
      repository: "https://github.com/test/skill-b",
      tags: [],
      installedAt: "2024-01-01",
      path: "/path/to/skill-b",
    },
    {
      name: "custom-skill",
      description: "Custom Skill",
      version: "custom",
      author: "carlos",
      repository: "https://github.com/test/custom-skill",
      tags: [],
      installedAt: "2024-01-01",
      path: "/path/to/custom-skill",
    },
  ];

  const registrySkills: SkillManifest[] = [
    {
      name: "skill-a",
      description: "Skill A",
      version: "1.1.0",
      author: "carlos",
      repository: "https://github.com/test/skill-a",
      tags: [],
    },
    {
      name: "skill-b",
      description: "Skill B",
      version: "2.0.0",
      author: "carlos",
      repository: "https://github.com/test/skill-b",
      tags: [],
    },
  ];

  beforeEach(() => {
    mockFileService = {
      listInstalled: vi.fn().mockResolvedValue(installedSkills),
    } as unknown as FileService;

    mockRegistry = {
      fetchAvailable: vi.fn().mockResolvedValue(registrySkills),
    } as unknown as SkillRegistry;

    useCase = new CheckOutdatedUseCase(mockFileService, mockRegistry);
  });

  it("should detect outdated skills", async () => {
    const result = await useCase.execute();

    expect(result.totalInstalled).toBe(3);
    expect(result.outdatedCount).toBe(1);

    const skillA = result.skills.find((s) => s.name === "skill-a");
    expect(skillA?.hasUpdate).toBe(true);
    expect(skillA?.installedVersion).toBe("1.0.0");
    expect(skillA?.latestVersion).toBe("1.1.0");
  });

  it("should detect up-to-date skills", async () => {
    const result = await useCase.execute();

    const skillB = result.skills.find((s) => s.name === "skill-b");
    expect(skillB?.hasUpdate).toBe(false);
    expect(skillB?.installedVersion).toBe("2.0.0");
    expect(skillB?.latestVersion).toBe("2.0.0");
  });

  it("should handle skills not in registry", async () => {
    const result = await useCase.execute();

    const customSkill = result.skills.find((s) => s.name === "custom-skill");
    expect(customSkill?.hasUpdate).toBe(false);
    expect(customSkill?.latestVersion).toBe("not in registry");
  });

  it("should handle custom version skills", async () => {
    const result = await useCase.execute();

    const customSkill = result.skills.find((s) => s.name === "custom-skill");
    expect(customSkill?.hasUpdate).toBe(false);
  });

  it("should return empty skills when nothing is installed", async () => {
    mockFileService.listInstalled = vi.fn().mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.skills).toHaveLength(0);
    expect(result.totalInstalled).toBe(0);
    expect(result.outdatedCount).toBe(0);
  });

  it("should correctly compare major versions", async () => {
    mockFileService.listInstalled = vi.fn().mockResolvedValue([
      { ...installedSkills[0], version: "1.0.0" },
    ]);
    mockRegistry.fetchAvailable = vi.fn().mockResolvedValue([
      { ...registrySkills[0], version: "2.0.0" },
    ]);

    const result = await useCase.execute();

    expect(result.skills[0]?.hasUpdate).toBe(true);
  });

  it("should correctly compare patch versions", async () => {
    mockFileService.listInstalled = vi.fn().mockResolvedValue([
      { ...installedSkills[0], version: "1.0.0" },
    ]);
    mockRegistry.fetchAvailable = vi.fn().mockResolvedValue([
      { ...registrySkills[0], version: "1.0.1" },
    ]);

    const result = await useCase.execute();

    expect(result.skills[0]?.hasUpdate).toBe(true);
  });

  it("should not flag as outdated when installed version is newer", async () => {
    mockFileService.listInstalled = vi.fn().mockResolvedValue([
      { ...installedSkills[0], version: "2.0.0" },
    ]);
    mockRegistry.fetchAvailable = vi.fn().mockResolvedValue([
      { ...registrySkills[0], version: "1.0.0" },
    ]);

    const result = await useCase.execute();

    expect(result.skills[0]?.hasUpdate).toBe(false);
  });
});
