import { gatherSystemInfo } from "./systemInfo.js";
import { gatherEnvironmentInfo } from "./envInfo.js";
import {
  createFile,
  readFile,
  updateFile,
  deleteFile,
  listFiles,
 // FileCrudError,
} from "./fileCrud.js";
import {
  toJson,
  formatSystemInfo,
  formatEnvironmentInfo,
  formatOperationResult,
} from "./formatters.js";

const HELP_TEXT = `Thunder System Info & File CRUD Tool

Usage:
  node index.js <command> [options]

Commands:
  info                     Show system and runtime information
  env                      Show selected environment variables
  files create <path>      Create a code file
  files read <path>        Read a code file
  files update <path>      Update a code file
  files delete <path>      Delete a code file
  files list [dir]         List code files in a directory
  help                     Show this help message

Global options:
  --json                   Output raw JSON instead of formatted text

Environment options:
  --keys k1,k2             Comma-separated env var names (default: common set)
  --all                    Include every environment variable

File options:
  --content <text>         File content for create/update
  --file <path>            Read content from another file
  --append                 Append content on update instead of replacing
  --recursive              Recursively list files
  --base <dir>             Restrict file operations to this directory

Examples:
  node index.js info
  node index.js info --json
  node index.js env --keys PATH,HOME,NODE_ENV
  node index.js files create src/example.js --content "console.log('hi');"
  node index.js files read src/example.js
  node index.js files update src/example.js --content "// updated"
  node index.js files list src --recursive
`;

export async function runCli(argv) {
  const args = argv.slice(2);
  const options = parseOptions(args);
  const command = options._[0];
 
  if (!command || command === "help" || options.help) {
    return { stdout: HELP_TEXT, exitCode: 0 };
  }

  try {
    switch (command) {
      case "info":
        return handleInfo(options);
      case "env":
        return handleEnv(options);
      case "files":
        return await handleFiles(options);
      default:
        return {
          stdout: `Unknown command: ${command}\n\n${HELP_TEXT}`,
          exitCode: 1,
        };
    }
  } catch (error) {
    return formatError(error);
  }
}

function handleInfo(options) {
  const data = gatherSystemInfo();
  const stdout = options.json ? toJson(data) : formatSystemInfo(data);
  return { stdout, exitCode: 0 };
}

function handleEnv(options) {
  const data = gatherEnvironmentInfo({
    keys: options.keys,
    all: options.all,
  });
  const stdout = options.json ? toJson(data) : formatEnvironmentInfo(data);
  return { stdout, exitCode: 0 };
}

async function handleFiles(options) {
  const subcommand = options._[1];
  const targetPath = options._[2];

  if (!subcommand) {
    throw new Error("Missing files subcommand. Use create, read, update, delete, or list.");
  }

  const fileOptions = { baseDir: options.base };

  switch (subcommand) {
    case "create": {
      if (!targetPath) {
        throw new Error("Missing file path for create.");
      }
      const content = await resolveContent(options);
      const result = await createFile(targetPath, content, fileOptions);
      return renderResult(result, options);
    }
    case "read": {
      if (!targetPath) {
        throw new Error("Missing file path for read.");
      }
      const result = await readFile(targetPath, fileOptions);
      return renderResult(result, options);
    }
    case "update": {
      if (!targetPath) {
        throw new Error("Missing file path for update.");
      }
      const content = await resolveContent(options);
      const result = await updateFile(targetPath, content, {
        ...fileOptions,
        mode: options.append ? "append" : "replace",
      });
      return renderResult(result, options);
    }
    case "delete": {
      if (!targetPath) {
        throw new Error("Missing file path for delete.");
      }
      const result = await deleteFile(targetPath, fileOptions);
      return renderResult(result, options);
    }
    case "list": {
      const directory = targetPath ?? ".";
      const result = await listFiles(directory, {
        ...fileOptions,
        recursive: options.recursive,
      });
      return renderResult(result, options);
    }
    default:
      throw new Error(`Unknown files subcommand: ${subcommand}`);
  }
}

function renderResult(result, options) {
  const stdout = options.json ? toJson(result) : formatOperationResult(result);
  return { stdout, exitCode: 0 };
}

async function resolveContent(options) {
  if (options.file) {
    const { readFile: readContentFile } = await import("./fileCrud.js");
    const result = await readContentFile(options.file, {
      baseDir: options.base,
    });
    return result.content;
  }

  return options.content ?? "";
}

function parseOptions(args) {
  const options = { _: [] };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg.startsWith("--")) {
      options._.push(arg);
      continue;
    }

    const key = arg.slice(2);

    if (key === "json" || key === "all" || key === "append" || key === "recursive" || key === "help") {
      options[key] = true;
      continue;
    }

    const next = args[index + 1];
    if (next === undefined || next.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return options;
}

function formatError(error) {
  // if (error instanceof FileCrudError) {
  //   return {
  //     stdout: toJson({
  //       error: error.message,
  //       code: error.code,
  //       details: error.details,
  //     }),
  //     exitCode: 1,
  //   };
  // }

  return {
    stdout: toJson({
      error: error.message ?? "Unknown error",
    }),
    exitCode: 1,
  };
}
