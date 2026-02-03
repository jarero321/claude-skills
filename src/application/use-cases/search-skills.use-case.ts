import type { SkillRegistry, SkillManifest } from "../../domain/interfaces/index.ts";

export class SearchSkillsUseCase {
  constructor(private readonly registry: SkillRegistry) {}

  async execute(query: string): Promise<SkillManifest[]> {
    if (!query.trim()) {
      return this.registry.fetchAvailable();
    }

    return this.registry.search(query);
  }
}
