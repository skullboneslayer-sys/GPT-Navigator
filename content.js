(() => {
  'use strict';
  if (document.getElementById('conversation-compass-host')) return;
  const C = globalThis.ConversationCompassCore;
  if (!C) return;
  const host = document.createElement('div');
  host.id = 'conversation-compass-host';
  host.style.cssText = 'all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483600;';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      :host { --scheme:light; --bg:#fafafa; --surface:#fff; --text:#252525; --muted:#666666; --line:#dedede; --accent:#505050; --tint:#ededed; --hover:#f0f0f0; --shadow:0 16px 60px #0003; font:14px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; color:var(--text); color-scheme:light; }
      :host([data-theme="dark"]) { --scheme:dark; --bg:#242424; --surface:#303030; --text:#eeeeee; --muted:#b3b3b3; --line:#454545; --accent:#d6d6d6; --tint:#373737; --hover:#333333; --shadow:0 16px 60px #0007; color-scheme:dark; }
      .panel,.toast,.rail { font:14px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; color:var(--text); color-scheme:var(--scheme); }
      .panel,.rail { z-index:2; }
      .target { z-index:1; }
      .toast { z-index:3; }
      * { box-sizing:border-box; }
      [hidden] { display:none !important; }
      button,input,select { font:inherit; }
      button { cursor:pointer; color:inherit; }
      button:focus-visible,input:focus-visible,select:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
      .glyph { color:var(--accent); width:20px; height:20px; flex:0 0 20px; display:block; }
      .count { background:var(--tint); color:var(--accent); border-radius:6px; padding:1px 6px; font-size:11px; font-variant-numeric:tabular-nums; }
      .panel { pointer-events:auto; position:fixed; right:16px; top:80px; bottom:20px; width:354px; max-height:800px; max-width:calc(100vw - 24px); display:flex; flex-direction:column; border:1px solid var(--line); border-radius:18px; background:var(--bg); box-shadow:var(--shadow); overflow:hidden; }
      header { display:flex; gap:10px; align-items:center; padding:17px 17px 12px; }
      .brand { flex:1; min-width:0; }
      h2 { font-size:16px; line-height:1.2; margin:0; letter-spacing:-.3px; font-weight:750; }
      .eyebrow { margin:4px 0 0; color:var(--muted); font-size:11px; }
      .icon { border:1px solid transparent; background:transparent; border-radius:8px; width:30px; height:30px; font-size:20px; display:grid; place-items:center; padding:0; }
      .icon:hover { background:var(--hover); border-color:var(--line); }
      .search-wrap { margin:0 16px 12px; position:relative; }
      .search-wrap span { position:absolute; left:12px; top:9px; font-size:17px; color:var(--muted); }
      input[type="search"] { width:100%; min-width:0; border:1px solid var(--line); background:var(--surface); color:var(--text); border-radius:10px; padding:10px 10px 10px 36px; font-size:13px; }
      input::placeholder { color:var(--muted); opacity:1; }
      .filters { display:flex; gap:5px; padding:0 16px 12px; }
      .filter { flex:1; padding:7px 4px; background:transparent; border:1px solid var(--line); border-radius:8px; font-size:12px; font-weight:600; }
      .filter[aria-pressed="true"] { background:var(--tint); color:var(--accent); border-color:var(--accent); }
      .filter:hover { background:var(--hover); }
      .filter[aria-pressed="true"]:hover { background:var(--tint); }
      .summary { padding:0 17px 10px; display:flex; justify-content:space-between; gap:8px; color:var(--muted); font-size:11px; }
      .summary strong { color:var(--text); font-weight:600; }
      .list { margin:0; padding:7px 10px; list-style:none; flex:1; min-height:90px; overflow:auto; overscroll-behavior:contain; border-block:1px solid var(--line); scrollbar-width:thin; }
      .item { margin:3px 0; }
      .message { display:flex; width:100%; gap:11px; text-align:left; border:1px solid transparent; border-radius:11px; background:transparent; padding:10px 9px; }
      .message:hover { background:var(--hover); }
      .message[aria-current="true"] { background:var(--tint); border-color:var(--accent); }
      .number { color:var(--muted); font-size:11px; padding-top:1px; min-width:25px; text-align:right; font-variant-numeric:tabular-nums; }
      .message[aria-current="true"] .number { color:var(--accent); }
      .entry { flex:1; min-width:0; }
      .role { font-size:10px; color:var(--muted); font-weight:650; letter-spacing:.5px; text-transform:uppercase; display:block; margin-bottom:4px; }
      .role.user { color:var(--accent); }
      .preview { display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; overflow-wrap:anywhere; font-size:12px; line-height:1.55; }
      mark { background:#fed56c; color:#1c2531; border-radius:2px; }
      .empty { color:var(--muted); padding:25px 14px; text-align:center; font-size:13px; }
      .empty strong { color:var(--text); display:block; margin-bottom:7px; }
      .controls { padding:12px 16px 7px; display:flex; gap:7px; }
      .nav { background:var(--surface); border:1px solid var(--line); border-radius:8px; flex:1; padding:8px 6px; font-size:12px; }
      .nav:hover,.utility:hover { background:var(--hover); }
      button:disabled { opacity:.45; cursor:default; }
      .index-row { display:flex; gap:7px; padding:0 16px 10px; }
      .index { flex:1; background:var(--tint); border:1px solid var(--line); border-radius:8px; padding:8px 10px; font-size:12px; color:var(--accent); font-weight:650; }
      .index:hover { border-color:var(--accent); }
      .utility { background:var(--surface); border:1px solid var(--line); border-radius:8px; padding:7px 10px; font-size:12px; }
      .status { margin:0; padding:0 17px 10px; font-size:11px; line-height:1.5; color:var(--muted); min-height:27px; }
      .settings { display:flex; align-items:center; justify-content:space-between; padding:9px 16px; border-top:1px solid var(--line); color:var(--muted); font-size:11px; gap:8px; }
      .settings select { max-width:116px; background:var(--surface); color:var(--text); border:1px solid var(--line); padding:4px 6px; border-radius:6px; font-size:11px; }
      .hint { font-size:10px; }
      .target { position:fixed; pointer-events:none; border:2px solid var(--accent); background:color-mix(in srgb,var(--accent) 5%,transparent); border-radius:8px; box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 15%,transparent); }
      .toast { pointer-events:none; position:fixed; bottom:26px; left:50%; transform:translateX(-50%); max-width:calc(100vw - 32px); border:1px solid var(--line); background:var(--bg); color:var(--text); border-radius:10px; padding:12px 16px; font-size:13px; box-shadow:var(--shadow); }
      .rail { pointer-events:auto; position:fixed; right:16px; top:50%; transform:translateY(-50%); width:32px; max-width:calc(100vw - 32px); padding:0; border:1px solid transparent; border-radius:16px; overflow:hidden; }
      .rail-bars { width:100%; max-height:min(80vh,max(120px,calc(100vh - 200px))); overflow-y:auto; overflow-x:hidden; overscroll-behavior:contain; scrollbar-width:none; }
      .rail-bars::-webkit-scrollbar { display:none; width:0; height:0; }
      .prompt-bar { display:flex; align-items:center; justify-content:flex-end; width:100%; height:13px; padding:0 5px; border:0; border-radius:0; background:transparent; text-align:left; }
      .rail-mark { display:block; flex:0 0 20px; width:20px; height:1px; background:#d1d1d1; }
      :host([data-theme="dark"]) .rail-mark { background:#626262; }
      .prompt-bar[aria-current="true"] .rail-mark { background:var(--text); opacity:1; }
      .rail-label { display:none; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
      .rail[data-expanded="true"] { width:320px; padding:6px; background:var(--bg); border-color:var(--line); box-shadow:0 4px 16px #0002; }
      .rail[data-expanded="true"] .rail-bars { scrollbar-width:auto; }
      .rail[data-expanded="true"] .rail-bars::-webkit-scrollbar { display:block; width:3px; height:0; background:transparent; }
      .rail[data-expanded="true"] .rail-bars::-webkit-scrollbar-track { background:transparent; }
      .rail[data-expanded="true"] .rail-bars::-webkit-scrollbar-thumb { min-height:24px; border-radius:999px; background:color-mix(in srgb,var(--text) 18%,transparent); }
      .rail[data-expanded="true"] .rail-bars::-webkit-scrollbar-thumb:hover { background:color-mix(in srgb,var(--text) 27%,transparent); }
      .rail[data-expanded="true"] .rail-bars::-webkit-scrollbar-button { display:none; width:0; height:0; }
      .rail[data-expanded="true"] .prompt-bar { height:36px; padding:0 12px; justify-content:flex-start; border-radius:10px; }
      .rail[data-expanded="true"] .rail-label { display:block; width:100%; font-size:13px; line-height:20px; }
      .rail[data-expanded="true"] .rail-mark { display:none; }
      .rail[data-expanded="true"] .prompt-bar:hover { background:var(--hover); }
      .rail[data-expanded="true"] .prompt-bar[aria-current="true"] { background:var(--tint); }
      @media(max-width:620px) { .panel { top:65px; right:12px; bottom:12px; width:min(354px,calc(100vw - 24px)); } .rail { right:12px; } }
      @media(prefers-reduced-motion:no-preference) { .message,.filter { transition:background .12s; } .rail { transition:width .16s ease,background .12s; } }
    </style>
    <nav class="rail" data-expanded="false" aria-label="Prompt navigation bars" hidden><div class="rail-bars"></div></nav>
    <section id="compass-panel" class="panel" aria-label="Conversation contents" hidden>
      <header><svg class="glyph" viewBox="0 0 16 16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M6 3.5H12 M6 5.5H12 M6 7.5H12 M6 11.5H12" stroke-width="1" opacity=".6"/><path d="M4 9.5H12" stroke-width="1.25"/></g></svg><div class="brand"><h2>GPT-Navigator</h2><p class="eyebrow">Your place in a long conversation</p></div><span class="count">0</span><button class="icon close" type="button" aria-label="Close full navigator" title="Close full navigator (Escape)">×</button></header>
      <div class="search-wrap"><span aria-hidden="true">⌕</span><input type="search" aria-label="Search messages" placeholder="Find a word, phrase, or topic…" autocomplete="off" spellcheck="false"></div>
      <div class="filters" role="group" aria-label="Message filter"><button class="filter" data-filter="all" type="button" aria-pressed="true">All messages</button><button class="filter" data-filter="user" type="button" aria-pressed="false">My prompts</button><button class="filter" data-filter="assistant" type="button" aria-pressed="false">Replies</button></div>
      <div class="summary"><strong class="total">0 messages found</strong><span class="coverage">Page index</span></div>
      <ol class="list" aria-label="Messages in conversation order"></ol>
      <div class="controls"><button class="nav previous" type="button" title="Previous prompt (Ctrl+Shift+Up)">↑ Previous prompt</button><button class="nav next" type="button" title="Next prompt (Ctrl+Shift+Down)">↓ Next prompt</button></div>
      <div class="index-row"><button class="index" type="button">Index full chat</button><button class="utility refresh" type="button" title="Clear the index and rescan the page">Refresh</button></div>
      <p class="status" role="status" aria-live="polite">Only messages loaded by ChatGPT are listed. Index full chat to find older turns.</p>
      <footer class="settings"><label>Theme <select aria-label="Navigator theme"><option value="auto">Match ChatGPT</option><option value="dark">Dark</option><option value="light">Light</option></select></label><span class="hint" title="Change this shortcut in your browser's extension shortcut settings">Ctrl+Shift+Y</span></footer>
    </section>
    <div class="target" hidden></div><div class="toast" role="status" hidden></div>`;
  document.documentElement.appendChild(host);
  const $ = (selector) => shadow.querySelector(selector);
  const panel = $('.panel'), list = $('.list'), search = $('input'), status = $('.status');
  let index = [], visible = [], fallbackIds = new WeakMap(), sequence = 0;
  const identityAliases = new Map();
  const supersededResponses = new Set();
  let activeId = null, filter = 'all', theme = 'auto', route = location.pathname + location.search;
  let root = C.conversationRoot(), scanTimer = null, scrollTimer = null, operation = null;
  let complete = false, open = false, signature = '', toastTimer = null, highlightTimer = null;
  let session = 0;
  let jumpPin = null;
  let knownTail = null, pendingTail = null, nativeBranch = null;
  let completedHeadId = null, railExpanded = false, railTimer = null, railSignature = '', suppressRailFocus = false, touchReveal = false, ignoreTouchClick = false;

  function savePreferences() {
    try { chrome.storage.local.set({ compassPreferences: { theme, filter } }).catch(() => {}); } catch { /* extension was reloaded */ }
  }
  function applyTheme() {
    let actual = theme;
    if (actual === 'auto') {
      const html = document.documentElement;
      const declared = html.getAttribute('data-theme') || html.style.colorScheme;
      if (html.classList.contains('dark') || declared === 'dark') actual = 'dark';
      else if (html.classList.contains('light') || declared === 'light') actual = 'light';
      else {
        const background = getComputedStyle(document.body).backgroundColor;
        const rgb = background.match(/[\d.]+/gu)?.map(Number) || [];
        actual = rgb.length >= 3 && (rgb.length < 4 || rgb[3] > 0) ? (rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 < 125 ? 'dark' : 'light') : matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
      }
    }
    host.setAttribute('data-theme', actual);
  }
  function setStatus(message) { status.textContent = message; }
  function toast(message) {
    $('.toast').textContent = message;
    $('.toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('.toast').hidden = true; }, 3500);
  }
  function setOpen(value, focus = false) {
    open = value;
    panel.hidden = !value;
    collapseRail();
    $('.rail').hidden = value || !index.some((message) => message.role === 'user');
    if (value) { scan(); render(); if (focus) search.focus(); }
    else if (shadow.activeElement) {
      suppressRailFocus = true;
      const button = $('.prompt-bar[aria-current="true"]') || $('.prompt-bar');
      button?.focus({ preventScroll:true });
      suppressRailFocus = false;
    }
  }
  function reset(message = 'Only messages loaded by ChatGPT are listed. Index full chat to find older turns.') {
    session++;
    if (operation) operation.cancelled = true;
    index = []; visible = []; activeId = null; complete = false; signature = '';
    completedHeadId = null; railSignature = ''; collapseRail();
    jumpPin = null;
    knownTail = null; pendingTail = null; nativeBranch = null;
    fallbackIds = new WeakMap(); sequence = 0;
    identityAliases.clear();
    supersededResponses.clear();
    $('.target').hidden = true;
    setStatus(message);
    render();
  }
  function checkContext() {
    const currentRoute = location.pathname + location.search;
    const currentRoot = C.conversationRoot();
    if (currentRoute !== route || currentRoot !== root) {
      route = currentRoute;
      root = currentRoot;
      reset('New conversation. Index full chat to include older messages.');
      search.value = '';
    }
  }
  function invalidateBranch(removed, tail = null) {
    index = index.filter((entry) => !removed.has(entry.id));
    session++;
    if (operation) operation.cancelled = true;
    identityAliases.clear();
    activeId = null; jumpPin = null;
    complete = false; completedHeadId = null;
    knownTail = tail; pendingTail = null; nativeBranch = null;
    $('.target').hidden = true;
    setStatus('Conversation branch changed. Removed messages from the previous branch.');
  }
  function uniqueSlots(messages) {
    const slots = new Map();
    for (const message of messages) {
      if (message.slot) slots.set(message.slot, slots.has(message.slot) ? null : message);
    }
    return slots;
  }
  const nativeTurnSelector = '[data-turn-key], [data-testid^="conversation-turn-"]';
  function adjacentNativeTurns(before, after) {
    let a = before.turnElement, b = after.turnElement;
    if (!a || !b || before.scroller !== after.scroller) return false;
    if (a === b) return true;
    const parents = [];
    for (let node = a.parentElement; node && root.contains(node); node = node.parentElement) parents.push(node);
    const common = parents.find((node) => node.contains(b));
    if (!common) return false;
    while (a.parentElement !== common) a = a.parentElement;
    while (b.parentElement !== common) b = b.parentElement;
    return a.nextElementSibling === b;
  }
  function confirmNativeEdit(turn) {
    if (!turn?.querySelector('textarea, [contenteditable="true"], [contenteditable="plaintext-only"]')) return;
    captureNativeBranch('edit', turn, true);
  }
  function captureNativeBranch(kind, turn, confirmed = kind === 'redo') {
    checkContext();
    if (!root?.contains(turn)) return;
    const role = kind === 'edit' ? 'user' : 'assistant';
    const observed = C.readMessages(root, fallbackIds, () => ++sequence).filter((entry) => !supersededResponses.has(entry.id));
    const current = observed.find((entry) => entry.turnElement === turn && entry.role === role);
    const original = index.find((entry) => entry.id === current?.id) ||
      index.find((entry) => entry.turnElement === turn && entry.role === role);
    const cut = original ? index.indexOf(original) : -1;
    if (cut < 0 || !original.stable) return;
    const predecessor = index[cut - 1];
    nativeBranch = {
      kind, original:{ ...original }, predecessor:predecessor?.stable ? { ...predecessor } : null,
      atStart:cut === 0,
      priorIds:new Set([...index, ...observed].map((entry) => entry.id)),
      removed:new Set(index.slice(cut).map((entry) => entry.id)),
      confirmed, until:Date.now() + (kind === 'edit' && !confirmed ? 300000 : 30000)
    };
    return nativeBranch;
  }
  function observeNativeBranchAction(event) {
    if (!event.isTrusted || !(event.target instanceof Element)) return;
    const path = event.composedPath();
    const button = event.target.closest('[role="menuitem"]') || event.target.closest('button, [role="button"]') ||
      path.find((node) => node instanceof Element && node.matches('[role="menuitem"], button, [role="button"]'));
    if (!button || button.closest('.markdown')) return;
    const label = C.normalize(button.getAttribute('aria-label') || button.title || button.textContent).toLowerCase();
    const turn = button.closest(nativeTurnSelector);
    if (!turn) {
      if (nativeBranch?.kind === 'redo' && !nativeBranch.confirmed && Date.now() < nativeBranch.until &&
          (button.closest('[role="menu"]') || path.some((node) => node instanceof Element && node.matches('[role="menu"]'))) &&
          /^(?:try again(?:\s|$)|use pro mode$|search the web$|submit$)/u.test(label)) {
        nativeBranch.confirmed = true;
        nativeBranch.until = Date.now() + 30000;
      }
      return;
    }
    if (!root?.contains(turn)) return;
    const testId = button.getAttribute('data-testid');
    if (/^(save|send|save and submit)$/.test(label)) { confirmNativeEdit(turn); return; }
    if (label === 'cancel' && nativeBranch?.original.turnElement === turn) { nativeBranch = null; return; }
    const kind = testId === 'edit-message-button' || /^(edit|edit message)$/.test(label) ? 'edit' :
      testId === 'regenerate-response-button' || /^(regenerate( response)?|redo( response)?|retry|try again)$/.test(label) ? 'redo' : null;
    if (!kind) return;
    const captured = captureNativeBranch(kind, turn, kind === 'redo' && !button.hasAttribute('aria-haspopup'));
    if (captured) captured.trigger = button;
  }
  function responseGenerating(messages) {
    return messages.some((entry) => entry.role === 'assistant' && entry.transient) ||
      [...document.querySelectorAll('button[data-testid="stop-button"], button[aria-label="Stop generating"]')]
        .some((stop) => stop.getClientRects().length && !stop.closest('[hidden], [aria-hidden="true"]'));
  }
  function reconcileNativeBranch(observed, seen) {
    const branch = nativeBranch;
    if (!branch) return false;
    if (Date.now() > branch.until) { nativeBranch = null; return false; }
    if (!branch.confirmed || (branch.kind === 'edit' && branch.original.turnElement.isConnected &&
        branch.original.turnElement.querySelector('textarea, [contenteditable="true"], [contenteditable="plaintext-only"]'))) return false;
    const { original, predecessor } = branch;
    if ([...branch.removed].some((id) => id !== original.id && seen.has(id))) return false;
    const preceding = predecessor && seen.get(predecessor.id);
    let replacement = observed.find((entry) => (entry.turnElement === original.turnElement ||
      (branch.kind === 'redo' && preceding?.role === 'user' && entry.turnElement === preceding.turnElement)) &&
      entry.role === original.role && !branch.priorIds.has(entry.id)) ||
      seen.get(original.id) || observed.find((entry) => entry.turnElement === original.turnElement && entry.role === original.role);
    if (!replacement && predecessor) {
      const current = seen.get(predecessor.id);
      if (!current) return false;
      replacement = observed[observed.indexOf(current) + 1];
      if (replacement && !adjacentNativeTurns(current, replacement)) return false;
    }
    if (!replacement && branch.kind === 'redo' && predecessor?.role === 'user' && seen.has(predecessor.id) &&
        !seen.has(original.id) && responseGenerating(observed)) {
      supersededResponses.add(original.id);
      invalidateBranch(branch.removed);
      return true;
    }
    if (!replacement && branch.atStart) replacement = observed[0];
    if (!replacement || replacement.role !== original.role ||
        (replacement.id !== original.id && branch.priorIds.has(replacement.id))) return false;
    if (replacement.id === original.id && replacement.text === original.text && !responseGenerating(observed)) return false;
    const removed = new Set(branch.removed);
    if (replacement.id === original.id) removed.delete(original.id);
    else if (branch.kind === 'redo') {
      // Old and regenerated replies can coexist while ChatGPT switches them.
      supersededResponses.add(original.id);
      const previous = observed.findIndex((entry) => entry.id === original.id);
      if (previous >= 0) observed.splice(previous, 1);
      seen.delete(original.id);
    }
    invalidateBranch(removed);
    return true;
  }
  function reconcileGeneratingBranch(observed, seen, currentTail, last, atBottom, viewHeight) {
    if (!knownTail || knownTail.scroller !== last.scroller) return false;
    if (seen.has(knownTail.id)) { knownTail.pendingRestart = null; return false; }
    if (currentTail.trailingSpace > Math.max(viewHeight, knownTail.trailingSpace + 32) ||
        (!atBottom && Math.abs(currentTail.trailingSpace - knownTail.trailingSpace) > 24)) return false;
    let candidate = knownTail.pendingRestart;
    if (candidate && (Date.now() >= candidate.until || [...candidate.removed].some((id) => seen.has(id)))) {
      candidate = knownTail.pendingRestart = null;
    }
    if (!candidate) {
      const oldEnd = index.findIndex((entry) => entry.id === knownTail.id);
      const cut = index.findLastIndex((entry) => entry.scroller === last.scroller && entry.messageId && seen.has(entry.id)) + 1;
      if (!cut || cut > oldEnd) return false;
      const anchor = index[cut - 1];
      candidate = { anchor:anchor.id, endY:anchor.endY, removed:new Set(index.slice(cut).map((entry) => entry.id)), until:Date.now() + 10000 };
    }
    const current = seen.get(candidate.anchor);
    if (!current) return false;
    const next = observed[observed.indexOf(current) + 1];
    // A virtual window can hide a suffix while keeping its space. Only a
    // shortened end after a shared turn indicates the continuation was replaced.
    if (candidate.endY - current.endY <= 8 || (next && !adjacentNativeTurns(current, next)) ||
        [...candidate.removed].some((id) => seen.has(id))) return false;
    if (!responseGenerating([last])) {
      // ChatGPT can remove the suffix in a separate render before generating.
      knownTail.pendingRestart = candidate;
      return false;
    }
    invalidateBranch(candidate.removed, last.stable ? currentTail : null);
    return true;
  }
  function reconcileBranch(observed, seen, olderLoading) {
    if (reconcileNativeBranch(observed, seen)) return;
    const oldSlots = uniqueSlots(index), newSlots = uniqueSlots(observed);
    const replaced = index.findIndex((entry) => {
      const current = newSlots.get(entry.slot);
      return oldSlots.get(entry.slot) === entry && entry.messageId && current?.messageId &&
        current.messageId !== entry.messageId && !seen.has(entry.id);
    });
    if (replaced >= 0) {
      invalidateBranch(new Set(index.slice(replaced).map((entry) => entry.id)));
      return;
    }

    // Regenerating can change the turn key, and a reset may only remove turns.
    // A missing node in a virtual window is not evidence that it was deleted.
    const scroller = observed[0]?.scroller;
    if (!scroller || olderLoading) {
      pendingTail = null;
      return;
    }
    const last = observed.reduce((tail, entry) => entry.scroller === scroller && (!tail || entry.y >= tail.y) ? entry : tail, null);
    const view = C.viewport(scroller), { position, maximum } = C.scrollMetrics(scroller);
    const rect = last?.element.getBoundingClientRect();
    const atBottom = position >= maximum - 3;
    const atEnd = atBottom && rect && rect.top < view.bottom && rect.bottom > view.top;
    const end = rect && last.y + rect.height;
    const mountedEnd = rect && Math.abs(end - maximum - view.height) <= 4;
    const currentTail = last && { id: last.id, scroller, end, trailingSpace: maximum + view.height - end };
    if (last && reconcileGeneratingBranch(observed, seen, currentTail, last, atBottom, view.height)) return;
    if (!last?.stable || (!atEnd && !mountedEnd) || C.historyLoading(scroller) ||
        observed.some((entry) => entry.transient)) { pendingTail = null; return; }
    const matches = (entry) => entry.stable && seen.get(entry.id)?.stable && compatible(entry, seen.get(entry.id));
    const tailIndex = index.findIndex((entry) => entry.id === canonicalId(knownTail?.id));
    if (tailIndex < 0 || matches(index[tailIndex])) {
      knownTail = currentTail; pendingTail = null;
      return;
    }
    // An unvirtualized thread can expose a shorter physical end without moving
    // the viewport. Otherwise require the real last message to be in view.
    const shorterMountedEnd = mountedEnd && knownTail.scroller === scroller && end + 4 < knownTail.end;
    if ((!atEnd && !shorterMountedEnd) || (atEnd && maximum > 3 && view.bottom - rect.bottom > Math.max(160, view.height * .65))) {
      pendingTail = null;
      return;
    }

    const pending = pendingTail;
    if (pending && pending.scroller === scroller && pending.id === last.id &&
        index.some((entry) => entry.id === pending.anchor && matches(entry))) {
      const remaining = 450 - (Date.now() - pending.since);
      if (remaining <= 0) invalidateBranch(pending.removed, currentTail);
      else scheduleScan(remaining);
      return;
    }
    pendingTail = null;
    const anchorIndex = index.findLastIndex(matches);
    if (anchorIndex >= tailIndex) {
      knownTail = currentTail;
    } else if (anchorIndex >= 0) {
      pendingTail = { scroller, id: last.id, anchor: index[anchorIndex].id, since: Date.now(), removed: new Set(index.slice(anchorIndex + 1).map((entry) => entry.id)) };
      scheduleScan(450);
    }
  }
  function scan() {
    checkContext();
    if (!root?.isConnected) return [];
    const observed = C.readMessages(root, fallbackIds, () => ++sequence).filter((entry) => !supersededResponses.has(entry.id));
    // Hydrating a partial turn can replace its fallback ordinals with real keys.
    // Only a retained DOM identity can prove that this is the same message.
    for (const message of observed) {
      const old = index.find((entry) => entry.id !== message.id && entry.role === message.role && !entry.messageId && compatible(entry, message) && (
        (entry.element === message.element && (entry.transient || message.messageId)) ||
        (entry.transient && entry.turnElement && entry.turnElement === message.turnElement)
      ));
      if (!old) continue;
      identityAliases.set(old.id, message.id);
      if (index.some((entry) => entry !== old && entry.id === message.id)) index.splice(index.indexOf(old), 1);
      else Object.assign(old, message);
    }
    activeId = canonicalId(activeId);
    const seen = new Map(observed.map((entry) => [entry.id, entry]));
    // Only durable identities are useful once their DOM node is unmounted.
    index = index.filter((entry) => entry.stable || seen.get(entry.id)?.element === entry.element);
    const headHydrating = Boolean(operation?.hydratingHead && !operation.cancelled && operation.session === session);
    const olderLoading = headHydrating || [...new Set(observed.map((message) => message.scroller))].some((scroller) => C.historyLoading(scroller, { olderOnly: true }));
    reconcileBranch(observed, seen, olderLoading);
    visible = observed;
    C.mergeMessages(index, observed, { headHydration: headHydrating, historyPrepend: olderLoading });
    // A later visit can reveal history that the page withheld during the scan.
    // Keep completion honest when a stable earlier boundary is discovered.
    const head = index.find((message) => message.stable);
    if (complete && completedHeadId && head && head.id !== canonicalId(completedHeadId)) {
      complete = false; completedHeadId = null;
      setStatus('Earlier history appeared. Index full chat again to include it.');
    } else if (complete && !completedHeadId) completedHeadId = head?.id || null;
    updateActive();
    const nextSignature = index.map((message) => `${message.id}:${message.text}`).join('\u0001');
    if (nextSignature !== signature) { signature = nextSignature; render(); }
    else updateCounts();
    applyTheme();
    return observed;
  }
  function scheduleScan(delay = 250) {
    if (scanTimer) return;
    scanTimer = setTimeout(() => { scanTimer = null; scan(); }, delay);
  }
  function updateCounts(shown) {
    if (shown === undefined) { const needle = C.normalize(search.value).toLocaleLowerCase(); shown = index.filter((message) => (filter === 'all' || message.role === filter) && (!needle || message.text.toLocaleLowerCase().includes(needle))).length; }
    $('.count').textContent = String(index.length);
    const categoryTotal = filter === 'all' ? index.length : index.filter((message) => message.role === filter).length;
    const category = filter === 'user' ? 'prompts' : filter === 'assistant' ? 'replies' : 'messages';
    $('.total').textContent = shown === categoryTotal ? `${categoryTotal} ${category} found` : `${shown} of ${categoryTotal} ${category}`;
    $('.coverage').textContent = complete ? 'Full scan finished' : 'Page index';
    $('.index').textContent = operation?.kind === 'index' ? 'Cancel' : 'Index full chat';
    $('.refresh').disabled = Boolean(operation);
    $('.previous').disabled = !index.some((message) => message.role === 'user');
    $('.next').disabled = $('.previous').disabled;
  }
  async function recoverJumpArrival(pin) {
    checkContext();
    if (jumpPin !== pin || operation || !pin.scroller.isConnected) return;
    const before = C.scrollMetrics(pin.scroller);
    if (before.maximum <= pin.maximum + 2 || Date.now() >= pin.until) return;
    // Older history may displace the viewport and unmount the target. Try its
    // shifted position once and require the exact message to remount there.
    pin.probing = true;
    move(pin.scroller, pin.position + before.maximum - pin.maximum);
    const probe = C.scrollPosition(pin.scroller);
    const deadline = Math.min(pin.until, Date.now() + 1400);
    while (jumpPin === pin && !operation && Date.now() < deadline) {
      await delay(120);
      if (jumpPin !== pin || operation || !pin.scroller.isConnected) return;
      scan();
      if (pin.maximum >= before.maximum) { pin.probing = false; return; }
    }
    if (jumpPin === pin && !operation) {
      jumpPin = null;
      if (pin.scroller.isConnected && Math.abs(C.scrollPosition(pin.scroller) - probe) <= 2) move(pin.scroller, before.position);
      scheduleScan(0);
    }
  }
  function keepJumpArrival(mounted) {
    const pin = jumpPin;
    if (!pin?.scroller.isConnected) return false;
    const pinned = findObserved(mounted, pin.id, pin.target);
    const sameScroller = pinned?.scroller === pin.scroller;
    const metrics = C.scrollMetrics(pin.scroller);
    const following = Date.now() < pin.until;
    const view = C.viewport(pin.scroller);
    if (following && C.historyLoading(pin.scroller, { olderOnly: true })) pin.loadingOlder = true;
    const grew = metrics.maximum > pin.maximum + 2;
    if (following && grew && sameScroller && pinned.y > pin.y + 2) {
      const correction = pinned.element.getBoundingClientRect().top - view.top - pin.offset;
      if (Math.abs(correction) > 2) move(pin.scroller, metrics.position + correction);
      pin.position = C.scrollPosition(pin.scroller);
      pin.y = pinned.y;
      pin.maximum = metrics.maximum;
    } else if (following && grew && !sameScroller && pin.loadingOlder && !pin.probed && !operation) {
      pin.probed = true;
      queueMicrotask(() => recoverJumpArrival(pin));
    }
    const rect = sameScroller && pinned.element.getBoundingClientRect();
    const atArrival = rect && rect.bottom > view.top && rect.top < view.bottom && Math.abs(C.scrollPosition(pin.scroller) - pin.position) <= 2;
    if (atArrival || (following && (pin.probing || (!sameScroller && (grew || pin.loadingOlder || Math.abs(metrics.position - pin.position) <= 2))))) {
      activeId = canonicalId(pin.id);
      markActive();
      if (!atArrival) scheduleScan(Math.min(350, Math.max(0, pin.until - Date.now())));
      return true;
    }
    return false;
  }
  function updateActive() {
    // Jumps align the target at 76px. Track just inside it so a preceding
    // message's final pixels cannot steal selection and skip a compact step.
    const readingOffset = 80;
    const mounted = visible.filter((message) => message.element.isConnected);
    if (keepJumpArrival(mounted)) return;
    jumpPin = null;
    if (!mounted.length) { activeId = null; markActive(); return; }
    const candidates = mounted.filter((message) => {
      const rect = message.element.getBoundingClientRect();
      const view = C.viewport(message.scroller);
      return rect.bottom > view.top + readingOffset && rect.top < view.bottom;
    });
    const bottomPrompt = candidates.findLast((message) => {
      if (message.role !== 'user') return false;
      const view = C.viewport(message.scroller), metrics = C.scrollMetrics(message.scroller), rect = message.element.getBoundingClientRect();
      return metrics.position >= metrics.maximum - 3 && rect.top >= view.top && rect.bottom <= view.bottom;
    });
    const nearest = bottomPrompt || candidates.sort((a, b) => {
      const distance = (message) => {
        const rect = message.element.getBoundingClientRect();
        const top = C.viewport(message.scroller).top + readingOffset;
        return rect.top <= top && rect.bottom > top ? 0 : Math.abs(rect.top - top);
      };
      return distance(a) - distance(b);
    })[0];
    if (nearest) activeId = nearest.id;
    markActive();
  }
  function activePromptId() {
    let cursor = index.findIndex((message) => message.id === canonicalId(activeId));
    for (; cursor >= 0; cursor--) if (index[cursor].role === 'user') return index[cursor].id;
    return null;
  }
  function markActive() {
    const promptId = activePromptId();
    for (const button of list.querySelectorAll('.message')) button.setAttribute('aria-current', String(button.dataset.id === (filter === 'user' ? promptId : activeId)));
    let changed = false;
    for (const button of shadow.querySelectorAll('.prompt-bar')) {
      const current = String(button.dataset.id === promptId);
      if (current === 'true' && button.getAttribute('aria-current') !== current) changed = true;
      button.setAttribute('aria-current', current);
      button.tabIndex = button === shadow.activeElement || (!shadow.activeElement?.classList.contains('prompt-bar') && (current === 'true' || (!promptId && button === $('.rail-bars').firstElementChild))) ? 0 : -1;
    }
    if (changed && !operation) revealRailPrompt(promptId);
  }
  function revealRailPrompt(id) {
    const bars = $('.rail-bars'), bar = [...bars.querySelectorAll('.prompt-bar')].find((button) => button.dataset.id === id);
    if (!bar) return;
    if (bar.offsetTop < bars.scrollTop) bars.scrollTop = bar.offsetTop;
    else if (bar.offsetTop + bar.offsetHeight > bars.scrollTop + bars.clientHeight) bars.scrollTop = bar.offsetTop + bar.offsetHeight - bars.clientHeight;
  }
  function centerRailPrompt(preferFocused = false) {
    const bars = $('.rail-bars'), focused = preferFocused && shadow.activeElement?.classList.contains('prompt-bar') ? shadow.activeElement : null;
    const button = focused || $('.prompt-bar[aria-current="true"]');
    if (button) bars.scrollTop = Math.max(0, button.offsetTop + button.offsetHeight / 2 - bars.clientHeight / 2);
  }
  function collapseRail() {
    clearTimeout(railTimer);
    railExpanded = false; touchReveal = false;
    $('.rail').dataset.expanded = 'false';
    centerRailPrompt();
  }
  function expandRail(preferFocused = false) {
    clearTimeout(railTimer);
    if (open || railExpanded) return;
    railExpanded = true;
    $('.rail').dataset.expanded = 'true';
    centerRailPrompt(preferFocused);
  }
  function scheduleRailCollapse() {
    clearTimeout(railTimer);
    railTimer = setTimeout(() => {
      if (!touchReveal && !$('.rail').matches(':hover')) collapseRail();
    }, 160);
  }
  function renderRail() {
    const prompts = index.filter((message) => message.role === 'user');
    const next = prompts.map((message) => `${message.id}:${message.text}`).join('\u0001');
    $('.rail').hidden = open || !prompts.length;
    if (next === railSignature) { markActive(); return; }
    railSignature = next;
    const bars = $('.rail-bars'), oldScroll = bars.scrollTop;
    const focusedId = shadow.activeElement?.classList.contains('prompt-bar') ? shadow.activeElement.dataset.id : null;
    const existing = new Map([...bars.querySelectorAll('.prompt-bar')].map((button) => [button.dataset.id, button]));
    const barFragment = document.createDocumentFragment();
    prompts.forEach((message, position) => {
      const number = position + 1, preview = C.normalize(message.text).slice(0, 140);
      let bar = existing.get(message.id);
      if (!bar) {
        bar = document.createElement('button'); bar.type = 'button'; bar.className = 'prompt-bar'; bar.dataset.id = message.id;
        const label = document.createElement('span'); label.className = 'rail-label';
        const mark = document.createElement('span'); mark.className = 'rail-mark'; mark.setAttribute('aria-hidden', 'true');
        bar.append(label, mark);
      }
      bar.setAttribute('aria-label', `Prompt ${number}: ${preview}`);
      bar.querySelector('.rail-label').textContent = preview;
      barFragment.append(bar);
    });
    bars.replaceChildren(barFragment);
    bars.scrollTop = oldScroll;
    if (focusedId) {
      suppressRailFocus = true;
      existing.get(focusedId)?.focus({ preventScroll:true });
      suppressRailFocus = false;
    }
    markActive();
  }
  function appendPreview(container, text, query) {
    let start = query ? text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) : -1;
    const offset = Math.max(0, start - 50);
    const preview = `${offset ? '…' : ''}${text.slice(offset, offset + 230)}${text.length > offset + 230 ? '…' : ''}`;
    start = query ? preview.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) : -1;
    if (start < 0) container.textContent = preview;
    else {
      container.append(document.createTextNode(preview.slice(0, start)));
      const mark = document.createElement('mark');
      mark.textContent = preview.slice(start, start + query.length);
      container.append(mark, document.createTextNode(preview.slice(start + query.length)));
    }
  }
  function render() {
    renderRail();
    for (const button of shadow.querySelectorAll('.filter')) button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    const query = C.normalize(search.value);
    const needle = query.toLocaleLowerCase();
    const shown = index.filter((message) => (filter === 'all' || message.role === filter) && (!needle || message.text.toLocaleLowerCase().includes(needle)));
    updateCounts(shown.length);
    if (!open) return;
    const focusedId = shadow.activeElement?.dataset.id;
    const oldScroll = list.scrollTop;
    const fragment = document.createDocumentFragment();
    const numbered = filter === 'all' ? index : index.filter((message) => message.role === filter);
    const ordinals = new Map(numbered.map((message, i) => [message.id, i + 1]));
    const currentId = filter === 'user' ? activePromptId() : activeId;
    const existing = new Map(Array.from(list.querySelectorAll('.message'), (button) => [button.dataset.id, button.closest('li')]));
    for (const message of shown) {
      const cached = existing.get(message.id);
      const cacheKey = `${message.text}\0${query}\0${ordinals.get(message.id)}\0${filter}`;
      if (cached && cached._compassKey === cacheKey) { cached.querySelector('button').setAttribute('aria-current', String(message.id === currentId)); fragment.append(cached); continue; }
      const item = document.createElement('li'); item.className = 'item';
      const button = document.createElement('button'); button.type = 'button'; button.className = 'message'; button.dataset.id = message.id;
      button.setAttribute('aria-current', String(message.id === currentId));
      item._compassKey = cacheKey;
      const number = ordinals.get(message.id);
      button.title = `${filter === 'user' ? 'Prompt' : filter === 'assistant' ? 'Reply' : 'Message'} ${number} · ${message.role === 'user' ? 'You' : 'ChatGPT'}\n${message.text.slice(0, 800)}`;
      const badge = document.createElement('span'); badge.className = 'number'; badge.textContent = String(number);
      const entry = document.createElement('span'); entry.className = 'entry';
      const role = document.createElement('span'); role.className = `role ${message.role}`; role.textContent = message.role === 'user' ? 'You' : 'ChatGPT';
      const preview = document.createElement('span'); preview.className = 'preview'; appendPreview(preview, message.text, query);
      entry.append(role, preview); button.append(badge, entry); item.append(button); fragment.append(item);
    }
    if (!shown.length) {
      const empty = document.createElement('li'); empty.className = 'empty';
      const title = document.createElement('strong'); title.textContent = query ? 'No matching messages yet' : 'Your conversation starts here';
      empty.append(title, document.createTextNode(query ? 'Try another phrase or index the full chat to search earlier messages.' : 'Open a ChatGPT conversation. Your prompts and replies will appear automatically.'));
      fragment.append(empty);
    }
    list.replaceChildren(fragment);
    list.scrollTop = oldScroll;
    if (focusedId) Array.from(list.querySelectorAll('.message')).find((button) => button.dataset.id === focusedId)?.focus({ preventScroll: true });
  }
  function mainScroller() {
    const sample = visible.find((message) => message.element.isConnected) || index.find((message) => message.element.isConnected);
    return sample?.scroller || document.scrollingElement;
  }
  const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  function move(scroller, top) { C.scrollToPosition(scroller, top); }
  function ownsOperation(task) { return operation === task && task.session === session; }
  function cancelled(task) {
    checkContext();
    return task.cancelled || !ownsOperation(task.owner || task) || !root?.isConnected;
  }
  function capturePosition(scroller) {
    const view = C.viewport(scroller);
    const inView = visible.filter((message) => {
      const rect = message.element.getBoundingClientRect();
      return message.scroller === scroller && message.element.isConnected && rect.bottom > view.top && rect.top < view.bottom;
    });
    const anchor = inView.find((message) => message.stable) || inView[0];
    const metrics = C.scrollMetrics(scroller);
    return { top: metrics.position, fromEnd: metrics.maximum - metrics.position, reversed: metrics.minimum < 0, anchor: anchor ? { ...anchor } : null, offset: anchor ? anchor.element.getBoundingClientRect().top - view.top : 0 };
  }
  async function restorePosition(scroller, position, task) {
    checkContext();
    if (!ownsOperation(task) || route !== task.route || !scroller.isConnected) return false;
    task.restoring = true;
    task.restoreClamped = false;
    try {
      const anchor = canonicalTarget(position.anchor);
      const recovery = { owner:task, started:Date.now(), limit:12000 };
      const hints = [position.top];
      if (position.reversed) hints.push(C.scrollMetrics(scroller).maximum - position.fromEnd);
      const found = anchor && (resolve(anchor.id, anchor) || await seekLoaded(anchor, scroller, recovery, position.offset, hints));
      const exact = found && await align(found, recovery, position.offset);
      if (cancelled(recovery)) return false;
      if (exact) {
        task.restoreClamped = Math.abs(exact.element.getBoundingClientRect().top - C.viewport(exact.scroller).top - position.offset) > 3;
        return !task.restoreClamped;
      }
      // A distance measured from the end is a useful probe, not a fallback:
      // a changed scroll extent could otherwise send the reader to the bottom.
      move(scroller, position.top);
      return !anchor;
    } finally { task.restoring = false; }
  }
  function startOperation(kind, scroller) {
    const previous = operation?.session === session ? operation : null;
    const position = previous?.scroller === scroller ? previous.position : capturePosition(scroller);
    const arrival = jumpPin || previous?.arrival;
    if (previous) previous.cancelled = true;
    jumpPin = null;
    const task = { kind, scroller, position, arrival, cancelled: false, session, route, started: Date.now() };
    operation = task;
    updateCounts();
    return task;
  }
  function finishOperation(task) {
    if (operation === task) { operation = null; render(); }
  }
  function operationTimeLeft(task) {
    return (task.limit || (task.kind === 'index' ? 180000 : 12000)) - (Date.now() - task.started);
  }
  async function waitForScan(task, milliseconds) {
    const until = Date.now() + milliseconds;
    while (Date.now() < until) {
      if (cancelled(task) || operationTimeLeft(task) <= 0) return false;
      await delay(Math.min(160, until - Date.now()));
    }
    return !cancelled(task) && operationTimeLeft(task) > 0;
  }
  function hydrationState(scroller) {
    const messages = scan(), view = C.viewport(scroller);
    const inView = messages.filter((message) => {
      const rect = message.element.getBoundingClientRect();
      return message.scroller === scroller && rect.bottom > view.top && rect.top < view.bottom;
    });
    const stable = inView.filter((message) => message.stable && !message.transient).sort((a, b) => a.y - b.y);
    // The older-history announcement may be an offscreen sibling of the thread.
    const olderPending = C.historyLoading(scroller, { olderOnly: true });
    const pending = olderPending || C.historyLoading(scroller) || inView.some((message) => message.transient);
    const boundary = stable.slice(0, 3).map((message) => canonicalId(message.id)).join('|');
    const progress = `${scroller.scrollHeight}:${index.length}:${boundary}`;
    return {
      messages, inView, hasContent: inView.length > 0, head: stable[0], boundary, pending, olderPending,
      leadingGap: stable.length ? stable[0].element.getBoundingClientRect().top - view.top : Infinity,
      progress, signal: `${progress}:${pending}`
    };
  }
  async function settleViewport(scroller, task, { minimum = 180, maximum = 2500, quiet = 180, stopOnOlderHistory = false, target = null, accept = () => true, allowPending = false } = {}) {
    const started = Date.now();
    let state = hydrationState(scroller), signature = state.signal, quietSince = started;
    while (!cancelled(task) && operationTimeLeft(task) > 0) {
      state = hydrationState(scroller);
      if (target && findObserved(state.messages, target.id, target)) return { ...state, settled: true };
      if (stopOnOlderHistory && state.olderPending) return { ...state, settled: false };
      if (state.signal !== signature) { signature = state.signal; quietSince = Date.now(); }
      if (state.hasContent && (allowPending || !state.pending) && accept(state) && Date.now() - started >= minimum && Date.now() - quietSince >= quiet) return { ...state, settled: true };
      if (Date.now() - started >= maximum) break;
      if (!await waitForScan(task, 160)) break;
    }
    return { ...state, settled: false };
  }
  function scanDestination(scroller, messages, direction = 1) {
    const view = C.viewport(scroller), position = C.scrollPosition(scroller);
    let target = position + direction * Math.max(120, scroller.clientHeight * .72);
    const containing = messages.find((message) => {
      if (message.scroller !== scroller) return false;
      const rect = message.element.getBoundingClientRect();
      return direction > 0 ? rect.top <= view.top + 80 && rect.bottom > view.bottom + scroller.clientHeight : rect.top < view.top - scroller.clientHeight && rect.bottom > view.top + 80;
    });
    // Full prose is already read from these tall replies, so crossing it is safe.
    if (containing) target = direction > 0 ? Math.max(target, containing.y + containing.element.getBoundingClientRect().height - scroller.clientHeight * .65) : Math.min(target, containing.y - 76);
    return Math.max(0, Math.min(scroller.scrollHeight - scroller.clientHeight, target));
  }
  async function probeLoadedHead(scroller, task, deadline) {
    const anchor = index.filter((message) => message.stable && message.scroller === scroller).sort((a, b) => a.y - b.y)[0];
    if (!anchor || cancelled(task)) return;
    move(scroller, anchor.y - 76);
    await settleViewport(scroller, task, { minimum: 2200, maximum: 4000 });
    while (!cancelled(task) && operationTimeLeft(task) > 0 && Date.now() < deadline && C.scrollPosition(scroller) > 3) {
      const state = hydrationState(scroller), before = C.scrollPosition(scroller);
      move(scroller, scanDestination(scroller, state.messages, -1));
      await settleViewport(scroller, task, state.pending || !state.hasContent || state.leadingGap > 160 ? { minimum: 2200, maximum: 4000 } : { minimum: 180, maximum: 1800 });
      if (Math.abs(C.scrollPosition(scroller) - before) < 2) break;
    }
  }
  async function hydrateHead(scroller, task, options) {
    task.hydratingHead = true;
    try { return await hydrateHeadViewport(scroller, task, options); }
    finally { task.hydratingHead = false; }
  }
  async function hydrateHeadViewport(scroller, task, { quiet = 2500, maximum = 20000, idle = maximum } = {}) {
    const started = Date.now(), hardDeadline = started + Math.min(maximum, Math.max(0, operationTimeLeft(task)));
    let deadline = Math.min(hardDeadline, started + idle);
    move(scroller, 0);
    let state = hydrationState(scroller), signature = state.signal, progress = state.progress, quietSince = started, probedAnchor = false, progressed = false;
    while (!cancelled(task) && Date.now() < deadline && operationTimeLeft(task) > 0) {
      state = hydrationState(scroller);
      if (cancelled(task)) break;
      if (state.signal !== signature) { signature = state.signal; quietSince = Date.now(); }
      // Loading announcements can flicker without delivering more history.
      // Extend the idle window only when the actual indexed boundary advances.
      if (state.progress !== progress) {
        progress = state.progress; progressed = true;
        deadline = Math.min(hardDeadline, Date.now() + idle);
      }
      setStatus(`Loading earlier messages… ${index.length} messages found. Cancel to return to your place.`);
      if (C.scrollPosition(scroller) <= 3 && state.head && !state.pending && Date.now() - quietSince >= quiet) return { ...state, settled: true, progressed };
      // A fixed-height virtual spacer can remain blank at physical zero. Visit
      // the oldest known real message to trigger its older-history boundary.
      if (!state.hasContent && !state.pending && !probedAnchor && Date.now() - started >= 4000) {
        probedAnchor = true;
        await probeLoadedHead(scroller, task, deadline - quiet);
        if (cancelled(task)) break;
        move(scroller, 0); quietSince = Date.now();
      } else if (C.scrollPosition(scroller) > 3) {
        move(scroller, 0); quietSince = Date.now();
      }
      if (!await waitForScan(task, 160)) break;
    }
    return { ...hydrationState(scroller), settled: false, progressed };
  }
  async function sweepHistory(scroller, task) {
    let blank = false, stalled = 0, lastY = -1;
    for (let step = 0; step < 6000 && !cancelled(task) && operationTimeLeft(task) > 0; step++) {
      const state = await settleViewport(scroller, task, { maximum: 5000, stopOnOlderHistory: true });
      if (cancelled(task)) break;
      if (state.olderPending) return { bottom: false, blank, needsHead: true };
      if (state.pending) return { bottom: false, blank: true };
      blank ||= !state.settled;
      setStatus(`Indexing… ${index.length} messages found. Cancel to return to your place.`);
      const maximum = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      if (C.scrollPosition(scroller) >= maximum - 3) {
        const bottom = await settleViewport(scroller, task, { minimum: 500, maximum: 5000, quiet: 350, stopOnOlderHistory: true });
        if (cancelled(task)) break;
        if (bottom.olderPending) return { bottom: false, blank, needsHead: true };
        if (C.scrollPosition(scroller) >= scroller.scrollHeight - scroller.clientHeight - 3) return { bottom: true, blank: blank || !bottom.settled };
      }
      move(scroller, scanDestination(scroller, state.messages));
      if (!await waitForScan(task, 160)) break;
      stalled = Math.abs(C.scrollPosition(scroller) - lastY) < 2 ? stalled + 1 : 0;
      lastY = C.scrollPosition(scroller);
      if (stalled > 8) break;
    }
    return { bottom: false, blank: true };
  }
  async function fullScan() {
    scan();
    const scroller = mainScroller();
    if (!scroller || !visible.length) { setStatus('Open a conversation with messages first.'); return; }
    const task = startOperation('index', scroller);
    complete = false;
    completedHeadId = null;
    let verified = false;
    try {
      setStatus('Indexing from the beginning. You can cancel at any time.');
      for (let pass = 0; pass < 8 && operationTimeLeft(task) > 0; pass++) {
        const head = await hydrateHead(scroller, task, { maximum: 60000, idle: 20000 });
        if (cancelled(task)) return;
        if (!head.settled) {
          if (head.pending || head.progressed) continue;
          break;
        }
        const swept = await sweepHistory(scroller, task);
        if (cancelled(task)) return;
        if (swept.needsHead) continue;
        if (!swept.bottom) break;
        const count = index.length;
        const confirmed = await hydrateHead(scroller, task, { maximum: 60000, idle: 20000 });
        if (cancelled(task)) return;
        if (head.settled && confirmed.settled && !swept.blank && head.boundary === confirmed.boundary && count === index.length) { verified = true; break; }
      }
      if (ownsOperation(task)) {
        complete = verified;
        completedHeadId = complete ? index.find((message) => message.stable)?.id || null : null;
        setStatus(complete ? `Scan finished: ${index.length} messages. Returning to your place.` : `${index.length} messages indexed. ChatGPT did not finish loading; try another scan.`);
      }
    } catch (error) {
      if (ownsOperation(task)) setStatus('The page changed during indexing. Refresh the index and try again.');
      console.warn('[GPT-Navigator] Index interrupted:', error.message);
    } finally {
      try {
        if (ownsOperation(task)) {
          const restored = await restorePosition(scroller, task.position, task);
          if (ownsOperation(task)) {
            if (!restored) setStatus(task.restoreClamped ? `${task.cancelled ? 'Scan cancelled' : complete ? `Full page scan finished · ${index.length} messages` : 'Index retained'}. Returned to your original message; its previous reading offset no longer fits.` : 'Index retained. ChatGPT could not reload your original message; position restored approximately.');
            else if (task.cancelled) setStatus(`Scan cancelled. ${index.length} messages retained; index may be partial.`);
            else if (complete) setStatus(`Full page scan finished · ${index.length} messages.`);
          }
        }
      } finally { finishOperation(task); }
    }
  }
  function compatible(expected, actual) {
    if (!expected || !actual || expected.role !== actual.role) return false;
    if (expected.messageId && actual.messageId) return expected.messageId === actual.messageId;
    if (expected.text.startsWith('[Response loading') || expected.text.startsWith('[Attachment or empty')) return true;
    return expected.role === 'user' ? expected.text === actual.text : expected.text === actual.text || actual.text.startsWith(expected.text) || expected.text.startsWith(actual.text);
  }
  function canonicalId(id) {
    const visited = new Set();
    while (identityAliases.has(id) && !visited.has(id)) { visited.add(id); id = identityAliases.get(id); }
    return id;
  }
  function canonicalTarget(target) {
    if (!target) return target;
    const id = canonicalId(target.id);
    if (id === target.id) return target;
    const current = index.find((message) => message.id === id);
    return { ...target, id, stable: current?.stable ?? target.stable, messageId: current?.messageId ?? target.messageId };
  }
  function findObserved(observed, id, expected) {
    const canonical = canonicalId(id), target = canonicalTarget(expected);
    return observed.find((message) => message.id === canonical && message.element.isConnected && (!target || (compatible(target, message) && (target.stable || target.element === message.element) && (target.messageId || target.element === message.element || target.text === message.text))));
  }
  function resolve(id, expected) { return findObserved(scan(), id, expected); }
  function moveToMessage(message, offset) {
    const { scroller, element } = message;
    move(scroller, C.scrollPosition(scroller) + element.getBoundingClientRect().top - C.viewport(scroller).top - offset);
  }
  function atMessageOffset(message, offset) {
    if (!message) return false;
    const { scroller, element } = message;
    const rect = element.getBoundingClientRect(), view = C.viewport(scroller), metrics = C.scrollMetrics(scroller);
    const correction = rect.top - view.top - offset;
    return rect.bottom > view.top && rect.top < view.bottom &&
      (Math.abs(correction) <= 3 || (correction < 0 && metrics.position <= 3) || (correction > 0 && metrics.position >= metrics.maximum - 3));
  }
  async function align(message, task, offset = 76) {
    for (let attempt = 0; attempt < 4; attempt++) {
      if (cancelled(task)) return null;
      const current = resolve(message.id, message);
      if (!current || cancelled(task)) return null;
      const scroller = current.scroller;
      moveToMessage(current, offset);
      const state = await settleViewport(scroller, task, {
        maximum: 4200, allowPending: true,
        accept: ({ inView }) => Boolean(findObserved(inView, message.id, message))
      });
      if (cancelled(task)) return null;
      const verified = findObserved(state.inView, message.id, message);
      if (!state.settled || !verified) return null;
      if (atMessageOffset(verified, offset)) return verified;
    }
    return null;
  }
  function windowDirection(target, inView) {
    const ranks = new Map(index.map((message, position) => [message.id, position]));
    const wanted = ranks.get(canonicalId(target.id));
    if (wanted === undefined) return 0;
    const neighbors = inView.filter((message) => message.stable && !message.transient).map((message) => ranks.get(message.id)).filter(Number.isFinite);
    if (!neighbors.length) return 0;
    if (neighbors.every((position) => position < wanted)) return 1;
    if (neighbors.every((position) => position > wanted)) return -1;
    return 0;
  }
  async function seekLoaded(target, scroller, task, offset = 76, hints = []) {
    if (!target.stable || !scroller.isConnected) return null;
    let maximum = C.scrollMetrics(scroller).maximum, low = 0, high = maximum;
    const tried = [];
    let nearby = [];
    for (let step = 0; step < 18 && !cancelled(task) && operationTimeLeft(task) > 0; step++) {
      const latest = index.find((message) => message.id === canonicalId(target.id));
      const guess = latest?.scroller === scroller ? latest.y : target.y;
      const candidates = [guess - offset, ...hints, ...nearby, (low + high) / 2, low, high];
      const destination = candidates.filter(Number.isFinite).map((position) => Math.max(0, Math.min(maximum, position)))
        .filter((position) => position >= low && position <= high)
        .find((position) => !tried.some((previous) => Math.abs(previous - position) < 3));
      if (destination === undefined) break;
      tried.push(destination);
      move(scroller, destination);
      const state = await settleViewport(scroller, task, { minimum: 500, maximum: 3000, target });
      if (cancelled(task)) return null;
      const found = findObserved(state.messages, target.id, target);
      if (found) return found;
      const metrics = C.scrollMetrics(scroller);
      if (Math.abs(metrics.maximum - maximum) > 2) {
        maximum = metrics.maximum; low = 0; high = maximum; tried.length = 0; nearby = [];
      }
      // A virtual window can move far from its old coordinates after reflow.
      // Use the identities that really mounted to narrow the search window.
      const direction = state.settled ? windowDirection(target, state.inView) : 0;
      const stride = Math.max(24, C.viewport(scroller).height * .45);
      if (direction > 0) low = Math.max(low, Math.min(maximum, metrics.position + stride));
      else if (direction < 0) high = Math.min(high, Math.max(0, metrics.position - stride));
      if (low > high) break;
      if (direction) nearby = [];
      else if (!nearby.length) nearby = [metrics.position - stride, metrics.position + stride, metrics.position - 2 * stride, metrics.position + 2 * stride];
    }
    return null;
  }
  function highlight(message) {
    clearTimeout(highlightTimer);
    const box = message.element.getBoundingClientRect();
    const view = C.viewport(message.scroller);
    const top = Math.max(view.top, box.top), bottom = Math.min(view.bottom, box.bottom);
    const target = $('.target');
    target.style.cssText = `left:${Math.max(0, box.left - 4)}px;top:${top}px;width:${Math.min(innerWidth, box.width + 8)}px;height:${Math.max(6, bottom - top)}px;`;
    target.hidden = false;
    highlightTimer = setTimeout(() => { target.hidden = true; }, 2200);
  }
  async function jump(id) {
    const originSession = session, originRoute = location.pathname + location.search;
    const stored = index.find((message) => message.id === canonicalId(id)); if (!stored) return;
    const observed = scan();
    const target = canonicalTarget(stored);
    if (originSession !== session || originRoute !== route || !index.some((message) => message.id === target.id)) return;
    const scroller = mainScroller(), task = startOperation('jump', scroller);
    task.targetId = target.id;
    const firstPrompt = index.find((message) => message.role === 'user')?.id;
    let success = false;
    try {
      let found = findObserved(observed, target.id, target);
      if (!found) {
        setStatus('Locating the selected message…');
        found = await seekLoaded(target, scroller, task);
      }
      if (cancelled(task)) return;
      let exact = null;
      if (found) {
        moveToMessage(found, 76);
        const current = resolve(target.id, target);
        exact = atMessageOffset(current, 76) ? current : current && await align(current, task);
      }
      if (found && !exact && !cancelled(task) && operationTimeLeft(task) > 0) {
        const reloaded = await seekLoaded(target, scroller, task);
        exact = reloaded && await align(reloaded, task);
      }
      if (exact && !cancelled(task)) {
        success = true; activeId = exact.id;
        const metrics = C.scrollMetrics(exact.scroller), view = C.viewport(exact.scroller);
        const nearHead = exact.stable && (exact.id === canonicalId(firstPrompt) || metrics.position <= view.height);
        const now = Date.now(), prior = task.arrival;
        const inherited = prior?.scroller === exact.scroller && prior.until > now;
        const loadingOlder = C.historyLoading(exact.scroller, { olderOnly: true }) || Boolean(inherited && prior.loadingOlder);
        jumpPin = {
          id:exact.id, target:{ ...exact }, scroller:exact.scroller, position:metrics.position, maximum:metrics.maximum,
          y:exact.y, offset:exact.element.getBoundingClientRect().top - view.top,
          until:Math.max(now + (nearHead || loadingOlder ? 6500 : 650), inherited ? prior.until : 0),
          loadingOlder
        };
        render(); highlight(exact);
        setStatus(`At message ${index.findIndex((message) => message.id === exact.id) + 1} · ${exact.role === 'user' ? 'Your prompt' : 'ChatGPT reply'}.`);
        if (innerWidth < 700) setOpen(false);
      } else if (!cancelled(task)) {
        setStatus('ChatGPT did not load that exact message. Returning to your place.');
      }
    } catch (error) {
      if (ownsOperation(task)) setStatus('The page changed during navigation. Refresh the index and try again.');
      console.warn('[GPT-Navigator] Jump interrupted:', error.message);
    } finally {
      try {
        if (!success && ownsOperation(task)) {
          const restored = await restorePosition(scroller, task.position, task);
          if (ownsOperation(task)) {
            const result = task.cancelled ? 'Navigation cancelled.' : 'Exact message could not be loaded.';
            setStatus(`${result} ${restored || task.restoreClamped ? 'Returned to your original message.' : 'Restored an approximate scroll position.'}`);
            if (!open) toast(status.textContent);
          }
        }
      } finally { finishOperation(task); }
    }
  }
  function adjacent(direction) {
    scan();
    const pending = operation?.kind === 'jump' && !operation.cancelled && operation.session === session ? operation.targetId : null;
    const current = index.findIndex((message) => message.id === canonicalId(pending || activeId));
    let cursor = current < 0 ? (direction > 0 ? -1 : index.length) : current;
    for (cursor += direction; cursor >= 0 && cursor < index.length; cursor += direction) {
      if (index[cursor].role === 'user') { jump(index[cursor].id); return; }
    }
    toast('No further prompt in this index. Index full chat to include earlier messages.');
  }
  $('.rail').addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') expandRail(); });
  $('.rail').addEventListener('pointerleave', scheduleRailCollapse);
  $('.rail').addEventListener('focusin', () => { clearTimeout(railTimer); markActive(); if (!suppressRailFocus) expandRail(true); });
  $('.rail').addEventListener('focusout', scheduleRailCollapse);
  $('.rail').addEventListener('pointerdown', (event) => {
    ignoreTouchClick = false;
    if (event.pointerType === 'touch') {
      touchReveal = true;
      if (!railExpanded) { ignoreTouchClick = true; expandRail(); }
    }
  });
  $('.rail-bars').addEventListener('click', (event) => {
    if (ignoreTouchClick) { ignoreTouchClick = false; event.preventDefault(); return; }
    const button = event.target.closest('.prompt-bar'); if (button) jump(button.dataset.id);
  });
  document.addEventListener('pointerdown', (event) => { if (touchReveal && !event.composedPath().includes($('.rail'))) collapseRail(); }, true);
  $('.rail-bars').addEventListener('keydown', (event) => {
    if (!['ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
    expandRail();
    const bars = [...$('.rail-bars').querySelectorAll('.prompt-bar')], current = bars.indexOf(event.target);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? bars.length - 1 : current + (event.key === 'ArrowDown' ? 1 : -1);
    bars[Math.max(0, Math.min(bars.length - 1, next))]?.focus(); event.preventDefault(); event.stopPropagation();
  });
  $('.close').addEventListener('click', () => setOpen(false));
  search.addEventListener('input', render);
  for (const button of shadow.querySelectorAll('.filter')) button.addEventListener('click', () => { filter = button.dataset.filter; savePreferences(); render(); });
  list.addEventListener('click', (event) => { const button = event.target.closest('.message'); if (button) jump(button.dataset.id); });
  $('.previous').addEventListener('click', () => adjacent(-1));
  $('.next').addEventListener('click', () => adjacent(1));
  $('.index').addEventListener('click', () => { if (operation?.kind === 'index') { operation.cancelled = true; setStatus('Cancelling… returning to your place.'); } else fullScan(); });
  $('.refresh').addEventListener('click', () => { reset(); scan(); render(); });
  $('select').addEventListener('change', (event) => { theme = event.target.value; applyTheme(); savePreferences(); });
  shadow.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (operation) operation.cancelled = true;
      else if (railExpanded) collapseRail();
      else if (search.value) { search.value = ''; render(); }
      else setOpen(false);
      event.preventDefault(); event.stopPropagation();
    }
  });
  document.addEventListener('click', observeNativeBranchAction, true);
  document.addEventListener('submit', (event) => {
    if (event.isTrusted && event.target instanceof Element) confirmNativeEdit(event.target.closest(nativeTurnSelector));
  }, true);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nativeBranch?.kind === 'redo' && !nativeBranch.confirmed) nativeBranch = null;
    if (!event.repeat && ['Enter', ' '].includes(event.key) && nativeBranch?.kind === 'redo' && !nativeBranch.confirmed) observeNativeBranchAction(event);
    if (event.repeat || C.isEditable(event)) return;
    if (event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey && ['ArrowUp','ArrowDown'].includes(event.code)) {
      event.preventDefault(); event.stopPropagation();
      adjacent(event.code === 'ArrowUp' ? -1 : 1);
    }
    if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End','Space'].includes(event.code) && !event.composedPath().includes(host) && !(event.ctrlKey && event.shiftKey)) jumpPin = null;
  }, true);
  document.addEventListener('scroll', (event) => {
    if (event.composedPath().includes(host)) return;
    if (!jumpPin || Math.abs(C.scrollPosition(jumpPin.scroller) - jumpPin.position) > 2) $('.target').hidden = true;
    if (!scrollTimer) scrollTimer = setTimeout(() => { scrollTimer = null; scan(); }, 120);
  }, true);
  document.addEventListener('wheel', (event) => {
    if (event.composedPath().includes(host)) return;
    jumpPin = null;
    if (operation && !operation.restoring) {
      operation.cancelled = true;
      setStatus(operation.kind === 'index' ? 'Scan cancelled by scrolling. Returning to your place.' : 'Navigation cancelled by scrolling.');
    }
  }, { capture: true, passive: true });
  document.addEventListener('pointerdown', (event) => {
    if (!event.composedPath().includes(host)) jumpPin = null;
    if (nativeBranch?.kind === 'redo' && !nativeBranch.confirmed &&
        event.composedPath().some((node) => node instanceof Element && node.matches('[role="menu"]'))) observeNativeBranchAction(event);
    if (nativeBranch?.kind === 'redo' && !nativeBranch.confirmed && event.target instanceof Element &&
        !nativeBranch.trigger?.contains(event.target) &&
        !event.composedPath().some((node) => node instanceof Element && node.matches('[role="menu"]'))) nativeBranch = null;
  }, true);
  document.addEventListener('touchstart', (event) => {
    if (event.composedPath().includes(host)) return;
    jumpPin = null;
    if (operation && !operation.restoring) operation.cancelled = true;
  }, { capture: true, passive: true });
  const observer = new MutationObserver((mutations) => {
    if (mutations.every((mutation) => mutation.target === host || host.contains(mutation.target))) return;
    scheduleScan();
  });
  observer.observe(document.documentElement, { subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['class','data-theme','data-turn-key','data-testid','data-message-id','data-chatgpt-search-message-ids','data-chatgpt-search-unit-key','data-message-author-role','hidden','aria-hidden','aria-busy'] });
  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, { attributes:true, attributeFilter:['class','style','data-theme'] });
  themeObserver.observe(document.body, { attributes:true, attributeFilter:['class','style','data-theme'] });
  matchMedia('(prefers-color-scheme:dark)').addEventListener('change', applyTheme);
  window.addEventListener('resize', () => { $('.target').hidden = true; scheduleScan(); });
  setInterval(() => { checkContext(); applyTheme(); }, 750);
  try {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'compass:toggle') { setOpen(!open, true); sendResponse({ ok:true }); }
    });
    chrome.storage.local.get('compassPreferences').then(({ compassPreferences:prefs }) => {
      if (prefs) {
        if (['auto','dark','light'].includes(prefs.theme)) theme = prefs.theme;
        if (['all','user','assistant'].includes(prefs.filter)) filter = prefs.filter;
      }
      $('select').value = theme; applyTheme(); render();
    }).catch(() => {});
  } catch { /* Page still works if the extension has just been reloaded. */ }
  scan(); applyTheme();
})();
