import {
  showBanner,
  showSeparator as showSeparatorUI,
  showGoodbye as showGoodbyeUI,
  showSuccess as showSuccessUI,
  showError as showErrorUI,
  showInfo as showInfoUI,
  confirmAction as confirmActionUI,
  createProgressReporter,
  showNote,
  clack as p,
  chalk,
  sleep,
} from "@cjarero183006/cli-builder";
import type { ProgressReporter } from "@cjarero183006/cli-builder/interfaces";
import type { SkillManifest, InstalledSkill, ValidationResult } from "../../domain/interfaces/index.ts";
import type { OutdatedSkill } from "../../application/use-cases/index.ts";
import type { McpManifest, InstalledMcp, McpEnvVar } from "../../domain/interfaces/mcp-service.interface.ts";

export { createProgressReporter, sleep };
export type { ProgressReporter };

export function showBannerUI(): void {
  showBanner({
    title: "Skills",
    subtitle: "Claude Code Agent Skills Manager",
  });
}

export function showSeparator(): void {
  showSeparatorUI();
}

export function showGoodbye(): void {
  showGoodbyeUI({
    message: "Thanks for using Claude Skills!",
  });
}

export type InteractiveAction = "install" | "uninstall" | "list" | "search" | "mcp" | "outdated" | "exit";

export async function selectAction(): Promise<InteractiveAction | null> {
  const result = await p.select({
    message: "What would you like to do?",
    options: [
      { value: "install", label: "Install skill", hint: "Add a new skill" },
      { value: "uninstall", label: "Uninstall skill", hint: "Remove installed skill" },
      { value: "list", label: "List installed", hint: "Show all skills" },
      { value: "search", label: "Search skills", hint: "Find in registry" },
      { value: "mcp", label: "MCP Servers", hint: "Manage MCP servers" },
      { value: "outdated", label: "Check updates", hint: "Find outdated skills" },
      { value: "exit", label: "Exit", hint: "Close the CLI" },
    ],
  });

  if (p.isCancel(result)) {
    return null;
  }

  return result as InteractiveAction;
}

export type McpAction = "install" | "uninstall" | "update" | "list" | "outdated" | "back";

export async function selectMcpAction(): Promise<McpAction | null> {
  const result = await p.select({
    message: "MCP Servers",
    options: [
      { value: "install", label: "Install MCP", hint: "Add a new MCP server" },
      { value: "uninstall", label: "Uninstall MCP", hint: "Remove installed MCP" },
      { value: "update", label: "Update MCP", hint: "Update installed MCP" },
      { value: "list", label: "List available", hint: "Show all MCPs" },
      { value: "outdated", label: "Check updates", hint: "Find outdated MCPs" },
      { value: "back", label: "Back", hint: "Return to main menu" },
    ],
  });

  if (p.isCancel(result)) {
    return null;
  }

  return result as McpAction;
}

export async function selectMcpToUninstall(mcps: InstalledMcp[]): Promise<InstalledMcp | null> {
  if (mcps.length === 0) {
    p.log.warn("No MCPs installed");
    return null;
  }

  const result = await p.select({
    message: "Select an MCP to uninstall:",
    options: mcps.map((mcp) => ({
      value: mcp.name,
      label: mcp.name,
      hint: `Installed at ${mcp.path}`,
    })),
  });

  if (p.isCancel(result)) {
    return null;
  }

  return mcps.find((m) => m.name === result) ?? null;
}

export async function selectMcpToUpdate(mcps: InstalledMcp[]): Promise<InstalledMcp | null> {
  if (mcps.length === 0) {
    p.log.warn("No MCPs installed");
    return null;
  }

  const result = await p.select({
    message: "Select an MCP to update:",
    options: mcps.map((mcp) => ({
      value: mcp.name,
      label: mcp.name,
      hint: `Installed at ${mcp.path}`,
    })),
  });

  if (p.isCancel(result)) {
    return null;
  }

  return mcps.find((m) => m.name === result) ?? null;
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
  return confirmActionUI(message);
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
  showSuccessUI(message);
}

export function showError(message: string): void {
  showErrorUI(message);
}

export function showInstallSuccess(skill: InstalledSkill): void {
  console.log();
  showNote(
    `${chalk.cyan("Skill installed:")} ${skill.name}\n` +
      `${chalk.cyan("Version:")} ${skill.version}\n` +
      `${chalk.cyan("Path:")} ${skill.path}\n\n` +
      `The skill is now available in Claude Code.`,
    "Success"
  );
  p.outro(chalk.green("Installation complete!"));
}

