import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListSkillsUseCase } from "../../application/use-cases/list-skills.use-case.ts";
import type { FileService, InstalledSkill } from "../../domain/interfaces/index.ts";

describe("ListSkillsUseCase", () => {
  let fileService: FileService;
  let useCase: ListSkillsUseCase;

  const mockSkills: InstalledSkill[] = [
    {
      name: "skill-a",
      description: "First skill",
      version: "1.0.0",
      author: "author-a",
      repository: "https://github.com/test/skill-a",
      tags: ["test"],
      installedAt: "2024-01-01T00:00:00.000Z",
      path: "/home/user/.claude/skills/skill-a",
    },
    {
      name: "skill-b",
      description: "Second skill",
      version: "2.0.0",
      author: "author-b",
      repository: "https://github.com/test/skill-b",
      tags: ["test"],
      installedAt: "2024-01-02T00:00:00.000Z",
      path: "/home/user/.claude/skills/skill-b",
    },
  ];

  beforeEach(() => {
    fileService = {
      getSkillsDir: vi.fn().mockReturnValue("/home/user/.claude/skills"),
      ensureSkillsDir: vi.fn().mockResolvedValue(undefined),
      listInstalled: vi.fn().mockResolvedValue(mockSkills),
      readManifest: vi.fn().mockResolvedValue(null),
      writeManifest: vi.fn().mockResolvedValue(undefined),
      removeSkill: vi.fn().mockResolvedValue(undefined),
      skillExists: vi.fn().mockReturnValue(false),
      hasSkillFile: vi.fn().mockReturnValue(true),
    };

    useCase = new ListSkillsUseCase(fileService);
  });

  it("should return all installed skills", async () => {
    const result = await useCase.execute();

    expect(result).toEqual(mockSkills);
    expect(fileService.listInstalled).toHaveBeenCalled();
  });

  it("should return empty array when no skills installed", async () => {
    vi.mocked(fileService.listInstalled).mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
