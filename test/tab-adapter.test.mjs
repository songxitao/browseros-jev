import test from 'node:test';
import assert from 'node:assert/strict';
import { BrowserOsTabAdapter } from '../src/tab-adapter.mjs';

class MockMcpClient {
  constructor() {
    this.calls = [];
    this.snapshotResponse = `- document "测试页面"
  - button "确定" [ref=e12]
  - link "首页" [ref=e15]
  - searchbox "搜索推文" [ref=e20]`;
  }

  async callTool(name, args) {
    this.calls.push({ name, args });
    if (name === 'snapshot') {
      return { content: [{ type: 'text', text: this.snapshotResponse }] };
    }
    if (name === 'act') {
      return { content: [{ type: 'text', text: 'Action executed' }] };
    }
    return { content: [] };
  }
}

test('BrowserOsTabAdapter 契约测试套件', async (t) => {
  await t.test('1. getAXState 生成符合官方正则要求的首行 URL 和交互元素清单', async () => {
    const mockMcp = new MockMcpClient();
    const adapter = new BrowserOsTabAdapter({
      pageId: 10,
      mcpClient: mockMcp,
      url: 'https://x.com/search?q=gemini4'
    });

    const axState = await adapter.getAXState({ emit: false, disableDiffing: true });

    // 校验首行 URL 是否符合官方 checkState 规则 (/^Browser tab:.* URL: "([^"]+)"\./m)
    const urlMatch = axState.match(/^Browser tab:.* URL: "([^"]+)"\./m);
    assert.ok(urlMatch, '首行必须匹配官方 checkState 正则，且以英文句号结尾');
    assert.equal(urlMatch[1], 'https://x.com/search?q=gemini4');

    // 校验每一行交互元素是否符合官方 parseState 正则
    // /^(\d+) (text field|text area|combo box|radio button|menu item|[\w]+)(?: \([^)]*\))? (?:Description: )?(.*)$/
    const lines = axState.split('\n').slice(1).filter(Boolean);
    assert.equal(lines.length, 3, '应提取到 3 个交互元素');

    assert.equal(lines[0], '0 button 确定');
    assert.equal(lines[1], '1 link 首页');
    assert.equal(lines[2], '2 searchbox 搜索推文');
  });

  await t.test('2. click(index) 精确反查 ref 并调用 MCP act', async () => {
    const mockMcp = new MockMcpClient();
    const adapter = new BrowserOsTabAdapter({
      pageId: 10,
      mcpClient: mockMcp,
      url: 'https://x.com/search?q=gemini4'
    });

    await adapter.getAXState({});
    mockMcp.calls = []; // 重置调用记录

    await adapter.click(0);
    assert.equal(mockMcp.calls.length, 1);
    assert.deepEqual(mockMcp.calls[0], {
      name: 'act',
      args: { page: 10, kind: 'click', ref: 'e12' }
    });

    await adapter.click(1);
    assert.equal(mockMcp.calls.length, 2);
    assert.deepEqual(mockMcp.calls[1], {
      name: 'act',
      args: { page: 10, kind: 'click', ref: 'e15' }
    });

    // 非法索引应主动报错
    await assert.rejects(async () => {
      await adapter.click(999);
    }, /Unknown element index: 999/);
  });

  await t.test('3. scroll 与 pressKey 参数正确透传给 MCP act', async () => {
    const mockMcp = new MockMcpClient();
    const adapter = new BrowserOsTabAdapter({
      pageId: 10,
      mcpClient: mockMcp,
      url: 'https://x.com'
    });

    await adapter.getAXState({});
    mockMcp.calls = [];

    // 滚动测试
    await adapter.scroll(0, 'down', 2);
    assert.equal(mockMcp.calls.length, 1);
    assert.equal(mockMcp.calls[0].name, 'act');
    assert.equal(mockMcp.calls[0].args.kind, 'scroll');
    assert.equal(mockMcp.calls[0].args.ref, 'e12');

    // 全局页面按键测试
    await adapter.pressKey('PageDown');
    assert.equal(mockMcp.calls.length, 2);
    assert.deepEqual(mockMcp.calls[1], {
      name: 'act',
      args: { page: 10, kind: 'key', text: 'PageDown' }
    });
  });

  await t.test('4. 连续多轮快照刷新时索引正确重置且隔离陈旧映射', async () => {
    const mockMcp = new MockMcpClient();
    const adapter = new BrowserOsTabAdapter({
      pageId: 10,
      mcpClient: mockMcp,
      url: 'https://x.com'
    });

    await adapter.getAXState({});
    assert.equal(adapter.indexToRef.get(0), 'e12');

    // 模拟页面变动，新快照节点不同
    mockMcp.snapshotResponse = `- document "新页面"
  - tab "最新" [ref=e88]`;

    const freshState = await adapter.getAXState({});
    assert.equal(adapter.indexToRef.get(0), 'e88');
    assert.equal(adapter.indexToRef.has(1), false, '旧的索引 1 应已被清除');
    assert.ok(freshState.includes('0 tab 最新'));
  });
});
