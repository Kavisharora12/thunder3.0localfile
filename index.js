#!/usr/bin/env node
import express from "express";
import { runCli } from "./src/cli.js";
import { readFile } from "./src/fileCrud.js";

const app = express();
app.use(express.json());

/* ---------------- HOME ROUTE ---------------- */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "🚀 Thunder server is running"
  });
});

/* ---------------- FILE READ API ---------------- */
app.post("/api/files/read", async (req, res) => {
  try {
    const { path } = req.body;

    if (!path) {
      return res.status(400).json({
        success: false,
        error: "Path is required"
      });
    }

    const result = await readFile(path);

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* ---------------- START SERVER ---------------- */
const PORT = 3000;

function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

/* ---------------- CLI + SERVER MODE ---------------- */
const isServerMode = process.argv.includes("--server");

if (isServerMode) {
  startServer();
} else {
  const result = await runCli(process.argv);

  console.log(result.stdout);

  if (result.exitCode !== 0) {
    process.exitCode = result.exitCode;
  }
}