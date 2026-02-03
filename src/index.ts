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
  selectAction,
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

async function handleOutdated(): Promise<void> {
  const progress = createProgressReporter();
  progress.start("Checking for outdated skills...");

  const result = await checkOutdatedUseCase.execute();
  progress.stop("Check complete");

  showOutdatedResults(result.skills);
}

async function handleValidate(path?: string): Promise<void> {
  if (!path) {
    showError("Please provide a path to validate");
    process.exit(1);
  }

  const result = await skillValidator.validateSkillPath(path);
  showValidationResult(path, result);

  if (!result.valid) {
    process.exit(1);
  }
}

async function handleMcpList(): Promise<void> {
  const mcps = await mcpService.listAvailable();
  showMcpList(mcps);
}

async function handleMcpInstall(name?: string): Promise<void> {
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
    process.exit(1);
  }
}

async function handleMcpUninstall(name?: string): Promise<void> {
  if (!name) {
    showError("Please provide an MCP name to uninstall");
    process.exit(1);
  }

  const confirmed = await confirmAction(`Are you sure you want to uninstall MCP "${name}"?`);
  if (!confirmed) {
    showSuccess("Operation cancelled");
    return;
  }

  const progress = createProgressReporter();
  const result = await uninstallMcpUseCase.execute(name, progress);

  if (result.success) {
    showSuccess(`MCP "${name}" uninstalled successfully`);
  } else {
    showError(result.error ?? "MCP uninstallation failed");
    process.exit(1);
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
