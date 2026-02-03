export interface GitService {
  clone(repoUrl: string, destPath: string): Promise<void>;
  getLatestTag(repoUrl: string): Promise<string | null>;
}
