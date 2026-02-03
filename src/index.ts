#!/usr/bin/env node
import {
  InstallSkillUseCase,
  UninstallSkillUseCase,
  ListSkillsUseCase,
  SearchSkillsUseCase,
  CheckOutdatedUseCase,
  InstallMcpUseCase,
  UninstallMcpUseCase,
} from "./application/use-cases/index.ts";
import {
  FileServiceImpl,
  GitServiceImpl,
  RegistryServiceImpl,
  SkillValidatorImpl,
  McpServiceImpl,
} from "./infrastructure/services/index.ts";
import {
  parseArgs,
  showHelp,
  showBanner,
  showSeparator,
  showGoodbye,
  sleep,
  selectAction,
  selectMcpAction,
  promptSearchQuery,
  selectSkillToInstall,
  selectSkillToUninstall,
  selectMcpToUninstall,
  confirmAction,
  createProgressReporter,
  showSkillsList,
  showSearchResults,
  showSuccess,
  showError,
  showInfo,
  showInstallSuccess,
  showOutdatedResults,
  showValidationResult,
  showMcpList,
  showMcpInstallSuccess,
  selectMcpToInstall,
} from "./infrastructure/cli/index.ts";

const fileService = new FileServiceImpl();
const gitService = new GitServiceImpl();
const registryService = new RegistryServiceImpl();
const skillValidator = new SkillValidatorImpl();
const mcpService = new McpServiceImpl(registryService);

const installUseCase = new InstallSkillUseCase(fileService, gitService, registryService);
const uninstallUseCase = new UninstallSkillUseCase(fileService);
const listUseCase = new ListSkillsUseCase(fileService);
const searchUseCase = new SearchSkillsUseCase(registryService);
const checkOutdatedUseCase = new CheckOutdatedUseCase(fileService, registryService);
const installMcpUseCase = new InstallMcpUseCase(mcpService);
const uninstallMcpUseCase = new UninstallMcpUseCase(mcpService);

async function handleInstall(skillName?: string, repoUrl?: string, exitOnError = true): Promise<void> {
  const progress = createProgressReporter();

  const result = await installUseCase.execute(
    { skillName, repoUrl },
    progress
  );

  if (result.success && result.skill) {
    showInstallSuccess(result.skill);
  } else {
    showError(result.error ?? "Installation failed");
    if (exitOnError) process.exit(1);
  }
}

