export interface SkillManifest {
  name: string;
  description: string;
  version: string;
  author: string;
  repository: string;
  tags: string[];
  license?: string;
}

export interface InstalledSkill extends SkillManifest {
  installedAt: string;
  path: string;
}

export interface SkillMetadata {
  author: string;
  version: string;
  tags?: string[];
}
