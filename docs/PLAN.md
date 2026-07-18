# 月下冷梗旅店首版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一個可直接部署至靜態網站、含 72 題全齡內容、兩種玩法、本機紀錄、無障礙與 RWD 的 Vanilla JavaScript 冷笑話遊戲。

**Architecture:** 使用原生 ES Modules 將不可變題庫、純函式遊戲核心、瀏覽器能力包裝與 DOM UI 分離；所有狀態由事件經純函式更新，再由單一 UI 層轉譯。測試使用 Node 20 內建 `node:test`，瀏覽器行為另以手動測試頁及實際 Chrome／Edge 驗證。

**Tech Stack:** HTML5、CSS3、Vanilla JavaScript ES2022、原生 ES Modules、Web Audio API、Clipboard API、localStorage、Node.js 20 內建測試。

## Global Constraints

- 只使用 HTML、CSS 與 Vanilla JavaScript；不得使用 React、Angular、Vue、TypeScript、後端服務或大型遊戲引擎。
- 首版提供六類、每類 12 題，共 72 題全齡友善繁體中文內容。
- 平台以桌機瀏覽器優先，支援平板與行動觸控；斷點固定為 640px 與 1024px。
- 所有資源使用相對路徑，支援靜態網站根路徑與子路徑部署。
- 中文文件、註解與 UI 文案遵守 AGENTS.md 名詞翻譯規範。
- 不讀取、不輸出、不提交任何憑證、token、`.env` 或私人金鑰。
- 所有功能以測試先行實作；每個里程碑驗證後才提交。
- Commit 描述使用繁體中文並符合 Conventional Commits 1.0.0。

---

## Scope

### In

- 旅店大廳、四選一挑戰、冷笑話放映室
- 72 題題庫、六類篩選、註解、來源地區與難度
- 最佳分數、收藏、已看題目與偏好本機儲存
- Web Audio 程式化音效、Clipboard 複製與降級
- 三組 RWD、鍵盤操作、ARIA 回饋、減少動態效果
- SEO、靜態部署文件、自動測試與手動測試頁

### Out

- 帳號、雲端同步、投稿、後台、多人排行榜、即時對戰
- 後端、資料庫、外部分析、遠端字型、第三方框架
- 圖片梗圖產生與任何需私人金鑰的服務

---

## File Map

| 檔案 | 單一責任 |
|---|---|
| `index.html` | 語意頁面、SEO 中繼資料、UI 掛載點 |
| `styles/tokens.css` | 色彩、字型、間距、圓角與陰影變數 |
| `styles/base.css` | 重設、基本排版、焦點與輔助類別 |
| `styles/components.css` | 按鈕、卡片、房牌、印章、對話框 |
| `styles/layout.css` | 畫面配置與三組 RWD |
| `styles/motion.css` | 動畫與 `prefers-reduced-motion` |
| `data/jokes.js` | 六類 72 題不可變題庫 |
| `scripts/joke-engine.js` | 驗證、抽樣、選項洗牌與篩選純函式 |
| `scripts/game-state.js` | 遊戲狀態、作答、計分、前進與結算 |
| `scripts/storage.js` | 本機紀錄正規化、讀寫與記憶體降級 |
| `scripts/audio.js` | Web Audio 支援檢測與三種程式化音效 |
| `scripts/share.js` | 分享文字與 Clipboard 降級 |
| `scripts/ui.js` | DOM 查詢、畫面轉譯、事件與焦點管理 |
| `scripts/app.js` | 模組組裝與應用程式啟動 |
| `tests/*.test.js` | Node 內建單元與資料契約測試 |
| `tests/browser-test.html` | 瀏覽器能力及 DOM 手動測試 |
| `docs/ART-DIRECTION.md` | 可選風格、採用規範與禁止事項 |
| `docs/TEST-PLAN.md` | 功能、手動、行動裝置及無障礙清單 |
| `README.md` | 介紹、執行、結構、測試、部署與限制 |
| `CONTRIBUTING.md` | 貢獻流程、內容規範與提交規範 |
| `LICENSE` | MIT License |
| `robots.txt` | 搜尋引擎規則 |
| `sitemap.xml` | 單頁網站地圖範本 |

---

### Task 1: 專案骨架、文件與靜態入口

