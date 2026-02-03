import { describe, it, expect, beforeEach } from "vitest";
import { SkillValidatorImpl } from "../../../infrastructure/services/skill-validator.service.ts";
import type { SkillFrontmatter } from "../../../domain/interfaces/index.ts";

describe("SkillValidatorImpl", () => {
  let validator: SkillValidatorImpl;

  beforeEach(() => {
    validator = new SkillValidatorImpl();
  });

  describe("validate", () => {
    const validFrontmatter: SkillFrontmatter = {
      name: "test-skill",
      description: "A test skill for testing purposes",
      license: "MIT",
      metadata: {
        author: "carlos",
        version: "1.0.0",
        tags: ["test", "example"],
      },
    };

    it("should validate a correct frontmatter", () => {
      const result = validator.validate(validFrontmatter);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should return error for null frontmatter", () => {
      const result = validator.validate(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing or invalid YAML frontmatter");
    });

    it("should return error for missing name", () => {
      const frontmatter = { ...validFrontmatter, name: "" };
      const result = validator.validate(frontmatter);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: name");
    });

    it("should return error for invalid name format", () => {
      const frontmatter = { ...validFrontmatter, name: "Test Skill" };
      const result = validator.validate(frontmatter);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Name must contain only lowercase letters, numbers, and hyphens");
    });

    it("should return error for missing description", () => {
      const frontmatter = { ...validFrontmatter, description: "" };
      const result = validator.validate(frontmatter);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: description");
    });

    it("should return error for description exceeding max length", () => {
      const frontmatter = { ...validFrontmatter, description: "a".repeat(1025) };
      const result = validator.validate(frontmatter);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Description exceeds maximum length of 1024 characters");
    });

    it("should return error for missing license", () => {
      const frontmatter = { ...validFrontmatter, license: "" };
      const result = validator.validate(frontmatter);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: license");
    });

    it("should return error for missing metadata.author", () => {
      const frontmatter = {
        ...validFrontmatter,
        metadata: { ...validFrontmatter.metadata, author: "" },
      };
      const result = validator.validate(frontmatter);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: metadata.author");
    });

    it("should return error for missing metadata.version", () => {
      const frontmatter = {
        ...validFrontmatter,
        metadata: { ...validFrontmatter.metadata, version: "" },
      };
      const result = validator.validate(frontmatter);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: metadata.version");
    });

    it("should return warning for non-semver version", () => {
      const frontmatter = {
        ...validFrontmatter,
        metadata: { ...validFrontmatter.metadata, version: "v1.0" },
      };
      const result = validator.validate(frontmatter);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain("Version should follow semantic versioning (e.g., 1.0.0)");
    });

    it("should accept valid names with numbers and hyphens", () => {
      const frontmatter = { ...validFrontmatter, name: "skill-123-test" };
      const result = validator.validate(frontmatter);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate without optional tags", () => {
      const frontmatter = {
        ...validFrontmatter,
        metadata: { author: "carlos", version: "1.0.0" },
      };
      const result = validator.validate(frontmatter);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
