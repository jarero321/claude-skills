import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchSkillsUseCase } from "../../application/use-cases/search-skills.use-case.ts";
import type { SkillRegistry, SkillManifest } from "../../domain/interfaces/index.ts";

describe("SearchSkillsUseCase", () => {
  let registry: SkillRegistry;
  let useCase: SearchSkillsUseCase;

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

  beforeEach(() => {
    registry = {
      fetchAvailable: vi.fn().mockResolvedValue(mockSkills),
      search: vi.fn().mockImplementation((query: string) => {
        return Promise.resolve(
          mockSkills.filter(
            (s) =>
              s.name.includes(query) ||
              s.description.toLowerCase().includes(query.toLowerCase()) ||
              s.tags.some((t) => t.includes(query))
          )
        );
      }),
      findByName: vi.fn().mockResolvedValue(null),
    };

    useCase = new SearchSkillsUseCase(registry);
  });

  it("should return all skills when query is empty", async () => {
    const result = await useCase.execute("");

    expect(result).toEqual(mockSkills);
    expect(registry.fetchAvailable).toHaveBeenCalled();
    expect(registry.search).not.toHaveBeenCalled();
  });

  it("should search skills when query is provided", async () => {
    const result = await useCase.execute("review");

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("code-review");
    expect(registry.search).toHaveBeenCalledWith("review");
  });

  it("should return empty array when no matches found", async () => {
    vi.mocked(registry.search).mockResolvedValue([]);

    const result = await useCase.execute("nonexistent");

    expect(result).toEqual([]);
  });

  it("should trim whitespace from query", async () => {
    vi.mocked(registry.fetchAvailable).mockResolvedValue(mockSkills);

    await useCase.execute("   ");

    expect(registry.fetchAvailable).toHaveBeenCalled();
  });
});
