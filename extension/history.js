/* Read the open conversation from the same origin as the ChatGPT tab. */
(() => {
  'use strict';

  function visibleRecord(message) {
    const role = message?.author?.role;
    if (role !== 'user' && role !== 'assistant') return null;
    if (message.metadata?.is_visually_hidden_from_conversation === true) return null;
    if (role === 'assistant' && ((message.recipient != null && message.recipient !== 'all') ||
        (message.channel != null && message.channel !== 'final'))) return null;
    const content = message.content;
    if (['user_editable_context', 'model_editable_context', 'thoughts', 'reasoning_recap', 'execution_output'].includes(content?.content_type)) return null;
    if (typeof message.id !== 'string' || !message.id) throw new Error('History message is missing its ID');
    const parts = Array.isArray(content?.parts) ? content.parts : [content?.text];
    const text = parts.map(part => typeof part === 'string' ? part : typeof part?.text === 'string' ? part.text : '')
      .filter(Boolean).join(' ').replace(/\s+/gu, ' ').trim();
    // An image-only or attachment-only prompt still has a real place in the conversation.
    return { id:message.id, role, text };
  }

  function selectedBranch(body) {
    const records = [], seen = new Set();
    let key = body.current_node;
    if (!key) throw new Error('History has no selected branch');
    while (key !== null) {
      if (typeof key !== 'string' || !key || /^paginated-root(?:[:_-]|$)/iu.test(key) ||
          seen.has(key) || !Object.hasOwn(body.mapping, key)) throw new Error('Incomplete history branch');
      seen.add(key);
      const node = body.mapping[key];
      if (!node || node.parent === undefined) throw new Error('History node is missing its parent');
      const record = visibleRecord(node.message);
      if (record) records.push(record);
      key = node.parent;
    }
    return { records:records.reverse(), pages:1 };
  }

  // A flat list describes the server's selection. A complete tree can also
  // distinguish the branch this tab shows, even with its last turn unmounted.
  function visibleTree(body, conversationId) {
    const mapping = body.mapping;
    if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping) || (body.conversation_id ?? body.id) !== conversationId ||
        !Object.hasOwn(mapping, body.current_node)) return null;
    const keys = Object.keys(mapping);
    const roots = keys.filter(key => mapping[key]?.parent === null);
    if (roots.length !== 1) return null;
    const stack = [{key:roots[0], parent:null, previous:null}];
    const visited = new Set(), byId = new Map();
    while (stack.length) {
      const {key, parent, previous} = stack.pop();
      if (!Object.hasOwn(mapping, key) || visited.has(key) || /^paginated-root(?:[:_-]|$)/iu.test(key)) return null;
      const node = mapping[key];
      if (!node || node.parent !== parent || !Array.isArray(node.children)) return null;
      visited.add(key);
      const record = visibleRecord(node.message);
      let entry = previous;
      if (record) {
        if (byId.has(record.id)) return null;
        entry = {record, parent:previous, children:[], canEnd:false};
        byId.set(record.id, entry);
        if (previous) previous.children.push(entry);
      }
      // Tools and system messages can sit between two visible messages. A
      // hidden leaf, or an explicitly selected internal node, can end a path.
      if (entry && (!node.children.length || key === body.current_node)) entry.canEnd = true;
      for (const child of node.children) {
        if (typeof child !== 'string') return null;
        stack.push({key:child, parent:key, previous:entry});
      }
    }
    return visited.size === keys.length ? byId : null;
  }

  function branchFromMiddle(tree, messageId) {
    let tip = tree?.get(messageId);
    if (!tip || !tip.children.length) return null;
    while (tip.children.length) {
      if (tip.canEnd || tip.children.length !== 1) return null;
      tip = tip.children[0];
    }
    const records = [];
    for (let node = tip; node; node = node.parent) records.push(node.record);
    return records.reverse();
  }

  function validatePage(page, latest) {
    if (!Array.isArray(page.messages) || typeof page.page_info?.has_previous_page !== 'boolean' || typeof page.page_info?.has_next_page !== 'boolean' ||
        (latest && page.page_info.has_next_page !== false)) throw new Error('Incomplete history page');
  }

  function selection(page) {
    // A branch can change while older pages are loading, even on the same conversation URL.
    return JSON.stringify([page.current_node ?? null, page.page_info.start_cursor, page.page_info.end_cursor, page.page_info.has_previous_page,
      page.messages.map(message => message?.id)]);
  }

  function temporaryError(message) {
    const error = new Error(message);
    error.retryable = true;
    return error;
  }

  function httpError(message, response) {
    if (response.status !== 429 && response.status < 500) return new Error(message);
    const error = temporaryError(message);
    const after = response.headers.get('Retry-After')?.trim();
    if (/^\d+$/u.test(after)) error.retryAfterMs = Number(after) * 1000;
    else if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/iu.test(after)) {
      const until = Date.parse(after);
      if (Number.isFinite(until)) error.retryAfterMs = until - Date.now();
    }
    return error;
  }

  async function read(conversationId, { signal, middle = false } = {}) {
    if (typeof conversationId !== 'string' || !/^[a-z\d_-]+$/iu.test(conversationId)) throw new Error('Invalid conversation ID');
    const origin = location.origin;
    const settings = { mode:'same-origin', credentials:'same-origin', redirect:'error', cache:'no-store', signal };
    const session = await fetch(new URL('/api/auth/session', origin), settings);
    if (!session.ok) throw httpError('Chat session unavailable', session);
    const { accessToken } = await session.json();
    if (typeof accessToken !== 'string' || !accessToken) throw new Error('Chat session unavailable');

    const headers = { Authorization:'Bearer ' + accessToken, Accept:'application/json' };
    const treeURL = new URL('/backend-api/conversation/' + conversationId, origin);
    const latestURL = new URL('/backend-api/conversations/' + conversationId, origin);
    latestURL.search = '?include_has_versions=true&num_turns=100';
    async function get(url, optional = false) {
      const response = await fetch(url, { ...settings, headers });
      if (optional && (response.status === 404 || response.status === 405)) return null;
      if (!response.ok) {
        throw httpError('Conversation history unavailable (' + response.status + ')', response);
      }
      const body = await response.json();
      const owner = body?.conversation_id ?? body?.id;
      if (!body || (owner !== undefined && owner !== conversationId)) throw new Error('Unexpected conversation');
      return body;
    }

    let page = await get(latestURL, true);
    const paginatedEndpointAvailable = Boolean(page);
    if (!page) page = await get(treeURL);
    if (page.mapping && typeof page.mapping === 'object') {
      const branch = selectedBranch(page);
      if (middle) branch.tree = visibleTree(page, conversationId);
      return branch;
    }
    validatePage(page, true);
    if (middle && paginatedEndpointAvailable) {
      const body = await get(treeURL, true);
      const tree = body && visibleTree(body, conversationId);
      if (tree) {
        const branch = selectedBranch(body);
        // Two reads can straddle a branch switch. Compare visible message IDs
        // and roles, since node keys need not be the IDs used by flat pages.
        const recent = page.messages.map(visibleRecord).filter(Boolean);
        const offset = branch.records.length - recent.length;
        if (offset < 0 || (!page.page_info.has_previous_page && offset !== 0) ||
            recent.some((row, i) => row.id !== branch.records[offset+i].id || row.role !== branch.records[offset+i].role)) {
          throw temporaryError('Conversation changed during indexing');
        }
        return { ...branch, tree };
      }
    }
    const initialSelection = selection(page);
    let selectedNode = page.current_node;
    const chunks = [], ids = new Set(), cursors = new Set();
    while (true) {
      const chunk = [];
      const previousSize = ids.size;
      for (const message of page.messages) {
        const id = message?.id;
        if (typeof id !== 'string' || !id) throw new Error('Unrecognized history record');
        if (ids.has(id)) continue;
        ids.add(id);
        const record = visibleRecord(message);
        if (record) chunk.push(record);
      }
      if (chunks.length && ids.size === previousSize) throw new Error('History page did not advance');
      chunks.push(chunk);
      if (!page.page_info.has_previous_page) break;
      const cursor = page.page_info.start_cursor;
      if (typeof cursor !== 'string' || !cursor || cursors.has(cursor) || chunks.length >= 1000) {
        throw new Error('Invalid history pagination');
      }
      cursors.add(cursor);
      const olderURL = new URL(latestURL);
      olderURL.searchParams.set('before', cursor);
      page = await get(olderURL);
      validatePage(page, false);
      if (page.current_node != null) {
        if (selectedNode != null && selectedNode !== page.current_node) throw temporaryError('Conversation changed during indexing');
        selectedNode = page.current_node;
      }
    }
    if (chunks.length > 1) {
      const latest = await get(latestURL);
      validatePage(latest, true);
      if (selection(latest) !== initialSelection) {
        throw temporaryError('Conversation changed during indexing');
      }
    }
    return { records:chunks.reverse().flat(), pages:chunks.length };
  }

  globalThis.GPTNavHistory = { read, branchFromMiddle };
})();
