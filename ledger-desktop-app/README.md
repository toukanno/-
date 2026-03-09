# Ledger Desktop Starter

Electron + TypeScript で構築する会計帳簿作成デスクトップアプリのスターターリポジトリです。

> 想定用途: 既存の Excel/VBA ベース業務を段階的にネイティブアプリへ移行するための土台。

## 主な構成

- **Electron**: デスクトップアプリ実行基盤
- **TypeScript**: メイン/レンダラープロセスの型安全な実装
- **HTML/CSS**: 画面レイアウトとスタイリング
- **SQLite (better-sqlite3)**: 帳簿データのローカル永続化サンプル

## セットアップ

```bash
npm install
npm run dev
```

## 利用可能なスクリプト

- `npm run dev`: Electron を開発モードで起動
- `npm run build`: TypeScript をビルド
- `npm run start`: ビルド済みコードを起動

## ディレクトリ

```text
ledger-desktop-app/
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ main.ts
   ├─ preload.ts
   ├─ renderer.ts
   ├─ index.html
   └─ styles.css
```

## 次にやること（推奨）

1. Excel/VBA の業務ロジックをユースケース単位で分解
2. 画面要件に合わせた UI コンポーネント化
3. 帳票出力仕様（CSV/PDF/印刷）を定義
4. テスト方針（ユニット/結合/E2E）を確定

