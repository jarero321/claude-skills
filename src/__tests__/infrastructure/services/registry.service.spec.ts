import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RegistryServiceImpl } from "../../../infrastructure/services/registry.service.ts";
import type { SkillManifest } from "../../../domain/interfaces/index.ts";

const mockSkills: SkillManifest[] = [
  {
    name: "code-review",
    description: "Review code for best practices",
    version: "1.0.0",
    author: "carlos",
    repository: "https://github.com/test/code-review",
    tags: ["review", "security"],
  },
  {
    name: "git-commit",
    description: "Generate commit messages",
    version: "1.0.0",
    author: "carlos",
    repository: "https://github.com/test/git-commit",
    tags: ["git", "commit"],
  },
];

const mockRegistryData = {
  version: "1.0.0",
  skills: mockSkills,
};

describe("RegistryServiceImpl", () => {
  let service: RegistryServiceImpl;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRegistryData),
    });
    vi.stubGlobal("fetch", mockFetch);
    service = new RegistryServiceImpl();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("fetchAvailable", () => {
    it("should fetch skills from registry", async () => {
      const result = await service.fetchAvailable();

      expect(result).toEqual(mockSkills);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should cache results after first fetch", async () => {
      await service.fetchAvailable();
      await service.fetchAvailable();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should throw error on failed fetch", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: "Not Found",
      });

      await expect(service.fetchAvailable()).rejects.toThrow("Failed to fetch skill registry");
    });
  });

  describe("search", () => {
    it("should search skills by name", async () => {
      const result = await service.search("code");

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe("code-review");
    });

    it("should search skills by description", async () => {
      const result = await service.search("commit");

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe("git-commit");
    });

    it("should search skills by tags", async () => {
      const result = await service.search("security");

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe("code-review");
    });

    it("should be case insensitive", async () => {
      const result = await service.search("REVIEW");

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe("code-review");
    });

    it("should return empty array for no matches", async () => {
      const result = await service.search("nonexistent");

      expect(result).toEqual([]);
    });
  });

  describe("findByName", () => {
    it("should find skill by exact name", async () => {
      const result = await service.findByName("code-review");

      expect(result).toEqual(mockSkills[0]);
    });

    it("should return null if skill not found", async () => {
      const result = await service.findByName("nonexistent");

      expect(result).toBeNull();
    });
  });
});
