const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { evaluateRanking, moveRanking, toggleSelection } = require("../ranking-game-core.js");

const fixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/demo-fixtures.json"), "utf8"),
);

test("每轮教学模拟都有唯一的六个候选与三个参考答案", () => {
  assert.equal(fixture.rankingGame.origin, "synthetic");
  assert.equal(fixture.rankingGame.rounds.length, 3);
  fixture.rankingGame.rounds.forEach((round) => {
    const candidateIds = round.candidates.map((candidate) => candidate.id);
    assert.equal(candidateIds.length, 6);
    assert.equal(new Set(candidateIds).size, 6);
    assert.equal(round.idealOrder.length, 3);
    assert.equal(new Set(round.idealOrder).size, 3);
    round.idealOrder.forEach((id) => assert.ok(candidateIds.includes(id)));
  });
});

test("排名命中与顺序命中分开计算", () => {
  const ideal = ["a", "b", "c"];
  assert.deepEqual(evaluateRanking(["a", "b", "c"], ideal), { hits: 3, exact: 3 });
  assert.deepEqual(evaluateRanking(["c", "a", "b"], ideal), { hits: 3, exact: 0 });
  assert.deepEqual(evaluateRanking(["a", "x", "c"], ideal), { hits: 2, exact: 2 });
});

test("上移与下移不越过排名边界", () => {
  assert.deepEqual(moveRanking(["a", "b", "c"], "b", -1), ["b", "a", "c"]);
  assert.deepEqual(moveRanking(["a", "b", "c"], "b", 1), ["a", "c", "b"]);
  assert.deepEqual(moveRanking(["a", "b", "c"], "a", -1), ["a", "b", "c"]);
});

test("选择最多三件，再次点击会移除", () => {
  assert.deepEqual(toggleSelection([], "a"), { selection: ["a"], changed: true, action: "added" });
  assert.deepEqual(toggleSelection(["a"], "a"), { selection: [], changed: true, action: "removed" });
  assert.deepEqual(toggleSelection(["a", "b", "c"], "d"), {
    selection: ["a", "b", "c"],
    changed: false,
    action: "full",
  });
});
