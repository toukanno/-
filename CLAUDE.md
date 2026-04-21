# CLAUDE.md

このリポジトリは `toukanno` のポートフォリオ／デモ用モノレポです。Web サイトテンプレート、ブラウザ・Android ゲーム、Electron デスクトップアプリ、Chrome 拡張、PHP フォーム、Claude API を活用した自動開発システムなどを含みます。

## リポジトリ構成

```
/
├── index.html                   # NEXUS Creative Agency ポートフォリオサイト（ルートLP）
├── contact.html                 # コンタクトフォーム（HTML/PHP/MySQL）
├── mail_confirm.php             # フォーム確認画面
├── insert.php                   # フォーム DB 登録処理（※学習用・SQLi あり）
├── style.css / style2.css       # フォーム用スタイル
├── README.md                    # プロジェクト概要（日本語）
├── BRANCHES.md                  # ブランチ一覧と役割
├── CODE_REVIEW.md               # 直近のコードレビュー記録
├── EXTERNAL_REPO_CREATED.md     # 外部リポジトリ作成メモ
├── .gitignore                   # Node/macOS/env を除外
├── auto-developer/              # Claude API 自動開発システム（Python）
├── chrome-extensions/           # Chrome 拡張機能
│   └── css-visualizer/          # CSS 可視化拡張（Manifest V3）
├── desktop-apps/                # Electron デスクトップアプリ 20 種（雛形）
├── electron-kaikei-app/         # 会計帳簿作成 Electron アプリ
├── games/                       # ゲーム 20 作品（Web 19 + Android 1）
├── note-repo/                   # note 記事管理用リポジトリ雛形
├── repos/                       # 10 プロジェクト雛形（personal-blog 等）
├── sites/                       # Web サイトテンプレート 70 種
└── .claude/                     # Claude Code 設定・フック
```

## 技術スタック

| レイヤー | 技術 | 用途 |
|----------|------|------|
| フロントエンド | HTML5, CSS3, Vanilla JS | サイト、ゲーム、会計アプリ UI |
| バックエンド | PHP | コンタクトフォーム |
| DB | MySQL | フォームデータ保存（参考実装） |
| デスクトップ | Electron 28 | `electron-kaikei-app/`, `desktop-apps/` |
| ブラウザ拡張 | Chrome Extension Manifest V3 | `chrome-extensions/css-visualizer` |
| モバイル | Kotlin, Android SDK | Vertical Scroll Shooter |
| 自動化 | Python 3.12+, Anthropic Claude API (`claude-opus-4-6` + adaptive thinking) | `auto-developer/` |
| ビルド | Gradle / electron-builder | Android / Electron |
| CI/CD | GitHub Actions | auto-developer スケジュール実行 |

## 開発ワークフロー

### ブランチ命名規則
- Claude Code 連携: `claude/[タスク名]-[ID]`（例: `claude/add-claude-documentation-27uJJ`）
- Codex 連携: `codex/[タスク名]`
- 統合先: `master`
- コミットメッセージ: 日本語説明 + `feat:` / `fix:` / `chore:` / `merge:` 等のプレフィックス
- ブランチ詳細は `BRANCHES.md` を参照

### ビルド・テスト
- **ルート / sites / games（Web）**: ビルド不要。各ディレクトリの `index.html` をブラウザで開く。
- **Android ゲーム**: `games/vertical-scroll-shooter-android/` で `./gradlew assembleDebug`（Min SDK 24 / Target SDK 34）。
- **Electron 会計アプリ**: `electron-kaikei-app/` で `npm install` → `npm start`（DevTools 有効: `npm run dev`、パッケージ: `npm run build`）。
- **Electron デスクトップアプリ群**: 各 `desktop-apps/NN-*/` で `npm install && npm start`（現状は README のみの雛形が多い）。
- **auto-developer**: `pip install -r auto-developer/requirements.txt` → `python auto-developer/develop_repos.py`。
- **Chrome 拡張**: `chrome-extensions/css-visualizer/` をブラウザの「パッケージ化されていない拡張機能」として読み込む。
- **リンター・テスト**: 未設定。コミット前は `php -l`、`python -m py_compile` などで構文チェック推奨。

### CI/CD (`auto-developer/`)
- GitHub Actions で毎日 UTC 9:00（日本時間 18:00）にスケジュール実行。
- `workflow_dispatch` で手動実行も可能。
- 既定: 1 回あたり最大 3 リポジトリを処理（`MAX_REPOS_PER_RUN`）。
- `DEVELOP_ALL_REPOS=true` で全未実装リポジトリを対象にできる。
- 必要 Secrets: `ANTHROPIC_API_KEY`, `REPO_ACCESS_TOKEN`, `GITHUB_USERNAME`（任意）, `DEVELOP_ALL_REPOS`（任意）。

## コーディング規約

### 全般
- ファイル・ディレクトリ名: **ケバブケース**（例: `product-modern-01`, `vertical-scroll-shooter-android`）。`repos/` 配下は `NN-name` で連番管理。
- コメント・ドキュメント: 基本は**日本語**。
- フレームワーク原則不使用: Vanilla HTML/CSS/JS を基本とする。

### フロントエンド（sites / games / ルート）
- 各ページは**単一 HTML ファイル**で完結（インライン CSS/JS）、外部依存なし。
- モバイルレスポンシブ対応（ブレークポイント: 768px）。
- ダークテーマ + CSS 変数によるテーマ管理。
- スクロールアニメーション／マーキー演出を多用。

