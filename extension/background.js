importScripts('i18n.js');
const version = chrome.runtime.getManifest().version;
const preferenceValues = {
  theme: ['auto', 'dark', 'light'],
  filter: ['all', 'user', 'assistant'],
  language: ['auto', ...GPTNavI18n.locales]
};
let preferenceWrites = Promise.resolve();
function validatePreferencePatch(patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return null;
  const entries = Object.entries(patch);
  if (!entries.length || entries.some(([key, value]) =>
    !Object.hasOwn(preferenceValues, key) || !preferenceValues[key].includes(value))) return null;
  return Object.fromEntries(entries);
}
function savePreferences(patch) {
  // One worker serializes patches from every tab against the latest stored value.
  const write = preferenceWrites.then(async () => {
    const { compassPreferences } = await chrome.storage.local.get('compassPreferences');
    const preferences = {
      ...(compassPreferences && typeof compassPreferences === 'object' && !Array.isArray(compassPreferences)
        ? compassPreferences : {}),
      ...patch
    };
    await chrome.storage.local.set({ compassPreferences: preferences });
    return preferences;
  });
  // A failed write must not prevent later preference changes from being saved.
  preferenceWrites = write.catch(() => {});
  return write;
}
function isNewerVersion(current, previous) {
  const parse = (value) => typeof value === 'string' && /^\d+(?:\.\d+){0,3}$/u.test(value)
    ? value.split('.').map(Number) : null;
  const next = parse(current), old = parse(previous);
  if (!next || !old) return false;
  for (let i = 0; i < 4; i++) {
    if ((next[i] || 0) !== (old[i] || 0)) return (next[i] || 0) > (old[i] || 0);
  }
  return false;
}
let titleWrites = Promise.resolve();
function updateTitles(write) {
  const task = titleWrites.then(async () => {
    const { compassPreferences } = await chrome.storage.local.get('compassPreferences');
    const language = compassPreferences?.language || 'auto';
    await write(key => GPTNavI18n.translate(language, key, { version }));
  });
  titleWrites = task.catch(() => {});
  return task;
}
function refreshTitle(refreshTabs = false) {
  return updateTitles(async title => {
    await chrome.action.setBadgeText({ text: '' });
    const toggle = title('toggle'), reload = title('reload');
    await chrome.action.setTitle({ title:toggle });
    if (!refreshTabs) return;
    // Chrome retains tab-specific overrides even when the worker stops.
    // Preserve the reload hint on tabs without a receiver after a language change.
    const reloadTitles = GPTNavI18n.locales.map(locale => GPTNavI18n.translate(locale, 'reload'));
    const tabs = await chrome.tabs.query({});
    await Promise.allSettled(tabs.filter(tab => tab.id != null).map(async ({id:tabId}) => {
      const current = await chrome.action.getTitle({ tabId });
      const desired = reloadTitles.includes(current) ? reload : toggle;
      if (current !== desired) await chrome.action.setTitle({ tabId, title:desired });
    }));
  });
}
async function toggle(tab) {
  if (!tab?.id) return;
  let key = 'toggle';
  try { await chrome.tabs.sendMessage(tab.id, { type: 'compass:toggle' }); }
  catch { key = 'reload'; }
  await updateTitles(title => chrome.action.setTitle({ tabId:tab.id, title:title(key) }));
}
chrome.action.onClicked.addListener(toggle);
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-contents') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await toggle(tab);
});
chrome.storage.onChanged.addListener((changes, area) => {
  const prefs = changes.compassPreferences;
  if (area === 'local' && prefs && prefs.oldValue?.language !== prefs.newValue?.language) refreshTitle(true).catch(() => {});
});
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({ compassSeenVersion: version, compassUpdateVersion: '' });
  } else if (details.reason === 'update' && isNewerVersion(version, details.previousVersion)) {
    await chrome.storage.local.set({ compassUpdateVersion: version });
  }
  await refreshTitle();
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!['compass:ack-update', 'compass:save-preferences', 'compass:get-shortcut', 'compass:get-release-notes'].includes(message?.type)) return;
  if (sender?.id !== chrome.runtime.id) {
    sendResponse({ ok:false }); return;
  }
  if (message.type === 'compass:get-release-notes') {
    fetch(chrome.runtime.getURL('release-notes.json'))
      .then(response => {
        if (!response.ok) throw new Error('Could not load release notes');
        return response.json();
      })
      .then(releases => sendResponse({ ok:true, notes:releases[version] ?? {} }))
      .catch(() => sendResponse({ ok:false }));
    return true;
  }
  if (message.type === 'compass:save-preferences') {
    const patch = validatePreferencePatch(message.patch);
    if (!patch) { sendResponse({ ok:false }); return; }
    savePreferences(patch)
      .then((preferences) => sendResponse({ ok:true, preferences }))
      .catch(() => sendResponse({ ok:false }));
    return true;
  }
  if (message.type === 'compass:get-shortcut') {
    Promise.resolve().then(() => chrome.commands.getAll()).then((commands) => {
      const shortcut = commands.find((command) => command.name === 'toggle-contents')?.shortcut;
      sendResponse({ ok:true, shortcut: typeof shortcut === 'string' ? shortcut : '' });
    }).catch(() => sendResponse({ ok:false }));
    return true;
  }
  if (message.version !== version) { sendResponse({ ok:false }); return; }
  chrome.storage.local.set({ compassSeenVersion:version })
    .then(() => sendResponse({ ok:true })).catch(() => sendResponse({ ok:false }));
  return true;
});
refreshTitle().catch(() => {});
