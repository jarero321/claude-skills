import { exec } from "child_process";
import { promisify } from "util";
import type { GitService } from "../../domain/interfaces/index.ts";

const execAsync = promisify(exec);

export class GitServiceImpl implements GitService {
  async clone(repoUrl: string, destPath: string): Promise<void> {
    await execAsync(`git clone --depth 1 "${repoUrl}" "${destPath}"`);
  }

  async getLatestTag(repoUrl: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync(`git ls-remote --tags --sort=-v:refname "${repoUrl}" | head -1`);
      const match = stdout.match(/refs\/tags\/(.+)$/);
      return match ? match[1]!.trim() : null;
    } catch {
      return null;
    }
  }
}
