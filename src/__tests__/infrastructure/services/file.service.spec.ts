import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { homedir } from "os";
import { join } from "path";

const mockExistsSync = vi.fn().mockReturnValue(false);
const mockMkdir = vi.fn().mockResolvedValue(undefined);
const mockReaddir = vi.fn().mockResolvedValue([]);
const mockReadFile = vi.fn().mockResolvedValue("{}");
const mockWriteFile = vi.fn().mockResolvedValue(undefined);
const mockRm = vi.fn().mockResolvedValue(undefined);

vi.mock("fs/promises", () => ({
  mkdir: () => mockMkdir(),
  readdir: () => mockReaddir(),
  readFile: () => mockReadFile(),
  writeFile: () => mockWriteFile(),
  rm: () => mockRm(),
}));

vi.mock("fs", () => ({
  existsSync: (path: string) => mockExistsSync(path),
}));

import { FileServiceImpl } from "../../../infrastructure/services/file.service.ts";

describe("FileServiceImpl", () => {
  let service: FileServiceImpl;
  const expectedSkillsDir = join(homedir(), ".claude", "skills");

  beforeEach(() => {
    service = new FileServiceImpl();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getSkillsDir", () => {
    it("should return the correct skills directory path", () => {
      const result = service.getSkillsDir();
      expect(result).toBe(expectedSkillsDir);
    });
  });

  describe("ensureSkillsDir", () => {
    it("should create the skills directory", async () => {
      await service.ensureSkillsDir();
      expect(mockMkdir).toHaveBeenCalled();
    });
  });

  describe("skillExists", () => {
    it("should check if skill directory exists", () => {
      mockExistsSync.mockReturnValue(true);

      const result = service.skillExists("test-skill");

      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(join(expectedSkillsDir, "test-skill"));
    });

    it("should return false if skill does not exist", () => {
      mockExistsSync.mockReturnValue(false);

      const result = service.skillExists("nonexistent");

      expect(result).toBe(false);
    });
  });

  describe("hasSkillFile", () => {
    it("should check if SKILL.md exists in path", () => {
      mockExistsSync.mockReturnValue(true);

      const result = service.hasSkillFile("/path/to/skill");

      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith("/path/to/skill/SKILL.md");
    });
  });

  describe("removeSkill", () => {
    it("should remove skill directory if it exists", async () => {
      mockExistsSync.mockReturnValue(true);

      await service.removeSkill("test-skill");

      expect(mockRm).toHaveBeenCalled();
    });

    it("should not call rm if skill does not exist", async () => {
      mockExistsSync.mockReturnValue(false);

      await expect(service.removeSkill("nonexistent")).resolves.not.toThrow();
      expect(mockRm).not.toHaveBeenCalled();
    });
  });
});
