# BrowserOS-Jev ⚡

<p align="center">
  <b>Reflex-speed browser action bridge connecting TypeSafe Jev with BrowserOS Neo.</b>
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

## Purpose

**BrowserOS Neo** is the dedicated browser for autonomous agents, featuring persistent logins and native MCP accessibility support.

**BrowserOS-Jev** is a zero-dependency glue bridge that integrates **TypeSafe Jev** (sub-200ms System-One decision model) into BrowserOS Neo. Instead of firing heavy reasoning models (Claude, GPT-4o) on every mechanical click and scroll, the supervising agent delegates routine page interactions to Jev's fast reflex loop, cutting cycle time by 50%+ and token consumption by 90%+.

---

## Core Capabilities

- ⚡ **200ms Reflex Loop**: Executes mechanical page interactions (clicks, scrolling, keystrokes) at reflex speed.
- 🌐 **Native MCP Bridge**: Connects directly to BrowserOS Neo via its default HTTP MCP endpoint (`:9011`).
- 📦 **Zero Dependencies**: Pure modern Node.js (v20+ ESM) using built-in modules (`node:fs`, `node:util`, `node:path`, `fetch`).
- 🛡️ **Supervisory Guardrails**: Enforces origin jailing (`allowedOrigins`), anti-deadlock loop detection, and sensitive action gating.
- 🔌 **Dual Interface**: Runs as a standalone CLI or directly loads as an Agent Skill for Claude Code, Codex, and Antigravity.

---

## Quickstart

### 1. Requirements

- **Node.js** >= 20.0.0
- **BrowserOS Neo** running with MCP enabled (default: `http://127.0.0.1:9011/mcp`)
- **TypeSafe API Key**

### 2. Configure Key

Supply your key through the environment or local credentials file (both are git-ignored):

```bash
# Environment variable
export TYPESAFE_API_KEY="your-typesafe-api-key"

# Or in ~/.config/jev-browser-use/credentials.env
TYPESAFE_API_KEY="your-typesafe-api-key"
```

### 3. Run

```bash
# Basic invocation
node bin/run.mjs --page <tabId> --goal "<task description>"

# Example: Switch to the Latest tab on Twitter / X
node bin/run.mjs --page 12 --goal "Click the 'Latest' tab"
```

**Options**:
- `--page <number>`: Target BrowserOS tab ID (**required**).
- `--goal <string>`: Task goal for Jev to execute (**required**).
- `--maxSteps <number>`: Maximum reflex actions before returning control (default: `10`).
- `--maxMs <number>`: Overall timeout in milliseconds (default: `45000`).
- `--endpoint <url>`: BrowserOS MCP URL (default: `http://127.0.0.1:9011/mcp`).

---

## Test & Verification

Run the self-contained, offline unit test suite:

```bash
npm test
# or: node --test test/*.test.mjs
```

**Pass Criterion**: 14 tests across 5 suites pass with 0 failures (~75ms).

---

## Ecosystem

- [BrowserOS Neo](https://browseros.com) — Agent-native browser runtime.
- [TypeSafe AI](https://typesafe.ai) — System-One reflex decision engine.
- [wy-coliney/jev-browser-use](https://github.com/wy-coliney/jev-browser-use) — Foundational Jev state-machine specification.

---

## License

[MIT License](LICENSE) © 2026 Antigravity & songxitao.
