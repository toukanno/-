# - (ダッシュ) リポジトリ

Webサイト、ゲーム、ツールなどをまとめた総合リポジトリです。

---

## リポジトリ構成

```
.
├── index.html          # NEXUS クリエイティブエージェンシーのサイト
├── contact.html        # お問い合わせフォーム (PHP/MySQL連携)
├── mail_confirm.php    # お問い合わせ内容確認ページ
├── insert.php          # お問い合わせデータのDB登録処理
├── style.css / style2.css
├── auto-developer/     # GitHub リポジトリ自動開発ツール
├── games/              # 10種類のゲーム集
└── sites/              # 40種類の業種別Webサイトテンプレート
```

---

## 各ディレクトリの説明

### ルート直下 — NEXUS クリエイティブエージェンシー

`index.html` はダークテーマのモダンなクリエイティブエージェンシーのランディングページです。サービス紹介、ポートフォリオ、プロセス説明、お客様の声などのセクションで構成されています。

お問い合わせフォーム (`contact.html`) はXAMPP環境でMySQLデータベースに接続して動作します。フォーム送信 → 確認画面 (`mail_confirm.php`) → DB登録 (`insert.php`) の流れです。

---

### auto-developer/ — リポジトリ自動開発ツール

Claude APIを使って、未実装のGitHubリポジトリを自動で開発するシステムです。

- **言語**: Python
- **仕組み**: GitHub APIでリポジトリ一覧を取得し、README.mdしかないリポジトリを検出して、Claude Opus でコードを自動生成
- **実行**: GitHub Actionsで毎日1回自動実行（日本時間18:00）、手動実行も可能
- **制限**: 1回あたり最大3リポジトリを処理

詳しくは [auto-developer/README.md](./auto-developer/README.md) を参照。

---

### games/ — ゲームコレクション（10種類）

HTML/JavaScript/CSSで作られたブラウザゲームと、1つのAndroidゲームを収録しています。

| ゲーム | 技術 | 説明 |
|--------|------|------|
| 2048 | Web (HTML/JS) | 数字スライドパズルゲーム |
| スネーク | Web (HTML/JS) | 古典的なスネークゲーム |
| テトリス | Web (HTML/JS) | ゴーストピース付きテトリス |
| ブロック崩し | Web (HTML/JS) | パワーアップ付きブロック崩し |
| フラッピーバード | Web (HTML/JS) | 障害物を避けて飛ぶゲーム |
| 迷路ランナー | Web (HTML/JS) | 自動生成迷路 |
| 神経衰弱 | Web (HTML/JS) | カード神経衰弱 |
| モグラたたき | Web (HTML/JS) | モグラたたきゲーム |
| パックマン | Web (HTML/JS) | パックマン風ゲーム |
| 縦スクロールシューター | Android (Kotlin) | タッチ操作の宇宙シューティング |

Webゲームは各フォルダの `index.html` をブラウザで開くだけで遊べます。

詳しくは [games/README.md](./games/README.md) を参照。

---

### sites/ — 業種別Webサイトテンプレート（40種類）

さまざまな業種向けのWebサイトテンプレート集です。すべてHTML/CSS/JSの単一ファイル構成で、レスポンシブ対応しています。

#### 飲食・食品

| サイト | 説明 |
|--------|------|
| bakery-artisan | 手作りパン・クロワッサンのアルチザンベーカリー |
| cafe-tokyo | スペシャルティコーヒーと手作りペストリーのカフェ |
| cooking-class | 和食・洋食・製菓のクッキングスクール |
| craft-beer-bar | 20種類以上のタップビールとフードペアリングのクラフトビアバー |
| organic-farm | 旬の野菜販売と農業体験ができるオーガニック農園 |
| restaurant-italian | 自家製パスタとワインのイタリアンレストラン |
| sushi-bar | おまかせコースと日本酒の高級寿司店 |

#### 美容・ヘルスケア

| サイト | 説明 |
|--------|------|
| beauty-salon | フェイシャル・ボディ・ブライダルスキンケアの美容サロン |
| clinic-dental | 一般歯科・ホワイトニング・矯正の歯科クリニック |
| fitness-gym | パーソナルトレーニング・グループレッスン・24時間営業のフィットネスジム |
| hair-salon | カット・カラー・パーマ・ヘッドスパのヘアサロン |
| nail-salon | ジェルネイル・ネイルケア・ペディキュアのネイルサロン |
| yoga-studio | ハタヨガ・ホットヨガ・マタニティヨガのヨガスタジオ |

#### 教育・スクール

| サイト | 説明 |
|--------|------|
| dance-academy | ヒップホップ・ジャズ・キッズダンスのダンスアカデミー |
| kindergarten | 自然体験・食育・英語教育の幼稚園 |
| music-school | ピアノ・ギター・ボイストレーニングの音楽教室 |

#### 専門サービス

| サイト | 説明 |
|--------|------|
| architecture-firm | 住宅設計・商業施設・リノベーションの建築設計事務所 |
| auto-repair | 車検・修理・カスタマイズの自動車整備工場 |
| law-firm | 企業法務・民事・刑事の法律事務所 |
| photography-studio | ウェディング・家族・商品撮影のフォトスタジオ |
| real-estate | 賃貸・売買・リノベーションの不動産会社 |
| wedding-planner | チャペル・和婚・リゾートウェディングのウェディングプランナー |

#### 小売・ショップ

| サイト | 説明 |
|--------|------|
| bookstore-online | 100万冊以上の書籍・電子書籍・レビューのオンライン書店 |
| flower-shop | ブーケ・ウェディング装花・定期便のフラワーショップ |
| pet-shop | ペット販売・用品・トリミングのペットショップ |
| vintage-clothing | レディース・メンズ・アクセサリーのヴィンテージ古着屋 |

#### 旅行・宿泊

| サイト | 説明 |
|--------|------|
| hotel-resort | オーシャンビュー・フレンチレストラン・スパのリゾートホテル |
| travel-agency | 国内・海外ツアー・オーダーメイド旅行の旅行会社 |

#### テクノロジー・クリエイティブ

| サイト | 説明 |
|--------|------|
| landing-premium | AIデザインプラットフォームのランディングページ |
| main-site | デザイン・開発サービスのクリエイティブエージェンシー |
| portfolio-developer | Webアプリ開発・UIデザインの開発者ポートフォリオ |
| tech-startup | AI・クラウド・データ分析のテクノロジー企業 |

#### 商品紹介ページ

| サイト | 説明 |
|--------|------|
| catalog-luxe | ファッション・ライフスタイルのラグジュアリー商品カタログ |
| product-modern-01 | スマートウォッチ「AURA Watch」の商品ページ |
| product-modern-02 | 高級フレグランス「NOIR Parfum」の商品ページ |
| product-modern-03 | ワイヤレスヘッドホン「PULSE」の商品ページ |
| product-modern-04 | 自然派スキンケア「LUMIERE」の商品ページ |
| product-modern-05 | スポーツギア「APEX」の商品ページ |
| product-showcase-01 | 電動バイク「VOLTA」の商品ページ |
| product-showcase-02 | スマートホームハブ「ORBIT」の商品ページ |

---

## 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript
- **バックエンド**: PHP (お問い合わせフォーム)
- **データベース**: MySQL (XAMPP環境)
- **モバイル**: Kotlin / Android (シューティングゲーム)
- **自動化**: Python, GitHub Actions, Claude API
