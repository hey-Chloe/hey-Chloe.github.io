import { compareThreeCard, evaluateThreeCard, isWinningMahjong, newMahjongRound, newThreeCardRound, sortMahjong, spinSlots } from './casual-games.js';

const app = document.querySelector('#app');
const state = { view: 'lobby', casual: null };
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const rank = (value) => ({ 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }[value] || value);
const suit = (value) => ({ spade: '♠', heart: '♥', club: '♣', diamond: '♦' }[value] || '');
const isRed = (card) => card.suit === 'heart' || card.suit === 'diamond';

function header() {
  return `<header class="topbar"><button class="brand brand-button" data-view="lobby" aria-label="返回 KAI Play 大厅"><div class="logo"><span></span>K</div><div>KAI PLAY <small>浏览器单机训练场</small></div></button><div class="top-actions"><div class="player-chip"><span class="player-avatar">访</span><span><b>访客</b><small>本地试玩</small></span></div><div class="score-pill"><small>网络请求</small><strong>0</strong></div></div></header>`;
}

function nav(active) {
  return `<nav class="nav"><button class="btn ${active === 'lobby' ? 'active' : ''}" data-view="lobby">游戏</button><button class="btn ${active === 'rules' ? 'active' : ''}" data-view="rules">边界</button></nav>`;
}

function gameVisual(action) {
  const scenes = {
    'open-three': '<span class="visual-live"><i></i>免费训练</span><div class="visual-three-cards"><i>9<small>♦</small></i><i>9<small>♣</small></i><i>A<small>♥</small></i></div><b>三张定胜负</b>',
    'open-mahjong': '<span class="visual-live"><i></i>136 张牌墙</span><div class="visual-mahjong-tiles"><i>一<small>万</small></i><i>發</i><i>●<small>筒</small></i><i>三<small>条</small></i></div><b>摸一张 · 打一张</b>',
    'open-slots': '<span class="visual-live"><i></i>零消耗娱乐</span><div class="visual-mini-reels"><i>7</i><i>KAI</i><i>⚡</i></div><b>算力转轮</b>',
  };
  return `<div class="game-visual visual-${action}" aria-hidden="true"><span class="visual-glow"></span>${scenes[action]}</div>`;
}

function gameCard({ eyebrow, title, description, meta, action, tone }) {
  return `<article class="game-card ${tone} is-live">${gameVisual(action)}<div class="game-content"><div class="game-heading"><span class="eyebrow">${eyebrow}</span><span class="status-badge live">本地可玩</span></div><h3>${title}</h3><p>${description}</p><div class="game-meta">${meta.map((item) => `<span>${item}</span>`).join('')}</div><button class="btn primary" data-action="${action}">现在就玩 <b>→</b></button></div></article>`;
}

function lobby() {
  const games = [
    gameCard({ eyebrow: '三张牌型', title: '炸金花训练', description: '三张牌快速比大小；随机发牌、牌型判断和胜负比较都在浏览器中完成。', meta: ['两位虚拟牌友', '不计积分', '无网络'], action: 'open-three', tone: 'game-violet' }),
    gameCard({ eyebrow: '单人练习', title: '麻将摸打', description: '用完整 136 张基础牌墙练习摸牌、打牌与常规胡牌结构。', meta: ['真实牌墙规则', '胡牌检测', '无网络'], action: 'open-mahjong', tone: 'game-orange' }),
    gameCard({ eyebrow: '轻量娱乐', title: '算力转轮', description: '点击后让三个转轮停下，仅展示随机组合与动效反馈。', meta: ['纯视觉娱乐', '零消耗', '无奖励'], action: 'open-slots', tone: 'game-cyan' }),
  ].join('');
  return `<div class="shell lobby-shell">${header()}<section class="kai-hero"><div class="kai-hero-copy"><span class="kicker"><i class="live-dot"></i> 3 款纯浏览器试玩</span><h1>KAI Play</h1><p>从原项目中抽出的单机训练场：不登录、不联网、不保存战绩，也没有充值、支付或可兑换奖励。</p><div class="hero-points"><span>浏览器本地计算</span><span>手机可玩</span><span>随时重开</span></div><div class="actions"><button class="btn primary play-now" data-action="open-three">开始三张牌 <b>→</b></button><button class="btn glass" data-action="scroll-games">全部玩法</button></div></div><div class="hero-game-stage" aria-hidden="true"><span class="hero-stage-label"><i></i>LOCAL PLAYGROUND</span><div class="hero-card-fan"><i>9<small>♦</small></i><i>A<small>♥</small></i><i>K<small>♣</small></i></div><div class="hero-mode-dock"><span><i>三</i>三张牌</span><span><i>麻</i>麻将</span><span><i>7</i>转轮</span></div></div></section><section class="section-block" id="game-selection"><div class="section-head"><div><span class="section-kicker">PLAYGROUND / LOCAL</span><h2>三种玩法</h2></div><p>都在当前页面内运行</p></div><div class="game-grid">${games}</div></section>${nav('lobby')}</div>`;
}

