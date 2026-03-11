<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2b3762a7-ad45-4ef0-a2a5-631129604709

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## 🚀 部署與最新設定指南

### 1. 套件與環境
已在 `package.json` 加入 Node 版本限制（`>=18.0.0`），確保環境一致性。
- 請執行 `npm install` 安裝相依套件。
- 測試能否正常啟動：`npm run dev`。

### 2. GitHub Actions 自動部署
本專案已加入 `.github/workflows/deploy.yml`。
- **作用**：只要程式碼推入 `main` 或 `master` 分支，即會自動建置並部署靜態檔案至 **GitHub Pages**。

### 3. Git 忽略檔案設定
`.gitignore` 已重新設計：
- 排除不需要的套件目錄：`node_modules/`
- 排除建置暫存與產出物：`dist/`、`build/`
- 排除私人敏感資訊：`.env`、`.env.local` 等（`.env.example` 予以上傳）
- 排除編輯器建立的無用檔案與快取：`.DS_Store`、`.eslintcache`、`*.log`
