import { describe, it, expect, vi, beforeEach } from "vitest";
import { InstallSkillUseCase } from "../../application/use-cases/install-skill.use-case.ts";
import type { FileService, GitService, SkillRegistry, SkillManifest } from "../../domain/interfaces/index.ts";

describe("InstallSkillUseCase", () => {
  let fileService: FileService;
  let gitService: GitService;
  let registry: SkillRegistry;
  let useCase: InstallSkillUseCase;
  let progress: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> };

  const mockManifest: SkillManifest = {
    name: "test-skill",
    description: "A test skill",
    version: "1.0.0",
    author: "tester",
    repository: "https://github.com/test/skill",
    tags: ["test"],
  };

  beforeEach(() => {
    fileService = {
      getSkillsDir: vi.fn().mockReturnValue("/home/user/.claude/skills"),
      ensureSkillsDir: vi.fn().mockResolvedValue(undefined),
      listInstalled: vi.fn().mockResolvedValue([]),
      readManifest: vi.fn().mockResolvedValue(null),
      writeManifest: vi.fn().mockResolvedValue(undefined),
      removeSkill: vi.fn().mockResolvedValue(undefined),
      skillExists: vi.fn().mockReturnValue(false),
      hasSkillFile: vi.fn().mockReturnValue(true),
    };

    gitService = {
      clone: vi.fn().mockResolvedValue(undefined),
      getLatestTag: vi.fn().mockResolvedValue(null),
    };

    registry = {
      fetchAvailable: vi.fn().mockResolvedValue([mockManifest]),
      search: vi.fn().mockResolvedValue([mockManifest]),
      findByName: vi.fn().mockResolvedValue(mockManifest),
    };

    progress = {
      start: vi.fn(),
      stop: vi.fn(),
    };

    useCase = new InstallSkillUseCase(fileService, gitService, registry);
  });

  it("should install a skill from registry", async () => {
    const result = await useCase.execute({ skillName: "test-skill" }, progress);

    expect(result.success).toBe(true);
    expect(result.skill?.name).toBe("test-skill");
    expect(registry.findByName).toHaveBeenCalledWith("test-skill");
    expect(gitService.clone).toHaveBeenCalled();
    expect(fileService.writeManifest).toHaveBeenCalled();
  });

  it("should install a skill from custom repo URL", async () => {
    const result = await useCase.execute(
      { repoUrl: "https://github.com/custom/my-skill" },
      progress
    );

    expect(result.success).toBe(true);
    expect(result.skill?.name).toBe("my-skill");
    expect(gitService.clone).toHaveBeenCalled();
    expect(registry.findByName).not.toHaveBeenCalled();
  });

  it("should fail if skill is already installed", async () => {
    vi.mocked(fileService.skillExists).mockReturnValue(true);

    const result = await useCase.execute({ skillName: "test-skill" }, progress);

    expect(result.success).toBe(false);
    expect(result.error).toContain("already installed");
  });

  it("should fail if skill is not found in registry", async () => {
    vi.mocked(registry.findByName).mockResolvedValue(null);

    const result = await useCase.execute({ skillName: "unknown-skill" }, progress);

    expect(result.success).toBe(false);
    expect(result.error).toContain("not found in registry");
  });

  it("should fail if repo does not contain SKILL.md", async () => {
    vi.mocked(fileService.hasSkillFile).mockReturnValue(false);

    const result = await useCase.execute({ skillName: "test-skill" }, progress);

    expect(result.success).toBe(false);
    expect(result.error).toContain("SKILL.md");
    expect(fileService.removeSkill).toHaveBeenCalled();
  });

  it("should fail if git clone fails", async () => {
    vi.mocked(gitService.clone).mockRejectedValue(new Error("Clone failed"));

    const result = await useCase.execute({ skillName: "test-skill" }, progress);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to clone");
  });

  it("should fail if neither skillName nor repoUrl provided", async () => {
    const result = await useCase.execute({}, progress);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Either skillName or repoUrl must be provided");
  });
});
