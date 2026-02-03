export interface SkillManifest {
  name: string;
  description: string;
  version: string;
  author: string;
  repository: string;
  tags: string[];
}

export interface InstalledSkill extends SkillManifest {
  installedAt: string;
  path: string;
}
