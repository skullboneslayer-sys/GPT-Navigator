async function toggle(tab) {
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'compass:toggle' });
  } catch {
    // The page may have been open before installation, or may not be ChatGPT.
    await chrome.action.setBadgeText({ tabId: tab.id, text: '↻' });
    await chrome.action.setTitle({ tabId: tab.id, title: 'Open ChatGPT and refresh the page to use GPT-Navigator' });
  }
}
chrome.action.onClicked.addListener(toggle);
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-contents') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await toggle(tab);
});