function poker(card) {
  const label = rank(card.rank);
  const symbol = suit(card.suit);
  return `<span class="poker ${isRed(card) ? 'red' : ''}" aria-label="${esc(`${label}${symbol}`)}"><span class="card-index"><b>${label}</b><small>${symbol}</small></span><i class="card-pip">${symbol}</i></span>`;
}

function casualHeader(title, mode, status) {
  return `<header class="casual-top"><button class="table-exit" data-action="casual-home">← 游戏大厅</button><div><span>${esc(mode)}</span><h1>${esc(title)}</h1></div><b>${esc(status)}</b></header>`;
}

function cardBack() { return '<span class="training-card-back" aria-label="未公开的牌"><i>K</i></span>'; }

function threeCardGame() {
  const round = state.casual?.round;
  if (!round) return lobby();
  const revealed = state.casual.revealed;
  const ranked = round.players.map((player, index) => ({ player, index, score: evaluateThreeCard(player.hand) })).sort((left, right) => compareThreeCard(right.player.hand, left.player.hand));
  const winner = ranked[0];
  const result = revealed ? `<div class="training-result ${winner.index === 0 ? 'win' : 'lose'}"><span>${winner.index === 0 ? '本轮获胜' : '本轮结果'}</span><b>${esc(winner.player.name)} · ${esc(winner.score.label)}</b><small>单机训练，不记录战绩</small></div>` : '';
  const seats = round.players.slice(1).map((player) => `<article class="three-opponent"><div class="training-avatar">${esc(player.name.slice(0, 1))}</div><b>${esc(player.name)}</b><div class="three-hand">${revealed ? player.hand.map(poker).join('') : player.hand.map(cardBack).join('')}</div>${revealed ? `<span>${esc(evaluateThreeCard(player.hand).label)}</span>` : '<span>等待翻牌</span>'}</article>`).join('');
  return `<div class="shell casual-shell">${casualHeader('炸金花训练', 'THREE CARD', '浏览器单机')}<section class="casual-stage three-stage">${result}<div class="three-how"><span>1 看自己的三张牌</span><i>→</i><span>2 翻开并比牌</span><i>→</i><span>3 最大牌型获胜</span></div><div class="three-opponents">${seats}</div><div class="three-center"><span>本局免费</span><b>${state.casual.thinking ? '两位牌友正在思考…' : revealed ? '三家牌面已揭晓' : '三张牌，一次定胜负'}</b><small>无筹码 · 无下注</small></div><article class="three-player"><div class="training-avatar">你</div><div><b>你的手牌</b><span>${esc(evaluateThreeCard(round.players[0].hand).label)}</span></div><div class="three-hand">${round.players[0].hand.map(poker).join('')}</div></article><div class="casual-actions"><button class="btn primary" data-action="three-reveal" ${state.casual.thinking || revealed ? 'disabled' : ''}>${state.casual.thinking ? '牌友思考中…' : '翻开并比牌'}</button><button class="btn" data-action="three-new">换一手牌</button></div></section><p class="casual-disclaimer">单机牌型练习；随机发牌只用于娱乐，不涉及任何真实或虚拟资产。</p></div>`;
}

