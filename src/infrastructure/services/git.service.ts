import { gitClone, execSafe, escapeShellArg } from "@cjarero183006/cli-builder/utils";
import type { GitService } from "../../domain/interfaces/index.ts";

export class GitServiceImpl implements GitService {
  async clone(repoUrl: string, destPath: string): Promise<void> {
    await gitClone(repoUrl, destPath, { depth: 1 });
  }

  async getLatestTag(repoUrl: string): Promise<string | null> {
    try {
      const { stdout } = await execSafe(`git ls-remote --tags --sort=-v:refname ${escapeShellArg(repoUrl)} | head -1`);
      const match = stdout.match(/refs\/tags\/(.+)$/);
      return match?.[1]?.trim() ?? null;
    } catch {
      return null;
    }
  }
}
