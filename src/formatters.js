/**
 * Format byte counts for human-readable console output.
 */
function formatBytes(bytes) {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) {
    return "N/A";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

/**
 * Render data as indented JSON.
 */
export function toJson(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Render system info for terminal display.
 */
export function formatSystemInfo(data) {
  const lines = [
    "=== System Information ===",
    "",
    "Operating System",
    `  Platform .............. ${data.operatingSystem.platform}`,
    `  Type .................. ${data.operatingSystem.type}`,
    `  Release ............... ${data.operatingSystem.release}`,
    `  Version ............... ${data.operatingSystem.version}`,
    `  Architecture .......... ${data.operatingSystem.arch}`,
    "",
    "Host",
    `  Hostname .............. ${data.host.hostname}`,
    `  Home Directory ........ ${data.host.homeDirectory}`,
    `  Temp Directory ........ ${data.host.tempDirectory}`,
    `  Uptime (seconds) ...... ${data.host.uptimeSeconds}`,
    "",
    "Runtime",
    `  Node.js Version ....... ${data.runtime.nodeVersion}`,
    `  Process ID ............ ${data.runtime.pid}`,
    `  Current Directory ..... ${data.runtime.cwd}`,
    "",
    "Hardware",
    `  CPU Model ............. ${data.hardware.cpuModel}`,
    `  CPU Cores ............. ${data.hardware.cpuCores}`,
    `  Total Memory .......... ${formatBytes(data.hardware.totalMemoryBytes)}`,
    `  Free Memory ........... ${formatBytes(data.hardware.freeMemoryBytes)}`,
    `  Load Average .......... ${data.hardware.loadAverage.join(", ") || "N/A"}`,
    "",
    `Collected at: ${data.collectedAt}`,
  ];

  return lines.join("\n");
}

/**
 * Render environment variable report for terminal display.
 */
export function formatEnvironmentInfo(data) {
  const lines = [
    "=== Environment Variables ===",
    "",
    `Source: ${data.source}`,
    `Requested keys: ${data.requestedKeys.length}`,
    `Missing keys: ${data.missingKeys.length ? data.missingKeys.join(", ") : "none"}`,
    "",
  ];

  for (const key of data.requestedKeys) {
    const value = data.variables[key];
    const display =
      value === null || value === undefined
        ? "(not set)"
        : truncate(value, 120);
    lines.push(`${key}: ${display}`);
  }

  lines.push("", `Collected at: ${data.collectedAt}`);

  return lines.join("\n");
}

/**
 * Render generic operation results for terminal display.
 */
export function formatOperationResult(data) {
  if (data.operation === "read") {
    return [
      "=== File Read ===",
      `Path: ${data.path}`,
      `Size: ${formatBytes(data.sizeBytes)}`,
      `Modified: ${data.modifiedAt}`,
      "",
      data.content,
    ].join("\n");
  }

  if (data.operation === "list") {
    const lines = [
      "=== File List ===",
      `Directory: ${data.directory}`,
      `Recursive: ${data.recursive}`,
      `Count: ${data.count}`,
      "",
    ];

    for (const file of data.files) {
      lines.push(
        `- ${file.path} (${formatBytes(file.sizeBytes)}, modified ${file.modifiedAt})`
      );
    }

    return lines.join("\n");
  }

  return toJson(data);
}

function truncate(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
}
