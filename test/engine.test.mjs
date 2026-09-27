import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig, availableActions, discoverActions, createSession } from '../src/engine.mjs';
import { BrowserOsMcpClient } from '../src/mcp-client.mjs';

test('Jev 引擎内核与 MCP 客户端测试套件', async (t) => {
  await t.test('1. loadConfig 具备开箱即用的默认容错回退机制', async () => {
    const config = await loadConfig();
    assert.ok(config, '配置对象不应为空');
    assert.equal(config.provider, 'typesafe');
    assert.equal(config.model, 'jev-latest');
    assert.ok(config.envFile.includes('credentials.env'), '应指向标准的 credentials.env 路径');
  });

  await t.test('2. discoverActions 能从无障碍状态文本中正确提取可点击动作', () => {
    const sampleState = `Browser tab: 1 URL: "https://example.com".
0 button 确定
1 link 了解更多
2 text field 搜索`;

    const actions = discoverActions(sampleState, {
      click: true,
      denyNames: [/搜索/]
    });

    assert.equal(actions.length, 2, '应匹配 2 个点击动作（过滤了拒绝名单）');
    assert.equal(actions[0].name, '确定');
    assert.equal(actions[0].index, 0);
    assert.equal(actions[1].name, '了解更多');
    assert.equal(actions[1].index, 1);
  });

  await t.test('3. createSession 会话管理与指标聚合', async () => {
    const mockTab = {
      getAXState: async () => 'Browser tab: 1 URL: "https://example.com".\n0 button 确定',
      click: async () => {}
    };

    const session = createSession(mockTab);
    const initialMetrics = session.metrics();
    assert.equal(initialMetrics.runs, 0);
    assert.equal(initialMetrics.decisions, 0);
    assert.deepEqual(session.history(), []);

    session.reset();
    assert.equal(session.metrics().runs, 0);
  });

  await t.test('4. BrowserOsMcpClient SSE 响应体解析', () => {
    const client = new BrowserOsMcpClient();
    const rawSse = `event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{"status":"ok"}}\n\n`;
    const parsed = client.parseSseResponse(rawSse);
    assert.deepEqual(parsed, {
      jsonrpc: '2.0',
      id: 1,
      result: { status: 'ok' }
    });
  });
});
