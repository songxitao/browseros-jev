---
name: browseros-jev
description: >
  High-speed System-One browser action acceleration with TypeSafe Jev and BrowserOS Neo.
  Achieves 10x-50x speedups, sub-second mechanical actions, and 90%+ LLM token savings
  while maintaining strict safety policies and Codex supervisory verification.
---

# BrowserOS-Jev: System-One Browser Action Accelerator

## Overview

`browseros-jev` bridges **BrowserOS Neo** (via its HTTP MCP server) with **TypeSafe Jev** (fast System-One decision models). It allows high-level reasoning agents (Claude, Codex, Antigravity) to delegate high-frequency mechanical browser interactions (clicking, scrolling, navigating) to a specialized 200ms reflex loop.

## Prerequisites

1. **BrowserOS Neo**: Running with HTTP MCP enabled (default `http://127.0.0.1:9011/mcp`).
2. **Node.js**: v20.0.0 or higher (Zero third-party npm dependencies).
3. **API Key**: TypeSafe API Key configured via:
   - Environment variable: `export TYPESAFE_API_KEY="your-api-key"`
   - Or file: `~/.config/jev-browser-use/credentials.env` containing `TYPESAFE_API_KEY=...`

## CLI Usage

Run tasks directly through the command-line interface:

```bash
# Basic execution on a specific tab
node bin/run.mjs --page <pageId> --goal "<task_goal>"

# Example: Switch to the Latest tab on Twitter / X
node bin/run.mjs --page 12 --goal "Click the 'Latest' tab"

# Options:
#   --page <number>     BrowserOS tab ID (required)
#   --goal <string>     Task goal description (required)
#   --maxSteps <num>    Maximum mechanical steps allowed (default: 10)
#   --maxMs <num>       Maximum task execution time in ms (default: 45000)
#   --endpoint <url>    BrowserOS MCP endpoint (default: http://127.0.0.1:9011/mcp)
```

## Security & Supervisory Safety Contract

1. **Origin Jailing**: The bridge enforces domain isolation (`allowedOrigins`), strictly preventing the browser from navigating outside the target domain.
2. **Anti-Deadlock Brake**: Detects consecutive identical actions with zero DOM changes and immediately triggers `no_progress` handoff back to the reasoning model.
3. **Safety Gate**: Denies dangerous actions (e.g. Delete, Purchase, Submit, Pay) and surrenders control to Codex for independent confirmation.
4. **Credential Isolation**: Zero plaintext keys in code or git history; keys are isolated in user-level configuration files outside the repository.
