# GPT-Navigator

Restore the long chat navigation menu that Open AI removed between August and September of 2026. Designed around the original TOC system, installed as a chromium browser extension.

<table>
  <tr>
    <td align="center" valign="top">
      <strong>Minimal navigation, restored matching the old GPT look</strong><br><br>
      <img width="300" alt="Thin navigation marks beside the conversation" src="https://github.com/user-attachments/assets/75fdd6e8-032c-41da-ab6d-9c827ced927f">
    </td>
    <td align="center" valign="top">
      <strong>Hover to see all your loaded prompts (Index in the main app to load ALL prompts)</strong><br><br>
      <img width="300" alt="Expanded prompt navigation list" src="https://github.com/user-attachments/assets/f550e4a2-c6b1-45d3-9b58-cd7a63078063">
    </td>
  </tr>
  <tr>
    <td align="center" valign="top">
      <strong>Click to open the full Nav app in your browser extensions menu</strong><br><br>
      <img width="300" alt="Full navigator with message filters and indexing" src="https://github.com/user-attachments/assets/1d2f8695-b187-4fdd-a9b7-9c2e90fc004b">
    </td>
    <td align="center" valign="top">
      <strong>Search your conversation, filter by origin, and one-button full conversation index (Indexing can take up to 3-minutes as it reloads the full webpage)</strong><br><br>
      <img width="300" alt="Search results with matching words highlighted" src="https://github.com/user-attachments/assets/4be2f644-c3d1-4b90-8a51-437771c5d09f">
    </td>
  </tr>
</table>

## Features

- Thin navigation marks on the right edge, one per prompt.
- Hover to show your prompts; click a prompt to jump to it.
- The current prompt stays highlighted while you read its reply.
- Long prompt lists scroll, and the interface matches ChatGPT's theme.
- An optional full menu provides search, message filters and full-chat indexing.

## Install in a Chromium browser

1. Download **GPT-Navigator-chromium-v1.0.zip** from [Releases](https://github.com/skullboneslayer-sys/GPT-Navigator/releases).
2. Extract it into a folder you will keep.
3. Open your browser's extensions page and enable **Developer mode**:

   | Browser | Extensions page |
   | --- | --- |
   | Opera | `opera://extensions` |
   | Chrome | `chrome://extensions` |
   | Edge | `edge://extensions` |
   | Brave | `brave://extensions` |

4. Click **Load unpacked** and select the folder containing `manifest.json`.
5. Refresh your ChatGPT tab.


## Controls

Hover over the marks to expand the prompt list. Click a prompt to jump. Move the pointer away to collapse it.

Open the full menu using the extension icon or **Ctrl+Shift+Y**. Search, **My prompts**, **Replies** and **Index full chat** are available there. Use **Index full chat** for older messages.

**Ctrl+Shift+Up** and **Ctrl+Shift+Down** move between prompts.

Created by [Skullboneslayer](https://github.com/skullboneslayer-sys).


