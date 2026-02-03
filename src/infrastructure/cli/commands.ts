export type Command =
  | "install"
  | "uninstall"
  | "list"
  | "search"
  | "outdated"
  | "validate"
  | "mcp"
  | "interactive";

export type McpSubcommand = "list" | "install" | "uninstall" | "outdated";

export interface ParsedArgs {
  command: Command;
  subcommand?: McpSubcommand;
  args: string[];
  flags: {
    repo?: string;
    help?: boolean;
  };
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    if (args[0] === "--help" || args[0] === "-h") {
      return { command: "interactive", args: [], flags: { help: true } };
    }
    return { command: "interactive", args: [], flags: {} };
  }

  const command = args[0] as Command;
  const restArgs: string[] = [];
  const flags: ParsedArgs["flags"] = {};
  let subcommand: McpSubcommand | undefined;

  let startIndex = 1;

  if (command === "mcp" && args[1] && !args[1].startsWith("-")) {
    subcommand = args[1] as McpSubcommand;
    startIndex = 2;
  }

  for (let i = startIndex; i < args.length; i++) {
    const arg = args[i]!;

    if (arg === "--repo" || arg === "-r") {
      flags.repo = args[++i];
    } else if (arg === "--help" || arg === "-h") {
      flags.help = true;
    } else if (!arg.startsWith("-")) {
      restArgs.push(arg);
    }
  }

  return { command, subcommand, args: restArgs, flags };
}

export function showHelp(): void {
  console.log(`
Usage: claude-skills <command> [options]

Commands:
  install <skill-name>      Install a skill from the registry
  install --repo <url>      Install a skill from a Git repository
  uninstall <skill-name>    Uninstall a skill
  list                      List installed skills
  search <query>            Search available skills in registry
  outdated                  Check for outdated skills
  validate <path>           Validate a skill directory

MCP Commands:
  mcp list                  List available MCPs in registry
  mcp install <name>        Install an MCP server
  mcp uninstall <name>      Uninstall an MCP server
  mcp outdated              Check for outdated MCPs

Options:
  -r, --repo <url>    Git repository URL for direct installation
  -h, --help          Show this help message

Examples:
  claude-skills install code-review
  claude-skills install --repo https://github.com/user/my-skill
  claude-skills uninstall code-review
  claude-skills list
  claude-skills search security
  claude-skills outdated
  claude-skills validate ./my-skill
  claude-skills mcp list
  claude-skills mcp install repo-monitor
  claude-skills                      # Interactive mode
`);
}
