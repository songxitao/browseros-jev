# BrowserOS-Jev ⚡

<p align="center">
  <b>A lightweight, reflex-speed bridge connecting TypeSafe Jev with BrowserOS Neo.</b>
</p>

<p align="center">
  <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.md">English</a>
</p>

<p align="center">
  <a href="https://github.com/nodejs/node"><img src="https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?style=flat-square&logo=node.js" alt="Node.js"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License: MIT"></a>
  <a href="#"><img src="https://img.shields.io/badge/Dependencies-Zero%20NPM-brightgreen?style=flat-square" alt="Zero NPM Dependencies"></a>
  <a href="https://browseros.com"><img src="https://img.shields.io/badge/Browser-BrowserOS%20Neo-orange?style=flat-square" alt="BrowserOS Neo"></a>
  <a href="https://typesafe.ai"><img src="https://img.shields.io/badge/Reflex-TypeSafe%20Jev-6366f1?style=flat-square" alt="TypeSafe Jev"></a>
</p>

---

## What is this?

**BrowserOS Neo** is a powerful AI-ready browser featuring persistent logins, anti-detect capabilities, and native MCP accessibility support.

However, driving a browser entirely with heavy reasoning LLMs (System 2, like Claude or GPT-4o) for every mechanical click or scroll is slow (10s+ per action) and burns excessive tokens.

**BrowserOS-Jev** is a clean, minimal glue bridge that integrates **TypeSafe Jev** (sub-200ms System-One decision models) into **BrowserOS Neo**. It allows autonomous agents to delegate mechanical browsing steps to Jev's fast reflex loop while retaining supervisory control.

---

## Key Features

- ⚡ **Sub-Second Reflex**: ~200ms mechanical decisions (click, scroll, key press) instead of waiting for heavy LLMs.
- 🌐 **Native MCP Integration**: Communicates directly with BrowserOS Neo over its standard HTTP MCP interface (`:9011`).
- 📦 **Zero NPM Dependencies**: 100% pure modern Node.js (v20+ ESM) with built-in modules (`node:fs`, `node:util`, `node:path`, `fetch`).
- 🛡️ **Built-in Guardrails**: Domain jailing (`allowedOrigins`), anti-deadlock state detection, and sensitive action gating.
- 🔌 **Agent & CLI Ready**: Usable as a standalone CLI or directly callable as a Skill from Claude Code, Codex, or Antigravity.

---

## Quickstart

### 1. Requirements

- **Node.js** >= 20.0.0
- **BrowserOS Neo** running with MCP enabled (default endpoint: `http://127.0.0.1:9011/mcp`)
- **TypeSafe API Key**

### 2. Configure API Key

Set the key in your environment or keep it in the user config file (neither will be committed to git):

```bash
# Option A: Environment variable
export TYPESAFE_API_KEY="your-typesafe-api-key"

# Option B: Config file in home directory (~/.config/jev-browser-use/credentials.env)
TYPESAFE_API_KEY="your-typesafe-api-key"
```

### 3. Run a Task

```bash
# Syntax: node bin/run.mjs --page <tabId> --goal "<task description>"
node bin/run.mjs --page 12 --goal "Click the 'Latest' tab"
```

Common options:
- `--page <number>`: Target BrowserOS tab ID (required).
- `--goal <string>`: What you want Jev to do on the page (required).
- `--maxSteps <number>`: Maximum mechanical actions before returning (default: `10`).
- `--maxMs <number>`: Overall task timeout in milliseconds (default: `45000`).
- `--endpoint <url>`: BrowserOS MCP server URL (default: `http://127.0.0.1:9011/mcp`).

---

## Verification & Tests

The repository includes a 100% offline, zero-network test suite:

```bash
npm test
# or
node --test test/*.test.mjs
```

```text
TAP version 13
# tests 14
# suites 5
# pass 14
# fail 0
# duration_ms ~75ms
```

---

## Acknowledgments

- [BrowserOS Neo](https://browseros.com) — The modern agent browser with native MCP support.
- [TypeSafe AI](https://typesafe.ai) — Ultra-fast System-One decision models.
- [wy-coliney/jev-browser-use](https://github.com/wy-coliney/jev-browser-use) — Original Jev state-machine specification.

---

## License

[MIT License](LICENSE) © 2026 Antigravity & 尖子.
