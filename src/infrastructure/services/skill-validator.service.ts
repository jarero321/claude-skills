import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import type { SkillValidator, SkillFrontmatter, ValidationResult } from "../../domain/interfaces/index.ts";
import { FrontmatterParserImpl } from "./frontmatter-parser.service.ts";

const MAX_DESCRIPTION_LENGTH = 1024;
const SKILL_FILE = "SKILL.md";

export class SkillValidatorImpl implements SkillValidator {
  private parser = new FrontmatterParserImpl();

  validate(frontmatter: SkillFrontmatter | null): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!frontmatter) {
      errors.push("Missing or invalid YAML frontmatter");
      return { valid: false, errors, warnings };
    }

    if (!frontmatter.name || typeof frontmatter.name !== "string") {
      errors.push("Missing required field: name");
    } else if (!/^[a-z0-9-]+$/.test(frontmatter.name)) {
      errors.push("Name must contain only lowercase letters, numbers, and hyphens");
    }

    if (!frontmatter.description || typeof frontmatter.description !== "string") {
      errors.push("Missing required field: description");
    } else if (frontmatter.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description exceeds maximum length of ${MAX_DESCRIPTION_LENGTH} characters`);
    }

    if (!frontmatter.license || typeof frontmatter.license !== "string") {
      errors.push("Missing required field: license");
    }

    if (!frontmatter.metadata) {
      errors.push("Missing required field: metadata");
    } else {
      if (!frontmatter.metadata.author || typeof frontmatter.metadata.author !== "string") {
        errors.push("Missing required field: metadata.author");
      }

      if (!frontmatter.metadata.version || typeof frontmatter.metadata.version !== "string") {
        errors.push("Missing required field: metadata.version");
      } else if (!/^\d+\.\d+\.\d+$/.test(frontmatter.metadata.version)) {
        warnings.push("Version should follow semantic versioning (e.g., 1.0.0)");
      }

      if (frontmatter.metadata.tags && !Array.isArray(frontmatter.metadata.tags)) {
        errors.push("metadata.tags must be an array");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateSkillPath(skillPath: string): Promise<ValidationResult> {
    const skillFilePath = join(skillPath, SKILL_FILE);

    if (!existsSync(skillFilePath)) {
      return {
        valid: false,
        errors: [`SKILL.md not found at ${skillFilePath}`],
        warnings: [],
      };
    }

    try {
      const content = await readFile(skillFilePath, "utf-8");
      const parsed = this.parser.parse(content);
      return this.validate(parsed.frontmatter);
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to read SKILL.md: ${error instanceof Error ? error.message : "Unknown error"}`],
        warnings: [],
      };
    }
  }
}
