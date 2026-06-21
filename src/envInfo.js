const DEFAULT_ENV_KEYS = [
  "PATH",
  "HOME",
  "USER",
  "USERNAME",
  "USERPROFILE",
  "TEMP",
  "TMP",
  "SHELL",
  "COMSPEC",
  "LANG",
  "LC_ALL",
  "NODE_ENV",
  "npm_config_prefix",
  "APPDATA",
  "LOCALAPPDATA",
  "PROGRAMFILES",
  "SYSTEMROOT",
];

/**
 * Collect selected environment variables with graceful handling for missing keys.
 */
export function gatherEnvironmentInfo(options = {}) {
  const keys = normalizeKeys(options.keys);
  const includeAll = options.all === true;

  const selectedKeys = includeAll
    ? Object.keys(process.env).sort((a, b) => a.localeCompare(b))
    : keys;

  const variables = {};
  const missing = [];

  for (const key of selectedKeys) {
    const value = process.env[key];

    if (value === undefined) {
      missing.push(key);
      variables[key] = null;
    } else {
      variables[key] = value;
    }
  }

  return {
    collectedAt: new Date().toISOString(),
    source: includeAll ? "all" : "selected",
    requestedKeys: selectedKeys,
    missingKeys: missing,
    count: Object.keys(variables).length,
    variables,
  };
}

function normalizeKeys(keys) {
  if (!keys) {
    return [...DEFAULT_ENV_KEYS];
  }

  if (Array.isArray(keys)) {
    return keys.map((key) => String(key).trim()).filter(Boolean);
  }

  return String(keys)
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

export { DEFAULT_ENV_KEYS };
