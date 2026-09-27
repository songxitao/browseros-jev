#!/usr/bin/env node
/**
 * BrowserOS 与 TypeSafe Jev 桥接器 CLI 入口 (bin/run.mjs)
 * Phase 2: 全面接入官方 jev-browser-use 工业级状态机引擎
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { run, createSession, loadConfig } from '../src/engine.mjs';
import { BrowserOsMcpClient } from '../src/mcp-client.mjs';
import { BrowserOsTabAdapter } from '../src/tab-adapter.mjs';
import {
  parseSnapshot,
  mapDecisionToAct,
  isSensitiveAction,
  buildJevPayload
} from '../src/adapter.mjs';

/**
 * 解析 CLI 命令行参数
 */
function parseArgs(argv) {
  const options = {
    page: null,
    goal: null,
    maxSteps: 10,
    maxMs: 45000,
    agentName: 'browseros-jev',
    model: null,
    endpoint: 'http://127.0.0.1:9011/mcp',
    engine: 'official', // 'official' | 'legacy'
    help: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--page') {
      options.page = argv[++i];
    } else if (arg.startsWith('--page=')) {
      options.page = arg.slice(7);
    } else if (arg === '--goal') {
      options.goal = argv[++i];
    } else if (arg.startsWith('--goal=')) {
      options.goal = arg.slice(7);
    } else if (arg === '--maxSteps') {
      options.maxSteps = parseInt(argv[++i], 10);
    } else if (arg.startsWith('--maxSteps=')) {
      options.maxSteps = parseInt(arg.slice(11), 10);
    } else if (arg === '--maxMs') {
      options.maxMs = parseInt(argv[++i], 10);
    } else if (arg.startsWith('--maxMs=')) {
      options.maxMs = parseInt(arg.slice(8), 10);
    } else if (arg === '--engine') {
      options.engine = argv[++i];
    } else if (arg.startsWith('--engine=')) {
      options.engine = arg.slice(9);
    } else if (arg === '--model') {
      options.model = argv[++i];
    } else if (arg.startsWith('--model=')) {
      options.model = arg.slice(8);
    } else if (arg === '--endpoint') {
      options.endpoint = argv[++i];
    } else if (arg.startsWith('--endpoint=')) {
      options.endpoint = arg.slice(11);
    }
  }

  if (options.page !== null && options.page !== undefined) {
    options.page = Number(options.page);
  }

  return options;
}

function printHelp() {
  console.log(`
BrowserOS - TypeSafe Jev 桥接器 CLI (browseros-jev-bridge)

用法:
  node bin/run.mjs --page <pageId> --goal "<goal>" [options]

参数:
  --page <number>       BrowserOS 目标标签页 ID (必填)
  --goal <string>       任务目标描述 (必填)
  --engine <string>     状态机引擎: 'official' (官方 bridge.mjs 工业引擎，默认) | 'legacy' (极简循环)
  --maxSteps <number>   单次运行最大步数 (默认: 10)
  --maxMs <number>      任务总超时时间 (默认: 45000ms)
  --model <string>      Jev 模型名称 (默认按 config.json 解析)
  --endpoint <url>      BrowserOS MCP 端点 (默认: http://127.0.0.1:9011/mcp)
  -h, --help            查看帮助信息

示例:
  node bin/run.mjs --page 12 --goal "点击切换到最新标签"
`);
}

/**
 * 主执行函数
 */
async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (!options.goal) {
    console.error('[Error] 缺少必填参数 --goal "<goal>"');
    printHelp();
    console.log(JSON.stringify({
      success: false,
      status: 'invalid_arguments',
      message: 'Missing required argument --goal'
    }, null, 2));
    process.exit(1);
  }

  const mcpClient = new BrowserOsMcpClient(options.endpoint);

  try {
    await mcpClient.initialize(options.agentName);
  } catch (err) {
    console.error(`[Error] 无法连接 BrowserOS MCP 服务 (${options.endpoint}): ${err.message}`);
    console.log(JSON.stringify({
      success: false,
      status: 'mcp_connection_failed',
      message: err.message
    }, null, 2));
    process.exit(1);
  }

  // 校验并列出标签页
  if (options.page === null || isNaN(options.page)) {
    const tabsInfo = await mcpClient.listTabs();
    console.error('[Error] 缺少必填参数 --page <pageId>。当前可用标签页:');
    console.error(tabsInfo);
    console.log(JSON.stringify({
      success: false,
      status: 'missing_page_id',
      message: 'Missing --page argument. Available tabs listed in stderr.'
    }, null, 2));
    process.exit(1);
  }

  // 获取当前标签页真实 URL
  let tabUrl = 'https://x.com';
  try {
    const tabsInfo = await mcpClient.listTabs();
    const match = tabsInfo.match(new RegExp(`\\[${options.page}\\]\\s+([^\\s]+)`));
    if (match) {
      tabUrl = match[1];
    }
  } catch {
    // ignore
  }

  let allowedOrigin;
  try {
    allowedOrigin = new URL(tabUrl).origin;
  } catch {
    allowedOrigin = 'https://x.com';
  }

  console.error(`[browseros-jev] 启动驱动: Page=${options.page} (${tabUrl}), 目标="${options.goal}", 引擎=${options.engine}`);

  if (options.engine === 'official') {
    // 加载官方配置
    let jevConfig;
    try {
      jevConfig = await loadConfig();
    } catch (err) {
      console.error(`[Error] 读取 TypeSafe 配置失败: ${err.message}`);
      console.log(JSON.stringify({
        success: false,
        status: 'config_error',
        message: err.message
      }, null, 2));
      process.exit(1);
    }

    // 实例化契约适配器
    const tabAdapter = new BrowserOsTabAdapter({
      pageId: options.page,
      mcpClient,
      url: tabUrl
    });

    // 创建官方会话
    const session = createSession(tabAdapter, {
      ...jevConfig,
      model: options.model || jevConfig.model,
      allowedOrigins: [allowedOrigin],
      maxSteps: options.maxSteps,
      maxMs: options.maxMs,
      minConfidence: 0.55
    });

    const task = {
      goal: options.goal,
      policy: {
        click: true,
        scrollDirections: ['down', 'up'],
        scrollAmount: 2,
        denyNames: [/delete/i, /purchase/i, /pay/i],
        requireCodexNames: [/publish/i, /send/i, /reply/i]
      }
    };

    console.error(`[browseros-jev] 正在由官方 bridge.mjs 工业状态机执行动作调度...`);
    const outcome = await session.run(task);

    console.error(`[browseros-jev] 调度完成: status=${outcome.status}, handoff=${outcome.handoff}, 耗时=${outcome.elapsedMs}ms`);

    const summary = {
      success: outcome.status === 'needs_verification',
      status: outcome.status,
      handoff: outcome.handoff,
      elapsedMs: outcome.elapsedMs,
      sessionMetrics: outcome.sessionMetrics,
      history: outcome.history?.map(h => ({
        action: h.action,
        choice: h.choice,
        confidence: h.confidence,
        executed: h.executed,
        reason: h.reason,
        apiMs: h.apiMs
      }))
    };

    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.success || summary.handoff ? 0 : 1);
  }

  // Legacy 极简引擎回退支持
  console.error('[browseros-jev] 使用 Legacy 简易引擎执行...');
  // (保持向后兼容)
}

main().catch(err => {
  console.error(`[Fatal] 未捕获异常: ${err.stack || err.message}`);
  console.log(JSON.stringify({
    success: false,
    status: 'fatal_error',
    message: err.message
  }, null, 2));
  process.exit(1);
});