**Files:**
- Create: `index.html`
- Create: `styles/tokens.css`
- Create: `styles/base.css`
- Create: `styles/components.css`
- Create: `styles/layout.css`
- Create: `styles/motion.css`
- Create: `scripts/app.js`
- Create: `docs/ART-DIRECTION.md`
- Create: `docs/TEST-PLAN.md`
- Create: `robots.txt`
- Create: `sitemap.xml`
- Create: `tests/static-structure.test.js`

**Interfaces:**
- Consumes: 核准的設計規格 `docs/superpowers/specs/2026-07-19-moonlit-punchline-design.md`
- Produces: DOM 掛載點 `#app-shell`、`#live-region`、`#toast-region`；CSS tokens；`bootstrap()` 啟動函式

- [ ] **Step 1: 寫入會失敗的靜態結構測試**

`tests/static-structure.test.js` 使用 `readFile` 讀取入口，斷言包含：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('入口包含語意掛載點與無障礙回饋區', () => {
  assert.match(html, /id="app-shell"/);
  assert.match(html, /id="live-region"[^>]*aria-live="polite"/);
  assert.match(html, /id="toast-region"[^>]*aria-live="polite"/);
});

test('入口包含 SEO、結構化資料及相對資源', () => {
  assert.match(html, /property="og:title"/);
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(html, /(?:src|href)="\//);
});
```

- [ ] **Step 2: 執行測試並確認先失敗**

Run: `node --test tests/static-structure.test.js`
Expected: FAIL，原因為 `index.html` 尚不存在。

- [ ] **Step 3: 建立最小可載入的語意入口與 CSS 架構**

`index.html` 必須含 `lang="zh-Hant"`、Viewport、Description、Canonical、Open Graph、Twitter Card、`WebApplication` JSON-LD、跳至主要內容連結、`main#app-shell`、兩個 ARIA live region、`noscript` 與相對路徑 `./scripts/app.js`。
`scripts/app.js` 先提供：

```js
export function bootstrap(documentRef = document) {
  const shell = documentRef.querySelector('#app-shell');
  if (!shell) throw new Error('找不到應用程式掛載點');
  shell.dataset.ready = 'true';
}

if (typeof document !== 'undefined') bootstrap();
```

六個 CSS 檔先建立設計 token、基本排版、44px 互動目標、元件邊線、三段版面與減少動態效果規則；不得加入尚無用途的元件。

- [ ] **Step 4: 撰寫美術與測試文件**

`docs/ART-DIRECTION.md` 列出三種曾評估風格、採用「月下冷泉旅店」原因、七色色票、字體堆疊、房牌／障子門／湯牌／印章規格、160–420ms 動畫與禁止事項。
`docs/TEST-PLAN.md` 以可勾選清單列出功能、桌機、360px、768px、鍵盤、螢幕閱讀器、對比、減少動態效果、儲存降級、剪貼簿降級及靜態子路徑測試。

- [ ] **Step 5: 加入搜尋引擎與靜態部署檔**

`robots.txt` 使用 `User-agent: *`、`Allow: /` 與網站地圖範例；`sitemap.xml` 只含首頁並以 `https://example.com/moonlit-punchline/` 明確標示部署時須替換的示範網址，README 後續說明替換方式。

- [ ] **Step 6: 執行里程碑驗證**

Run: `node --test tests/static-structure.test.js`
Expected: 2 tests PASS。
Run: `git diff --check`
Expected: 無輸出且 exit code 0。

- [ ] **Step 7: 提交專案骨架**

```bash
git add index.html styles scripts/app.js docs/ART-DIRECTION.md docs/TEST-PLAN.md robots.txt sitemap.xml tests/static-structure.test.js
git commit -m "feat: 建立旅店入口與設計基礎"
```

---

### Task 2: 72 題題庫與遊戲核心

**Files:**
- Create: `data/jokes.js`
- Create: `scripts/joke-engine.js`
- Create: `scripts/game-state.js`
- Create: `tests/jokes.test.js`
- Create: `tests/joke-engine.test.js`
- Create: `tests/game-state.test.js`

**Interfaces:**
- Produces: `JOKE_CATEGORIES`、`JOKES`
- Produces: `validateJokes(jokes)` → `{ valid: boolean, errors: string[] }`
- Produces: `sampleUnique(items, count, random)` → 新陣列
- Produces: `buildChoices(joke, random)` → `{ text: string, correct: boolean }[]`
- Produces: `filterJokes(jokes, category, favoriteIds)` → 新陣列
- Produces: `createGame(jokes, random)`、`answerCurrent(state, text)`、`advanceGame(state)`

- [ ] **Step 1: 寫入題庫契約失敗測試**

`tests/jokes.test.js` 斷言：共 72 題、六類各 12 題、ID 與題目唯一、三個不同干擾選項、答案不在干擾選項、難度只為 1–3、所有字串去除空白後非空。

```js
test('題庫為六類各十二題', () => {
  assert.equal(JOKES.length, 72);
  for (const category of JOKE_CATEGORIES) {
    assert.equal(JOKES.filter((joke) => joke.category === category.id).length, 12);
  }
});
```

- [ ] **Step 2: 執行題庫測試並確認先失敗**

Run: `node --test tests/jokes.test.js`
Expected: FAIL，原因為 `data/jokes.js` 尚不存在。

- [ ] **Step 3: 建立完整 72 題資料**

依 `zh-pun-001..012`、`wordplay-001..012`、`nature-001..012`、`daily-life-001..012`、`world-001..012`、`absurd-001..012` 建立題目。每題明確填入 `question`、`answer`、三個語意相近干擾選項、`region`、能解釋笑點的 `note` 與難度；禁止重複改寫同一笑點充數。

- [ ] **Step 4: 執行題庫契約測試**

Run: `node --test tests/jokes.test.js`
Expected: 全部 PASS。

- [ ] **Step 5: 寫入引擎與狀態失敗測試**

`tests/joke-engine.test.js` 使用固定 random 序列驗證 10 題不重複、四選項唯一且正解唯一、分類與收藏篩選。
`tests/game-state.test.js` 驗證：

```js
test('答對依連勝加分且答錯歸零', () => {
  const first = answerCurrent(createFixtureGame(), '正解一');
  assert.deepEqual({ score: first.score, streak: first.streak }, { score: 120, streak: 1 });
  const second = answerCurrent(advanceGame(first), '錯誤答案');
  assert.equal(second.score, 120);
  assert.equal(second.streak, 0);
});
```

- [ ] **Step 6: 執行核心測試並確認先失敗**

Run: `node --test tests/joke-engine.test.js tests/game-state.test.js`
Expected: FAIL，原因為公開函式尚不存在。

- [ ] **Step 7: 實作最小純函式核心**

`createGame` 抽 10 題並建立 `{ questions, index, score, streak, bestStreak, correctCount, answered, selectedAnswer, finished }`。
`answerCurrent` 拒絕重複作答；答對分數為 `100 + Math.min(nextStreak, 5) * 20`，答錯維持分數並將連勝歸零。
`advanceGame` 只在已作答時前進；最後一題後設定 `finished: true`。

- [ ] **Step 8: 執行全部核心測試與差異檢查**

Run: `node --test tests/jokes.test.js tests/joke-engine.test.js tests/game-state.test.js`
Expected: 全部 PASS。
Run: `git diff --check`
Expected: exit code 0。

- [ ] **Step 9: 提交題庫與核心**

```bash
git add data scripts/joke-engine.js scripts/game-state.js tests/jokes.test.js tests/joke-engine.test.js tests/game-state.test.js
git commit -m "feat: 建立冷梗題庫與遊戲核心"
```

---

### Task 3: 儲存、分享與音效能力

**Files:**
- Create: `scripts/storage.js`
- Create: `scripts/share.js`
- Create: `scripts/audio.js`
- Create: `tests/storage.test.js`
- Create: `tests/share.test.js`
- Create: `tests/audio.test.js`

**Interfaces:**
- Produces: `DEFAULT_PROFILE`、`normalizeProfile(value)`
- Produces: `createProfileStore(storage, key)` → `{ load, save, clear, persistent }`
- Produces: `toggleFavorite(profile, jokeId)` → 新 profile
- Produces: `formatShareText(joke)` → 字串
- Produces: `copyShareText(text, clipboard)` → `Promise<{ copied, text }>`
- Produces: `createAudioController(AudioContextClass)` → `{ supported, enabled, setEnabled, play }`

- [ ] **Step 1: 寫入瀏覽器能力失敗測試**

`tests/storage.test.js` 以記憶體假物件驗證正常讀寫、損壞 JSON、`setItem` 丟錯、收藏切換與清除。
`tests/share.test.js` 驗證分享字串及 Clipboard 成功／拒絕。
`tests/audio.test.js` 驗證缺少 AudioContext 時 `supported === false`，且未啟用時 `play` 不建立節點。

- [ ] **Step 2: 執行測試並確認先失敗**

Run: `node --test tests/storage.test.js tests/share.test.js tests/audio.test.js`
Expected: FAIL，原因為模組尚不存在。

- [ ] **Step 3: 實作儲存與收藏**

`DEFAULT_PROFILE` 固定為：

```js
export const DEFAULT_PROFILE = Object.freeze({
  bestScore: 0,
  bestStreak: 0,
  favorites: [],
  viewed: [],
  soundEnabled: false,
  preferredCategory: 'all'
});
```

`createProfileStore` 捕捉所有 Storage 例外，失敗後改用模組內記憶體值且 `persistent` 回報 false；`normalizeProfile` 只接受已知欄位與合法型別。

- [ ] **Step 4: 實作分享與程式化音效**

`formatShareText` 輸出「問題／答案／月下冷梗旅店」三行。Clipboard 寫入失敗回傳 `{ copied: false, text }`。
音效控制器只在 `setEnabled(true)` 後延遲建立 AudioContext；`play('correct'|'wrong'|'flip')` 以 OscillatorNode 與 GainNode 產生不超過 0.45 秒的短音效。

- [ ] **Step 5: 執行能力測試**

Run: `node --test tests/storage.test.js tests/share.test.js tests/audio.test.js`
Expected: 全部 PASS。

- [ ] **Step 6: 提交瀏覽器能力模組**

```bash
git add scripts/storage.js scripts/share.js scripts/audio.js tests/storage.test.js tests/share.test.js tests/audio.test.js
git commit -m "feat: 加入本機紀錄分享與音效"
```

---

### Task 4: 旅店大廳與四選一挑戰 UI

**Files:**
- Create: `scripts/ui.js`
- Modify: `scripts/app.js`
- Modify: `index.html`
- Modify: `styles/tokens.css`
- Modify: `styles/base.css`
- Modify: `styles/components.css`
- Modify: `styles/layout.css`
- Modify: `styles/motion.css`
- Create: `tests/ui-render.test.js`

**Interfaces:**
- Consumes: Task 2 遊戲核心；Task 3 profile store 與 audio controller
- Produces: `createApp({ document, jokes, store, audio, clipboard, random })`
- Produces: `renderLobby(model)`、`renderChallenge(model)`、`renderResults(model)` 純 HTML 字串
- Produces: 事件委派使用 `data-action` 與 `data-answer`

- [ ] **Step 1: 寫入 UI 轉譯失敗測試**

`tests/ui-render.test.js` 不需要 DOM 函式庫，只測純字串：

```js
test('挑戰畫面提供題號、四個答案與即時回饋關聯', () => {
  const html = renderChallenge(fixtureModel);
  assert.match(html, /第 1 題／共 10 題/);
  assert.equal((html.match(/data-answer=/g) ?? []).length, 4);
  assert.match(html, /aria-describedby="answer-feedback"/);
});
```

另驗證大廳兩個模式入口、結果畫面總分／答對數／最高連勝與重新挑戰。

- [ ] **Step 2: 執行 UI 測試並確認先失敗**

Run: `node --test tests/ui-render.test.js`
Expected: FAIL，原因為 `scripts/ui.js` 尚不存在。

- [ ] **Step 3: 實作純字串畫面與安全跳脫**

建立 `escapeHtml(value)`，所有題庫字串在插入 HTML 前必須跳脫。大廳含今日冷度、最佳成績、收藏數與兩個模式按鈕；挑戰含進度、分數、連勝、問題、四個原生按鈕、作答後註解及下一題；結算含三項成績、收藏最後一題與重新挑戰。

- [ ] **Step 4: 組裝應用程式事件與狀態**

`createApp` 對 `#app-shell` 使用單一 click 事件委派，處理 `open-challenge`、`answer`、`next-question`、`restart`、`go-lobby`、`toggle-sound`。每次轉譯後將焦點移到畫面標題或結果區，不把焦點留在已移除按鈕。

- [ ] **Step 5: 完成大廳與挑戰視覺**

使用核准色票、和紙點紋、月相、房牌、障子門與酒紅印章；不使用外部圖片。手機單欄、平板入口雙欄、桌機橫向大廳；所有按鈕最小高度 44px。作答狀態以圖示、文字與顏色共同表示。

- [ ] **Step 6: 執行自動測試**

Run: `node --test`
Expected: 所有測試 PASS。

- [ ] **Step 7: 啟動靜態伺服器並完成瀏覽器里程碑驗證**

Run: `python -m http.server 4173 --bind 127.0.0.1`
Verify at `http://127.0.0.1:4173/`：

1. 大廳兩個入口可見且 Tab 順序合理。
2. 完成 10 題後總分、答對數與最高連勝正確。
3. 重新整理後最佳成績仍在。
4. 360px、768px、1280px 無水平捲動。
5. 控制台無錯誤。

- [ ] **Step 8: 提交挑戰模式**

```bash
git add index.html styles scripts/app.js scripts/ui.js tests/ui-render.test.js
git commit -m "feat: 完成旅店大廳與問答挑戰"
```

---

### Task 5: 放映室、收藏、複製與完整互動

**Files:**
- Modify: `scripts/ui.js`
- Modify: `scripts/app.js`
- Modify: `styles/components.css`
- Modify: `styles/layout.css`
- Modify: `styles/motion.css`
- Modify: `tests/ui-render.test.js`
- Create: `tests/browser-test.html`
- Create: `tests/browser-test.js`

**Interfaces:**
- Consumes: `filterJokes`、`toggleFavorite`、`copyShareText`、audio controller
- Produces: `renderGallery(model)`、`createGalleryState(jokes, profile)`
- 事件 actions: `open-gallery`、`set-category`、`flip-card`、`previous-joke`、`next-joke`、`random-joke`、`toggle-favorite`、`copy-joke`

- [ ] **Step 1: 擴充失敗測試**

`tests/ui-render.test.js` 新增：八個篩選按鈕、翻牌前不顯示答案、翻牌後顯示註解與地區、收藏空狀態、複製降級欄位。
`tests/browser-test.js` 在瀏覽器頁面執行簡易斷言，結果寫入 `#test-results`：

```js
const checks = [];
const check = (name, pass) => checks.push({ name, pass: Boolean(pass) });
check('支援 ES Modules', 'noModule' in HTMLScriptElement.prototype);
check('支援 localStorage 或可捕捉例外', typeof Storage !== 'undefined');
document.querySelector('#test-results').textContent =
  checks.map(({ name, pass }) => `${pass ? 'PASS' : 'FAIL'}：${name}`).join('\n');
```

- [ ] **Step 2: 執行測試並確認新增案例先失敗**

Run: `node --test tests/ui-render.test.js`
Expected: 新增的放映室案例 FAIL。

- [ ] **Step 3: 實作放映室狀態與畫面**

狀態含 `category`、`visibleJokes`、`index`、`revealed`。切換分類後回到第一題並收起答案；上一題／下一題循環；隨機題不得在可見題目超過一題時留在同一題。收藏篩選為空時不存取不存在的題目。

- [ ] **Step 4: 串接收藏、複製與音效降級**

收藏後立即更新 profile、收藏數與按鈕 `aria-pressed`。複製成功於 `#toast-region` 宣告；失敗則顯示已填入文字的唯讀 textarea、選取文字並提供關閉按鈕。音效不支援時不轉譯切換按鈕。

- [ ] **Step 5: 完成翻牌與減少動態效果**

翻牌只改變可見內容，不將答案放在 `aria-hidden` 的背面造成重複閱讀。一般模式使用 320ms 紙張淡入；`prefers-reduced-motion: reduce` 將動畫時間設為 1ms 並停止霧氣。

- [ ] **Step 6: 執行自動與瀏覽器測試**

Run: `node --test`
Expected: 所有測試 PASS。
Open: `http://127.0.0.1:4173/tests/browser-test.html`
Expected: 頁面所有檢查顯示 PASS。

- [ ] **Step 7: 完成手動里程碑驗證**

在 Chrome 或 Edge 驗證分類、翻牌、收藏、只看收藏、空狀態、複製成功／拒絕、音效開關與重新整理保存；以鍵盤完成同一流程；以 360px 觸控模擬確認按鈕尺寸。

- [ ] **Step 8: 提交放映室**

```bash
git add scripts styles tests
git commit -m "feat: 完成冷梗放映室與收藏互動"
```

---

### Task 6: 專案文件、授權與發布驗證

**Files:**
- Create: `README.md`
- Create: `CONTRIBUTING.md`
- Create: `LICENSE`
- Modify: `docs/TEST-PLAN.md`
- Modify: `docs/PLAN.md`
- Modify: `sitemap.xml` only if a real deployment URL is available
- Create: `tests/documentation.test.js`

**Interfaces:**
- Consumes: 所有已完成的功能與實際驗證命令
- Produces: 可交付專案說明、貢獻規範、MIT 授權與驗證紀錄

- [ ] **Step 1: 寫入文件完整性失敗測試**

`tests/documentation.test.js` 讀取三份必要文件，斷言 README 含遊戲介紹、特色、操作、安裝與執行、專案結構、測試、靜態網站部署、已知限制、授權；CONTRIBUTING 含分支與繁中 Conventional Commit；LICENSE 含 MIT。

- [ ] **Step 2: 執行文件測試並確認先失敗**

Run: `node --test tests/documentation.test.js`
Expected: FAIL，原因為交付文件尚不存在。

- [ ] **Step 3: 撰寫 README、CONTRIBUTING 與 LICENSE**

README 提供直接開啟限制與 `python -m http.server 4173` 建議、Synology NAS Web Station 部署步驟、完整結構樹、`node --test` 指令、瀏覽器測試網址、已知限制與 MIT。
CONTRIBUTING 規定 `feature/xxx`、`fix/xxx`、`chore/xxx`，提交格式 `type(scope): 繁體中文描述`，新增笑話必須維持全齡、三個干擾選項及資料契約。
LICENSE 使用 2026 年與專案貢獻者名稱。

- [ ] **Step 4: 執行完整自動驗證**

Run: `node --test`
Expected: 0 failures。
Run: `git diff --check`
Expected: 無輸出且 exit code 0。
Run: `git status --short`
Expected: 只列出本里程碑預期檔案。

- [ ] **Step 5: 執行最終瀏覽器驗證並更新測試清單**

重新啟動靜態伺服器後，以 1280px、768px、360px 驗證兩種模式完整流程、鍵盤、收藏保存、音效預設關閉、減少動態效果、Clipboard 降級與無控制台錯誤。在 `docs/TEST-PLAN.md` 勾選已執行項目，未能自動確認的螢幕閱讀器細項保留未勾選並列為已知限制，不得假稱通過。

- [ ] **Step 6: 提交文件與驗證結果**

```bash
git add README.md CONTRIBUTING.md LICENSE docs tests/documentation.test.js
git commit -m "docs: 完成專案說明與測試指南"
```

- [ ] **Step 7: 請求程式碼審查並修正**

依 `superpowers:requesting-code-review` 對設計規格、此計畫與全部提交進行需求符合度、程式正確性、安全性、無障礙及內容品質審查；Critical 與 Important 問題必須修正並重新執行 `node --test`。

- [ ] **Step 8: 完成分支與推送前檢查**

依 `superpowers:finishing-a-development-branch` 再次驗證測試與 Git 狀態。只有已設定 remote 時才可推送；推送前必須逐字顯示下列三個命令的實際輸出：

```bash
git remote get-url origin
git branch --show-current
git log -1 --format="%H %s"
```

若沒有 remote，停止於可推送狀態並回報缺少 remote；不得猜測網址或自行建立遠端儲存庫。

---

## Risk Controls

- 題庫品質：資料契約只保證結構；另在程式碼審查逐類抽查笑點、全齡尺度與干擾選項品質。
- 靜態子路徑：HTML、CSS、JavaScript 全用 `./` 或檔案相對路徑，最終以子目錄伺服測試。
- 瀏覽器能力：Storage、Clipboard、Audio 全經可注入包裝，測成功與失敗兩路。
- 無障礙：狀態不只靠色彩；鍵盤、焦點、ARIA live 與減少動態效果均有自動或手動驗收。
- 私密資料：`.gitignore` 排除 `.env` 與常見編輯器檔；Git 檢查只列檔名與差異，不讀取私密檔案。

## Acceptance Checklist

- [ ] 六類各 12 題且全部資料契約測試通過
- [ ] 挑戰每局 10 題不重複，計分與連勝符合規格
- [ ] 放映室的篩選、翻牌、收藏、複製與空狀態可用
- [ ] 最佳成績、收藏、已看題目與偏好可保存並可降級
- [ ] 桌機、平板、手機三組版面無水平捲動
- [ ] 鍵盤可完成主要流程且結果有 ARIA 回饋
- [ ] 減少動態效果與音效預設關閉生效
- [ ] SEO、robots、sitemap、README、授權及貢獻文件齊備
- [ ] `node --test` 0 failures，瀏覽器測試頁全數 PASS
- [ ] 推送前已顯示 remote、branch 與 commit
