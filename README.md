# 修圖練習室 Photo Editing Lab

用雨中的紅燈籠和陽光下的水果攤兩張照片練習亮度、對比和飽和度。換照片時，滑桿會留在原來的位置，可以直接比較同樣的設定在兩個場景有什麼差別。每篇都有滑桿和三個練習步驟。可以來回切換原圖，看清楚自己剛才改了什麼。練習照片由 AI 生成。

[打開修圖練習室](https://pinhao0827.github.io/pixel-darkroom/) · [閱讀 AGENTS.md](AGENTS.md)

## 在自己的電腦上打開

用瀏覽器開啟 `docs/index.html`。改了筆記或版型之後，請用 Node.js 20 以上在專案根目錄執行下列指令。

```sh
node scripts/build.mjs
node scripts/build.mjs --check
```

## 想加一篇？

照 [AGENTS.md 的完整範例](AGENTS.md#新增一篇筆記)，在 `notes/` 放一份新的 JSON 再重跑建置。首頁會自己多一張卡片，分類和上下篇連結也會跟著更新。

## 發布到 GitHub Pages

在 Repository 的 **Settings → Pages** 選 **Deploy from a branch**，分支選 `main`，資料夾選 `/docs`。下次更新時，把來源和重新建置的 `docs/` 一起推上去。
