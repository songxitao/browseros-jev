/**
 * BrowserOsTabAdapter: 将 BrowserOS Neo 的 MCP 会话包装为官方 jev-browser-use 要求的 Tab 契约接口
 */
export class BrowserOsTabAdapter {
  constructor({ pageId, mcpClient, url = 'https://x.com' }) {
    this.pageId = Number(pageId);
    this.mcpClient = mcpClient;
    this.url = url;
    this.indexToRef = new Map();
    this.refToIndex = new Map();
    this.lastState = '';
  }

  /**
   * 自动从 BrowserOS 获取最新的当前 Tab URL
   */
  async updateUrl() {
    try {
      const tabsInfo = await this.mcpClient.listTabs();
      const match = tabsInfo.match(new RegExp(`\\[${this.pageId}\\]\\s+([^\\s]+)`));
      if (match) {
        this.url = match[1];
      }
    } catch {
      // 保持现有 url
    }
    return this.url;
  }

  /**
   * 产出符合官方 bridge.mjs 规范的无障碍状态树
   * 首行匹配 /^Browser tab:.* URL: "([^"]+)"\./m
   * 后续行匹配 /^(\d+) (text field|text area|combo box|radio button|menu item|[\w]+)(?: \([^)]*\))? (?:Description: )?(.*)$/
   */
  async getAXState(options = {}) {
    const response = await this.mcpClient.callTool('snapshot', { page: this.pageId });
    const rawText = response?.content?.[0]?.text || '';

    this.indexToRef.clear();
    this.refToIndex.clear();

    const lines = rawText.split('\n');
    const items = [];
    // 匹配 BrowserOS 无障碍树行：- <role> "<label>" [ref=eN]
    const elementRegex = /^\s*-\s*([\w\-]+)(?:\s+"([^"]*)")?(?:\s+\[ref=(e\d+)\])?/i;

    for (const line of lines) {
      const match = line.match(elementRegex);
      if (match) {
        const role = match[1];
        const name = match[2] || '';
        const ref = match[3];
        if (ref) {
          items.push({ role, name, ref });
        }
      }
    }

    const header = `Browser tab: ${this.pageId} URL: "${this.url}".`;
    const bodyLines = items.map((item, index) => {
      this.indexToRef.set(index, item.ref);
      this.refToIndex.set(item.ref, index);

      let cleanRole = item.role.toLowerCase().replace(/-/g, '_');
      if (cleanRole === 'radio') cleanRole = 'radio button';
      if (cleanRole === 'menuitem') cleanRole = 'menu item';
      if (cleanRole === 'checkbox') cleanRole = 'checkbox';

      const cleanName = item.name.trim();
      return `${index} ${cleanRole}${cleanName ? ` ${cleanName}` : ''}`;
    });

    this.lastState = [header, ...bodyLines].join('\n');
    return this.lastState;
  }

  /**
   * 将官方数字索引映射为 BrowserOS 的物理 ref 点击
   */
  async click(index) {
    if (!this.indexToRef.has(index)) {
      throw new Error(`Unknown element index: ${index}`);
    }
    const ref = this.indexToRef.get(index);
    return await this.mcpClient.callTool('act', {
      page: this.pageId,
      kind: 'click',
      ref
    });
  }

  /**
   * 映射滚动动作
   */
  async scroll(target, direction = 'down', amount = 1) {
    let ref;
    if (typeof target === 'number' && this.indexToRef.has(target)) {
      ref = this.indexToRef.get(target);
    }
    const args = {
      page: this.pageId,
      kind: 'scroll',
      direction,
      amount
    };
    if (ref) {
      args.ref = ref;
    }
    return await this.mcpClient.callTool('act', args);
  }

  /**
   * 映射键盘按键
   */
  async pressKey(key) {
    return await this.mcpClient.callTool('act', {
      page: this.pageId,
      kind: 'key',
      text: key
    });
  }

  /**
   * 映射页面刷新
   */
  async reload() {
    return await this.mcpClient.callTool('navigate', {
      page: this.pageId,
      url: this.url
    });
  }
}
