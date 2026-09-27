/**
 * BrowserOS 与 TypeSafe Jev 桥接器核心适配器 (src/adapter.mjs)
 */

/**
 * 解析 BrowserOS accessibility snapshot 文本为动作候选与 criteria 映射
 * @param {string} snapshotText
 * @returns {{ candidates: Array<{key: string, ref: string, label: string, role: string}>, criteria: Record<string, string> }}
 */
export function parseSnapshot(snapshotText) {
  if (!snapshotText || typeof snapshotText !== 'string') {
    return {
      candidates: [],
      criteria: {
        done: 'Goal is achieved / task completed',
        blocked: 'Goal cannot be achieved / page is blocked'
      }
    };
  }

  const lines = snapshotText.split(/\r?\n/);
  const candidates = [];
  const lineRegex = /^\s*(?:[-*]\s*)?([a-zA-Z0-9_-]+)(?:\s+["']([^"']*)["'])?.*\[ref=([a-zA-Z0-9_-]+)\]/;

  let index = 0;
  for (const line of lines) {
    const match = line.match(lineRegex);
    if (match) {
      const role = match[1];
      const label = match[2] !== undefined ? match[2] : '';
      const ref = match[3];
      candidates.push({
        key: `a${index}`,
        ref,
        label,
        role
      });
      index++;
    }
  }

  const criteria = {};
  for (const c of candidates) {
    criteria[c.key] = c.label ? `${c.role} "${c.label}"` : `${c.role}`;
  }
  criteria.done = 'Goal is achieved / task completed';
  criteria.blocked = 'Goal cannot be achieved / page is blocked';

  return { candidates, criteria };
}

/**
 * 将 Jev 决策反向映射为 BrowserOS act 负载
 * @param {string} choice 决策键（例如 'a0', 'a1'）
 * @param {Array<{key: string, ref: string, label: string, role: string}>} candidates
 * @param {number|string} pageId 页面 ID
 * @param {string} [agentName='browseros-jev']
 * @returns {{ page: number|string, agentName: string, kind: string, ref: string } | null}
 */
export function mapDecisionToAct(choice, candidates, pageId, agentName = 'browseros-jev') {
  if (!choice || !Array.isArray(candidates)) {
    return null;
  }
  const candidate = candidates.find(c => c.key === choice);
  if (!candidate) {
    return null;
  }
  return {
    page: pageId,
    agentName,
    kind: 'click',
    ref: candidate.ref
  };
}

/**
 * 高危敏感动作制动检测
 * @param {{ label?: string, role?: string, ref?: string } | string} action
 * @returns {boolean}
 */
export function isSensitiveAction(action) {
  if (!action) return false;
  const label = typeof action === 'string' ? action : (action.label || '');
  return /delete|purchase|pay|submit|删除|支付|购买|提交/i.test(label);
}

/**
 * 构建符合 TypeSafe Jev SystemOne 规范的请求体
 * @param {string} goal 目标描述
 * @param {Array<{key: string, ref: string, label: string, role: string}>} candidates 候选动作列表
 * @param {object} [options] 可选配置
 * @returns {object} Jev 请求载荷
 */
export function buildJevPayload(goal, candidates, options = {}) {
  const model = options?.model || 'jev-latest';
  const criteria = {};
  if (Array.isArray(candidates)) {
    for (const c of candidates) {
      criteria[c.key] = c.label ? `${c.role} "${c.label}"` : `${c.role}`;
    }
  }
  criteria.done = 'Goal is achieved / task completed';
  criteria.blocked = 'Goal cannot be achieved / page is blocked';

  return {
    model,
    state: {
      goal,
      ...(options?.state || {})
    },
    questions: {
      next: {
        type: 'choice',
        criteria
      }
    }
  };
}