function mahjongTile(tile) {
  const selected = state.casual?.selectedTileId === tile.id;
  const tone = tile.suit === '万' ? 'wan' : tile.suit === '筒' ? 'tong' : tile.suit === '条' ? 'tiao' : 'honor';
  return `<button class="mahjong-tile ${tone} ${selected ? 'selected' : ''} ${state.casual?.round.drawnId === tile.id ? 'drawn' : ''}" data-mahjong-tile="${esc(tile.id)}" aria-label="${esc(tile.label)}"><b>${esc(tile.suit === '字' ? tile.label : tile.rank)}</b><small>${esc(tile.suit === '字' ? '' : tile.suit)}</small></button>`;
}

function mahjongGame() {
  const round = state.casual?.round;
  if (!round) return lobby();
  const canDraw = round.hand.length === 13 && round.wall.length > 0;
  const canDiscard = round.hand.length === 14;
  const wall = Array.from({ length: Math.min(18, Math.ceil(round.wall.length / 8)) }, () => '<i></i>').join('');
  const notice = round.won ? '<div class="training-result win"><span>牌型完成</span><b>胡牌</b><small>四组面子加一对将</small></div>' : '';
  return `<div class="shell casual-shell">${casualHeader('麻将摸打', 'MAHJONG LAB', `牌墙 ${round.wall.length} 张`)}<section class="casual-stage mahjong-stage">${notice}<div class="mahjong-wall wall-top" aria-hidden="true">${wall}</div><div class="mahjong-wall wall-left" aria-hidden="true">${wall}</div><div class="mahjong-wall wall-right" aria-hidden="true">${wall}</div><div class="mahjong-wall wall-bottom" aria-hidden="true">${wall}</div><div class="mahjong-counter"><small>牌墙剩余</small><b>${round.wall.length}</b><span>${canDraw ? '轮到你摸牌' : state.casual.selectedTileId ? '点击“打出所选”' : '请选择一张牌'}</span></div><div class="discard-river"><span>牌河</span><div>${round.discards.slice(-24).map((tile) => `<i class="river-tile">${esc(tile.label)}</i>`).join('') || '<small>摸一张，再选择一张打出</small>'}</div></div><div class="mahjong-hand">${sortMahjong(round.hand).map(mahjongTile).join('')}</div><div class="casual-actions"><button class="btn primary" data-action="mahjong-draw" ${canDraw && !round.won ? '' : 'disabled'}>① 摸一张</button><button class="btn" data-action="mahjong-discard" ${canDiscard && state.casual.selectedTileId && !round.won ? '' : 'disabled'}>② 打出所选</button><button class="btn" data-action="mahjong-new">重新开局</button></div></section><p class="casual-disclaimer">完整 136 张基础牌墙；暂不包含吃碰杠、花牌和多人计番。</p></div>`;
}

function slotsGame() {
  const casual = state.casual;
  if (!casual) return lobby();
  const result = casual.last?.result;
  const resultCopy = result?.tier === 'jackpot' ? '三个图标完全相同' : result?.tier === 'pair' ? '其中两个图标相同' : result ? '三个图标各不相同' : '点击按钮，等待三个转轮依次停止';
  return `<div class="shell casual-shell">${casualHeader('算力转轮', 'COMPUTE REELS', `已旋转 ${casual.spins} 次`)}<section class="casual-stage slots-stage"><div class="slot-guide"><b>怎么玩？</b><span><i>1</i>点击免费旋转</span><span><i>2</i>三个转轮停止</span><span><i>3</i>查看图标组合</span></div><div class="slot-machine"><div class="slot-crown"><span>KAI PLAY</span><b>算力转轮</b><small>免费娱乐 · 零消耗</small></div><div class="slot-reels ${casual.spinning ? 'spinning' : ''}">${casual.reels.map((symbol, index) => `<div class="slot-reel" style="--reel:${index}"><small>◆</small><span class="slot-symbol symbol-${symbol === '7' ? 'seven' : 'kai'}">${esc(symbol)}</span><small>★</small></div>`).join('')}</div><div class="slot-paytable"><span><b>三枚相同</b><small>三连共振</small></span><span><b>两枚相同</b><small>双核同频</small></span><span><b>各不相同</b><small>继续挑战</small></span></div><div class="slot-result ${result?.tier || ''}"><b>${casual.spinning ? '转轮依次停止中…' : result?.label || '准备好了吗？'}</b><small>${resultCopy}</small></div><button class="slot-lever" data-action="slots-spin" ${casual.spinning ? 'disabled' : ''}><i></i><span>${casual.spinning ? '正在旋转…' : '免费旋转一次'}</span></button></div></section><p class="casual-disclaimer">纯视觉娱乐，不支付、不下注、不发放可兑换奖励，也不会保存任何账户数据。</p></div>`;
}

