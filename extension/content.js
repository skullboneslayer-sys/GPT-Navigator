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
  let activeId = null, filter = 'all', theme = 'auto', route = location.pathname + location.search;
  let root = C.conversationRoot(), scanTimer = null, scrollTimer = null, operation = null;
  let complete = false, open = false, signature = '', toastTimer = null, highlightTimer = null;
  let restoring = false, session = 0, headHydrating = 0;
  let jumpPin = null;
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
    fallbackIds = new WeakMap(); sequence = 0;
    identityAliases.clear();
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
  function scan() {
    checkContext();
    if (!root?.isConnected) return [];
    const observed = C.readMessages(root, fallbackIds, () => ++sequence);
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
    // An unloaded ordinal is not an identity. Retaining it creates phantom rows
    // when the same partial turn is remounted with hydrated keys.
    index = index.filter((entry) => !entry.transient || (entry.element.isConnected && observed.some((message) => message.id === entry.id)));
    // Separate the immutable message identity from its slot in a turn.
    for (const message of observed) {
      const old = index.find((entry) => entry.slot && entry.slot === message.slot);
      if (!old) continue;
      if (old.id !== message.id || !compatible(old, message)) {
        jumpPin = null;
        if (operation) operation.cancelled = true;
        index.splice(index.indexOf(old));
        complete = false;
        setStatus('Conversation branch changed. Index full chat again for the current branch.');
        break;
      }
    }
    visible = observed;
    C.mergeMessages(index, observed, { headHydration: headHydrating > 0, historyPrepend: headHydrating > 0 || [...new Set(observed.map((message) => message.scroller))].some((scroller) => C.historyLoading(scroller, { olderOnly: true })) });
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
    const busy = !!operation;
    $('.index').textContent = busy ? 'Cancel' : 'Index full chat';
    $('.refresh').disabled = busy;
    $('.previous').disabled = busy || !index.some((message) => message.role === 'user');
    $('.next').disabled = $('.previous').disabled;
  }
  function updateActive() {
    if (!visible.length) { activeId = null; jumpPin = null; markActive(); return; }
    // Jumps align the target at 76px. Track just inside it so a preceding
    // message's final pixels cannot steal selection and skip a compact step.
    const readingOffset = 80;
    const mounted = visible.filter((message) => message.element.isConnected);
    // A short final reply cannot always reach the reading line at the bottom.
    // Keep the exact selection until scrolling changes the user's position.
    if (jumpPin) {
      const pinned = mounted.find((message) => message.id === canonicalId(jumpPin.id) && message.scroller === jumpPin.scroller);
      const rect = pinned?.element.getBoundingClientRect(), view = pinned ? C.viewport(pinned.scroller) : null;
      if (pinned && Math.abs(C.scrollPosition(pinned.scroller) - jumpPin.position) <= 2 && rect.bottom > view.top && rect.top < view.bottom) {
        jumpPin.id = pinned.id; activeId = pinned.id;
        markActive();
        return;
      }
      jumpPin = null;
    }
    const candidates = mounted.filter((message) => {
      const rect = message.element.getBoundingClientRect();
      const view = C.viewport(message.scroller);
      return rect.bottom > view.top + readingOffset && rect.top < view.bottom;
    });
    const nearest = candidates.sort((a, b) => {
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
  function cancelled(task) {
    checkContext();
    return task.cancelled || task.session !== session || !root?.isConnected;
  }
  function capturePosition(scroller) {
    const view = C.viewport(scroller);
    const anchor = visible.find((message) => {
      const rect = message.element.getBoundingClientRect();
      return message.element.isConnected && rect.bottom > view.top && rect.top < view.bottom;
    });
    const top = C.scrollPosition(scroller);
    return { top, fromEnd: Math.max(0, scroller.scrollHeight - scroller.clientHeight - top), id: anchor?.id, anchor: anchor ? { ...anchor } : null, offset: anchor ? anchor.element.getBoundingClientRect().top - view.top : 0 };
  }
  async function restorePosition(scroller, position, task) {
    checkContext();
    if (task.session !== session || route !== task.route) return false;
    restoring = true;
    task.restoreClamped = false;
    try {
      const current = index.find((message) => message.id === canonicalId(position.id));
      // Prepending older history moves absolute coordinates. The distance from
      // the end is another candidate that can remount the original message;
      // its immutable identity still has to match before restoring the offset.
      const endPosition = Math.max(0, scroller.scrollHeight - scroller.clientHeight - position.fromEnd);
      const observedPosition = current ? current.y - position.offset : position.top;
      const candidates = current?.element.isConnected ? [observedPosition, endPosition] : [endPosition, observedPosition];
      let exact = null;
      for (const candidate of new Set(candidates)) {
        move(scroller, candidate);
        await delay(220);
        checkContext();
        if (task.session !== session || route !== task.route) return false;
        exact = position.id ? resolve(position.id, position.anchor) : null;
        if (exact) break;
      }
      const anchor = canonicalTarget(position.anchor);
      const latest = index.find((message) => message.id === anchor?.id);
      if (!exact && anchor?.stable && latest) {
        const restoreTask = { ...task, cancelled:false, started:Date.now(), limit:12000 };
        exact = await seek({ ...anchor, y:latest.y }, scroller, restoreTask);
      }
      checkContext();
      if (task.session !== session || route !== task.route) return false;
      for (let attempt = 0; exact && attempt < 3; attempt++) {
        move(scroller, C.scrollPosition(scroller) + exact.element.getBoundingClientRect().top - C.viewport(scroller).top - position.offset);
        await delay(140);
        checkContext();
        if (task.session !== session || route !== task.route) return false;
        exact = resolve(position.id, position.anchor);
        if (exact && Math.abs(exact.element.getBoundingClientRect().top - C.viewport(scroller).top - position.offset) <= 3) return true;
      }
      if (exact) {
        const rect = exact.element.getBoundingClientRect(), view = C.viewport(scroller);
        const desired = C.scrollPosition(scroller) + rect.top - view.top - position.offset;
        const maximum = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        if ((desired < -3 || desired > maximum + 3) && rect.bottom > view.top && rect.top < view.bottom) {
          task.restoreClamped = true;
          toast('Returned to your original message. Its previous reading offset no longer fits the page.');
          return false;
        }
      }
      move(scroller, Math.max(0, scroller.scrollHeight - scroller.clientHeight - position.fromEnd));
      if (position.id) toast('Original message did not reload. Restored an approximate scroll position.');
      return !position.id;
    } finally { restoring = false; }
  }
  function startOperation(kind) {
    if (operation) { operation.cancelled = true; return null; }
    jumpPin = null;
    const task = { kind, cancelled: false, session, route, started: Date.now() };
    operation = task;
    updateCounts();
    return task;
  }
  function finishOperation(task) {
    if (operation === task) { operation = null; render(); }
  }
  function operationTimeLeft(task) {
    return (task.limit || (task.kind === 'index' ? 180000 : 120000)) - (Date.now() - task.started);
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
    const pending = C.historyLoading(scroller) || inView.some((message) => message.transient);
    const boundary = stable.slice(0, 3).map((message) => canonicalId(message.id)).join('|');
    const progress = `${scroller.scrollHeight}:${index.length}:${boundary}`;
    return {
      messages, hasContent: inView.length > 0, head: stable[0], boundary, pending,
      leadingGap: stable.length ? stable[0].element.getBoundingClientRect().top - view.top : Infinity,
      progress, signal: `${progress}:${pending}`
    };
  }
  async function settleViewport(scroller, task, { minimum = 180, maximum = 2500, quiet = 180, stopOnPending = false } = {}) {
    const started = Date.now();
    let state = hydrationState(scroller), signature = state.signal, quietSince = started;
    while (!cancelled(task) && operationTimeLeft(task) > 0) {
      state = hydrationState(scroller);
      if (stopOnPending && state.pending) return { ...state, settled: false };
      if (state.signal !== signature) { signature = state.signal; quietSince = Date.now(); }
      if (state.hasContent && !state.pending && Date.now() - started >= minimum && Date.now() - quietSince >= quiet) return { ...state, settled: true };
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
    headHydrating++;
    try { return await hydrateHeadViewport(scroller, task, options); }
    finally { headHydrating--; }
  }
  async function hydrateHeadViewport(scroller, task, { quiet = 2500, maximum = 20000, idle = maximum } = {}) {
    const started = Date.now(), hardDeadline = started + Math.min(maximum, Math.max(0, operationTimeLeft(task)));
    let deadline = Math.min(hardDeadline, started + idle);
    move(scroller, 0);
    let state = hydrationState(scroller), signature = state.signal, progress = state.progress, quietSince = started, probedAnchor = false, progressed = false;
    while (!cancelled(task) && Date.now() < deadline && operationTimeLeft(task) > 0) {
      state = hydrationState(scroller);
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
      const state = await settleViewport(scroller, task, { stopOnPending: true });
      if (cancelled(task)) break;
      if (state.pending) return { bottom: false, blank, needsHead: true };
      blank ||= !state.hasContent || state.pending;
      setStatus(`Indexing… ${index.length} messages found. Cancel to return to your place.`);
      const maximum = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      if (C.scrollPosition(scroller) >= maximum - 3) {
        const bottom = await settleViewport(scroller, task, { minimum: 500, maximum: 3500, quiet: 350, stopOnPending: true });
        if (bottom.pending) return { bottom: false, blank, needsHead: true };
        if (C.scrollPosition(scroller) >= scroller.scrollHeight - scroller.clientHeight - 3 && !bottom.pending) return { bottom: true, blank: blank || !bottom.hasContent };
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
    const task = startOperation('index'); if (!task) return;
    const position = capturePosition(scroller);
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
      if (task.session === session) {
        complete = verified;
        completedHeadId = complete ? index.find((message) => message.stable)?.id || null : null;
        setStatus(complete ? `Scan finished: ${index.length} messages. Returning to your place.` : `${index.length} messages indexed. ChatGPT did not finish loading; try another scan.`);
      }
    } catch (error) {
      setStatus('The page changed during indexing. Refresh the index and try again.');
      console.warn('[GPT-Navigator] Index interrupted:', error.message);
    } finally {
      if (task.session === session) {
        const restored = await restorePosition(scroller, position, task);
        if (!restored && task.session === session) setStatus(task.restoreClamped ? `${task.cancelled ? 'Scan cancelled' : complete ? `Full page scan finished · ${index.length} messages` : 'Index retained'}. Returned to your original message; its previous reading offset no longer fits.` : 'Index retained. ChatGPT could not reload your original message; position restored approximately.');
        else if (task.cancelled) setStatus(`Scan cancelled. ${index.length} messages retained; index may be partial.`);
        else if (complete) setStatus(`Full page scan finished · ${index.length} messages.`);
      }
      finishOperation(task);
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
    return { ...target, id, stable: current?.stable ?? target.stable };
  }
  function resolve(id, expected) {
    const observed = scan(), canonical = canonicalId(id), target = canonicalTarget(expected);
    return observed.find((message) => message.id === canonical && message.element.isConnected && (!target || (compatible(target, message) && (target.stable || target.element === message.element) && (target.messageId || target.element === message.element || target.text === message.text))));
  }
  async function align(message, task) {
    const scroller = message.scroller;
    for (let attempt = 0; attempt < 4; attempt++) {
      if (cancelled(task)) return null;
      const current = resolve(message.id, message);
      if (!current) return null;
      const view = C.viewport(scroller);
      move(scroller, C.scrollPosition(scroller) + current.element.getBoundingClientRect().top - view.top - 76);
      await delay(140);
      const verified = resolve(message.id, message);
      if (!verified) return null;
      const rect = verified.element.getBoundingClientRect();
      const actualView = C.viewport(scroller);
      if (rect.top >= actualView.top - 2 && rect.top < actualView.bottom - 12 && rect.bottom > actualView.top) return verified;
    }
    return null;
  }
  async function seek(target, scroller, task) {
    target = canonicalTarget(target);
    if (cancelled(task) || !target.stable) return null;
    // Try the observed coordinate first, then a bounded sweep if ChatGPT reflowed.
    move(scroller, target.y - 76);
    await settleViewport(scroller, task, { minimum: 260, maximum: 3000 });
    let found = resolve(target.id, target);
    if (found) return found;
    const maximum = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    const expected = Math.max(0, Math.min(maximum, target.y - 76));
    for (let radius = 1; radius <= 5; radius++) {
      for (const sign of [-1, 1]) {
        if (cancelled(task) || operationTimeLeft(task) <= 0) return null;
        move(scroller, expected + sign * radius * scroller.clientHeight * .7);
        await settleViewport(scroller, task, { minimum: 160, maximum: 2500 });
        found = resolve(target.id, target);
        if (found) return found;
      }
    }
    for (let pass = 0; pass < 3 && operationTimeLeft(task) > 0; pass++) {
      const head = await hydrateHead(scroller, task, { maximum: Math.min(20000, operationTimeLeft(task)) });
      if (cancelled(task)) return null;
      for (let step = 0; step < 3000 && operationTimeLeft(task) > 0; step++) {
        const state = await settleViewport(scroller, task);
        if (cancelled(task)) return null;
        found = resolve(target.id, target);
        if (found) return found;
        setStatus(`Locating exact message… ${index.findIndex((message) => message.id === canonicalId(target.id)) + 1}. Cancel to return to your place.`);
        const bottom = scroller.scrollHeight - scroller.clientHeight;
        if (C.scrollPosition(scroller) >= bottom - 3) break;
        const before = C.scrollPosition(scroller);
        move(scroller, scanDestination(scroller, state.messages));
        if (!await waitForScan(task, 160) || Math.abs(C.scrollPosition(scroller) - before) < 2) return null;
      }
      if (head.settled) return null;
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
    if (operation) { toast('Finish or cancel the current scan first.'); return; }
    const originSession = session, originRoute = location.pathname + location.search;
    const stored = index.find((message) => message.id === canonicalId(id)); if (!stored) return;
    let target = { ...stored };
    scan();
    target = canonicalTarget(target);
    if (originSession !== session || originRoute !== route || !index.some((message) => message.id === target.id)) return;
    const task = startOperation('jump'); if (!task) return;
    const scroller = mainScroller(), position = capturePosition(scroller);
    let success = false;
    try {
      const found = resolve(target.id, target) || await seek(target, scroller, task);
      const exact = found ? await align(found, task) : null;
      if (exact && !cancelled(task)) {
        success = true; activeId = exact.id;
        jumpPin = { id:exact.id, scroller:exact.scroller, position:C.scrollPosition(exact.scroller) };
        render(); highlight(exact);
        setStatus(`At message ${index.findIndex((message) => message.id === exact.id) + 1} · ${exact.role === 'user' ? 'Your prompt' : 'ChatGPT reply'}.`);
        if (innerWidth < 700) setOpen(false);
      } else if (!cancelled(task)) {
        setStatus('Exact message could not be loaded. Refresh the index or index full chat again.');
        toast('ChatGPT did not load that exact message. Your place will be restored.');
      }
    } catch (error) {
      setStatus('The page changed during navigation. Refresh the index and try again.');
      console.warn('[GPT-Navigator] Jump interrupted:', error.message);
    } finally {
      if (!success) await restorePosition(scroller, position, task);
      if (task.cancelled && task.session === session) setStatus('Navigation cancelled. Returned to your place.');
      finishOperation(task);
    }
  }
  function adjacent(direction) {
    scan();
    const current = index.findIndex((message) => message.id === canonicalId(activeId));
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
  $('.index').addEventListener('click', () => { if (operation) { operation.cancelled = true; setStatus('Cancelling… returning to your place.'); } else fullScan(); });
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
  document.addEventListener('keydown', (event) => {
    if (event.repeat || C.isEditable(event)) return;
    if (event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey && ['ArrowUp','ArrowDown'].includes(event.code)) {
      event.preventDefault(); event.stopPropagation();
      adjacent(event.code === 'ArrowUp' ? -1 : 1);
    }
  }, true);
  document.addEventListener('scroll', (event) => {
    if (event.composedPath().includes(host)) return;
    $('.target').hidden = true;
    if (!scrollTimer) scrollTimer = setTimeout(() => { scrollTimer = null; scan(); }, 120);
  }, true);
  document.addEventListener('wheel', (event) => {
    if (operation && !restoring && !event.composedPath().includes(host)) { operation.cancelled = true; setStatus('Scan cancelled by scrolling. Returning to your place.'); }
  }, { capture: true, passive: true });
  document.addEventListener('touchstart', (event) => {
    if (operation && !restoring && !event.composedPath().includes(host)) operation.cancelled = true;
  }, { capture: true, passive: true });
  const observer = new MutationObserver((mutations) => {
    if (mutations.every((mutation) => mutation.target === host || host.contains(mutation.target))) return;
    scheduleScan();
  });
  observer.observe(document.documentElement, { subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['class','data-theme','data-turn-key','data-message-id','data-chatgpt-search-message-ids','data-chatgpt-search-unit-key','data-message-author-role','aria-hidden'] });
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
