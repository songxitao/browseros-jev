# BrowserOS-Jev ⚡

<p align="center">
  <b>连接 TypeSafe Jev 与 BrowserOS Neo 的轻量级毫秒级动作加速胶水桥</b>
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

## 项目背景与定位

**BrowserOS Neo** 是当前备受关注的 Agent 专属真机浏览器，具备原生登录态持久化、防检测以及内置 HTTP MCP 无障碍树支持。

但在日常驱动浏览器时，如果每个细微的“点击下一步”或“向下滚动两屏”都要调用动辄数百亿参数的大模型（系统二，如 Claude、GPT-4o），单步耗时高达 10 秒以上，既慢又浪费 Token。

**BrowserOS-Jev** 是一个专为解决该痛点打造的轻量胶水工具：将 **TypeSafe Jev**（200ms 快速决策“系统一”模型）无缝接入 **BrowserOS Neo**。让负责宏观规划的大模型把枯燥的高频机械点击委托给 Jev 极速执行，实现整体操作提速 50% 以上，Token 消耗降低 90%。

---

## 核心特性

- ⚡ **毫秒级动作反射**：机械操作（点击、滚动、翻页）决策耗时压缩至 ~200ms，告别漫长等待。
- 🌐 **原生 MCP 直连**：直接通过 BrowserOS Neo 默认开放的 HTTP MCP 端点（`:9011`）进行通信。
- 📦 **零第三方依赖**：纯原生现代 Node.js（v20+ ESM）打造，零 npm 依赖，开箱即用。
- 🛡️ **安全制动门禁**：内置域名隔离限制（`allowedOrigins`）、页面卡死/死锁检测（防死循环）以及敏感操作防护。
- 🔌 **即插即用**：既可作为独立命令行（CLI）执行，也可作为 Skill 直接挂载给 Claude Code、Codex 或 Antigravity 使用。

---

## 快速上手

### 1. 环境准备

- **Node.js** >= 20.0.0
- 正在运行的 **BrowserOS Neo**（默认已开启 MCP 服务：`http://127.0.0.1:9011/mcp`）
- **TypeSafe API Key**

### 2. 配置 API Key

支持通过环境变量或本地配置文件传入（绝不会被提交到 Git）：

```bash
# 方式 A：临时环境变量（推荐）
# Windows PowerShell
$env:TYPESAFE_API_KEY="你的Key"

# Linux / macOS
export TYPESAFE_API_KEY="你的Key"

# 方式 B：家目录固定配置文件 (~/.config/jev-browser-use/credentials.env)
TYPESAFE_API_KEY="你的Key"
```

### 3. 一键运行

```bash
# 格式: node bin/run.mjs --page <标签页ID> --goal "<任务目标描述>"
node bin/run.mjs --page 12 --goal "点击切换到最新标签"
```

常用参数：
- `--page <number>`：BrowserOS 目标标签页 ID（必填）。
- `--goal <string>`：需要在页面上执行的目标（必填）。
- `--maxSteps <number>`：单次委托的最大连续机械步数（默认: `10`）。
- `--maxMs <number>`：总任务超时时间（单位毫秒，默认: `45000`）。
- `--endpoint <url>`：BrowserOS MCP 端点（默认: `http://127.0.0.1:9011/mcp`）。

---

## 本地测试验证

项目自带 100% 离线、无需外网环境的轻量单元测试套件：

```bash
npm test
# 或
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

## 致谢与生态

感谢以下先锋项目为本项目提供的生态基础：

- [BrowserOS Neo](https://browseros.com) — 原生支持 MCP 的真机 Agent 浏览器。
- [TypeSafe AI](https://typesafe.ai) — 提供系统一毫秒级决策模型。
- [wy-coliney/jev-browser-use](https://github.com/wy-coliney/jev-browser-use) — Jev 状态机规范的原型启发。

---

## 开源协议

[MIT License](LICENSE) © 2026 Antigravity & 尖子.
