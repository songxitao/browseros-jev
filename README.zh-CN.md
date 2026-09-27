# BrowserOS-Jev ⚡

<p align="center">
  <b>连接 TypeSafe Jev 与 BrowserOS Neo 的毫秒级动作反射加速桥</b>
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

## 项目定位

**BrowserOS Neo** 是当前主流的 Agent 专属真机浏览器，具备原生登录态持久化、防检测与内置 HTTP MCP 无障碍树支持。

**BrowserOS-Jev** 是一个零依赖的胶水适配器，旨在将 **TypeSafe Jev**（200ms 快速决策的“系统一”模型）接入 BrowserOS Neo。无需为常规的点击或翻页调用高耗时的大语言模型（系统二，如 Claude、GPT-4o），上层规划 Agent 可将高频机械动作委托给 Jev 极速执行，任务耗时缩短 50% 以上，Token 消耗降低 90%。

---

## 核心特性

- ⚡ **200ms 反射回路**：以亚秒级决策执行点击、滚动与键盘按键等机械动作。
- 🌐 **原生 MCP 直连**：直接通过 BrowserOS Neo 默认开放的 HTTP MCP 端点（`:9011`）交互。
- 📦 **零第三方依赖**：纯原生现代 Node.js（v20+ ESM）打造，开箱即用。
- 🛡️ **安全监管门禁**：内置域名隔离（`allowedOrigins`）、页面死锁检测（防死循环）以及敏感高危操作制动。
- 🔌 **双模态交付**：既可作为独立命令行（CLI）执行，也可作为 Skill 直接挂载给 Claude Code、Codex 或 Antigravity。

---

## 快速上手

### 1. 环境准备

- **Node.js** >= 20.0.0
- 正在运行的 **BrowserOS Neo**（默认已开启 MCP 服务：`http://127.0.0.1:9011/mcp`）
- **TypeSafe API Key**

### 2. 配置 API Key

支持通过环境变量或用户目录配置文件传入（均已被 `.gitignore` 严密忽略）：

```bash
# 环境变量（推荐）
# Windows PowerShell
$env:TYPESAFE_API_KEY="你的Key"

# Linux / macOS
export TYPESAFE_API_KEY="你的Key"

# 或放置在 ~/.config/jev-browser-use/credentials.env
TYPESAFE_API_KEY="你的Key"
```

### 3. 一键运行

```bash
# 基本用法
node bin/run.mjs --page <标签页ID> --goal "<任务目标描述>"

# 示例：点击 Twitter / X 的最新标签
node bin/run.mjs --page 12 --goal "点击切换到最新标签"
```

**参数说明**：
- `--page <number>`：BrowserOS 目标标签页 ID（**必填**）。
- `--goal <string>`：页面执行目标（**必填**）。
- `--maxSteps <number>`：单次委托的最大连续机械步数（默认: `10`）。
- `--maxMs <number>`：总任务超时时间（单位毫秒，默认: `45000`）。
- `--endpoint <url>`：BrowserOS MCP 端点（默认: `http://127.0.0.1:9011/mcp`）。

---

## 测试验证

运行项目自包含的 100% 离线单元测试：

```bash
npm test
# 或: node --test test/*.test.mjs
```

**通过标准**：5 个套件、14 项单测全部通过且 0 失败（约 75ms）。

---

## 生态致谢

- [BrowserOS Neo](https://browseros.com) — 原生支持 MCP 的真机 Agent 浏览器。
- [TypeSafe AI](https://typesafe.ai) — 毫秒级决策反射模型。
- [wy-coliney/jev-browser-use](https://github.com/wy-coliney/jev-browser-use) — Jev 状态机规范的原型启发。

---

## 开源协议

[MIT License](LICENSE) © 2026 Antigravity & songxitao.
