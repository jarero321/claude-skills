#!/usr/bin/env node
import {
  InstallSkillUseCase,
  UninstallSkillUseCase,
  ListSkillsUseCase,
  SearchSkillsUseCase,
} from "./application/use-cases/index.ts";
import { FileServiceImpl, GitServiceImpl, RegistryServiceImpl } from "./infrastructure/services/index.ts";
import {
  parseArgs,
  showHelp,
  showBanner,
  selectAction,
  promptSkillName,
  promptSearchQuery,
  selectSkillToInstall,
  selectSkillToUninstall,
  confirmAction,
  createProgressReporter,
  showSkillsList,
  showSearchResults,
  showSuccess,
  showError,
  showInstallSuccess,
} from "./infrastructure/cli/index.ts";

const fileService = new FileServiceImpl();
const gitService = new GitServiceImpl();
const registryService = new RegistryServiceImpl();

const installUseCase = new InstallSkillUseCase(fileService, gitService, registryService);
const uninstallUseCase = new UninstallSkillUseCase(fileService);
const listUseCase = new ListSkillsUseCase(fileService);
const searchUseCase = new SearchSkillsUseCase(registryService);

async function handleInstall(skillName?: string, repoUrl?: string): Promise<void> {
  const progress = createProgressReporter();

  const result = await installUseCase.execute(
    { skillName, repoUrl },
    progress
  );

  if (result.success && result.skill) {
    showInstallSuccess(result.skill);
  } else {
    showError(result.error ?? "Installation failed");
    process.exit(1);
  }
}

async function handleUninstall(skillName?: string): Promise<void> {
  let name = skillName;

  if (!name) {
    const skills = await listUseCase.execute();
    const selected = await selectSkillToUninstall(skills);
    if (!selected) return;
    name = selected.name;
  }

  const confirmed = await confirmAction(`Are you sure you want to uninstall "${name}"?`);
  if (!confirmed) {
    showSuccess("Operation cancelled");
    return;
  }

  const progress = createProgressReporter();
  const result = await uninstallUseCase.execute(name, progress);

  if (result.success) {
    showSuccess(`Skill "${name}" uninstalled successfully`);
  } else {
    showError(result.error ?? "Uninstallation failed");
    process.exit(1);
  }
}

async function handleList(): Promise<void> {
  const skills = await listUseCase.execute();
  showSkillsList(skills);
}

async function handleSearch(query?: string): Promise<void> {
  let searchQuery = query ?? "";

  if (!searchQuery) {
    const result = await promptSearchQuery();
    if (result === null) return;
    searchQuery = result;
  }

  const skills = await searchUseCase.execute(searchQuery);
  showSearchResults(skills);
}

async function handleInteractive(): Promise<void> {
  showBanner();

  const action = await selectAction();
  if (!action || action === "exit") return;

  switch (action) {
    case "install": {
      const query = await promptSearchQuery();
      if (query === null) return;

      const skills = await searchUseCase.execute(query);
      const selected = await selectSkillToInstall(skills);
      if (!selected) return;

      await handleInstall(selected.name);
      break;
    }
    case "uninstall":
      await handleUninstall();
      break;
    case "list":
      await handleList();
      break;
    case "search":
      await handleSearch();
      break;
  }
}

async function main(): Promise<void> {
  const { command, args, flags } = parseArgs(process.argv);

  if (flags.help) {
    showHelp();
    return;
  }

  switch (command) {
    case "install":
      if (flags.repo) {
        await handleInstall(undefined, flags.repo);
      } else if (args[0]) {
        await handleInstall(args[0]);
      } else {
        showError("Please provide a skill name or --repo URL");
        showHelp();
        process.exit(1);
      }
      break;

    case "uninstall":
      await handleUninstall(args[0]);
      break;

    case "list":
      await handleList();
      break;

    case "search":
      await handleSearch(args.join(" "));
      break;

    case "interactive":
      await handleInteractive();
      break;

    default:
      showError(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  showError(error instanceof Error ? error.message : "An unexpected error occurred");
  process.exit(1);
});
