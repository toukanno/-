# 会計帳簿作成システム（Electron版）

省庁向け会計帳簿作成ExcelソフトをElectronでネイティブアプリ化した参考実装です。

## 機能

- **仕訳帳** - 仕訳入力・編集・削除、日付絞り込み
- **総勘定元帳** - 勘定科目別の取引履歴・残高確認
- **試算表** - 全勘定科目の借方・貸方・残高集計
- **貸借対照表** - 資産・負債・純資産の一覧
- **損益計算書** - 収益・費用・当期純利益の計算
- **勘定科目マスタ** - 科目の追加・編集・削除
- **CSVエクスポート** - 仕訳帳のCSV出力（BOM付きUTF-8）

## 技術スタック

| 技術 | 用途 |
|------|------|
| Electron 28 | ネイティブアプリ化 |
| HTML5 / CSS3 | UI |
| Vanilla JS (ES6+) | フロントエンドロジック |
| localStorage | データ永続化（参考実装） |
| better-sqlite3 | 本番用DB（要移行） |

## セットアップ

```bash
cd electron-kaikei-app
npm install
npm start
```

## 開発モード（DevTools有効）

```bash
npm run dev
```

## ビルド

```bash
npm run build
```

## ディレクトリ構成

```
electron-kaikei-app/
├── main.js          # Electron メインプロセス
├── preload.js       # プリロードスクリプト（セキュアAPI公開）
├── package.json
├── renderer/
│   ├── index.html   # メインUI
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── db.js    # データ管理層（localStorage版）
│       └── app.js   # アプリケーションロジック
└── assets/          # アイコン等
```

## 本番移行時の注意点

- `renderer/js/db.js` の localStorage 実装を、IPC + `better-sqlite3` による
  SQLite実装に置き換えてください
- メインプロセス (`main.js`) 側にDB操作のIPCハンドラーを追加してください
- セキュリティ: `contextIsolation: true` + `preload.js` の構成を維持してください

## 対象会計年度

アプリ起動時に現在年度〜5年前まで選択可能です。
