# - (個人開発リポジトリ)

Web開発の学習・実験用リポジトリです。クリエイティブエージェンシーのサイト、お問い合わせフォーム、ブラウザゲーム集、自動開発ツールなど、さまざまなプロジェクトをまとめています。

## プロジェクト構成

```
.
├── index.html              # NEXUS クリエイティブエージェンシーのLP
├── mail_confirm.php        # お問い合わせフォーム（確認画面）
├── insert.php              # お問い合わせフォーム（DB登録処理）
├── style.css / style2.css  # スタイルシート
├── auto-developer/         # GitHub リポジトリ自動開発ツール
├── games/                  # ブラウザ & Android ゲーム集（10種類）
└── sites/                  # 各種Webサイトテンプレート
```

## 各プロジェクトの説明

### NEXUS クリエイティブエージェンシー LP (`index.html`)

モダンなダークテーマのランディングページです。スクロールアニメーション、マーキー演出、レスポンシブ対応を備えたシングルページサイト。

### お問い合わせフォーム (`mail_confirm.php` / `insert.php`)

XAMPP + MySQL（`lesson01` データベース）でお問い合わせ内容をDBに保存するシンプルなフォームです。名前・メールアドレス・年齢・コメントを入力し、確認画面を経てデータベースに登録します。

### 自動開発ツール (`auto-developer/`)

Claude API を使って、README.md しかない未実装の GitHub リポジトリを自動的に検出し、コードを生成・コミットするツールです。GitHub Actions で毎日定時実行できます。詳細は [auto-developer/README.md](./auto-developer/README.md) を参照。

### ゲーム集 (`games/`)

ブラウザで遊べる9種類のWebゲームと、1つのAndroidゲームを収録しています。

| ゲーム | 技術 | 説明 |
|--------|------|------|
| スネーク | HTML/JS | 古典的なスネークゲーム |
| テトリス | HTML/JS | ゴーストピース付きテトリス |
| ブロック崩し | HTML/JS | パワーアップ付きブロック崩し |
| フラッピーバード | HTML/JS | 障害物をよけて飛ぶ鳥 |
| 迷路ランナー | HTML/JS | 自動生成迷路 |
| 神経衰弱 | HTML/JS | カード神経衰弱 |
| モグラたたき | HTML/JS | モグラたたきゲーム |
| 2048 | HTML/JS | 2048パズルゲーム |
| パックマン | HTML/JS | パックマン風ゲーム |
| 縦スクロールシューター | Android (Kotlin) | タッチ操作の宇宙シューティング |

Webゲームは各フォルダの `index.html` をブラウザで開くだけで遊べます。

### Webサイトテンプレート (`sites/`)

さまざまなデザインパターンのWebサイトテンプレートを収録しています。

- `catalog-luxe` — 高級感のあるカタログサイト
- `landing-premium` — プレミアムLP
- `main-site` — メインサイト
- `product-modern-01` 〜 `05` — モダンな商品紹介ページ（5種類）
- `product-showcase-01` 〜 `02` — 商品ショーケースページ（2種類）

## 技術スタック

- **フロントエンド**: HTML / CSS / JavaScript
- **バックエンド**: PHP (XAMPP)
- **データベース**: MySQL
- **モバイル**: Kotlin (Android)
- **AI連携**: Claude API (Anthropic)
- **CI/CD**: GitHub Actions
