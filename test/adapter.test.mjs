import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSnapshot,
  mapDecisionToAct,
  isSensitiveAction,
  buildJevPayload
} from '../src/adapter.mjs';

describe('BrowserOS-Jev 桥接器契约与缝隙测试 (Seams Test Suite)', () => {
  describe('Case 1: 解析 BrowserOS AX 快照为 Jev 动作候选 (parseSnapshot)', () => {
    test('正确解析 AX 快照中的 ref、label、role 并生成 Jev criteria 键值及 DONE/BLOCKED', () => {
      // 模拟真实 BrowserOS accessibility snapshot 文本片段
      const sampleSnapshot = `
- link "热门" [ref=e27]
- link "最新" [ref=e28]
- button "用户" [ref=e29]
      `.trim();

      const result = parseSnapshot(sampleSnapshot);

      // 断言返回结果存在
      assert.ok(result, 'parseSnapshot 应返回有效的解析结果对象');

      // 断言 candidates 列表解析正确
      assert.ok(Array.isArray(result.candidates), 'result.candidates 应为数组');
      assert.equal(result.candidates.length, 3, '应解析出 3 个动作候选');

      // 验证第 0 项候选
      assert.equal(result.candidates[0].key, 'a0');
      assert.equal(result.candidates[0].ref, 'e27');
      assert.equal(result.candidates[0].label, '热门');
      assert.equal(result.candidates[0].role, 'link');

      // 验证第 1 项候选
      assert.equal(result.candidates[1].key, 'a1');
      assert.equal(result.candidates[1].ref, 'e28');
      assert.equal(result.candidates[1].label, '最新');
      assert.equal(result.candidates[1].role, 'link');

      // 验证第 2 项候选
      assert.equal(result.candidates[2].key, 'a2');
      assert.equal(result.candidates[2].ref, 'e29');
      assert.equal(result.candidates[2].label, '用户');
      assert.equal(result.candidates[2].role, 'button');

      // 验证 criteria 键值映射
      assert.ok(result.criteria, 'result.criteria 应存在');
      assert.ok(result.criteria.a0, 'criteria 应包含 a0');
      assert.ok(result.criteria.a1, 'criteria 应包含 a1');
      assert.ok(result.criteria.a2, 'criteria 应包含 a2');
      assert.ok(result.criteria.done, 'criteria 应包含 DONE 选项');
      assert.ok(result.criteria.blocked, 'criteria 应包含 BLOCKED 选项');
    });
  });

  describe('Case 2: Jev 决策反向映射为 BrowserOS act 负载 (mapDecisionToAct)', () => {
    test('将选择 a1 对应 e28 映射为严格对齐的 BrowserOS act 负载', () => {
      const candidates = [
        { key: 'a0', ref: 'e27', label: '热门', role: 'link' },
        { key: 'a1', ref: 'e28', label: '最新', role: 'link' },
        { key: 'a2', ref: 'e29', label: '用户', role: 'button' }
      ];

      const actPayload = mapDecisionToAct('a1', candidates, 10, 'browseros-jev');

      assert.deepEqual(actPayload, {
        page: 10,
        agentName: 'browseros-jev',
        kind: 'click',
        ref: 'e28'
      }, '应该输出符合 BrowserOS act 参数要求的对象');
    });
  });

  describe('Case 3: 高危敏感动作制动检测 (isSensitiveAction)', () => {
    test('识别高危操作并返回 true，正常操作返回 false', () => {
      const sensitiveAction1 = { label: 'Delete Account', role: 'button', ref: 'e99' };
      const sensitiveAction2 = { label: 'Submit Payment', role: 'button', ref: 'e100' };
      const normalAction1 = { label: '最新', role: 'link', ref: 'e28' };
      const normalAction2 = { label: '查看详情', role: 'button', ref: 'e30' };

      assert.equal(isSensitiveAction(sensitiveAction1), true, '包含 Delete Account 应被判定为高危');
      assert.equal(isSensitiveAction(sensitiveAction2), true, '包含 Submit Payment 应被判定为高危');
      assert.equal(isSensitiveAction(normalAction1), false, '普通导航最新不应被判定为高危');
      assert.equal(isSensitiveAction(normalAction2), false, '普通查看详情不应被判定为高危');
    });
  });

  describe('Case 4: TypeSafe Jev 请求体构建 (buildJevPayload)', () => {
    test('生成符合 System One 规范的请求体', () => {
      const goal = '点击进入最新主题列表';
      const candidates = [
        { key: 'a0', ref: 'e27', label: '热门', role: 'link' },
        { key: 'a1', ref: 'e28', label: '最新', role: 'link' }
      ];
      const options = { model: 'jev-latest' };

      const payload = buildJevPayload(goal, candidates, options);

      assert.ok(payload, 'payload 应该存在');
      assert.equal(payload.model, 'jev-latest', 'model 应为 jev-latest');
      assert.ok(payload.state, 'payload 应包含 state 状态对象');
      assert.equal(payload.state.goal, goal, 'state 中应包含传入的 goal');
      assert.ok(payload.questions, 'payload 应包含 questions 对象');
      assert.ok(payload.questions.next, 'questions 中应包含 next 问题');
      assert.equal(payload.questions.next.type, 'choice', 'next 问题类型必须为 choice');
      assert.ok(payload.questions.next.criteria, 'next 问题必须包含 criteria');
      assert.ok(payload.questions.next.criteria.a0, 'criteria 必须映射 a0 动作');
      assert.ok(payload.questions.next.criteria.a1, 'criteria 必须映射 a1 动作');
      assert.ok(payload.questions.next.criteria.done, 'criteria 必须包含 done 选项');
      assert.ok(payload.questions.next.criteria.blocked, 'criteria 必须包含 blocked 选项');
    });
  });
});