export function showOutdatedResults(skills: OutdatedSkill[]): void {
  if (skills.length === 0) {
    p.log.info("No skills installed");
    return;
  }

  const outdated = skills.filter((s) => s.hasUpdate);
  const upToDate = skills.filter((s) => !s.hasUpdate);

  console.log();

  if (outdated.length > 0) {
    p.log.warn(`${outdated.length} skill${outdated.length === 1 ? "" : "s"} with updates available:`);
    console.log();

    for (const skill of outdated) {
      console.log(
        chalk.yellow(`  ${skill.name}: `) +
          chalk.dim(`${skill.installedVersion}`) +
          chalk.yellow(` -> `) +
          chalk.green(`${skill.latestVersion}`) +
          chalk.yellow(` (update available)`)
      );
    }
    console.log();
  }

  if (upToDate.length > 0) {
    p.log.success(`${upToDate.length} skill${upToDate.length === 1 ? "" : "s"} up to date:`);
    console.log();

    for (const skill of upToDate) {
      console.log(
        chalk.green(`  ${skill.name}: `) +
          chalk.dim(`${skill.installedVersion}`) +
          chalk.green(` (up to date)`)
      );
    }
    console.log();
  }
}

export function showValidationResult(path: string, result: ValidationResult): void {
  console.log();

  if (result.valid) {
    p.log.success(`Skill at ${path} is valid`);
  } else {
    p.log.error(`Skill at ${path} has validation errors:`);
  }

  if (result.errors.length > 0) {
    console.log();
    for (const error of result.errors) {
      console.log(chalk.red(`  x ${error}`));
    }
  }

  if (result.warnings.length > 0) {
    console.log();
    for (const warning of result.warnings) {
      console.log(chalk.yellow(`  ! ${warning}`));
    }
  }

  console.log();
}

export function showMcpList(mcps: McpManifest[]): void {
  if (mcps.length === 0) {
    p.log.info("No MCPs available in registry");
    return;
  }

  console.log();
  p.log.info(`Found ${mcps.length} MCP${mcps.length === 1 ? "" : "s"} available:`);
  console.log();

  for (const mcp of mcps) {
    console.log(chalk.cyan(`  ${mcp.name}`) + chalk.dim(` (${mcp.language})`));
    console.log(chalk.dim(`    ${mcp.description}`));
    console.log(chalk.dim(`    Repository: ${mcp.repository}`));
    console.log();
  }
}

export function showMcpInstallSuccess(name: string): void {
  console.log();
  showNote(
    `${chalk.cyan("MCP installed:")} ${name}\n\n` +
      `The MCP has been added to ~/.claude/settings.json\n` +
      `and will be available in Claude Code.`,
    "Success"
  );
  p.outro(chalk.green("MCP installation complete!"));
}

export async function selectMcpToInstall(mcps: McpManifest[]): Promise<McpManifest | null> {
  if (mcps.length === 0) {
    p.log.warn("No MCPs available");
    return null;
  }

  const result = await p.select({
    message: "Select an MCP to install:",
    options: mcps.map((mcp) => ({
      value: mcp.name,
      label: mcp.name,
      hint: `${mcp.description} (${mcp.language})`,
    })),
  });

  if (p.isCancel(result)) {
    return null;
  }

  return mcps.find((m) => m.name === result) ?? null;
}

export function showInfo(message: string): void {
  showInfoUI(message);
}

export async function runEnvVarWizard(envVars: McpEnvVar[]): Promise<Record<string, string> | null> {
  if (envVars.length === 0) {
    return {};
  }

  console.log();
  p.log.info(chalk.cyan("Configuration required"));
  console.log(chalk.dim("  This MCP needs some environment variables to work properly.\n"));

  const result: Record<string, string> = {};

  for (const envVar of envVars) {
    const label = envVar.required
      ? `${envVar.name} ${chalk.red("*")}`
      : envVar.name;

    const value = await p.text({
      message: label,
      placeholder: envVar.secret ? "........" : (envVar.default ?? ""),
      defaultValue: envVar.default,
      validate: (input) => {
        if (envVar.required && !input && !envVar.default) {
          return `${envVar.name} is required`;
        }
      },
    });

    if (p.isCancel(value)) {
      p.cancel("Configuration cancelled");
      return null;
    }

    const finalValue = (value as string) || envVar.default || "";
    if (finalValue) {
      result[envVar.name] = finalValue;
    }
  }

  return result;
}

export function showMcpConfigSummary(name: string, envVars: Record<string, string>): void {
  const entries = Object.entries(envVars);
  if (entries.length === 0) return;

  console.log();
  p.log.info(chalk.cyan("Configuration saved"));
  console.log();
  for (const [key, value] of entries) {
    const masked = value.length > 4 ? value.slice(0, 2) + ".".repeat(value.length - 4) + value.slice(-2) : "....";
    console.log(chalk.dim(`  ${key}: ${masked}`));
  }
  console.log();
}
