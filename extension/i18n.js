/* Bundled interface translations. Conversation text is never translated. */
(() => {
  'use strict';
  const locales = ['en', 'ko', 'ja', 'zh-CN', 'zh-TW'];
  const messages = {
    historyReading: ['Indexing conversation history…', '대화 기록을 색인하는 중…', '会話履歴を索引化しています…', '正在索引对话记录…', '正在索引對話記錄…'],
    historyDone: ['Conversation indexed · {count} messages', '대화 색인 완료 · 메시지 {count}개', '会話の索引を作成しました · {count}件', '对话索引已完成 · {count} 条消息', '對話索引已完成 · {count} 則訊息'],
    historyUnavailable: ['Showing loaded messages. Use Index full chat to look for older messages.', '불러온 메시지를 표시합니다. 이전 메시지를 찾으려면 전체 대화를 색인하세요.', '読み込み済みのメッセージを表示しています。過去のメッセージは会話全体を索引化して探せます。', '正在显示已加载的消息。可用“索引整个对话”查找更早的消息。', '正在顯示已載入的訊息。可用「索引整個對話」尋找更早的訊息。'],
    newBadge: ['NEW', '업데이트', '更新', '更新', '更新'],
    ackUpdate: ['Updated to {version}. Hover or focus for changes; click to dismiss.', '{version} 업데이트. 마우스를 올리거나 포커스하면 변경 내용을 볼 수 있습니다. 클릭하면 닫힙니다.', '{version}に更新。ホバーまたはフォーカスで変更内容を表示、クリックで閉じます。', '已更新至 {version}。悬停或聚焦可查看更新内容，点击关闭徽标。', '已更新至 {version}。懸停或聚焦可查看更新內容，點擊關閉徽章。'],
    updateHeading: ['Changes in {version}', '{version} 변경 내용', '{version}の変更内容', '{version} 更新内容', '{version} 更新內容'],
    dismissUpdate: ['Click NEW to dismiss this update badge.', '업데이트 배지를 클릭하면 닫힙니다.', '更新バッジをクリックすると閉じます。', '点击更新徽标即可关闭。', '點擊更新徽章即可關閉。'],
    tagline: ['Your place in a long conversation', '긴 대화에서 내 위치 찾기', '長い会話でも迷わず移動', '在长对话中找到你的位置', '在長對話中找到你的位置'],
    rail: ['Prompt navigation bars', '질문 탐색 막대', '質問ナビゲーション', '提问导航条', '提問導覽列'],
    contents: ['Conversation contents', '대화 목차', '会話の目次', '对话目录', '對話目錄'],
    close: ['Close full navigator', '전체 탐색기 닫기', 'ナビゲーターを閉じる', '关闭完整导航面板', '關閉完整導覽面板'],
    search: ['Search messages', '메시지 검색', 'メッセージを検索', '搜索消息', '搜尋訊息'],
    searchHint: ['Find a word, phrase, or topic…', '단어, 문구 또는 주제 검색…', '単語、フレーズ、話題を検索…', '搜索词语、短语或话题…', '搜尋詞語、片語或主題…'],
    filter: ['Message filter', '메시지 필터', 'メッセージの絞り込み', '消息筛选', '訊息篩選'],
    all: ['All messages', '모든 메시지', 'すべて', '全部消息', '全部訊息'],
    prompts: ['My prompts', '내 질문', '自分の質問', '我的提问', '我的提問'],
    replies: ['Replies', '답변', '回答', '回复', '回覆'],
    messagesOrder: ['Messages in conversation order', '대화 순서대로 정렬된 메시지', '会話順のメッセージ', '按对话顺序排列的消息', '按對話順序排列的訊息'],
    previous: ['Previous prompt', '이전 질문', '前の質問', '上一个提问', '上一個提問'],
    next: ['Next prompt', '다음 질문', '次の質問', '下一个提问', '下一個提問'],
    index: ['Index full chat', '전체 대화 색인', '会話全体を索引化', '索引整个对话', '索引整個對話'],
    refresh: ['Refresh', '새로고침', '更新', '刷新', '重新整理'],
    refreshHint: ['Clear the index and rescan the page', '색인을 지우고 페이지 다시 검색', '索引を消去してページを再走査', '清空索引并重新扫描页面', '清空索引並重新掃描頁面'],
    theme: ['Theme', '테마', 'テーマ', '主题', '主題'],
    themeLabel: ['Navigator theme', '탐색기 테마', 'ナビゲーターのテーマ', '导航面板主题', '導覽面板主題'],
    match: ['Match ChatGPT', 'ChatGPT에 맞춤', 'ChatGPTに合わせる', '跟随 ChatGPT', '跟隨 ChatGPT'],
    dark: ['Dark', '어둡게', 'ダーク', '深色', '深色'],
    light: ['Light', '밝게', 'ライト', '浅色', '淺色'],
    language: ['Language', '언어', '言語', '语言', '語言'],
    automatic: ['Automatic', '자동', '自動', '自动', '自動'],
    shortcutHint: ["Change this shortcut in your browser's extension shortcut settings", '브라우저의 확장 프로그램 단축키 설정에서 변경하세요', 'ブラウザーの拡張機能ショートカット設定で変更できます', '可在浏览器的扩展程序快捷键设置中更改', '可在瀏覽器的擴充功能快捷鍵設定中變更'],
    pageIndex: ['Page index', '페이지 색인', 'ページ索引', '页面索引', '頁面索引'],
    complete: ['Full scan finished', '전체 검색 완료', '全体の走査が完了', '完整扫描已完成', '完整掃描已完成'],
    cancel: ['Cancel', '취소', 'キャンセル', '取消', '取消'],
    foundMessages: ['{count} messages found', '메시지 {count}개', '{count}件のメッセージ', '找到 {count} 条消息', '找到 {count} 則訊息'],
    foundPrompts: ['{count} prompts found', '질문 {count}개', '{count}件の質問', '找到 {count} 个提问', '找到 {count} 個提問'],
    foundReplies: ['{count} replies found', '답변 {count}개', '{count}件の回答', '找到 {count} 条回复', '找到 {count} 則回覆'],
    filteredMessages: ['{shown} of {count} messages', '메시지 {count}개 중 {shown}개', '{count}件中{shown}件のメッセージ', '{count} 条消息中的 {shown} 条', '{count} 則訊息中的 {shown} 則'],
    filteredPrompts: ['{shown} of {count} prompts', '질문 {count}개 중 {shown}개', '{count}件中{shown}件の質問', '{count} 个提问中的 {shown} 个', '{count} 個提問中的 {shown} 個'],
    filteredReplies: ['{shown} of {count} replies', '답변 {count}개 중 {shown}개', '{count}件中{shown}件の回答', '{count} 条回复中的 {shown} 条', '{count} 則回覆中的 {shown} 則'],
    prompt: ['Prompt', '질문', '質問', '提问', '提問'],
    reply: ['Reply', '답변', '回答', '回复', '回覆'],
    message: ['Message', '메시지', 'メッセージ', '消息', '訊息'],
    you: ['You', '나', '自分', '你', '你'],
    promptLabel: ['Prompt {number}: {preview}', '질문 {number}: {preview}', '質問{number}: {preview}', '提问 {number}：{preview}', '提問 {number}：{preview}'],
    attachment: ['[Attachment or empty prompt]', '[첨부 파일 또는 빈 질문]', '[添付ファイルまたは空の質問]', '[附件或空提问]', '[附件或空提問]'],
    nonText: ['[Response loading or non-text content]', '[답변 로딩 중 또는 텍스트가 아닌 콘텐츠]', '[回答を読み込み中、またはテキスト以外の内容]', '[回复正在加载或包含非文本内容]', '[回覆正在載入或包含非文字內容]'],
    noMatches: ['No matching messages yet', '일치하는 메시지가 없습니다', '一致するメッセージがありません', '暂无匹配的消息', '尚無符合的訊息'],
    startHere: ['Your conversation starts here', '대화가 여기에 표시됩니다', 'ここに会話が表示されます', '你的对话从这里开始', '你的對話從這裡開始'],
    trySearch: ['Try another phrase or index the full chat to search earlier messages.', '다른 문구로 검색하거나 전체 대화를 색인하여 이전 메시지를 검색하세요.', '別の語句で検索するか、会話全体を索引化して過去のメッセージを検索してください。', '请尝试其他词语，或索引整个对话以搜索更早的消息。', '請嘗試其他詞語，或索引整個對話以搜尋更早的訊息。'],
    openChat: ['Open a ChatGPT conversation. Your prompts and replies will appear automatically.', 'ChatGPT 대화를 열면 질문과 답변이 자동으로 표시됩니다.', 'ChatGPTの会話を開くと、質問と回答が自動で表示されます。', '打开 ChatGPT 对话，提问和回复会自动显示。', '開啟 ChatGPT 對話，提問和回覆會自動顯示。'],
    initial: ['Only messages loaded by ChatGPT are listed. Index full chat to find older turns.', 'ChatGPT가 불러온 메시지만 표시됩니다. 이전 메시지를 찾으려면 전체 대화를 색인하세요.', 'ChatGPTが読み込んだメッセージのみ表示します。過去の内容は会話全体を索引化して探せます。', '仅列出 ChatGPT 已加载的消息。索引整个对话可查找更早的内容。', '僅列出 ChatGPT 已載入的訊息。索引整個對話可尋找更早的內容。'],
    newChat: ['New conversation. Index full chat to include older messages.', '새 대화입니다. 이전 메시지를 포함하려면 전체 대화를 색인하세요.', '新しい会話です。過去のメッセージを含めるには会話全体を索引化してください。', '新的对话。索引整个对话以包含更早的消息。', '新的對話。索引整個對話以包含更早的訊息。'],
    branchChanged: ['Conversation branch changed. Removed messages from the previous branch.', '대화 분기가 변경되어 이전 분기의 메시지를 제거했습니다.', '会話の分岐が変わったため、以前の分岐のメッセージを除外しました。', '对话分支已改变，已移除旧分支的消息。', '對話分支已改變，已移除舊分支的訊息。'],
    earlierAppeared: ['Earlier history appeared. Index full chat again to include it.', '이전 대화가 발견되었습니다. 전체 대화를 다시 색인하여 포함하세요.', 'さらに過去の履歴が見つかりました。会話全体を再度索引化してください。', '发现了更早的历史记录。请重新索引整个对话以包含这些内容。', '發現了更早的歷史紀錄。請重新索引整個對話以包含這些內容。'],
    loadingEarlier: ['Loading earlier messages… {count} messages found. Cancel to return to your place.', '이전 메시지 로딩 중… {count}개 발견. 취소하면 원래 위치로 돌아갑니다.', '過去のメッセージを読み込み中… {count}件発見。キャンセルすると元の位置に戻ります。', '正在加载更早的消息… 已找到 {count} 条。取消可返回原位置。', '正在載入更早的訊息… 已找到 {count} 則。取消可返回原位置。'],
    indexing: ['Indexing… {count} messages found. Cancel to return to your place.', '색인 중… {count}개 발견. 취소하면 원래 위치로 돌아갑니다.', '索引を作成中… {count}件発見。キャンセルすると元の位置に戻ります。', '正在建立索引… 已找到 {count} 条消息。取消可返回原位置。', '正在建立索引… 已找到 {count} 則訊息。取消可返回原位置。'],
    openFirst: ['Open a conversation with messages first.', '먼저 메시지가 있는 대화를 여세요.', 'まずメッセージのある会話を開いてください。', '请先打开包含消息的对话。', '請先開啟包含訊息的對話。'],
    indexingStart: ['Indexing from the beginning. You can cancel at any time.', '처음부터 색인 중입니다. 언제든지 취소할 수 있습니다.', '会話の先頭から索引を作成中です。いつでもキャンセルできます。', '正在从头建立索引，随时可以取消。', '正在從頭建立索引，隨時可以取消。'],
    scanReturning: ['Scan finished: {count} messages. Returning to your place.', '검색 완료: 메시지 {count}개. 원래 위치로 돌아갑니다.', '走査完了：{count}件。元の位置に戻ります。', '扫描完成：{count} 条消息。正在返回原位置。', '掃描完成：{count} 則訊息。正在返回原位置。'],
    scanPartial: ['{count} messages indexed. ChatGPT did not finish loading; try another scan.', '{count}개 색인 완료. ChatGPT 로딩이 완료되지 않았습니다. 다시 검색해 보세요.', '{count}件を索引化しました。ChatGPTの読み込みが未完了です。再走査してください。', '已索引 {count} 条消息。ChatGPT 尚未加载完成，请尝试重新扫描。', '已索引 {count} 則訊息。ChatGPT 尚未載入完成，請嘗試重新掃描。'],
    scanChanged: ['The page changed during indexing. Refresh the index and try again.', '색인 중 페이지가 변경되었습니다. 색인을 새로고침하고 다시 시도하세요.', '索引の作成中にページが変わりました。索引を更新して再試行してください。', '建立索引时页面发生变化。请刷新索引后重试。', '建立索引時頁面發生變化。請重新整理索引後再試。'],
    scanCancelled: ['Scan cancelled', '검색 취소됨', '走査をキャンセルしました', '扫描已取消', '掃描已取消'],
    scanDone: ['Full page scan finished · {count} messages', '전체 페이지 검색 완료 · 메시지 {count}개', '全体の走査が完了 · {count}件', '完整页面扫描已完成 · {count} 条消息', '完整頁面掃描已完成 · {count} 則訊息'],
    retained: ['Index retained', '색인 유지됨', '索引を保持しました', '索引已保留', '索引已保留'],
    clamped: ['Returned to your original message; its previous reading offset no longer fits.', '원래 메시지로 돌아왔지만 이전 읽기 위치는 더 이상 맞지 않습니다.', '元のメッセージに戻りましたが、以前の表示位置は再現できません。', '已返回原消息，但无法恢复之前的精确阅读位置。', '已返回原訊息，但無法恢復先前的精確閱讀位置。'],
    restoreApprox: ['Index retained. ChatGPT could not reload your original message; position restored approximately.', '색인은 유지됩니다. ChatGPT가 원래 메시지를 다시 불러오지 못해 대략적인 위치로 돌아왔습니다.', '索引は保持されています。元のメッセージを再読込できなかったため、おおよその位置に戻りました。', '索引已保留。ChatGPT 无法重新加载原消息，已恢复到大致位置。', '索引已保留。ChatGPT 無法重新載入原訊息，已恢復到大致位置。'],
    cancelledCount: ['Scan cancelled. {count} messages retained; index may be partial.', '검색 취소됨. 메시지 {count}개 유지. 색인이 일부만 포함할 수 있습니다.', '走査をキャンセルしました。{count}件を保持。索引は一部のみの可能性があります。', '扫描已取消。已保留 {count} 条消息，索引可能不完整。', '掃描已取消。已保留 {count} 則訊息，索引可能不完整。'],
    locating: ['Locating the selected message…', '선택한 메시지를 찾는 중…', '選択したメッセージを探しています…', '正在定位所选消息…', '正在定位所選訊息…'],
    atPrompt: ['At message {number} · Your prompt.', '메시지 {number} · 내 질문.', 'メッセージ{number} · 自分の質問。', '消息 {number} · 你的提问。', '訊息 {number} · 你的提問。'],
    atReply: ['At message {number} · ChatGPT reply.', '메시지 {number} · ChatGPT 답변.', 'メッセージ{number} · ChatGPTの回答。', '消息 {number} · ChatGPT 回复。', '訊息 {number} · ChatGPT 回覆。'],
    missingReturning: ['ChatGPT did not load that exact message. Returning to your place.', 'ChatGPT가 해당 메시지를 불러오지 못했습니다. 원래 위치로 돌아갑니다.', 'ChatGPTが該当メッセージを読み込めませんでした。元の位置に戻ります。', 'ChatGPT 未能加载该消息。正在返回原位置。', 'ChatGPT 未能載入該訊息。正在返回原位置。'],
    navigationChanged: ['The page changed during navigation. Refresh the index and try again.', '이동 중 페이지가 변경되었습니다. 색인을 새로고침하고 다시 시도하세요.', '移動中にページが変わりました。索引を更新して再試行してください。', '导航时页面发生变化。请刷新索引后重试。', '導覽時頁面發生變化。請重新整理索引後再試。'],
    navigationCancelled: ['Navigation cancelled.', '이동이 취소되었습니다.', '移動をキャンセルしました。', '导航已取消。', '導覽已取消。'],
    missing: ['Exact message could not be loaded.', '해당 메시지를 불러올 수 없습니다.', '該当メッセージを読み込めませんでした。', '无法加载目标消息。', '無法載入目標訊息。'],
    returned: ['Returned to your original message.', '원래 메시지로 돌아왔습니다.', '元のメッセージに戻りました。', '已返回原消息。', '已返回原訊息。'],
    approximate: ['Restored an approximate scroll position.', '대략적인 스크롤 위치로 돌아왔습니다.', 'おおよそのスクロール位置に戻りました。', '已恢复到大致滚动位置。', '已恢復到大致捲動位置。'],
    noFurther: ['No further prompt in this index. Index full chat to include earlier messages.', '이 색인에 더 이상 질문이 없습니다. 이전 메시지를 포함하려면 전체 대화를 색인하세요.', 'この索引にはこれ以上の質問がありません。過去のメッセージは会話全体を索引化してください。', '索引中没有更多提问。索引整个对话以包含更早的消息。', '索引中沒有更多提問。索引整個對話以包含更早的訊息。'],
    cancelling: ['Cancelling… returning to your place.', '취소 중… 원래 위치로 돌아갑니다.', 'キャンセル中… 元の位置に戻ります。', '正在取消… 正在返回原位置。', '正在取消… 正在返回原位置。'],
    scanScrolled: ['Scan cancelled by scrolling.', '스크롤하여 검색이 취소되었습니다.', 'スクロールにより走査をキャンセルしました。', '已因滚动而取消扫描。', '已因捲動而取消掃描。'],
    navigationScrolled: ['Navigation cancelled by scrolling.', '스크롤하여 이동이 취소되었습니다.', 'スクロールにより移動をキャンセルしました。', '已因滚动而取消导航。', '已因捲動而取消導覽。'],
    toggle: ['Toggle GPT-Navigator', 'GPT-Navigator 열기/닫기', 'GPT-Navigatorを開閉', '打开或关闭 GPT-Navigator', '開啟或關閉 GPT-Navigator'],
    reload: ['Open ChatGPT and refresh the page to use GPT-Navigator', 'GPT-Navigator를 사용하려면 ChatGPT를 열고 페이지를 새로고침하세요', 'GPT-Navigatorを使うにはChatGPTを開いてページを再読み込みしてください', '请打开 ChatGPT 并刷新页面以使用 GPT-Navigator', '請開啟 ChatGPT 並重新整理頁面以使用 GPT-Navigator']
  };
  function resolve(language) {
    const value = String(language || '').replace(/_/gu, '-').toLowerCase();
    if (/^zh(?:-|$)/u.test(value)) {
      if (/(?:^|-)hans(?:-|$)/u.test(value)) return 'zh-CN';
      return /(?:^|-)hant(?:-|$)|(?:^|-)(tw|hk|mo)(?:-|$)/u.test(value) ? 'zh-TW' : 'zh-CN';
    }
    return /^ko(?:-|$)/u.test(value) ? 'ko' : /^ja(?:-|$)/u.test(value) ? 'ja' : 'en';
  }
  function browserLanguage() {
    try { return resolve(chrome.i18n.getUILanguage()); } catch { return resolve(globalThis.navigator?.language); }
  }
  function translate(language, key, values = {}) {
    const locale = language === 'auto' ? browserLanguage() : resolve(language);
    const text = messages[key]?.[locales.indexOf(locale)] ?? messages[key]?.[0] ?? key;
    return text.replace(/\{(\w+)\}/gu, (match, name) => Object.hasOwn(values, name) ? String(values[name]) : match);
  }
  globalThis.GPTNavI18n = { locales, messages, resolve, browserLanguage, translate };
})();