async function handleUninstall(skillName?: string, exitOnError = true): Promise<void> {
  let name = skillName;

  if (!name) {
    const skills = await listUseCase.execute();
    const selected = await selectSkillToUninstall(skills);
    if (!selected) return;
    name = selected.name;
  }

  const confirmed = await confirmAction(`Are you sure you want to uninstall "${name}"?`);
  if (!confirmed) {
    showInfo("Operation cancelled");
    return;
  }

  const progress = createProgressReporter();
  const result = await uninstallUseCase.execute(name, progress);

  if (result.success) {
    showSuccess(`Skill "${name}" uninstalled successfully`);
  } else {
    showError(result.error ?? "Uninstallation failed");
    if (exitOnError) process.exit(1);
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

async function handleOutdated(): Promise<void> {
  const progress = createProgressReporter();
  progress.start("Checking for outdated skills...");

  const result = await checkOutdatedUseCase.execute();
  progress.stop("Check complete");

  showOutdatedResults(result.skills);
}

async function handleValidate(path?: string, exitOnError = true): Promise<void> {
  if (!path) {
    showError("Please provide a path to validate");
    if (exitOnError) process.exit(1);
    return;
  }

  const result = await skillValidator.validateSkillPath(path);
  showValidationResult(path, result);

  if (!result.valid && exitOnError) {
    process.exit(1);
  }
}

async function handleMcpList(): Promise<void> {
  const mcps = await mcpService.listAvailable();
  showMcpList(mcps);
}

async function handleMcpInstall(name?: string, exitOnError = true): Promise<void> {
  let mcpName = name;

  if (!mcpName) {
    const mcps = await mcpService.listAvailable();
    const selected = await selectMcpToInstall(mcps);
    if (!selected) return;
    mcpName = selected.name;
  }

  const progress = createProgressReporter();
  const result = await installMcpUseCase.execute(mcpName, progress);

  if (result.success && result.mcp) {
    showMcpInstallSuccess(result.mcp.name);
  } else {
    showError(result.error ?? "MCP installation failed");
    if (exitOnError) process.exit(1);
  }
}

async function handleMcpUninstall(name?: string, exitOnError = true): Promise<void> {
  let mcpName = name;

  if (!mcpName) {
    const mcps = await mcpService.listInstalled();
    const selected = await selectMcpToUninstall(mcps);
    if (!selected) return;
    mcpName = selected.name;
  }

  const confirmed = await confirmAction(`Are you sure you want to uninstall MCP "${mcpName}"?`);
  if (!confirmed) {
    showInfo("Operation cancelled");
    return;
  }

  const progress = createProgressReporter();
  const result = await uninstallMcpUseCase.execute(mcpName, progress);

  if (result.success) {
    showSuccess(`MCP "${mcpName}" uninstalled successfully`);
  } else {
    showError(result.error ?? "MCP uninstallation failed");
    if (exitOnError) process.exit(1);
  }
}

async function handleMcpOutdated(): Promise<void> {
  const progress = createProgressReporter();
  progress.start("Checking for outdated MCPs...");

  const installed = await mcpService.listInstalled();
  const available = await mcpService.listAvailable();

  progress.stop("Check complete");

  if (installed.length === 0) {
    showSuccess("No MCPs installed");
    return;
  }

  console.log();
  for (const mcp of installed) {
    const registryMcp = available.find((m) => m.name === mcp.name);
    if (registryMcp && registryMcp.version) {
      console.log(`  ${mcp.name}: installed (registry version: ${registryMcp.version})`);
    } else {
      console.log(`  ${mcp.name}: installed (not in registry)`);
    }
  }
  console.log();
}

async function handleInstallAction(): Promise<void> {
  const query = await promptSearchQuery();
  if (query === null) return;

  const skills = await searchUseCase.execute(query);
  const selected = await selectSkillToInstall(skills);
  if (!selected) return;

  await handleInstall(selected.name, undefined, false);
}

async function handleUninstallAction(): Promise<void> {
  await handleUninstall(undefined, false);
}

async function handleListAction(): Promise<void> {
  await handleList();
}

async function handleSearchAction(): Promise<void> {
  await handleSearch();
}

async function handleOutdatedAction(): Promise<void> {
  await handleOutdated();
}

async function handleMcpMenu(): Promise<void> {
  const action = await selectMcpAction();

  if (!action || action === "back") return;

  switch (action) {
    case "install":
      await handleMcpInstall(undefined, false);
      break;
    case "uninstall":
      await handleMcpUninstall(undefined, false);
      break;
    case "list":
      await handleMcpList();
      break;
    case "outdated":
      await handleMcpOutdated();
      break;
  }
}

async function executeAction(action: string): Promise<void> {
  try {
    switch (action) {
      case "install":
        await handleInstallAction();
        break;
      case "uninstall":
        await handleUninstallAction();
        break;
      case "list":
        await handleListAction();
        break;
      case "search":
        await handleSearchAction();
        break;
      case "mcp":
        await handleMcpMenu();
        break;
      case "outdated":
        await handleOutdatedAction();
        break;
    }
  } catch (error) {
    showError(error instanceof Error ? error.message : "An unexpected error occurred");
  }
}

async function handleInteractive(): Promise<void> {
  console.clear();
  showBanner();

  while (true) {
    const action = await selectAction();

    if (!action || action === "exit") {
      showGoodbye();
      return;
    }

    await executeAction(action);

    await sleep(800);
    showSeparator();
  }
}

async function main(): Promise<void> {
  const { command, subcommand, args, flags } = parseArgs(process.argv);

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

    case "outdated":
      await handleOutdated();
      break;

    case "validate":
      await handleValidate(args[0]);
      break;

    case "mcp":
      switch (subcommand) {
        case "list":
          await handleMcpList();
          break;
        case "install":
          await handleMcpInstall(args[0]);
          break;
        case "uninstall":
          await handleMcpUninstall(args[0]);
          break;
        case "outdated":
          await handleMcpOutdated();
          break;
        default:
          showError("Usage: claude-skills mcp <list|install|uninstall|outdated>");
          process.exit(1);
      }
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