### PHP（コンタクトフォーム）
- XAMPP ローカル環境を想定。
- MySQL 接続: `mysql:dbname=lesson01;host=localhost`。
- ⚠ 既知の脆弱性（`CODE_REVIEW.md` 参照）: `insert.php` の SQL インジェクション、`mail_confirm.php` の反射型 XSS、CSRF 未対策、DB 認証情報ハードコード。本番利用時は必ず修正すること。

### Python（`auto-developer/`）
- Python 3.12+ / `anthropic` SDK（`claude-opus-4-6` + adaptive thinking）。
- `requests` のタイムアウト未設定、正規表現抽出の厳格化が改善余地（`CODE_REVIEW.md` 参照）。

### Electron（`electron-kaikei-app/`, `desktop-apps/`）
- Electron 28 系。
- セキュリティ方針: `contextIsolation: true` + `preload.js` 構成を維持。
- データ永続化: 会計アプリは現状 `localStorage`、本番移行時は IPC + `better-sqlite3` に差し替える想定。

### Chrome 拡張（`chrome-extensions/css-visualizer/`）
- Manifest V3。`activeTab` / `scripting` のみ。
- `content.js` + `content.css` + `popup.html` / `popup.js` の最小構成。

### Android / Kotlin（`games/vertical-scroll-shooter-android/`）
- Min SDK: API 24（Android 7.0）／ Target SDK: API 34（Android 14）。
- カスタム `SurfaceView` による 60FPS ゲームループ。

## ディレクトリ詳細

### `games/` — ゲーム 20 作品
Web（HTML/JS）: 2048, breakout, brick-breaker, chess, connect-four, flappy-bird, hangman, maze-runner, memory-match, minesweeper, othello, pac-man, puzzle-15, simon-says, snake-game, sudoku, tetris, typing-game, whack-a-mole。
Android（Kotlin）: vertical-scroll-shooter-android。

### `sites/` — Web サイトテンプレート 70 種
店舗・サービス系（`cafe-tokyo`, `bakery-artisan`, `ramen-shop`, `sushi-bar`, `yoga-studio`, `hair-salon` など）、プロダクト系（`product-modern-01`〜`05`, `product-showcase-01`/`02`）、ランディング／カタログ（`landing-premium`, `catalog-luxe`）、ユーティリティ系（`calculator`, `password-generator`, `qr-generator`, `pomodoro-timer`, `markdown-editor`, `stopwatch-timer`, `unit-converter`, `weather-app`, `todo-app`, `color-picker`）などを収録。`main-site/` がメインサイト。

### `desktop-apps/` — Electron デスクトップアプリ 20 種（雛形）
`01-calculator` 〜 `20-video-player` の連番ディレクトリ。各アプリは `npm install && npm start` で起動する想定（現状は多くが README のみのスキャフォールド）。

### `electron-kaikei-app/` — 会計帳簿作成アプリ
仕訳帳・総勘定元帳・試算表・貸借対照表・損益計算書・勘定科目マスタ・CSV エクスポート（BOM 付き UTF-8）。Electron 28 + Vanilla JS + localStorage。`main.js` / `preload.js` / `renderer/` 構成。

### `chrome-extensions/css-visualizer/` — CSS 可視化 Chrome 拡張
任意ページで CSS プロパティ（ボックスモデル、Grid、Flexbox、z-index 等）を可視化。

### `repos/` — プロジェクト雛形 10 種
`01-personal-blog` 〜 `10-recipe-book`（portfolio-site, todo-app, weather-dashboard, e-commerce-store, chat-app, notes-app, quiz-app, music-player, recipe-book）。各ディレクトリは README のみのスキャフォールドで、`auto-developer/` の生成対象になり得る。

### `note-repo/` — note 記事管理リポジトリ雛形
`drafts/`（下書き `YYYY-MM-DD-title.md`）、`published/`（公開済み）、`assets/`（画像等）。

### `auto-developer/` — 自動開発システム
Claude API で未実装 GitHub リポジトリを検出し、コード生成 → コミットまで自動化。毎日 JST 18:00 に GitHub Actions で実行。詳細は `auto-developer/README.md`。

## Claude Code 設定

### セッションフック（`.claude/hooks/session-start.sh`）
- `CLAUDE_CODE_REMOTE=true` のリモート実行時のみ動作。
- `~/.github_token` が存在すれば読み込み `REPO_ACCESS_TOKEN` を `$CLAUDE_ENV_FILE` にエクスポート。
- トークン無しでも `git ls-remote origin HEAD` が通ればプロキシ経由アクセス可能として続行。

### 設定ファイル（`.claude/settings.json`）
- `SessionStart` フックに上記シェルスクリプトを登録。

## 注意事項
- `insert.php` / `mail_confirm.php` は**学習用コード**。SQL インジェクション・XSS・CSRF 未対策のまま公開されている。運用前に必ず修正（詳細は `CODE_REVIEW.md`）。
- `games/vertical-scroll-shooter-android/build/` などビルド生成物が紛れ込んでいる可能性あり。`.gitignore` に `build/` 追記を検討。
- `desktop-apps/` と `repos/` 配下は雛形中心。実装状況を確認してから作業すること。
- `develop_repos.py` の外部 API 呼び出しは `timeout` 未指定。編集時は併せて堅牢性改善を推奨。
