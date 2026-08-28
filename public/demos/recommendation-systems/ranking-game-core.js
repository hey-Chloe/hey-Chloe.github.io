(function attachRankingGameCore(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.RankingGameCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createRankingGameCore() {
  function evaluateRanking(selection, idealOrder) {
    const chosen = Array.from(selection);
    const ideal = Array.from(idealOrder);
    return {
      hits: chosen.filter((id) => ideal.includes(id)).length,
      exact: chosen.filter((id, index) => ideal[index] === id).length,
    };
  }

  function moveRanking(selection, itemId, direction) {
    const next = Array.from(selection);
    const index = next.indexOf(itemId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= next.length) return next;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  }

  function toggleSelection(selection, itemId, limit = 3) {
    const next = Array.from(selection);
    const selectedIndex = next.indexOf(itemId);
    if (selectedIndex >= 0) {
      next.splice(selectedIndex, 1);
      return { selection: next, changed: true, action: "removed" };
    }
    if (next.length >= limit) {
      return { selection: next, changed: false, action: "full" };
    }
    next.push(itemId);
    return { selection: next, changed: true, action: "added" };
  }

  return { evaluateRanking, moveRanking, toggleSelection };
});
