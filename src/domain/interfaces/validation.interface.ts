export interface SkillFrontmatter {
  name: string;
  description: string;
  license: string;
  metadata: {
    author: string;
    version: string;
    tags?: string[];
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ParsedSkillFile {
  frontmatter: SkillFrontmatter | null;
  content: string;
  raw: string;
}

export interface SkillValidator {
  validate(frontmatter: SkillFrontmatter | null): ValidationResult;
  validateSkillPath(skillPath: string): Promise<ValidationResult>;
}

export interface FrontmatterParser {
  parse(content: string): ParsedSkillFile;
  hasFrontmatter(content: string): boolean;
}
