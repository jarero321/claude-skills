import { describe, it, expect } from "vitest";
import { FrontmatterParserImpl } from "../../../infrastructure/services/frontmatter-parser.service.ts";

describe("FrontmatterParserImpl", () => {
  let parser: FrontmatterParserImpl;

  beforeEach(() => {
    parser = new FrontmatterParserImpl();
  });

  describe("hasFrontmatter", () => {
    it("should return true when content starts with ---", () => {
      const content = `---
name: test
---
# Content`;
      expect(parser.hasFrontmatter(content)).toBe(true);
    });

    it("should return true when content has leading whitespace before ---", () => {
      const content = `  ---
name: test
---
# Content`;
      expect(parser.hasFrontmatter(content)).toBe(true);
    });

    it("should return false when content does not start with ---", () => {
      const content = `# No Frontmatter
Some content here`;
      expect(parser.hasFrontmatter(content)).toBe(false);
    });
  });

  describe("parse", () => {
    it("should parse valid frontmatter correctly", () => {
      const content = `---
name: test-skill
description: A test skill
license: MIT
metadata:
  author: carlos
  version: "1.0.0"
  tags:
    - test
    - example
---

# Test Skill

This is the content.`;

      const result = parser.parse(content);

      expect(result.frontmatter).not.toBeNull();
      expect(result.frontmatter?.name).toBe("test-skill");
      expect(result.frontmatter?.description).toBe("A test skill");
      expect(result.frontmatter?.license).toBe("MIT");
      expect(result.frontmatter?.metadata.author).toBe("carlos");
      expect(result.frontmatter?.metadata.version).toBe("1.0.0");
      expect(result.frontmatter?.metadata.tags).toEqual(["test", "example"]);
      expect(result.content).toBe("# Test Skill\n\nThis is the content.");
    });

    it("should return null frontmatter for content without frontmatter", () => {
      const content = `# No Frontmatter

Just regular markdown content.`;

      const result = parser.parse(content);

      expect(result.frontmatter).toBeNull();
      expect(result.content).toBe(content);
    });

    it("should return null frontmatter for invalid YAML", () => {
      const content = `---
name: test
invalid yaml: [
---
# Content`;

      const result = parser.parse(content);

      expect(result.frontmatter).toBeNull();
    });

    it("should return null frontmatter when required fields are missing", () => {
      const content = `---
name: test-skill
---
# Content`;

      const result = parser.parse(content);

      expect(result.frontmatter).toBeNull();
    });

    it("should handle frontmatter without tags", () => {
      const content = `---
name: test-skill
description: A test skill
license: MIT
metadata:
  author: carlos
  version: "1.0.0"
---

# Content`;

      const result = parser.parse(content);

      expect(result.frontmatter).not.toBeNull();
      expect(result.frontmatter?.metadata.tags).toBeUndefined();
    });

    it("should preserve raw content", () => {
      const content = `---
name: test
description: test
license: MIT
metadata:
  author: carlos
  version: "1.0.0"
---
# Content`;

      const result = parser.parse(content);

      expect(result.raw).toBe(content);
    });
  });
});
