# CLAUDE.md

このリポジトリは `toukanno` のポートフォリオ・デモ用リポジトリです。ウェブサイトテンプレート、ゲームコレクション、コンタクトフォーム、Claude API を活用した自動開発システムを含みます。

## リポジトリ構成

```
/
├── index.html              # NEXUS Creative Agency ポートフォリオサイト
├── contact.html            # コンタクトフォーム（HTML/PHP/MySQL）
├── mail_confirm.php        # フォーム確認ページ
├── insert.php              # DB挿入スクリプト
├── style.css / style2.css  # フォーム用スタイル
├── auto-developer/         # Claude API 自動開発システム（Python）
├── games/                  # ゲームコレクション（10作品）
├── sites/                  # ウェブサイトテンプレート集（10種類）
└── .claude/                # Claude Code 設定・フック
```

## 技術スタック

| レイヤー | 技術 | 用途 |
|----------|------|------|
| フロントエンド | HTML5, CSS3, Vanilla JS | 全サイト・ゲーム |
| バックエンド | PHP | コンタクトフォーム |
| データベース | MySQL | フォームデータ保存 |
| モバイル | Kotlin, Android SDK | Vertical Scroll Shooter |
| 自動化 | Python 3.12+, Anthropic Claude API | auto-developer |
| ビルド | Gradle | Android ゲーム |
| CI/CD | GitHub Actions | auto-developer スケジュール実行 |

## 開発ワークフロー

### ブランチ命名規則
- Claude Code 連携: `claude/[タスク名]-[ID]`
- コミットメッセージ: 日本語説明 + `feat:`, `merge:` などのプレフィックス

### ビルド・テスト
- **ウェブサイト・ゲーム**: ビルドステップ不要（単一HTMLファイル、そのままブラウザで開く）
- **Android ゲーム**: `games/vertical-scroll-shooter-android/` で `./gradlew build`
- **auto-developer**: `pip install -r auto-developer/requirements.txt` → `python auto-developer/develop_repos.py`
- **リンター・テストフレームワーク**: 未設定

### CI/CD (auto-developer)
- GitHub Actions で毎日 UTC 9:00（日本時間 18:00）に実行
- `workflow_dispatch` で手動実行も可能
- 1回あたり最大3リポジトリを処理

## コーディング規約

### 全般
- ファイル・ディレクトリ名: **ケバブケース** (`product-modern-01`, `vertical-scroll-shooter-android`)
- 言語: 日本語のコメント・ドキュメントが標準
- フレームワーク不使用: Vanilla HTML/CSS/JS を基本とする

### フロントエンド（サイト・ゲーム）
- 各ページは**単一HTMLファイル**で完結（インラインCSS/JS）
- 外部依存なし
- モバイルレスポンシブ対応（ブレークポイント: 768px）
- ダークテーマ + CSS変数によるテーマ管理
- スクロールアニメーション対応

### PHP（コンタクトフォーム）
- XAMPP ローカル環境を想定
- MySQL 接続: `mysql:dbname=lesson01;host=localhost`

### Python（auto-developer）
- Python 3.12+
- Claude Opus 4.6 + adaptive thinking モード
- `anthropic` SDK 使用

### Android/Kotlin
- Min SDK: API 24 (Android 7.0)
- Target SDK: API 34 (Android 14)
- カスタム SurfaceView による 60FPS ゲームループ

## ディレクトリ詳細

### `games/` — ゲームコレクション（10作品）
| ゲーム | 技術 |
|--------|------|
| Snake, Tetris, Brick Breaker, Flappy Bird | HTML/JS |
| Maze Runner, Memory Match, Whack-a-Mole | HTML/JS |
| 2048, Pac-Man | HTML/JS |
| Vertical Scroll Shooter | Kotlin/Android |

### `sites/` — ウェブサイトテンプレート（10種類）
- `main-site/` — NEXUS Creative Agency（メインサイト）
- `product-modern-01` 〜 `05` — モダンプロダクトショーケース
- `product-showcase-01`, `02` — プロダクトショーケース
- `landing-premium` — プレミアムランディングページ
- `catalog-luxe` — ラグジュアリーカタログ

### `auto-developer/` — 自動開発システム
Claude API を使って未完成リポジトリのコードを自動生成するPythonスクリプト。GitHub Actions でスケジュール実行される。

## Claude Code 設定

### セッションフック (`.claude/hooks/session-start.sh`)
- `~/.github_token` から GitHub トークンを読み込み `REPO_ACCESS_TOKEN` に設定
- リモート環境（`CLAUDE_CODE_REMOTE=true`）でのみ実行

## 注意事項
- `insert.php` には SQL インジェクション脆弱性あり（学習用コード）
- 本番環境へのデプロイ前にセキュリティ対策が必要
