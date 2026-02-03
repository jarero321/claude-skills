import { describe, it, expect, vi, beforeEach } from "vitest";
import { UninstallSkillUseCase } from "../../application/use-cases/uninstall-skill.use-case.ts";
import type { FileService } from "../../domain/interfaces/index.ts";

describe("UninstallSkillUseCase", () => {
  let fileService: FileService;
  let useCase: UninstallSkillUseCase;
  let progress: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    fileService = {
      getSkillsDir: vi.fn().mockReturnValue("/home/user/.claude/skills"),
      ensureSkillsDir: vi.fn().mockResolvedValue(undefined),
      listInstalled: vi.fn().mockResolvedValue([]),
      readManifest: vi.fn().mockResolvedValue(null),
      writeManifest: vi.fn().mockResolvedValue(undefined),
      removeSkill: vi.fn().mockResolvedValue(undefined),
      skillExists: vi.fn().mockReturnValue(true),
      hasSkillFile: vi.fn().mockReturnValue(true),
    };

    progress = {
      start: vi.fn(),
      stop: vi.fn(),
    };

    useCase = new UninstallSkillUseCase(fileService);
  });

  it("should uninstall an existing skill", async () => {
    const result = await useCase.execute("test-skill", progress);

    expect(result.success).toBe(true);
    expect(fileService.removeSkill).toHaveBeenCalledWith("test-skill");
    expect(progress.start).toHaveBeenCalledWith("Removing test-skill...");
    expect(progress.stop).toHaveBeenCalledWith("Removed test-skill");
  });

  it("should fail if skill is not installed", async () => {
    vi.mocked(fileService.skillExists).mockReturnValue(false);

    const result = await useCase.execute("unknown-skill", progress);

    expect(result.success).toBe(false);
    expect(result.error).toContain("not installed");
    expect(fileService.removeSkill).not.toHaveBeenCalled();
  });

  it("should fail if removal throws an error", async () => {
    vi.mocked(fileService.removeSkill).mockRejectedValue(new Error("Permission denied"));

    const result = await useCase.execute("test-skill", progress);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to remove");
  });
});
