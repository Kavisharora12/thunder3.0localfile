import os from "node:os";

/**
 * Safely read a value; returns fallback when value is null, undefined, or empty.
 */
function safe(value, fallback = "N/A") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return value;
}

/**
 * Collect operating system, runtime, and host details.
 */
export function gatherSystemInfo() {
  const cpus = os.cpus();
  const primaryCpu = cpus[0] ?? null;

  return {
    collectedAt: new Date().toISOString(),
    operatingSystem: {
      platform: safe(os.platform()),
      type: safe(os.type()),
      release: safe(os.release()),
      version: safe(os.version?.() ?? null),
      arch: safe(os.arch()),
      endianness: safe(os.endianness?.() ?? null),
    },
    host: {
      hostname: safe(os.hostname()),
      uptimeSeconds: safe(os.uptime(), 0),
      homeDirectory: safe(os.homedir()),
      tempDirectory: safe(os.tmpdir()),
    },
    runtime: {
      nodeVersion: safe(process.version),
      pid: safe(process.pid, 0),
      cwd: safe(process.cwd()),
      execPath: safe(process.execPath),
    },
    hardware: {
      cpuModel: safe(primaryCpu?.model),
      cpuCores: cpus.length || 0,
      totalMemoryBytes: safe(os.totalmem(), 0),
      freeMemoryBytes: safe(os.freemem(), 0),
      loadAverage: os.loadavg?.() ?? [],
    },
    network: {
      interfaces: summarizeNetworkInterfaces(os.networkInterfaces()),
    },
  };
}

function summarizeNetworkInterfaces(interfaces) {
  if (!interfaces || typeof interfaces !== "object") {
    return {};
  }

  const summary = {};

  for (const [name, entries] of Object.entries(interfaces)) {
    if (!Array.isArray(entries)) {
      continue;
    }

    summary[name] = entries.map((entry) => ({
      address: safe(entry.address),
      family: safe(entry.family),
      internal: entry.internal ?? false,
      mac: safe(entry.mac),
    }));
  }

  return summary;
}
