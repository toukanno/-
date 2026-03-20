# note-repo

note記事の下書き・公開管理用リポジトリ雛形

## ディレクトリ構成

```
note-repo/
├── drafts/       # 下書き記事
├── published/    # 公開済み記事
└── assets/       # 画像・添付ファイル
```

## 運用手順

1. **下書き作成**: `drafts/` に `YYYY-MM-DD-タイトル.md` の形式でファイルを作成
2. **執筆**: Markdown形式で記事を執筆
3. **公開**: noteに投稿後、`published/` に移動
4. **assets管理**: 記事で使用した画像は `assets/` に保存

## ファイル命名規則

- 下書き: `drafts/YYYY-MM-DD-title.md`
- 公開済み: `published/YYYY-MM-DD-title.md`
