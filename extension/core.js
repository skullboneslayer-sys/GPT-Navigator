/* Shared DOM adapter. */
(() => {
  'use strict';
  const SELECTOR = '[data-chatgpt-search-unit-key$=":user"], [data-chatgpt-search-unit-key$=":assistant"], [data-message-author-role="user"], [data-message-author-role="assistant"]';
  const normalize = (text) => (text || '').replace(/\s+/gu, ' ').trim();
  const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  function findTextMatch(text, query) {
    const needle = query.toLocaleLowerCase();
    if (!needle) return null;
    const matchStart = text.toLocaleLowerCase().indexOf(needle);
    if (matchStart < 0) return null;
    const matchEnd = matchStart + needle.length;
    // Printable ASCII preserves offsets in every locale; avoid segmentation
    // for the common case when filtering a long conversation.
    if (/^[\x20-\x7e]*$/u.test(text)) return { start: matchStart, end: matchEnd };
    let foldedOffset = 0, start = null;
    // Case conversion can insert/remove code units (e.g. dotted I). Keep the
    // full-string match semantics, then map back without splitting a grapheme.
    // Combining marks stay with their base for Turkish/Lithuanian case rules.
    for (const { segment, index } of graphemes.segment(text)) {
      const nextOffset = foldedOffset + segment.toLocaleLowerCase().length;
      if (start === null && nextOffset > matchStart) start = index;
      if (nextOffset >= matchEnd) return { start, end: index + segment.length };
      foldedOffset = nextOffset;
    }
    return null;
  }
  // Native ChatGPT controls use the page's language, independently of our menu.
  const nativeLabels = {
    edit: /^(edit(?: message)?|수정|편집|메시지 (?:수정|편집)|編集|メッセージを編集|编辑(?:消息)?|編輯(?:訊息|消息)?)$/iu,
    save: /^(save(?: and (?:submit|send))?|send|submit|저장(?: 및 (?:제출|전송))?|보내기|전송|保存(?:して送信)?|送信|保存(?:并(?:提交|发送))?|发送|提交|儲存(?:並(?:提交|傳送|送出))?|傳送|送出)$/iu,
    cancel: /^(cancel|취소|キャンセル|取消)$/iu,
    redo: /^(regenerate(?: response)?|redo(?: response)?|retry|try again|다시 (?:시도|생성)|(?:답변|응답) (?:다시 생성|재생성)|재생성|もう一度試す|再試行|再生成|(?:回答|応答)を再生成|重新生成(?:回复|回答)?|重新尝试|重试|再试一次|重新產生(?:回覆|回答)?|重新生成(?:回覆|回答)?|再試一次|重試)$/iu,
    redoChoice: /^(try again|use pro mode|search the web|submit|다시 시도|다시 생성|Pro 모드 사용|웹 검색|제출|もう一度試す|再試行|再生成|Proモードを使用|ウェブを検索|送信|重新生成|重新尝试|重试|再试一次|使用\s*Pro\s*模式|搜索(?:网页|网络)|提交|重新產生|再試一次|重試|搜尋(?:網頁|網路)|送出)(?:$|\s|[（(])/iu,
    stop: /^(stop generating|stop response|생성 중지|응답 중지|停止|生成を停止|応答を停止|停止生成|停止回复|停止回覆)$/iu,
    older: /^(?:loading\s+(?:older|earlier)(?:\s+(?:conversation|history|messages))?|이전\s*(?:메시지|대화|기록)(?:를|을)?\s*(?:불러오는 중|불러오기|로드 중|로딩 중)|(?:過去|以前|古い)の?(?:メッセージ|会話|履歴)を?読み込み中|(?:正在)?(?:加载|載入)(?:更早|较早|較早|之前|先前|历史|歷史|旧|舊)的?(?:消息|訊息|对话|對話|记录|紀錄)?)(?:\s*[.…。]*)$/iu,
    loading: /^(?:loading(?:\s+(?:conversation|history|messages))?|로딩 중|불러오는 중|読み込み中|(?:正在)?(?:加载|載入)(?:中)?)(?:\s*[.…。]*)$/iu
  };
  function nativeLabel(kind, value) { return Boolean(nativeLabels[kind]?.test(normalize(value))); }
  function nativeAction(button, kind) {
    return [button.getAttribute('aria-label'), button.title, button.innerText || button.textContent].some((value) => nativeLabel(kind, value));
  }
  const isTransientMarker = (value) => /^fallback-turn-/u.test(value || '');
  function searchMarkerId(value, role, prose, historyById) {
    const ids = new Set((value || '').match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/giu)?.map((id) => id.toLowerCase()) || []);
    if (ids.size === 1) return ids.values().next().value;
    if (!historyById || !prose) return null;
    const matches = [...ids].filter(id => {
      const record = historyById.get(id);
      return record?.role === role && normalize(record.text) === prose;
    });
    return matches.length === 1 ? matches[0] : null;
  }
  function mountedMessageId(element, parent, role, prose, historyById) {
    const direct = element.getAttribute('data-message-id');
    if (direct) return direct;
    const ids = new Set();
    for (const child of element.querySelectorAll('[data-message-id]')) {
      if (child.closest('[hidden], [aria-hidden="true"]') || !child.getClientRects().length) continue;
      const author = child.closest('[data-message-author-role]');
      if (author && roleOf(author) !== role) continue;
      ids.add(child.getAttribute('data-message-id'));
    }
    if (ids.size) return ids.size === 1 ? ids.values().next().value : null;
    // A search unit can include tools or other responses. For multiple IDs,
    // require one candidate from this exact unit to match the visible prose.
    let markers = element.getAttribute('data-chatgpt-search-message-ids') || '';
    for (const child of element.querySelectorAll('[data-chatgpt-search-message-ids]')) {
      if (!child.closest('[hidden], [aria-hidden="true"]') && child.getClientRects().length) {
        markers += ' ' + child.getAttribute('data-chatgpt-search-message-ids');
      }
    }
    return searchMarkerId(markers || (parent && roleOf(parent) === role ?
      parent.getAttribute('data-chatgpt-search-message-ids') : null), role, prose, historyById);
  }
  function historyLoading(root, { olderOnly = false } = {}) {
    if (!olderOnly && root.matches('[aria-busy="true"]')) return true;
    for (const node of root.querySelectorAll('[aria-busy="true"], span.sr-only, [role="status"]')) {
      if (node.closest('[hidden], [aria-hidden="true"]')) continue;
      const announcement = normalize(node.textContent);
      if (nativeLabel('older', announcement) || (!olderOnly && (node.getAttribute('aria-busy') === 'true' || nativeLabel('loading', announcement)))) return true;
    }
    return false;
  }
  const roleOf = (element) => {
    const key = element.getAttribute('data-chatgpt-search-unit-key') || '';
    return key.endsWith(':user') ? 'user' : key.endsWith(':assistant') ? 'assistant' : element.getAttribute('data-message-author-role');
  };
  function conversationRoot(doc = document) {
    return doc.querySelector('[data-thread-find-target="conversation"]') || doc.querySelector('main') || doc.body;
  }
  function scrollContainer(element, includeSelf = false) {
    let hiddenScroller = null;
    for (let parent = includeSelf ? element : element?.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (parent.clientHeight > 0 && parent.scrollHeight > parent.clientHeight + 8) {
        if (/^(auto|scroll|overlay)$/u.test(style.overflowY)) return parent;
        if (!hiddenScroller && style.overflowY === 'hidden') hiddenScroller = parent;
      }
    }
    return hiddenScroller || document.scrollingElement || document.documentElement;
  }
  // ChatGPT's reverse flex scroll host has raw zero at the bottom and negative
  // scrollTop above it. All navigation uses a logical zero at the top instead.
  function scrollMetrics(scroller) {
    const maximum = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    const style = getComputedStyle(scroller);
    const reversed = /^(inline-)?flex$/u.test(style.display) && style.flexDirection === 'column-reverse';
    const minimum = reversed ? -maximum : 0;
    return { maximum, minimum, position: Math.min(maximum, Math.max(0, scroller.scrollTop - minimum)) };
  }
  function scrollPosition(scroller) {
    return scrollMetrics(scroller).position;
  }
  function scrollToPosition(scroller, position) {
    // Re-read bounds on every write: older history and streaming can grow them.
    const { minimum, maximum } = scrollMetrics(scroller);
    scroller.scrollTo({ top: minimum + Math.min(maximum, Math.max(0, Number.isFinite(position) ? position : 0)), behavior: 'instant' });
  }
  function viewport(scroller) {
    if (scroller === document.scrollingElement || scroller === document.documentElement || scroller === document.body) return { top: 0, height: innerHeight, bottom: innerHeight };
    const box = scroller.getBoundingClientRect();
    return { top: box.top + scroller.clientTop, height: scroller.clientHeight, bottom: box.top + scroller.clientTop + scroller.clientHeight };
  }
  function readMessages(root, fallbackIds, nextId, historyById) {
    const result = [];
    const seen = new Set();
    const dialog = root.closest?.('dialog, [role="dialog"]') ?? null;
    for (const element of root.querySelectorAll(SELECTOR)) {
      // A version preview may repeat IDs from the transcript it overlays.
      if (element.closest('dialog, [role="dialog"]') !== dialog) continue;
      const role = roleOf(element);
      // New wrappers can contain the legacy message marker. Index it once.
      let parent = element.parentElement?.closest(SELECTOR);
      if (parent && root.contains(parent) && roleOf(parent) === role && parent.getClientRects().length && parent.getBoundingClientRect().height >= 1) continue;
      if (element.closest('[hidden], [aria-hidden="true"]')) continue;
      const rect = element.getBoundingClientRect();
      if (!element.getClientRects().length || rect.height < 1) continue;
      // An open edit form is not a new prompt. Keep its cached original until
      // ChatGPT submits the edit and renders the resulting conversation.
      if (role === 'user' && element.querySelector('textarea, [contenteditable="true"], [contenteditable="plaintext-only"]')) continue;
      const turn = element.closest('[data-turn-key], [data-testid^="conversation-turn-"]');
      const unit = element.getAttribute('data-chatgpt-search-unit-key') || (parent && roleOf(parent) === role ? parent.getAttribute('data-chatgpt-search-unit-key') : null);
      const bodies = [];
      for (const node of element.querySelectorAll('[data-message-author-role], [data-search-result-target], .markdown, .whitespace-pre-wrap')) {
        if (bodies.at(-1)?.contains(node) || node.closest('[hidden], [aria-hidden="true"]') || !node.getClientRects().length) continue;
        const author = node.closest('[data-message-author-role]');
        if (!author || roleOf(author) === role) bodies.push(node);
      }
      if (!bodies.length) bodies.push(element);
      let text = normalize(bodies.map(node => node.innerText ?? node.textContent).join(' '));
      // aria-hidden descendants may still contribute to innerText: don't use
      // that string as identity evidence when it could describe a hidden turn.
      const prose = historyById && bodies.every(node => !node.querySelector('[aria-hidden="true"]')) ? text : '';
      const messageId = mountedMessageId(element, parent, role, prose, historyById);
      const turnId = turn?.getAttribute('data-turn-key');
      const stableTurnId = turnId && !isTransientMarker(turnId) ? turnId : null;
      const stableUnit = unit && !isTransientMarker(unit) ? unit : null;
      const transient = !messageId && !stableTurnId && !stableUnit && (isTransientMarker(turnId) || isTransientMarker(unit));
      const turnTestId = turn?.getAttribute('data-testid') || '';
      const turnNumber = /^conversation-turn-(\d+)$/u.exec(turnTestId)?.[1];
      let id;
      let stable = true;
      if (messageId) id = `message:${messageId}:${role}`;
      else if (stableTurnId && isTransientMarker(unit)) id = `turn:${stableTurnId}:${role}`;
      else if (stableUnit) id = `unit:${stableUnit}`;
      else if (stableTurnId) id = `turn:${stableTurnId}:${role}`;
      else if (transient) {
        stable = false;
        if (!fallbackIds.has(element)) fallbackIds.set(element, `node:${nextId()}`);
        id = fallbackIds.get(element);
      }
      else if (turnNumber !== undefined) { id = `position:${turnNumber}:${role}`; stable = false; }
      else if (unit) { id = `unit:${unit}`; stable = false; }
      else if (turnId) { id = `turn:${turnId}:${role}`; stable = false; }
      else {
        stable = false;
        if (!fallbackIds.has(element)) fallbackIds.set(element, `node:${nextId()}`);
        id = fallbackIds.get(element);
      }
      if (seen.has(id)) continue;
      seen.add(id);
      const placeholder = !text;
      if (!text) text = role === 'user' ? '[Attachment or empty prompt]' : '[Response loading or non-text content]';
      const scroller = scrollContainer(element);
      const view = viewport(scroller);
      // A rendered ordinal can be reassigned when older history loads. Only a
      // durable turn or search-unit key can prove a same-slot replacement.
      const slot = stableTurnId ? `turn:${stableTurnId}:${role}` : stableUnit ? `unit:${stableUnit}` : null;
      const metrics = scrollMetrics(scroller);
      const y = rect.top - view.top + metrics.position;
      result.push({ id, stable, transient, slot, turnElement: turn, messageId: messageId || null, role, text, placeholder, element, scroller, y, scrollMaximum: metrics.maximum, scrollReversed: metrics.minimum < 0, endY: metrics.maximum - y, coordinateEstimated: false, order: turnNumber === undefined ? null : Number(turnNumber) * 2 + (role === 'assistant' ? 1 : 0) });
    }
    return result;
  }
  function reconcileMountedRows(index, seen, aliases, compatible) {
    // ChatGPT can hydrate a provisional message or replace its element in a
    // retained turn. Build lookup tables only for rows that still lack IDs.
    const byElement = new Map(), byTurn = new Map();
    for (const row of index) {
      if (row.messageId || !row.element) continue;
      byElement.set(row.element, row);
      if (row.transient && row.turnElement) {
        let roles = byTurn.get(row.turnElement);
        if (!roles) byTurn.set(row.turnElement, roles = new Map());
        roles.set(row.role, roles.has(row.role) ? null : row);
      }
    }
    const replaced = new Set();
    if (byElement.size) {
      const ids = new Set(index.map(row => row.id));
      for (const message of seen.values()) {
        const direct = byElement.get(message.element);
        const old = direct && (direct.transient || message.messageId) ? direct : byTurn.get(message.turnElement)?.get(message.role);
        if (!old || old.id === message.id || old.role !== message.role || replaced.has(old) || !compatible(old, message)) continue;
        aliases.set(old.id, message.id);
        ids.delete(old.id);
        byElement.delete(old.element);
        byTurn.get(old.turnElement)?.delete(old.role);
        if (ids.has(message.id)) replaced.add(old);
        else { Object.assign(old, message); ids.add(message.id); }
      }
    }
    const retained = [];
    for (const row of index) {
      if (replaced.has(row) || (!row.stable && seen.get(row.id)?.element !== row.element)) continue;
      // Keep positions and text, and keep live edit-form containers. Release
      // any detached nodes, without mutating snapshots held by an active jump.
      const lostElement = row.element && !row.element.isConnected;
      const lostTurn = row.turnElement && !row.turnElement.isConnected;
      const lostScroller = row.scroller && !row.scroller.isConnected;
      retained.push(lostElement || lostTurn || lostScroller ? { ...row,
        element:lostElement ? null : row.element, turnElement:lostTurn ? null : row.turnElement,
        scroller:lostScroller ? null : row.scroller
      } : row);
    }
    return retained;
  }
  function mergeMessages(index, observed, { historyPrepend = false, headHydration = false } = {}) {
    const byId = new Map(index.map((item) => [item.id, item]));
    const rebased = observed.some((message) => {
      const previous = byId.get(message.id);
      return message.stable && previous?.stable && message.order !== null && previous.order !== null && message.order !== previous.order;
    });
    // A lazy history window can restart conversation-turn-N from zero. Until
    // those cached positions are seen again, preserve their anchored ordering.
    if (rebased || (headHydration && !observed.some((message) => byId.has(message.id)))) {
      for (const cached of index) cached.order = null;
    }
    const reverseGroups = new Map();
    for (const message of observed) {
      if (!message.scrollReversed || !Number.isFinite(message.scrollMaximum)) continue;
      let group = reverseGroups.get(message.scroller);
      if (!group) { group = { maximum: message.scrollMaximum, messages: [] }; reverseGroups.set(message.scroller, group); }
      group.maximum = message.scrollMaximum;
      group.messages.push(message);
    }
    for (const [scroller, group] of reverseGroups) {
      const projected = new Map();
      for (const cached of index) {
        if (cached.scroller !== scroller || !Number.isFinite(cached.scrollMaximum)) continue;
        // Each entry can have a different capture epoch. Preserve its distance
        // from the end as a destination estimate, then refresh that epoch once.
        projected.set(cached, { y: cached.y + group.maximum - cached.scrollMaximum, extentChanged: group.maximum !== cached.scrollMaximum });
      }
      const residuals = [];
      for (const message of group.messages) {
        const cached = byId.get(message.id), projection = projected.get(cached);
        if (message.stable && cached?.stable && projection) residuals.push(message.y - projection.y);
      }
      // Streaming can change total extent without prepending. Only consistent
      // measurements from multiple immutable identities justify a shared fix.
      const measured = residuals.length >= 2 && Math.max(...residuals) - Math.min(...residuals) <= 3;
      const correction = measured ? residuals.reduce((total, value) => total + value, 0) / residuals.length : 0;
      for (const [cached, projection] of projected) {
        cached.y = projection.y + correction;
        cached.endY = group.maximum - cached.y;
        cached.scrollMaximum = group.maximum;
        cached.scrollReversed = true;
        cached.coordinateEstimated = measured || historyPrepend ? false : Boolean(cached.coordinateEstimated || projection.extentChanged);
      }
    }
    for (let i = 0; i < observed.length; i++) {
      const message = observed[i];
      if (byId.has(message.id)) {
        Object.assign(byId.get(message.id), message);
        continue;
      }
      const previous = observed.slice(0, i).reverse().find((item) => byId.has(item.id));
      const following = observed.slice(i + 1).find((item) => byId.has(item.id));
      let insertion = index.length;
      if (previous) insertion = index.findIndex((item) => item.id === previous.id) + 1;
      else if (following) insertion = index.findIndex((item) => item.id === following.id);
      else if (headHydration) {
        // A retained spacer can remap each newly loaded head to the same y=0.
        // During explicit head hydration, a disjoint batch is earlier history;
        // stale equal coordinates cannot place it after the previous head.
        const first = index.findIndex((item) => item.scroller === message.scroller);
        if (first >= 0) insertion = first;
      }
      else {
        // A disjoint growing window cannot reveal whether its new content was
        // prepended or appended. Older-history loading supplies that context;
        // without it, keep new tail entries after the existing cache.
        const uncertain = index.some((item) => item.scroller === message.scroller && item.coordinateEstimated);
        if (!uncertain || historyPrepend) {
          const after = index.findIndex((item) => item.y > message.y);
          if (after >= 0) insertion = after;
        }
      }
      index.splice(insertion, 0, message);
      byId.set(message.id, message);
    }
    // Explicit turn positions, when available, survive virtualization and reflow.
    if (index.length && index.every((item) => !item.historyIndexed && item.order !== null) && new Set(index.map((item) => item.order)).size === index.length) {
      index.sort((a, b) => a.order - b.order);
    }
    return index;
  }
  function isEditable(event) {
    return event.composedPath().some((element) => element instanceof HTMLElement && (element.matches('input, textarea, select, [role="textbox"]') || element.isContentEditable));
  }
  globalThis.ConversationCompassCore = { SELECTOR, normalize, findTextMatch, nativeLabel, nativeAction, roleOf, conversationRoot, scrollContainer, scrollMetrics, scrollPosition, scrollToPosition, viewport, readMessages, reconcileMountedRows, mergeMessages, historyLoading, isEditable };
})();
