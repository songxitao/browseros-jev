/**
 * BrowserOS HTTP MCP 客户端模块 (src/mcp-client.mjs)
 * 纯原生 Node 实现，无任何第三方依赖
 */

export class BrowserOsMcpClient {
  constructor(endpoint = 'http://127.0.0.1:9011/mcp') {
    this.endpoint = endpoint;
    this.sessionId = null;
    this.rpcId = 1;
  }

  parseSseResponse(text) {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const d = line.slice(6).trim();
        if (!d) continue;
        try {
          return JSON.parse(d);
        } catch {
          // continue parsing
        }
      }
    }
    return JSON.parse(text);
  }

  async initialize(clientName = 'browseros-jev') {
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: this.rpcId++,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: clientName, version: '1.0.0' }
        }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`MCP initialize failed (${res.status}): ${err}`);
    }

    this.sessionId = res.headers.get('mcp-session-id');
    const text = await res.text();
    return this.parseSseResponse(text);
  }

  async callTool(name, args = {}) {
    if (!this.sessionId) {
      await this.initialize();
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    };
    if (this.sessionId) {
      headers['mcp-session-id'] = this.sessionId;
    }

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: this.rpcId++,
        method: 'tools/call',
        params: {
          name,
          arguments: args
        }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`MCP tools/call [${name}] failed (${res.status}): ${err}`);
    }

    const text = await res.text();
    const data = this.parseSseResponse(text);
    if (data.error) {
      throw new Error(`MCP tools/call [${name}] error: ${JSON.stringify(data.error)}`);
    }
    return data.result;
  }

  async getSnapshot(pageId) {
    const result = await this.callTool('snapshot', { page: Number(pageId) });
    return result?.content?.[0]?.text || '';
  }

  async act(actPayload) {
    return await this.callTool('act', actPayload);
  }

  async listTabs() {
    const result = await this.callTool('tabs', { action: 'list' });
    return result?.content?.[0]?.text || '';
  }
}
