(() => {
  'use strict';
  if (document.getElementById('conversation-compass-host')) return;
  const C = globalThis.ConversationCompassCore;
  if (!C) return;
  const I = globalThis.GPTNavI18n;
  const version = chrome.runtime.getManifest().version;
  let language = 'auto';
  const t = (key, values) => I.translate(language, key, values);
  const isMac = /mac/iu.test(navigator.userAgentData?.platform || navigator.platform || '');
  const modifier = isMac ? '⌘' : 'Ctrl';
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
      .panel { pointer-events:auto; position:fixed; right:16px; top:80px; bottom:20px; width:354px; max-height:800px; max-width:calc(100vw - 24px); display:flex; flex-direction:column; border:1px solid var(--line); border-radius:18px; background:var(--bg); box-shadow:var(--shadow); overflow:auto; overscroll-behavior:contain; scrollbar-width:thin; }
      header { display:flex; gap:10px; align-items:center; padding:17px 17px 12px; }
      .brand { flex:1; min-width:0; }
      .brand-title { display:flex; flex-wrap:wrap; align-items:center; gap:6px; }
      .update-badge { border:1px solid var(--accent); border-radius:5px; background:var(--tint); color:var(--text); padding:2px 5px; font-size:10px; line-height:1.3; font-weight:700; }
      .update-badge:hover { background:var(--hover); }
      .update-wrap { display:inline-flex; }
      .update-tooltip { position:absolute; top:55px; left:16px; right:16px; z-index:4; background:var(--surface); border:1px solid var(--line); border-radius:10px; box-shadow:var(--shadow); padding:12px 14px; font-size:12px; font-weight:400; line-height:1.5; max-height:calc(100% - 75px); overflow:auto; overscroll-behavior:contain; scrollbar-width:thin; }
      .update-tooltip strong { display:block; font-size:13px; }
      .update-tooltip ul { margin:8px 0; padding-left:17px; }
      .update-tooltip li { margin:5px 0; }
      .update-tooltip p { margin:8px 0 0; color:var(--muted); font-size:11px; }
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
      .settings { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; padding:9px 16px; border-top:1px solid var(--line); color:var(--muted); font-size:11px; gap:8px; }
      .settings label { display:flex; align-items:center; gap:5px; }
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
      @media(max-height:575px) { .panel { top:8px; bottom:8px; } .list { min-height:54px; } }
      @media(prefers-reduced-motion:no-preference) { .message,.filter { transition:background .12s; } .rail { transition:width .16s ease,background .12s; } }
    </style>
    <nav class="rail" data-expanded="false" aria-label="Prompt navigation bars" hidden><div class="rail-bars"></div></nav>
    <section id="compass-panel" class="panel" aria-label="Conversation contents" hidden>
      <header><svg class="glyph" viewBox="0 0 16 16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M6 3.5H12 M6 5.5H12 M6 7.5H12 M6 11.5H12" stroke-width="1" opacity=".6"/><path d="M4 9.5H12" stroke-width="1.25"/></g></svg><div class="brand"><div class="brand-title"><h2>GPT-Navigator</h2><span class="update-wrap" hidden><button class="update-badge" type="button" aria-describedby="update-details" hidden></button><span class="update-tooltip" id="update-details" role="tooltip" hidden><strong></strong><ul></ul><p></p></span></span></div><p class="eyebrow">Your place in a long conversation</p></div><span class="count">0</span><button class="icon close" type="button" aria-label="Close full navigator" title="Close full navigator (Escape)">×</button></header>
      <div class="search-wrap"><span aria-hidden="true">⌕</span><input type="search" aria-label="Search messages" placeholder="Find a word, phrase, or topic…" autocomplete="off" spellcheck="false"></div>
      <div class="filters" role="group" aria-label="Message filter"><button class="filter" data-filter="all" type="button" aria-pressed="true">All messages</button><button class="filter" data-filter="user" type="button" aria-pressed="false">My prompts</button><button class="filter" data-filter="assistant" type="button" aria-pressed="false">Replies</button></div>
      <div class="summary"><strong class="total">0 messages found</strong><span class="coverage">Page index</span></div>
      <ol class="list" aria-label="Messages in conversation order"></ol>
      <div class="controls"><button class="nav previous" type="button" title="Previous prompt (Ctrl+Shift+Up)">↑ Previous prompt</button><button class="nav next" type="button" title="Next prompt (Ctrl+Shift+Down)">↓ Next prompt</button></div>
      <div class="index-row"><button class="index" type="button">Index full chat</button><button class="utility refresh" type="button" title="Clear the index and rescan the page">Refresh</button></div>
      <p class="status" role="status" aria-live="polite">Only messages loaded by ChatGPT are listed. Index full chat to find older turns.</p>
      <footer class="settings"><label><span class="theme-label">Theme</span><select class="theme" aria-label="Navigator theme"><option value="auto">Match ChatGPT</option><option value="dark">Dark</option><option value="light">Light</option></select></label><label><span class="language-label">Language</span><select class="language" aria-label="Language"><option value="auto">Automatic</option><option value="en" lang="en">English</option><option value="ko" lang="ko">한국어</option><option value="ja" lang="ja">日本語</option><option value="zh-CN" lang="zh-CN">简体中文</option><option value="zh-TW" lang="zh-TW">繁體中文</option></select></label><span class="hint"></span></footer>
    </section>
    <div class="target" hidden></div><div class="toast" role="status" hidden></div>`;
  document.documentElement.appendChild(host);
  const $ = (selector) => shadow.querySelector(selector);
  const panel = $('.panel'), list = $('.list'), search = $('input'), status = $('.status');
  let promptButtons = new Map(), messageButtons = new Map();
  let markedPrompt = null, markedMessage = null, tabbablePrompt = null;
  let index = [], visible = [], fallbackIds = new WeakMap(), sequence = 0;
  const identityAliases = new Map();
  const regeneratedReplies = new Map();
  let activeId = null, filter = 'all', theme = 'auto', route = conversationRoute();
  const outgoingRoutes = new Map();
  let root = C.conversationRoot(), scanTimer = null, scrollTimer = null, operation = null;
  let complete = false, open = false, signature = '', toastTimer = null, highlightTimer = null;
  let session = 0;
  let historyRequest = null, historyAttempted = false, historyRetried = false;
  let historyById = null;
  let pendingHistory = null;
  let jumpPin = null;
  let knownTail = null, pendingTail = null, nativeBranch = null;
  let completedHeadId = null, railExpanded = false, railTimer = null, railSignature = '', suppressRailFocus = false, touchReveal = false, ignoreTouchClick = false;
  let statusMessage = [['initial']], toastMessage = [], lastWheelAt = -Infinity;
  let updateVersion = '', seenVersion = '';
  let releaseNotes = null, loadingReleaseNotes = false;
  let updateStateRevision = 0;
  let preferencesRevision = 0, shortcutRevision = 0, toggleShortcut = '', returnFocus = null;
  async function loadReleaseNotes() {
    if (releaseNotes || loadingReleaseNotes) return;
    loadingReleaseNotes = true;
    try {
      const result = await chrome.runtime.sendMessage({ type:'compass:get-release-notes' });
      if (result?.ok) {
        releaseNotes = result.notes;
        renderReleaseNotes();
      }
    } catch { /* The extension may have been reloaded. Retry on the next hover. */ }
    finally { loadingReleaseNotes = false; }
  }
  function renderReleaseNotes() {
    const locale = language === 'auto' ? I.browserLanguage() : language;
    const lines = releaseNotes?.[locale] ?? releaseNotes?.en;
    const list = $('.update-tooltip ul');
    list.replaceChildren();
    if (Array.isArray(lines)) {
      for (const line of lines) {
        if (typeof line !== 'string' || !line.trim()) continue;
        const item = document.createElement('li');
        item.textContent = line;
        list.append(item);
      }
    }
    list.hidden = !list.childElementCount;
  }
  function renderUpdateBadge() {
    const badge = $('.update-badge');
    badge.hidden = updateVersion !== version || seenVersion === version;
    badge.textContent = t('newBadge');
    $('.update-wrap').hidden = badge.hidden;
    if (badge.hidden) $('.update-tooltip').hidden = true;
    badge.setAttribute('aria-label', t('ackUpdate', { version }));
    $('.update-tooltip strong').textContent = t('updateHeading', { version });
    $('.update-tooltip p').textContent = t('dismissUpdate');
    if (!badge.hidden) {
      renderReleaseNotes();
      void loadReleaseNotes();
    }
  }
  function translated(parts) { return parts.map(([key, values]) => t(key, values)).join(' '); }
  function observeSearchText(message, record) {
    if (!record?.text || message.placeholder || record.renderedText === message.text) return;
    if (record.renderedText !== undefined) {
      // An existing ID can be reused for an in-place replacement. Collapsing,
      // expanding or continuing the saved text should keep its search coverage.
      const prose = text => C.normalize(text.replace(/!?\[([^\]]*)\]\([^)]+\)/gu, '$1')
        .replace(/[*_`~#>|]/gu, '').replace(/(?:…|\.{3})\s*$/u, ''));
      const saved = prose(record.text), current = prose(message.text);
      record.textReplaced = !current || !(saved.includes(current) || current.includes(saved));
    }
    record.renderedText = message.text;
  }
  function historyText(message) {
    const record = historyById?.get(message.messageId);
    return record && !record.textReplaced ? record.text : '';
  }
  function messageText(message) {
    if (!message.placeholder) return message.text;
    return historyText(message) || t(message.role === 'user' ? 'attachment' : 'nonText');
  }
  function matchingText(message, needle) {
    const displayed = messageText(message);
    if (!needle || displayed.toLocaleLowerCase().includes(needle)) return displayed;
    // A collapsed bubble may omit searchable text. Render the preview from the
    // same source that matched so the highlighted words are actually visible.
    const full = historyText(message);
    return full && full !== displayed && full.toLocaleLowerCase().includes(needle) ? full : null;
  }
  function applyLanguage() {
    host.lang = language === 'auto' ? I.browserLanguage() : language;
    for (const [selector, key] of Object.entries({ '.eyebrow':'tagline', '[data-filter="all"]':'all', '[data-filter="user"]':'prompts', '[data-filter="assistant"]':'replies', '.refresh':'refresh', '.theme-label':'theme', '.language-label':'language', '.theme option[value="auto"]':'match', '.theme option[value="dark"]':'dark', '.theme option[value="light"]':'light', '.language option[value="auto"]':'automatic' })) $(selector).textContent = t(key);
    for (const [selector, key] of Object.entries({ '.rail':'rail', '.panel':'contents', '.close':'close', 'input':'search', '.filters':'filter', '.list':'messagesOrder', '.theme':'themeLabel', '.language':'language' })) $(selector).setAttribute('aria-label', t(key));
    search.placeholder = t('searchHint');
    $('.close').title = `${t('close')} (Escape)`;
    $('.refresh').title = t('refreshHint');
    $('.hint').title = t('shortcutHint');
    renderShortcut();
    $('.previous').textContent = `↑ ${t('previous')}`;
    $('.next').textContent = `↓ ${t('next')}`;
    $('.previous').title = `${t('previous')} (${modifier}+Shift+↑)`;
    $('.next').title = `${t('next')} (${modifier}+Shift+↓)`;
    $('.language').value = language;
    status.textContent = translated(statusMessage);
    $('.toast').textContent = translated(toastMessage);
    renderUpdateBadge();
    railSignature = '';
    render();
  }

  function savePreferences(patch) {
    preferencesRevision++;
    try { chrome.runtime.sendMessage({ type:'compass:save-preferences', patch }).catch(() => {}); } catch { /* extension was reloaded */ }
  }
  function applyPreferences(prefs = {}) {
    const previousLanguage = language;
    theme = ['auto','dark','light'].includes(prefs.theme) ? prefs.theme : 'auto';
    filter = ['all','user','assistant'].includes(prefs.filter) ? prefs.filter : 'all';
    language = ['auto', ...I.locales].includes(prefs.language) ? prefs.language : 'auto';
    $('.theme').value = theme;
    applyTheme();
    if (language !== previousLanguage) applyLanguage();
    else render();
  }
  function renderShortcut() {
    $('.hint').textContent = toggleShortcut;
    $('.hint').hidden = !toggleShortcut;
  }
  async function refreshShortcut() {
    const revision = ++shortcutRevision;
    let shortcut = '';
    try {
      const response = await chrome.runtime.sendMessage({ type:'compass:get-shortcut' });
      if (response?.ok && typeof response.shortcut === 'string') shortcut = response.shortcut;
    } catch { /* An unavailable or unassigned shortcut has no hint. */ }
    if (revision !== shortcutRevision) return;
    toggleShortcut = shortcut;
    renderShortcut();
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
  function setStatus(key, values) { statusMessage = Array.isArray(key) ? key : [[key, values]]; status.textContent = translated(statusMessage); }
  function toast(key, values) {
    toastMessage = Array.isArray(key) ? key : [[key, values]];
    $('.toast').textContent = translated(toastMessage);
    $('.toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('.toast').hidden = true; }, 3500);
  }
  function setOpen(value, focus = false) {
    const restoreFocus = !value && panel.contains(shadow.activeElement);
    if (value && !open) returnFocus = focusedElement();
    open = value;
    panel.hidden = !value;
    if (!value) {
      list.replaceChildren();
      messageButtons.clear();
      markedMessage = null;
    }
    collapseRail();
    $('.rail').hidden = value || !index.some((message) => message.role === 'user');
    if (value) { scan(); render(); refreshShortcut(); if (focus) search.focus(); }
    else if (restoreFocus) {
      suppressRailFocus = true;
      const button = $('.prompt-bar[aria-current="true"]') || $('.prompt-bar');
      const composer = document.querySelector('#prompt-textarea, main [contenteditable="true"][role="textbox"], main textarea');
      if (![button, returnFocus, composer].some(focusAvailable)) {
        const fallback = document.body;
        const tabindex = fallback.getAttribute('tabindex');
        fallback.setAttribute('tabindex', '-1');
        fallback.focus({ preventScroll:true });
        if (tabindex === null) fallback.removeAttribute('tabindex');
        else fallback.setAttribute('tabindex', tabindex);
      }
      suppressRailFocus = false;
      returnFocus = null;
    }
  }
  function focusedElement() {
    let element = document.activeElement;
    while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
    return element;
  }
  function focusAvailable(element) {
    if (!element?.isConnected || element === document.body || element === document.documentElement || !element.getClientRects().length || element.matches(':disabled, [inert], [hidden]') || element.closest('[inert]')) return false;
    element.focus({ preventScroll:true });
    return focusedElement() === element;
  }
  function reset(message = 'initial') {
    resetHistoryRead();
    session++;
    if (operation) operation.cancelled = true;
    index = []; visible = []; activeId = null; complete = false; signature = '';
    completedHeadId = null; railSignature = null; collapseRail();
    list.replaceChildren();
    messageButtons.clear();
    markedMessage = null;
    if (message === 'newChat' || !returnFocus?.isConnected) returnFocus = null;
    jumpPin = null;
    knownTail = null; pendingTail = null; nativeBranch = null;
    fallbackIds = new WeakMap(); sequence = 0;
    identityAliases.clear();
    regeneratedReplies.clear();
    $('.target').hidden = true;
    setStatus(message);
    render();
  }
  function conversationRoute() {
    const chat = /^\/(?:g\/[^/]+\/)?c\/([a-z\d_-]+)\/?$/iu.exec(location.pathname);
    return chat ? '/c/' + chat[1] : location.pathname;
  }
  function checkContext() {
    const currentRoute = conversationRoute();
    const currentRoot = C.conversationRoot();
    if (currentRoute !== route || currentRoot !== root) {
      if (currentRoute !== route) {
        outgoingRoutes.delete(currentRoute);
        for (const outgoing of outgoingRoutes.values()) outgoing.firstPrompt = null;
        if (visible.length) {
          const firstPrompt = !route.startsWith('/c/') && currentRoute.startsWith('/c/') &&
            visible.length === 1 && visible[0].role === 'user' ? visible[0].id : null;
          outgoingRoutes.set(route, {
            firstPrompt,
            ids:new Set(index.filter(row => row.stable).map(row => row.id)),
            nodes:new WeakMap(visible.map(row => [row.element, row.messageId || row.slot || row.role]))
          });
        }
      }
      route = currentRoute;
      root = currentRoot;
      reset('newChat');
      search.value = '';
      scheduleScan(0);
    }
  }
  function invalidateBranch(removed, tail = null) {
    resetHistoryRead();
    index = index.filter((entry) => !removed.has(entry.id));
    session++;
    if (operation) operation.cancelled = true;
    identityAliases.clear();
    activeId = null; jumpPin = null;
    complete = false; completedHeadId = null;
    knownTail = tail; pendingTail = null; nativeBranch = null;
    $('.target').hidden = true;
    setStatus('branchChanged');
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
  function readMounted(byId = historyById) {
    const mounted = C.readMessages(root, fallbackIds, () => ++sequence, byId);
    if (!outgoingRoutes.size) return mounted;
    let rows = mounted;
    const tail = mountedTail(mounted);
    for (const [oldRoute, outgoing] of outgoingRoutes) {
      // During SPA navigation the URL may already identify B while A's old
      // wrappers are still mounted. A recycled wrapper with a new ID is valid.
      const retained = row => outgoing.nodes.get(row.element) === (row.messageId || row.slot || row.role);
      if (outgoing.firstPrompt) {
        // ChatGPT assigns a saved URL to a new conversation after the first
        // prompt is already on screen. Keep it provisional until its reply
        // arrives, the history verifies it, or a different transcript paints.
        const first = mounted.find(row => row.id === outgoing.firstPrompt && retained(row));
        if (!first) {
          index = index.filter(row => row.id !== outgoing.firstPrompt);
          outgoing.firstPrompt = null;
        } else if (mounted.some(row => row.role === 'assistant' && adjacentNativeTurns(first, row))) {
          outgoingRoutes.delete(oldRoute);
          continue;
        }
      }
      // A fork can reuse IDs. Fresh wrappers and a distinct terminal identify
      // the new transcript even when history is unavailable. Examine the raw
      // window for each transition so overlapping routes retire independently.
      const replaced = mounted.length && !mounted.some(retained) &&
        (mounted.every(row => !outgoing.ids.has(row.id)) || (tail && !outgoing.ids.has(tail)));
      if (replaced) outgoingRoutes.delete(oldRoute);
      else rows = rows.filter(row => byId?.has(row.messageId) || (outgoing.firstPrompt === row.id && retained(row)) ||
        (!retained(row) && !outgoing.ids.has(row.id)));
    }
    return rows;
  }
  function rememberRegeneration(branch, replacement) {
    const key = branch.predecessor?.id || branch.original.id;
    const reply = regeneratedReplies.get(key) || { versions:new Set(), predecessor:branch.predecessor?.id };
    reply.versions.add(branch.original.id);
    reply.active = replacement?.stable ? replacement.id : null;
    if (reply.active) reply.versions.add(reply.active);
    regeneratedReplies.set(key, reply);
  }
  function displayedReplies(rows, update = false) {
    if (!regeneratedReplies.size) return rows;
    const present = new Set(rows.map(row => row.id)), hidden = new Set();
    for (const reply of regeneratedReplies.values()) {
      if (update && !reply.active && reply.predecessor) {
        const pos = rows.findIndex(row => row.id === reply.predecessor);
        if (pos !== -1) {
          for (let i = pos + 1; i < rows.length && rows[i].role === 'assistant'; i++) {
            if (rows[i].stable && !reply.versions.has(rows[i].id)) {
              reply.active = rows[i].id;
              reply.versions.add(reply.active);
              break;
            }
          }
        }
      }
      if (update && !present.has(reply.active)) {
        const restored = [...reply.versions].filter(id => present.has(id));
        if (restored.length === 1 && (reply.active || !responseGenerating(rows))) {
          const old = index.findIndex(row => row.id === reply.active);
          if (old >= 0) invalidateBranch(new Set(index.slice(old).map(row => row.id)));
          reply.active = restored[0];
        }
      }
      for (const id of reply.versions) if (id !== reply.active) hidden.add(id);
    }
    return rows.filter(row => !hidden.has(row.id));
  }
  function captureNativeBranch(kind, turn, confirmed = kind === 'redo') {
    checkContext();
    if (!root?.contains(turn)) return;
    const role = kind === 'edit' ? 'user' : 'assistant';
    const observed = displayedReplies(readMounted());
    const current = observed.find((entry) => entry.turnElement === turn && entry.role === role);
    const original = index.find((entry) => entry.id === current?.id) ||
      index.find((entry) => entry.turnElement === turn && entry.role === role);
    const cut = original ? index.indexOf(original) : -1;
    if (cut < 0 || !original.stable) return;
    const predecessor = index[cut - 1];
    nativeBranch = {
      kind, original:{ ...original, turnElement:turn }, predecessor:predecessor?.stable ? { ...predecessor } : null,
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
    const testId = button.getAttribute('data-testid');
    const turn = button.closest(nativeTurnSelector);
    if (!turn) {
      if (nativeBranch?.kind === 'redo' && !nativeBranch.confirmed && Date.now() < nativeBranch.until &&
          (button.closest('[role="menu"]') || path.some((node) => node instanceof Element && node.matches('[role="menu"]'))) &&
          (testId === 'regenerate-response-button' || C.nativeAction(button, 'redoChoice') || C.nativeAction(button, 'redo'))) {
        nativeBranch.confirmed = true;
        nativeBranch.until = Date.now() + 30000;
      }
      return;
    }
    if (!root?.contains(turn)) return;
    if (C.nativeAction(button, 'save') || (button.matches('button[type="submit"]') && button.closest('form')?.querySelector('textarea, [contenteditable="true"]'))) { confirmNativeEdit(turn); return; }
    if (C.nativeAction(button, 'cancel') && nativeBranch?.original.turnElement === turn) { nativeBranch = null; return; }
    const kind = testId === 'edit-message-button' || C.nativeAction(button, 'edit') ? 'edit' :
      testId === 'regenerate-response-button' || C.nativeAction(button, 'redo') ? 'redo' : null;
    if (!kind) return;
    const captured = captureNativeBranch(kind, turn, kind === 'redo' && !button.hasAttribute('aria-haspopup'));
    if (captured) captured.trigger = button;
  }
  function responseGenerating(messages) {
    return messages.some((entry) => entry.role === 'assistant' && entry.transient) ||
      [...document.querySelectorAll('button[data-testid="stop-button"], button[aria-label]')]
        .some((stop) => (stop.getAttribute('data-testid') === 'stop-button' || C.nativeAction(stop, 'stop')) && stop.getClientRects().length && !stop.closest('[hidden], [aria-hidden="true"]'));
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
      rememberRegeneration(branch, null);
      invalidateBranch(branch.removed);
      return true;
    }
    if (!replacement && branch.atStart) replacement = observed[0];
    if (!replacement || replacement.role !== original.role ||
        (replacement.id !== original.id && branch.priorIds.has(replacement.id))) return false;
    if (replacement.id === original.id && branch.kind === 'redo' && responseGenerating(observed)) {
      // The stop button often arrives before the new reply. Remove the
      // abandoned suffix once, but keep watching for the actual replacement.
      if (branch.removed.size > 1) {
        const descendants = new Set(branch.removed);
        descendants.delete(original.id);
        invalidateBranch(descendants);
        branch.removed = new Set([original.id]);
        nativeBranch = branch;
      }
      branch.until = Date.now() + 30000;
      return true;
    }
    if (replacement.id === original.id && replacement.text === original.text && !responseGenerating(observed)) return false;
    const removed = new Set(branch.removed);
    if (replacement.id === original.id) removed.delete(original.id);
    else if (branch.kind === 'redo') {
      // Old and regenerated replies can coexist while ChatGPT switches them.
      rememberRegeneration(branch, replacement);
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
  function resetHistoryRead() {
    historyRequest?.abort();
    historyRequest = null;
    historyAttempted = false;
    historyRetried = false;
    historyById = null;
    pendingHistory = null;
  }
  function historyCandidate(records) {
    const keys = records.map(record => `message:${record.id}:${record.role}`);
    const positions = new Map(keys.map((key, i) => [key, i]));
    if (!keys.length || positions.size !== keys.length) throw new Error('Invalid history identities');
    const byId = new Map(records.map(record => [record.id, record]));
    return { records, keys, positions, byId };
  }
  function mountedTail(mounted) {
    const last = mounted.at(-1);
    if (!last?.messageId) return null;
    const view = C.viewport(last.scroller), metrics = C.scrollMetrics(last.scroller);
    const rect = last.element.getBoundingClientRect();
    const atBottom = metrics.position >= metrics.maximum - 3 && rect.bottom > view.top && rect.top < view.bottom;
    const atPhysicalEnd = Math.abs(last.y + rect.height - metrics.maximum - view.height) <= 4;
    return atBottom || atPhysicalEnd ? last.id : null;
  }
  function historyTail(mounted) {
    const physical = mountedTail(mounted);
    if (physical) return physical;
    const last = mounted.at(-1), turn = last?.turnElement;
    if (!last?.messageId || !turn || !root.matches('[data-thread-find-target="conversation"]') ||
        !root.contains(turn) || root === last.scroller) return null;

    // ChatGPT can open at the latest prompt with the entire final reply already
    // mounted below it. Controls belong to the turn, and the composer sits
    // outside the transcript. Check the turn against the virtual list's end.
    const end = turn.getBoundingClientRect().bottom;
    const transcriptStyle = getComputedStyle(root);
    const padding = parseFloat(transcriptStyle.paddingBottom) + parseFloat(transcriptStyle.borderBottomWidth);
    const gap = parseFloat(transcriptStyle.rowGap) || 0;
    for (let node = turn; node !== root; node = node.parentElement) {
      const parent = node.parentElement;
      let expectedEnd = end;
      for (let next = node.nextElementSibling; next; next = next.nextElementSibling) {
        const sibling = next.getBoundingClientRect();
        if (sibling.height > 1) return null;
        // The transcript's zero-height end sentinel occupies one real CSS
        // gap. Count it only when its rendered position agrees with that gap.
        if (parent === root && next.getAttribute('aria-hidden') === 'true' &&
            next.getClientRects().length && Math.abs(sibling.top - expectedEnd - gap) <= 1) {
          expectedEnd = sibling.bottom;
        }
      }
      const box = parent.getBoundingClientRect();
      if (!box.height) continue; // display:contents can wrap the virtual list.
      // A virtualizer can reserve later turns with just a sized parent, even
      // without a spacer sibling. Only the transcript's own padding is chrome.
      if (Math.abs(box.bottom - (parent === root ? padding : 0) - expectedEnd) > 2) return null;
    }
    return last.id;
  }
  function acceptHistory(candidate, mounted, openingTail = null) {
    if (outgoingRoutes.size || mounted.some(message => !message.messageId)) {
      // Validate against the whole rendered transcript. Applying the route
      // quarantine here could hide a conflicting row and make a prefix pass.
      const lookup = candidate.tree ? {get:id => candidate.tree.get(id)?.record} : candidate.byId;
      mounted = displayedReplies(C.readMessages(root, fallbackIds, () => ++sequence, lookup));
    }
    if (!mounted.length) return false;
    const terminalId = historyTail(mounted) || openingTail;
    if (terminalId) {
      if (terminalId !== candidate.keys.at(-1)) return false;
    } else {
      // With the tail off screen, accept only a unique continuation of the
      // messages mounted *now*. A shared prefix before a fork is ambiguous.
      if (!candidate.tree || outgoingRoutes.size) return false;
      const branch = GPTNavHistory.branchFromMiddle(candidate.tree, mounted.at(-1).messageId);
      if (!branch) return false;
      candidate = historyCandidate(branch);
    }
    const { records, keys, positions, byId } = candidate;
    let previous = -1;
    for (const message of mounted) {
      const position = positions.get(message.id);
      if (!message.messageId || position === undefined || position <= previous) return false;
      previous = position;
    }
    const cached = new Map(index.map(message => [message.id, message]));
    for (const message of mounted) cached.set(message.id, message);
    visible = mounted;
    historyById = byId;
    outgoingRoutes.clear();
    for (const message of mounted) observeSearchText(message, byId.get(message.messageId));
    index = records.map((record, i) => {
      const known = cached.get(keys[i]);
      if (known) {
        known.historyIndexed = true;
        return known;
      }
      return { id:keys[i], messageId:record.id, role:record.role, text:record.text,
        historyIndexed:true,
        placeholder:!record.text, stable:true, order:null };
    });
    pendingHistory = null;
    complete = true;
    completedHeadId = keys[0];
    if (!operation) setStatus('historyDone', {count:index.length});
    updateActive();
    render();
    return true;
  }
  async function readHistoryOnOpen(mounted) {
    const id = /^\/c\/([a-z\d_-]+)$/iu.exec(route)?.[1];
    if (!id || !globalThis.GPTNavHistory || complete || operation?.kind === 'index' ||
        (!mounted.length && !outgoingRoutes.size) || nativeBranch) return;
    if (historyAttempted && !pendingHistory) return;
    if (responseGenerating(mounted)) return;
    const currentTail = historyTail(mounted);
    const openingTail = outgoingRoutes.size ? null : currentTail;
    if (pendingHistory) {
      if (acceptHistory(pendingHistory, mounted)) return;
      // Reconsider a previously fetched result locally on scroll. Only a new
      // terminal identity warrants another read of the selected conversation.
      if (currentTail && pendingHistory.checkedTail !== currentTail) {
        historyAttempted = false;
        historyRetried = false;
      }
      if (historyAttempted) return;
      pendingHistory = null;
    }
    historyAttempted = true;
    const request = new AbortController();
    historyRequest = request;
    const timeout = setTimeout(() => request.abort(), 120000);
    if (!operation) setStatus('historyReading');
    let retry = true;
    let retryDelay = 1200;
    try {
      const middle = !openingTail;
      const { records, tree } = await GPTNavHistory.read(id, {signal:request.signal, middle});
      checkContext();
      if (request.signal.aborted) return;
      // The tab can change versions while a request is in flight. Read the
      // current DOM before publishing anything from either transcript.
      const current = displayedReplies(readMounted(), true);
      if (request.signal.aborted) return;
      if (!nativeBranch && !responseGenerating(current)) {
        const candidate = historyCandidate(records);
        candidate.tree = tree;
        if (acceptHistory(candidate, current, openingTail)) return;
        candidate.checkedTail = historyTail(current);
        pendingHistory = candidate;
        retry = Boolean(candidate.checkedTail || openingTail);
      }
    } catch (error) {
      retry = error.retryable || error.name === 'AbortError' || error.name === 'TypeError';
      retryDelay = Math.max(retryDelay, error.retryAfterMs ?? 0);
    } finally { clearTimeout(timeout); }
    if (historyRequest !== request) return;
    if (!operation) setStatus('historyUnavailable');
    // Re-read once if the network or branch changed while older pages loaded.
    // Larger values overflow a browser timer and would retry immediately.
    if (retry && !historyRetried && retryDelay <= 0x7fffffff) {
      historyRetried = true;
      const timer = setTimeout(() => {
        if (historyRequest === request) { historyAttempted = false; scheduleScan(0); }
      }, retryDelay);
      request.signal.addEventListener('abort', () => clearTimeout(timer), {once:true});
    }
  }
  function scan() {
    checkContext();
    if (!root?.isConnected) return [];
    const observed = displayedReplies(readMounted(), true);
    if (historyById) for (const message of observed) observeSearchText(message, historyById.get(message.messageId));
    const seen = new Map(observed.map((entry) => [entry.id, entry]));
    if (historyRequest && !historyById && !complete && !nativeBranch && !operation) {
      // A version switch can replace the whole middle window before history
      // returns. Don't merge two provisional transcripts when different IDs
      // occupy the same turn at the same position in the same scroller.
      const departed = new Map(visible.filter(row => row.messageId && !seen.has(row.id))
        .map(row => [row.y, row]));
      if (observed.some(row => {
        const old = departed.get(row.y);
        return old && row.messageId && row.role === old.role && row.order === old.order && row.scroller === old.scroller;
      })) {
        index = index.filter(row => seen.has(row.id));
        knownTail = pendingTail = null;
      }
    }
    index = C.reconcileMountedRows(index, seen, identityAliases, compatible);
    activeId = canonicalId(activeId);
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
      setStatus('earlierAppeared');
    } else if (complete && !completedHeadId) completedHeadId = head?.id || null;
    updateActive();
    const nextSignature = index.map((message) => `${message.id}:${message.text}`).join('\u0001');
    if (nextSignature !== signature) { signature = nextSignature; render(); }
    else updateCounts();
    applyTheme();
    void readHistoryOnOpen(observed);
    return observed;
  }
  function scheduleScan(delay = 250) {
    if (scanTimer) return;
    scanTimer = setTimeout(() => { scanTimer = null; scan(); }, delay);
  }
  function updateCounts(shown) {
    if (shown === undefined) { const needle = C.normalize(search.value).toLocaleLowerCase(); shown = index.filter((message) => (filter === 'all' || message.role === filter) && (!needle || matchingText(message, needle) !== null)).length; }
    const [key, values] = statusMessage[0];
    if ((key === 'historyDone' || key === 'scanDone') && values?.count !== index.length) {
      setStatus([[key, {count:index.length}], ...statusMessage.slice(1)]);
    }
    $('.count').textContent = String(index.length);
    const categoryTotal = filter === 'all' ? index.length : index.filter((message) => message.role === filter).length;
    const category = filter === 'user' ? 'Prompts' : filter === 'assistant' ? 'Replies' : 'Messages';
    $('.total').textContent = t(`${shown === categoryTotal ? 'found' : 'filtered'}${category}`, { count:categoryTotal, shown });
    $('.coverage').textContent = t(complete ? 'complete' : 'pageIndex');
    $('.index').textContent = t(operation?.kind === 'index' ? 'cancel' : 'index');
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
    const message = messageButtons.get(filter === 'user' ? promptId : activeId) || null;
    if (message !== markedMessage) {
      markedMessage?.setAttribute('aria-current', 'false');
      message?.setAttribute('aria-current', 'true');
      markedMessage = message;
    }
    const prompt = promptButtons.get(promptId) || null;
    if (prompt !== markedPrompt) {
      markedPrompt?.setAttribute('aria-current', 'false');
      prompt?.setAttribute('aria-current', 'true');
      markedPrompt = prompt;
      if (prompt && !operation) revealRailPrompt(promptId);
    }
    const focused = shadow.activeElement;
    const stop = focused?.classList.contains('prompt-bar') ? focused : prompt || $('.rail-bars').firstElementChild;
    if (stop !== tabbablePrompt) {
      if (tabbablePrompt) tabbablePrompt.tabIndex = -1;
      if (stop) stop.tabIndex = 0;
      tabbablePrompt = stop;
    }
  }
  function revealRailPrompt(id) {
    const bars = $('.rail-bars'), bar = promptButtons.get(id);
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
    const existing = promptButtons;
    promptButtons = new Map();
    const barFragment = document.createDocumentFragment();
    prompts.forEach((message, position) => {
      const number = position + 1, preview = C.normalize(messageText(message)).slice(0, 140);
      let bar = existing.get(message.id);
      if (!bar) {
        bar = document.createElement('button'); bar.type = 'button'; bar.className = 'prompt-bar'; bar.dataset.id = message.id;
        bar.setAttribute('aria-current', 'false'); bar.tabIndex = -1;
        const label = document.createElement('span'); label.className = 'rail-label';
        const mark = document.createElement('span'); mark.className = 'rail-mark'; mark.setAttribute('aria-hidden', 'true');
        bar.append(label, mark);
      }
      bar.setAttribute('aria-label', t('promptLabel', { number, preview }));
      bar.querySelector('.rail-label').textContent = preview;
      promptButtons.set(message.id, bar);
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
    const match = C.findTextMatch(text, query);
    const offset = Math.max(0, (match?.start || 0) - 50);
    const preview = `${offset ? '…' : ''}${text.slice(offset, offset + 230)}${text.length > offset + 230 ? '…' : ''}`;
    if (!match) container.textContent = preview;
    else {
      const start = match.start - offset + (offset ? 1 : 0);
      const end = Math.min(match.end - offset, 230) + (offset ? 1 : 0);
      container.append(document.createTextNode(preview.slice(0, start)));
      const mark = document.createElement('mark');
      mark.textContent = preview.slice(start, end);
      container.append(mark, document.createTextNode(preview.slice(end)));
    }
  }
  function render() {
    renderRail();
    for (const button of shadow.querySelectorAll('.filter')) button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    if (!open) { updateCounts(); return; }
    const query = C.normalize(search.value);
    const needle = query.toLocaleLowerCase();
    const shown = [];
    for (const message of index) {
      if (filter !== 'all' && message.role !== filter) continue;
      const text = matchingText(message, needle);
      if (text !== null) shown.push({message, text});
    }
    updateCounts(shown.length);
    const focusedId = shadow.activeElement?.dataset.id;
    const oldScroll = list.scrollTop;
    const fragment = document.createDocumentFragment();
    const numbered = filter === 'all' ? index : index.filter((message) => message.role === filter);
    const ordinals = new Map(numbered.map((message, i) => [message.id, i + 1]));
    const existing = messageButtons;
    messageButtons = new Map();
    for (const {message, text} of shown) {
      const cached = existing.get(message.id);
      const cacheKey = `${host.lang}\0${text}\0${query}\0${ordinals.get(message.id)}\0${filter}`;
      if (cached && cached.parentElement._compassKey === cacheKey) {
        messageButtons.set(message.id, cached); fragment.append(cached.parentElement); continue;
      }
      const item = document.createElement('li'); item.className = 'item';
      const button = document.createElement('button'); button.type = 'button'; button.className = 'message'; button.dataset.id = message.id;
      button.setAttribute('aria-current', 'false');
      item._compassKey = cacheKey;
      const number = ordinals.get(message.id);
      button.title = `${t(filter === 'user' ? 'prompt' : filter === 'assistant' ? 'reply' : 'message')} ${number} · ${message.role === 'user' ? t('you') : 'ChatGPT'}\n${text.slice(0, 800)}`;
      const badge = document.createElement('span'); badge.className = 'number'; badge.textContent = String(number);
      const entry = document.createElement('span'); entry.className = 'entry';
      const role = document.createElement('span'); role.className = `role ${message.role}`; role.textContent = message.role === 'user' ? t('you') : 'ChatGPT';
      const preview = document.createElement('span'); preview.className = 'preview'; appendPreview(preview, text, query);
      messageButtons.set(message.id, button);
      entry.append(role, preview); button.append(badge, entry); item.append(button); fragment.append(item);
    }
    if (!shown.length) {
      const empty = document.createElement('li'); empty.className = 'empty';
      const title = document.createElement('strong'); title.textContent = t(query ? 'noMatches' : 'startHere');
      empty.append(title, document.createTextNode(t(query ? 'trySearch' : 'openChat')));
      fragment.append(empty);
    }
    list.replaceChildren(fragment);
    list.scrollTop = oldScroll;
    if (focusedId) messageButtons.get(focusedId)?.focus({ preventScroll: true });
    markActive();
  }
  function mainScroller() {
    const sample = visible.find((message) => message.element?.isConnected) || index.find((message) => message.element?.isConnected);
    return sample?.scroller || document.scrollingElement;
  }
  const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  function move(scroller, top) { C.scrollToPosition(scroller, top); }
  function ownsOperation(task) { return operation === task && task.session === session; }
  function cancelled(task) {
    checkContext();
    return task.cancelled || task.userScrolled || task.owner?.userScrolled || !ownsOperation(task.owner || task) || !root?.isConnected;
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
      if (task.userScrolled) return false;
      const found = anchor && (resolve(anchor.id, anchor) || await seekLoaded(anchor, scroller, recovery, position.offset, hints));
      const exact = found && await align(found, recovery, position.offset);
      if (cancelled(recovery) || task.userScrolled) return false;
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
    const task = { kind, scroller, position, arrival, cancelled: false, session, route, started: Date.now(), wheelCarry: Date.now() - lastWheelAt < 180, wheelTotal:0, wheelAt:0, wheelDirection:0 };
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
      setStatus('loadingEarlier', { count:index.length });
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
      setStatus('indexing', { count:index.length });
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
    historyRequest?.abort();
    historyRequest = null;
    pendingHistory = null;
    historyAttempted = true;
    scan();
    const scroller = mainScroller();
    if (!scroller || !visible.length) { setStatus('openFirst'); return; }
    const task = startOperation('index', scroller);
    complete = false;
    completedHeadId = null;
    let verified = false;
    try {
      setStatus('indexingStart');
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
        setStatus(complete ? 'scanReturning' : 'scanPartial', { count:index.length });
      }
    } catch (error) {
      if (ownsOperation(task)) setStatus('scanChanged');
      console.warn('[GPT-Navigator] Index interrupted:', error.message);
    } finally {
      try {
        if (ownsOperation(task) && !task.userScrolled) {
          const restored = await restorePosition(scroller, task.position, task);
          if (ownsOperation(task)) {
            if (task.userScrolled) setStatus('scanScrolled');
            else if (!restored) setStatus(task.restoreClamped ? [[task.cancelled ? 'scanCancelled' : complete ? 'scanDone' : 'retained', { count:index.length }], ['clamped']] : [['restoreApprox']]);
            else if (task.cancelled) setStatus('cancelledCount', { count:index.length });
            else if (complete) setStatus('scanDone', { count:index.length });
          }
        }
      } finally { finishOperation(task); }
    }
  }
  function compatible(expected, actual) {
    if (!expected || !actual || expected.role !== actual.role) return false;
    if (expected.messageId && actual.messageId) return expected.messageId === actual.messageId;
    if (expected.placeholder) return true;
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
    if (expected?.historyIndexed) {
      return observed.find(message => message.element.isConnected && message.role === expected.role &&
        message.messageId && message.messageId === expected.messageId);
    }
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
  async function seekHistoryMessage(target, scroller, task, offset) {
    // The index provides identity and order. Derive pixel positions only from
    // this live scroller, whose extent can grow every time older turns load.
    let low = 0, high = 0, extent = -1, firstGuess = true, lastProbe = null, probedBlank = false;
    let state = hydrationState(scroller);
    while (!cancelled(task) && operationTimeLeft(task) > 0 && scroller.isConnected) {
      const found = findObserved(state.messages, target.id, target);
      if (found) return found;
      const rank = index.findIndex(message => message.id === target.id);
      if (rank < 0) return null;
      const { maximum, position } = C.scrollMetrics(scroller);
      const prepended = lastProbe === 0 && extent >= 0 && maximum > extent + 2;
      if (Math.abs(maximum - extent) > 1 || extent < 0) {
        extent = maximum; low = 0; high = maximum; firstGuess = true;
      }
      // A rapid second click may run after the first scroll write but before
      // the virtualizer paints. Offscreen nodes belong to the previous window
      // and cannot establish bounds for the current scroll position.
      const nearby = state.inView;
      if (!nearby.length) {
        state = await settleViewport(scroller, task, { target, maximum:2400 });
        if (cancelled(task)) return null;
        if (!state.inView.length && !findObserved(state.messages, target.id, target) && !state.pending) {
          // A silent fixed-height spacer can need a visit to a known real row
          // before it paints more turns. Try that anchor once. An announced
          // load, however, gets the remaining lookup time and stays cancellable.
          if (probedBlank) return null;
          const positionNow = C.scrollPosition(scroller);
          let closest = null;
          for (const row of index) {
            if (!row.stable || row.scroller !== scroller || !Number.isFinite(row.y)) continue;
            if (!closest || Math.abs(row.y - positionNow) < Math.abs(closest.y - positionNow)) closest = row;
          }
          if (!closest) return null;
          probedBlank = true;
          move(scroller, closest.y - offset);
          state = await settleViewport(scroller, task, { target, maximum:2400 });
        }
        continue;
      }
      const direction = windowDirection(target, nearby);
      if (!direction && !state.pending) return null;
      if (direction < 0 && position <= 3) {
        // The known target predates the currently loaded page. Stay at the
        // top until ChatGPT prepends another batch or the operation times out.
        const oldHead = nearby[0]?.id;
        const oldExtent = maximum;
        state = await settleViewport(scroller, task, {
          target, maximum: 6500, accept: s => s.inView[0]?.id !== oldHead ||
            Math.abs(C.scrollMetrics(scroller).maximum - oldExtent) > 2
        });
        if (!state.settled && !state.pending && C.scrollPosition(scroller) <= 3) return null;
        low = 0; high = C.scrollMetrics(scroller).maximum; firstGuess = true; lastProbe = 0;
        continue;
      }
      if (direction < 0) high = Math.min(high, Math.max(0, position - 2));
      if (direction > 0) low = Math.max(low, Math.min(maximum, position + 2));
      if (low > high) return null;
      const guess = firstGuess && Number.isFinite(target.y) && target.scroller === scroller ? target.y - offset :
        firstGuess ? maximum * rank / Math.max(1, index.length - 1) : (low + high) / 2;
      let next = Math.max(low, Math.min(high, guess));
      const viewHeight = C.viewport(scroller).height;
      if (direction < 0 && low === 0 && (prepended || next < viewHeight)) next = 0;
      if (direction > 0 && high === maximum && maximum - next < viewHeight) next = maximum;
      if (!firstGuess && Math.abs(next - position) <= 1 && !state.pending) return null;
      firstGuess = false;
      lastProbe = next;
      move(scroller, next);
      state = await settleViewport(scroller, task, { minimum:160, quiet:120, maximum:2400, target });
    }
    return null;
  }
  async function seekLoaded(target, scroller, task, offset = 76, hints = []) {
    if (!target.stable || !scroller.isConnected) return null;
    if (target.historyIndexed && task.kind === 'jump') return seekHistoryMessage(target, scroller, task, offset);
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
    const originSession = session, originRoute = conversationRoute();
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
        setStatus('locating');
        if (target.historyIndexed) task.limit = 90000;
        found = await seekLoaded(target, scroller, task);
      }
      if (cancelled(task)) return;
      let exact = null;
      if (found) {
        moveToMessage(found, 76);
        const current = resolve(target.id, target);
        exact = !target.historyIndexed && atMessageOffset(current, 76) ? current : current && await align(current, task);
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
        setStatus(exact.role === 'user' ? 'atPrompt' : 'atReply', { number:index.findIndex((message) => message.id === exact.id) + 1 });
        if (innerWidth < 700) setOpen(false);
      } else if (!cancelled(task)) {
        setStatus('missingReturning');
      }
    } catch (error) {
      if (ownsOperation(task)) setStatus('navigationChanged');
      console.warn('[GPT-Navigator] Jump interrupted:', error.message);
    } finally {
      try {
        if (!success && ownsOperation(task) && !task.userScrolled) {
          const restored = await restorePosition(scroller, task.position, task);
          if (ownsOperation(task)) {
            if (task.userScrolled) setStatus('navigationScrolled');
            else setStatus([[task.cancelled ? 'navigationCancelled' : 'missing'], [restored || task.restoreClamped ? 'returned' : 'approximate']]);
            if (!open) toast(statusMessage);
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
    toast('noFurther');
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
  for (const button of shadow.querySelectorAll('.filter')) button.addEventListener('click', () => { filter = button.dataset.filter; savePreferences({ filter }); render(); });
  list.addEventListener('click', (event) => { const button = event.target.closest('.message'); if (button) jump(button.dataset.id); });
  $('.previous').addEventListener('click', () => adjacent(-1));
  $('.next').addEventListener('click', () => adjacent(1));
  $('.index').addEventListener('click', () => { if (operation?.kind === 'index') { operation.cancelled = true; setStatus('cancelling'); } else fullScan(); });
  $('.refresh').addEventListener('click', () => { reset(); scan(); render(); });
  $('.theme').addEventListener('change', (event) => { theme = event.target.value; applyTheme(); savePreferences({ theme }); });
  $('.language').addEventListener('change', (event) => { language = event.target.value; applyLanguage(); savePreferences({ language }); });
  let updateHoverTimer;
  function showUpdateDetails() {
    clearTimeout(updateHoverTimer);
    if (!$('.update-wrap').hidden) {
      $('.update-tooltip').hidden = false;
      void loadReleaseNotes();
    }
  }
  function hideUpdateDetails() {
    clearTimeout(updateHoverTimer);
    $('.update-tooltip').hidden = true;
  }
  $('.update-wrap').addEventListener('pointerenter', showUpdateDetails);
  $('.update-wrap').addEventListener('pointerleave', () => {
    updateHoverTimer = setTimeout(hideUpdateDetails, 180);
  });
  $('.update-wrap').addEventListener('focusin', showUpdateDetails);
  $('.update-wrap').addEventListener('focusout', hideUpdateDetails);
  $('.update-wrap').addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.stopPropagation(); hideUpdateDetails(); $('.close').focus({ preventScroll:true }); }
  });
  $('.update-badge').addEventListener('click', async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type:'compass:ack-update', version });
      if (response?.ok) {
        updateStateRevision++;
        seenVersion = version;
        renderUpdateBadge();
        $('.close').focus({ preventScroll:true });
      }
    } catch { /* Retain the badge if acknowledgement could not be saved. */ }
  });
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
  function inputInScroller(event, keyboard = false) {
    const scroller = operation?.scroller || jumpPin?.scroller;
    if (!scroller || event.composedPath().includes(host)) return false;
    const target = event.target;
    if (keyboard && (target === document || target === document.body || target === document.documentElement)) return true;
    return target === scroller || (target instanceof Element && C.scrollContainer(target, true) === scroller);
  }
  function yieldToScroll() {
    jumpPin = null;
    if (!operation || operation.userScrolled) return;
    operation.cancelled = true;
    operation.userScrolled = true;
    setStatus(operation.kind === 'index' ? 'scanScrolled' : 'navigationScrolled');
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nativeBranch?.kind === 'redo' && !nativeBranch.confirmed) nativeBranch = null;
    if (!event.repeat && ['Enter', ' '].includes(event.key) && nativeBranch?.kind === 'redo' && !nativeBranch.confirmed) observeNativeBranchAction(event);
    if (event.isComposing || C.isEditable(event)) return;
    const navigationModifier = isMac ? (event.metaKey && !event.ctrlKey) || (event.ctrlKey && !event.metaKey) : event.ctrlKey && !event.metaKey;
    if (navigationModifier && event.shiftKey && !event.altKey && ['ArrowUp','ArrowDown'].includes(event.code)) {
      event.preventDefault(); event.stopPropagation();
      if (!event.repeat) adjacent(event.code === 'ArrowUp' ? -1 : 1);
      return;
    }
    if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End','Space'].includes(event.code) && inputInScroller(event, true)) {
      if (event.code === 'Space' && event.target instanceof Element && event.target.closest('button, [role="button"], a[href]')) return;
      yieldToScroll();
    }
  }, true);
  document.addEventListener('scroll', (event) => {
    if (event.composedPath().includes(host)) return;
    if (!jumpPin || Math.abs(C.scrollPosition(jumpPin.scroller) - jumpPin.position) > 2) $('.target').hidden = true;
    if (!scrollTimer) scrollTimer = setTimeout(() => { scrollTimer = null; scan(); }, 120);
  }, true);
  document.addEventListener('wheel', (event) => {
    const now = Date.now(), gap = now - lastWheelAt;
    if (event.ctrlKey || !event.deltaY || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    lastWheelAt = now;
    if (!inputInScroller(event)) return;
    if (!operation) { jumpPin = null; return; }
    // A gesture already in flight when a prompt was clicked is often trackpad
    // momentum. Ignore its tail until a pause, with a short bounded grace period.
    if (operation.wheelCarry && gap < 180 && now - operation.started < 500) return;
    operation.wheelCarry = false;
    const direction = Math.sign(event.deltaY);
    if (now - operation.wheelAt > 180 || direction !== operation.wheelDirection) operation.wheelTotal = 0;
    operation.wheelAt = now; operation.wheelDirection = direction;
    operation.wheelTotal += Math.abs(event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (operation.wheelTotal < 12) return;
    yieldToScroll();
  }, { capture: true, passive: true });
  document.addEventListener('pointerdown', (event) => {
    const scroller = operation?.scroller;
    if (scroller && event.button === 0 && event.pointerType !== 'touch' && !event.composedPath().includes(host)) {
      const page = scroller === document.scrollingElement;
      const element = page ? document.documentElement : scroller;
      const left = page ? 0 : element.getBoundingClientRect().left + element.clientLeft;
      if ((event.target === element || event.target === scroller || (page && event.target === document)) &&
          (event.clientX < left || event.clientX >= left + element.clientWidth)) yieldToScroll();
    }
    if (!event.composedPath().includes(host)) jumpPin = null;
    if (nativeBranch?.kind === 'redo' && !nativeBranch.confirmed &&
        event.composedPath().some((node) => node instanceof Element && node.matches('[role="menu"]'))) observeNativeBranchAction(event);
    if (nativeBranch?.kind === 'redo' && !nativeBranch.confirmed && event.target instanceof Element &&
        !nativeBranch.trigger?.contains(event.target) &&
        !event.composedPath().some((node) => node instanceof Element && node.matches('[role="menu"]'))) nativeBranch = null;
  }, true);
  let touchOrigin = null;
  document.addEventListener('touchstart', (event) => {
    const finger = event.touches[0];
    touchOrigin = event.touches.length === 1 && inputInScroller(event)
      ? { x:finger.clientX, y:finger.clientY, id:finger.identifier } : null;
  }, { capture:true, passive:true });
  document.addEventListener('touchmove', (event) => {
    if (!touchOrigin || event.touches.length !== 1) { touchOrigin = null; return; }
    const finger = event.touches[0];
    const dy = Math.abs(finger.clientY - touchOrigin.y);
    if (finger.identifier === touchOrigin.id && dy >= 8 && dy > Math.abs(finger.clientX - touchOrigin.x)) {
      touchOrigin = null;
      yieldToScroll();
    }
  }, { capture:true, passive:true });
  for (const type of ['touchend','touchcancel']) document.addEventListener(type, () => { touchOrigin = null; }, { capture:true, passive:true });
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
  window.addEventListener('languagechange', () => { if (language === 'auto') applyLanguage(); });
  window.addEventListener('focus', () => { if (open) refreshShortcut(); });
  setInterval(() => { checkContext(); applyTheme(); }, 750);
  try {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'compass:toggle') {
        setOpen(!open, true);
        sendResponse({ ok:true, version });
      }
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && (changes.compassUpdateVersion || changes.compassSeenVersion)) {
        updateStateRevision++;
        if (changes.compassUpdateVersion) updateVersion = changes.compassUpdateVersion.newValue || '';
        if (changes.compassSeenVersion) seenVersion = changes.compassSeenVersion.newValue || '';
        renderUpdateBadge();
      }
      if (area === 'local' && changes.compassPreferences) {
        preferencesRevision++;
        applyPreferences(changes.compassPreferences.newValue);
      }
    });
    const initialUpdateRevision = updateStateRevision;
    const initialPreferencesRevision = preferencesRevision;
    chrome.storage.local.get(['compassPreferences', 'compassUpdateVersion', 'compassSeenVersion']).then(({ compassPreferences:prefs, compassUpdateVersion, compassSeenVersion }) => {
      if (updateStateRevision === initialUpdateRevision) {
        updateVersion = compassUpdateVersion || '';
        seenVersion = compassSeenVersion || '';
      }
      if (preferencesRevision === initialPreferencesRevision) applyPreferences(prefs);
      renderUpdateBadge();
    }).catch(() => {});
  } catch { /* Page still works if the extension has just been reloaded. */ }
  scan(); applyTheme(); applyLanguage(); refreshShortcut();
})();
