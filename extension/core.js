/* Shared DOM adapter. */
(() => {
  'use strict';
  const SELECTOR = '[data-chatgpt-search-unit-key$=":user"], [data-chatgpt-search-unit-key$=":assistant"], [data-message-author-role="user"], [data-message-author-role="assistant"]';
  const normalize = (text) => (text || '').replace(/\s+/gu, ' ').trim();
  const isTransientMarker = (value) => /^fallback-turn-/u.test(value || '');
  function uniqueMessageId(value) {
    const ids = new Set((value || '').match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/giu)?.map((id) => id.toLowerCase()) || []);
    return ids.size === 1 ? ids.values().next().value : null;
  }
  function historyLoading(root, { olderOnly = false } = {}) {
    if (!olderOnly && root.matches('[aria-busy="true"]')) return true;
    for (const node of root.querySelectorAll('[aria-busy="true"], span.sr-only, [role="status"]')) {
      if (node.closest('[hidden], [aria-hidden="true"]')) continue;
      const announcement = normalize(node.textContent);
      if (olderOnly ? /^loading\s+(?:older|earlier)(?:\s+(?:conversation|history|messages))?(?:\.{3}|…)?$/iu.test(announcement) : node.getAttribute('aria-busy') === 'true' || /^loading(?:\s+(?:older|earlier))?(?:\s+(?:conversation|history|messages))?(?:\.{3}|…)?$/iu.test(announcement)) return true;
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
  function scrollContainer(element) {
    let hiddenScroller = null;
    for (let parent = element?.parentElement; parent; parent = parent.parentElement) {
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
  function readMessages(root, fallbackIds, nextId) {
    const result = [];
    const seen = new Set();
    for (const element of root.querySelectorAll(SELECTOR)) {
      const role = roleOf(element);
      // New wrappers can contain the legacy message marker. Index it once.
      let parent = element.parentElement?.closest(SELECTOR);
      if (parent && root.contains(parent) && roleOf(parent) === role && parent.getClientRects().length && parent.getBoundingClientRect().height >= 1) continue;
      if (element.closest('[hidden], [aria-hidden="true"]')) continue;
      const rect = element.getBoundingClientRect();
      if (!element.getClientRects().length || rect.height < 1) continue;
      const turn = element.closest('[data-turn-key], [data-testid^="conversation-turn-"]');
      const unit = element.getAttribute('data-chatgpt-search-unit-key') || (parent && roleOf(parent) === role ? parent.getAttribute('data-chatgpt-search-unit-key') : null);
      const messageId = element.getAttribute('data-message-id') || element.querySelector('[data-message-id]')?.getAttribute('data-message-id') || uniqueMessageId(
        element.getAttribute('data-chatgpt-search-message-ids') || element.querySelector('[data-chatgpt-search-message-ids]')?.getAttribute('data-chatgpt-search-message-ids') || (parent && roleOf(parent) === role ? parent.getAttribute('data-chatgpt-search-message-ids') : null)
      );
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
      // Prefer actual message prose to wrapper controls and role headings.
      const body = element.querySelector('[data-message-author-role], .markdown, .whitespace-pre-wrap') || element;
      let text = normalize(body.innerText || body.textContent);
      if (!text) text = role === 'user' ? '[Attachment or empty prompt]' : '[Response loading or non-text content]';
      const scroller = scrollContainer(element);
      const view = viewport(scroller);
      // Fallback ordinals can be reassigned when older history is prepended.
      // They cannot prove that a changed UUID occupies the same branch slot.
      const slot = stableTurnId ? `turn:${stableTurnId}:${role}` : turnNumber !== undefined ? `position:${turnNumber}:${role}` : stableUnit ? `unit:${stableUnit}` : null;
      const metrics = scrollMetrics(scroller);
      const y = rect.top - view.top + metrics.position;
      result.push({ id, stable, transient, slot, turnElement: turn, messageId: messageId || null, role, text, element, scroller, y, scrollMaximum: metrics.maximum, scrollReversed: metrics.minimum < 0, endY: metrics.maximum - y, coordinateEstimated: false, order: turnNumber === undefined ? null : Number(turnNumber) * 2 + (role === 'assistant' ? 1 : 0) });
    }
    return result;
  }
  function mergeMessages(index, observed, { historyPrepend = false, headHydration = false } = {}) {
    const byId = new Map(index.map((item) => [item.id, item]));
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
    if (index.length && index.every((item) => item.order !== null)) index.sort((a, b) => a.order - b.order);
    return index;
  }
  function isEditable(event) {
    return event.composedPath().some((element) => element instanceof HTMLElement && (element.matches('input, textarea, select, [role="textbox"]') || element.isContentEditable));
  }
  globalThis.ConversationCompassCore = { SELECTOR, normalize, roleOf, conversationRoot, scrollContainer, scrollMetrics, scrollPosition, scrollToPosition, viewport, readMessages, mergeMessages, historyLoading, isEditable };
})();
