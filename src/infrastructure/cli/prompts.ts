import * as p from "@clack/prompts";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import type { SkillManifest, InstalledSkill } from "../../domain/interfaces/index.ts";
import type { ProgressReporter } from "../../application/use-cases/index.ts";

const skillsGradient = gradient(["#00d4ff", "#7c3aed", "#f472b6"]);

export function showBanner(): void {
  console.clear();
  const title = figlet.textSync("Skills", { font: "Small" });
  console.log(skillsGradient(title));
  console.log(chalk.dim("  Claude Code Agent Skills Manager\n"));
}

export type InteractiveAction = "install" | "uninstall" | "list" | "search" | "exit";

export async function selectAction(): Promise<InteractiveAction | null> {
  const result = await p.select({
    message: "What would you like to do?",
    options: [
      { value: "install", label: "Install a skill", hint: "Download and install from registry" },
      { value: "uninstall", label: "Uninstall a skill", hint: "Remove an installed skill" },
      { value: "list", label: "List installed skills", hint: "Show all installed skills" },
      { value: "search", label: "Search skills", hint: "Browse available skills" },
      { value: "exit", label: "Exit", hint: "Quit the program" },
    ],
  });

  if (p.isCancel(result)) {
    p.cancel("Operation cancelled");
    return null;
  }

  return result as InteractiveAction;
}

export async function promptSkillName(message: string): Promise<string | null> {
  const result = await p.text({
    message,
    placeholder: "skill-name",
    validate: (value) => {
      if (!value) return "Skill name is required";
      if (!/^[a-z0-9-]+$/.test(value)) return "Use lowercase, numbers and hyphens only";
    },
  });

  if (p.isCancel(result)) {
    p.cancel("Operation cancelled");
    return null;
  }

  return result as string;
}

export async function promptSearchQuery(): Promise<string | null> {
  const result = await p.text({
    message: "Search query:",
    placeholder: "security, git, review...",
  });

  if (p.isCancel(result)) {
    p.cancel("Operation cancelled");
    return null;
  }

  return (result as string) || "";
}

export async function selectSkillToInstall(skills: SkillManifest[]): Promise<SkillManifest | null> {
  if (skills.length === 0) {
    p.log.warn("No skills found");
    return null;
  }

  const result = await p.select({
    message: "Select a skill to install:",
    options: skills.map((skill) => ({
      value: skill.name,
      label: skill.name,
      hint: skill.description,
    })),
  });

  if (p.isCancel(result)) {
    p.cancel("Operation cancelled");
    return null;
  }

  return skills.find((s) => s.name === result) ?? null;
}

export async function selectSkillToUninstall(skills: InstalledSkill[]): Promise<InstalledSkill | null> {
  if (skills.length === 0) {
    p.log.warn("No skills installed");
    return null;
  }

  const result = await p.select({
    message: "Select a skill to uninstall:",
    options: skills.map((skill) => ({
      value: skill.name,
      label: skill.name,
      hint: `v${skill.version} - ${skill.description}`,
    })),
  });

  if (p.isCancel(result)) {
    p.cancel("Operation cancelled");
    return null;
  }

  return skills.find((s) => s.name === result) ?? null;
}

export async function confirmAction(message: string): Promise<boolean> {
  const result = await p.confirm({
    message,
  });

  if (p.isCancel(result)) {
    return false;
  }

  return result;
}

export function createProgressReporter(): ProgressReporter {
  const spinner = p.spinner();
  return {
    start: (message: string) => spinner.start(message),
    stop: (message: string) => spinner.stop(message),
  };
}

export function showSkillsList(skills: InstalledSkill[]): void {
  if (skills.length === 0) {
    p.log.info("No skills installed yet. Use 'claude-skills install <name>' to install one.");
    return;
  }

  console.log();
  p.log.info(`Found ${skills.length} installed skill${skills.length === 1 ? "" : "s"}:`);
  console.log();

  for (const skill of skills) {
    console.log(chalk.cyan(`  ${skill.name}`) + chalk.dim(` v${skill.version}`));
    console.log(chalk.dim(`    ${skill.description}`));
    console.log(chalk.dim(`    Path: ${skill.path}`));
    console.log();
  }
}

export function showSearchResults(skills: SkillManifest[]): void {
  if (skills.length === 0) {
    p.log.warn("No skills found matching your query");
    return;
  }

  console.log();
  p.log.info(`Found ${skills.length} skill${skills.length === 1 ? "" : "s"}:`);
  console.log();

  for (const skill of skills) {
    console.log(chalk.cyan(`  ${skill.name}`) + chalk.dim(` v${skill.version}`));
    console.log(chalk.dim(`    ${skill.description}`));
    console.log(chalk.dim(`    Author: ${skill.author}`));
    if (skill.tags.length > 0) {
      console.log(chalk.dim(`    Tags: ${skill.tags.join(", ")}`));
    }
    console.log();
  }
}

export function showSuccess(message: string): void {
  p.outro(chalk.green(message));
}

export function showError(message: string): void {
  p.log.error(message);
}

export function showInstallSuccess(skill: InstalledSkill): void {
  console.log();
  p.note(
    `${chalk.cyan("Skill installed:")} ${skill.name}\n` +
      `${chalk.cyan("Version:")} ${skill.version}\n` +
      `${chalk.cyan("Path:")} ${skill.path}\n\n` +
      `The skill is now available in Claude Code.`,
    "Success"
  );
  p.outro(chalk.green("Installation complete!"));
}
