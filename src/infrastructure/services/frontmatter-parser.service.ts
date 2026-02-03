import { parse as parseYaml } from "yaml";
import type { FrontmatterParser, ParsedSkillFile, SkillFrontmatter } from "../../domain/interfaces/index.ts";

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

export class FrontmatterParserImpl implements FrontmatterParser {
  hasFrontmatter(content: string): boolean {
    return content.trimStart().startsWith("---");
  }

  parse(content: string): ParsedSkillFile {
    if (!this.hasFrontmatter(content)) {
      return {
        frontmatter: null,
        content: content,
        raw: content,
      };
    }

    const match = content.match(FRONTMATTER_REGEX);

    if (!match) {
      return {
        frontmatter: null,
        content: content,
        raw: content,
      };
    }

    const [, yamlContent, markdownContent] = match;

    try {
      const parsed = parseYaml(yamlContent ?? "") as unknown;
      const frontmatter = this.validateAndCastFrontmatter(parsed);

      return {
        frontmatter,
        content: markdownContent?.trim() ?? "",
        raw: content,
      };
    } catch {
      return {
        frontmatter: null,
        content: content,
        raw: content,
      };
    }
  }

  private validateAndCastFrontmatter(parsed: unknown): SkillFrontmatter | null {
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const obj = parsed as Record<string, unknown>;

    if (typeof obj.name !== "string" || !obj.name) {
      return null;
    }

    if (typeof obj.description !== "string" || !obj.description) {
      return null;
    }

    if (typeof obj.license !== "string" || !obj.license) {
      return null;
    }

    if (!obj.metadata || typeof obj.metadata !== "object") {
      return null;
    }

    const metadata = obj.metadata as Record<string, unknown>;

    if (typeof metadata.author !== "string" || !metadata.author) {
      return null;
    }

    if (typeof metadata.version !== "string" || !metadata.version) {
      return null;
    }

    const tags = Array.isArray(metadata.tags)
      ? metadata.tags.filter((t): t is string => typeof t === "string")
      : undefined;

    return {
      name: obj.name,
      description: obj.description,
      license: obj.license,
      metadata: {
        author: metadata.author,
        version: metadata.version,
        tags,
      },
    };
  }
}