function rules() {
  return `<div class="shell page-shell">${header()}<div class="section-head page-title"><div><span class="section-kicker">PUBLIC DEMO BOUNDARY</span><h1>试玩边界</h1></div><p>可验证，也不夸大</p></div><section class="card"><div class="rules"><div class="rule"><span>01</span><div><h3>纯浏览器运行</h3><p class="muted">页面不连接服务端，不创建账号，不读写数据库。</p></div></div><div class="rule"><span>02</span><div><h3>只有三种单机玩法</h3><p class="muted">联网斗地主、好友房和战绩系统不属于这个公开静态试玩。</p></div></div><div class="rule"><span>03</span><div><h3>不涉及资产</h3><p class="muted">没有充值、支付、提现、下注或可兑换奖励。</p></div></div></div></section>${nav('rules')}</div>`;
}

function render() {
  app.innerHTML = state.view === 'three' ? threeCardGame() : state.view === 'mahjong' ? mahjongGame() : state.view === 'slots' ? slotsGame() : state.view === 'rules' ? rules() : lobby();
}

function openThreeCard() { state.casual = { round: newThreeCardRound(), revealed: false, thinking: false }; state.view = 'three'; }
function openMahjong() { state.casual = { round: newMahjongRound(), selectedTileId: null }; state.view = 'mahjong'; }
function openSlots() { state.casual = { reels: ['7', 'KAI', '⚡'], last: null, spins: 0, spinning: false }; state.view = 'slots'; }

app.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.mahjongTile && state.view === 'mahjong' && state.casual?.round.hand.length === 14) { state.casual.selectedTileId = button.dataset.mahjongTile; render(); return; }
  if (button.dataset.view) { state.view = button.dataset.view; state.casual = null; render(); return; }
  const action = button.dataset.action;
  if (action === 'scroll-games') document.querySelector('#game-selection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (action === 'open-three') { openThreeCard(); render(); }
  if (action === 'open-mahjong') { openMahjong(); render(); }
  if (action === 'open-slots') { openSlots(); render(); }
  if (action === 'casual-home') { state.casual = null; state.view = 'lobby'; render(); }
  if (action === 'three-new') { state.casual = { round: newThreeCardRound(), revealed: false, thinking: false }; render(); }
  if (action === 'three-reveal' && state.view === 'three' && !state.casual?.thinking && !state.casual?.revealed) {
    state.casual.thinking = true; render();
    setTimeout(() => { if (state.view !== 'three' || !state.casual) return; state.casual.thinking = false; state.casual.revealed = true; render(); }, 900);
  }
  if (action === 'mahjong-new') { state.casual = { round: newMahjongRound(), selectedTileId: null }; render(); }
  if (action === 'mahjong-draw' && state.view === 'mahjong') {
    const round = state.casual.round;
    if (round.hand.length !== 13 || !round.wall.length) return;
    const drawn = round.wall.shift(); round.hand = sortMahjong([...round.hand, drawn]); round.drawnId = drawn.id; round.won = isWinningMahjong(round.hand); state.casual.selectedTileId = drawn.id; render();
  }
  if (action === 'mahjong-discard' && state.view === 'mahjong') {
    const round = state.casual.round; const tile = round.hand.find((candidate) => candidate.id === state.casual.selectedTileId);
    if (!tile || round.hand.length !== 14) return;
    round.hand = round.hand.filter((candidate) => candidate.id !== tile.id); round.discards.push(tile); round.drawnId = null; state.casual.selectedTileId = null; render();
  }
  if (action === 'slots-spin' && state.view === 'slots' && !state.casual?.spinning) {
    state.casual.spinning = true; state.casual.last = null; render();
    setTimeout(() => { if (state.view !== 'slots' || !state.casual) return; const next = spinSlots(); state.casual.reels = next.reels; state.casual.last = next; state.casual.spins += 1; state.casual.spinning = false; render(); }, 850);
  }
});

render();
