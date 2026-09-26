# Moonlit Punchline／月下冷梗旅店

一間在月色下收藏世界冷笑話的靜態網站。你可以入住十題挑戰房測試梗感，也可以走進放映室，慢慢翻閱、收藏與分享 72 則全齡冷梗。

## 遊戲介紹

「月下冷梗旅店」是一款蒐藏型冷笑話問答遊戲，以日式侘寂的冷泉旅店為視覺背景。內容使用繁體中文，收錄華語諧音、文字遊戲、動植物、食物日常、世界文化與荒謬邏輯六類題目。跨文化題目皆附來源地區及笑點註解。

## 特色

- 兩種玩法：10 題四選一挑戰與自由翻牌放映室
- 六類共 112 則全齡友善內容：華語諧音 40 題、文字遊戲 24 題，其餘四類各 12 題
- 新增 OK 蹦、英文字母、食物與音樂諧音；新增題目附整理來源，詳見 [題庫來源](docs/JOKE-SOURCES.md)
- 分數、連勝、收藏、已看題目與偏好保存於瀏覽器
- 分類篩選、隨機換題、收藏清單與分享文字
- Web Audio API 產生短音效，不載入外部音效檔
- Storage、Clipboard 與 Audio 不可用時皆有安全降級
- 360px、768px、1280px 三組響應式版面
- 鍵盤焦點、ARIA live region 與減少動態效果支援
- 不使用框架、後端、遠端字型、分析追蹤或私人金鑰

## 操作方式

### 入住挑戰房

1. 在大廳選擇「入住挑戰房」。
2. 每題從四個答案選一個；作答後會顯示正解與笑點註解。
3. 答對獲得 100 分，連勝另有最高 100 分加成。
4. 完成 10 題後查看總分、答對數及最高連勝。
5. 選擇「再住一晚」重新抽題，或返回大廳。

### 走進放映室

1. 在大廳選擇「走進放映室」。
2. 使用房間籤篩選六類題庫，或只看收藏。
3. 選擇「翻牌看答案」揭曉答案、註解與來源。
4. 可收藏、複製分享文字、隨機換題或前後切換。

所有主要控制皆為原生按鈕，可使用 Tab 移動焦點、Enter 或 Space 觸發。

## 安裝與執行

專案沒有套件相依或建構步驟。ES Modules 在部分瀏覽器以 `file://` 直接開啟時會受安全政策限制，因此建議使用本機靜態伺服器：

```powershell
cd F:\Codex\Projects\moonlit-punchline
python -m http.server 4173 --bind 127.0.0.1
```

接著開啟 `http://127.0.0.1:4173/`。

也可以使用任何能提供靜態檔案的工具；伺服器只需要正確回傳 HTML、CSS、JavaScript、XML 與文字檔案。

## 專案結構

```text
moonlit-punchline/
├─ data/
│  ├─ jokes.js                 # 六類 112 題不可變題庫入口
│  └─ extra-jokes.js           # 40 題擴充內容與整理來源
├─ docs/
│  ├─ ART-DIRECTION.md         # 色票、字體、元件與動畫規範
│  ├─ PLAN.md                  # 需求、範圍、里程碑與驗收
│  ├─ TEST-PLAN.md             # 自動、手動、行動裝置與無障礙清單
│  └─ superpowers/specs/       # 核准的產品設計規格
├─ scripts/
│  ├─ app.js                   # 啟動與模組組裝
│  ├─ audio.js                 # 程式化音效
│  ├─ game-state.js            # 遊戲狀態與計分純函式
│  ├─ joke-engine.js           # 驗證、抽題、洗牌與篩選
│  ├─ share.js                 # 分享文字與剪貼簿降級
│  ├─ storage.js               # 本機紀錄與記憶體降級
│  └─ ui.js                    # 畫面轉譯、事件與焦點
├─ styles/
│  ├─ tokens.css
│  ├─ base.css
│  ├─ components.css
│  ├─ layout.css
│  └─ motion.css
├─ tests/
│  ├─ browser-test.html        # 瀏覽器能力手動測試頁
│  └─ *.test.js                # Node 內建自動測試
├─ index.html
├─ robots.txt
└─ sitemap.xml
```

## 測試方式

需要 Node.js 20 或更新版本。執行全部自動測試：

```powershell
node --test
```

測試涵蓋題庫契約、抽題與洗牌、計分、儲存降級、收藏、分享、音效、UI 字串安全及交付文件。

啟動靜態伺服器後，開啟瀏覽器能力測試：

```text
http://127.0.0.1:4173/tests/browser-test.html
```

完整手動清單請見 [docs/TEST-PLAN.md](./docs/TEST-PLAN.md)。

## 靜態網站部署

### 一般靜態網站

將整個專案目錄上傳，並把網站入口設定為 `index.html`。所有執行資源使用相對路徑，可部署在網域根目錄或子目錄。

部署前請將以下示範網址換成正式網址：

- `index.html` 的 Canonical 與 Open Graph URL
- `robots.txt` 的 Sitemap URL
- `sitemap.xml` 的首頁 URL

### Synology NAS Web Station

1. 在 Web Station 建立「靜態網站」入口。
2. 將本專案所有檔案複製至該入口的文件根目錄或子目錄。
3. 確認 `.js` 以 JavaScript MIME type 提供。
4. 使用 HTTPS 網址測試 Storage、Clipboard 與音效。
5. 若部署於子目錄，從該網址開啟首頁並確認開發者工具沒有 404。

不需要 Docker、反向代理、資料庫或後端 API。

## 已知限制

- 題庫僅有繁體中文介面，跨文化內容是繁中解釋，不是多語原文。
- 紀錄只保存在目前瀏覽器；清除網站資料或使用私密瀏覽會遺失紀錄。
- Clipboard API 可能因非 HTTPS、權限或瀏覽器政策被拒絕，屆時改為手動複製。
- Web Audio API 可能不受部分舊瀏覽器支援；音效功能會隱藏或保持關閉。
- `sitemap.xml`、`robots.txt` 與 Canonical 內的 `example.com` 必須在正式部署前替換。
- 已以自動化 Chrome 驗證主要鍵盤焦點與 ARIA 狀態；完整螢幕閱讀器人工測試仍列在測試清單。
- 使用 `file://` 直接開啟可能因 ES Modules 安全政策無法執行，請使用靜態伺服器。

## 授權

程式碼與本專案整理的題庫內容採 [MIT License](./LICENSE)。新增內容前請確認不複製受著作權保護的長篇笑話集，並遵守全齡友善與貢獻規範。
