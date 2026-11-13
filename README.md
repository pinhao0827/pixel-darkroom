# 像素暗房 Pixel Darkroom

給修圖初學者的互動筆記。使用同一張雨夜巷弄影像，分別觀察亮度、對比和飽和度。每篇都有可比較原圖的滑桿和一組短練習。練習影像由 AI 生成。

## 開始使用

直接開啟 `docs/index.html` 即可離線瀏覽。開發使用 Node.js 20 以上，不需安裝套件。

```sh
node scripts/build.mjs
node scripts/build.mjs --check
```

第一次部署時，到 GitHub Repository 的 **Settings → Pages**，將來源設為 **Deploy from a branch**，發布分支選 `main`，資料夾選 `/docs`。之後提交更新後的 `docs/` 即可。

## 繼續寫筆記

先讀 [AGENTS.md](AGENTS.md)。在 `notes/` 新增一份符合欄位規則的 JSON，重建後首頁、分類和上下篇導覽會自動更新。
