# 課題管理 (TASKS)

このファイルは、リポジトリ全体にわたる継続的な改善課題とマージ対応状況を記録します。
定期的に更新し、完了した項目は `## 完了` セクションへ移動してください。

最終更新: 2026-04-21

---

## 進行中

### ドキュメント整合性
- [ ] `CLAUDE.md` の「注意事項」欄にある「`insert.php` に SQL インジェクション脆弱性あり」という記述は古い。現状はプリペアドステートメント + CSRF トークンで修正済みのため、記述を更新する。
- [ ] `BRANCHES.md` に記載されていない最近のマージ済みブランチ（`claude/setup-desktop-apps-repo-CHwn7`, `claude/fix-repo-access-NCwou`, `claude/excel-to-electron-app-AKX8D` など）を追記する。
- [ ] `README.md` と `CLAUDE.md` のディレクトリ構成説明に、新しく追加された `chrome-extensions/`, `desktop-apps/`, `electron-kaikei-app/`, `note-repo/`, `repos/` を反映させる。

### 品質・テスト基盤
- [ ] リンター未設定。最低限 `sites/` / `games/` 配下の HTML/CSS/JS に対して Prettier + ESLint（または stylelint）を導入する。
- [ ] `auto-developer/` の Python コードに対して `ruff` + `mypy` を導入する。
- [ ] Android ゲーム (`games/vertical-scroll-shooter-android/`) の Gradle ビルドを CI で検証する GitHub Actions ワークフローを追加する。

### セキュリティ
- [ ] `contact.html` で CSRF トークンを生成・埋め込んでいるか確認する（`insert.php` 側は検証済み）。
- [ ] XAMPP 本番前提の `insert.php` 内、`getenv()` のフォールバックで root / 空パスワードを許容している点は開発用途限定のため、本番向けの `.env.example` を整備する。

### マージ修正対応フロー
- [ ] 複数の `claude/*` ブランチを master へ統合する際、競合が発生した場合は本ファイル「マージ対応ログ」セクションに記録する。
- [ ] 統合済みブランチは定期的にリモートから削除する（`BRANCHES.md` 更新とセットで実施）。

---

## マージ対応ログ

| 日付 | ブランチ | 対応内容 |
|------|----------|----------|
| 2026-04-21 | `claude/add-task-updates-ZlvXG` | `TASKS.md` を新規追加。master との競合なし。 |

---

## 完了

（完了した課題はここに移動）

---

## 運用ルール

1. 新規課題は `## 進行中` の適切なカテゴリ配下に追加する。
2. 対応着手時は担当ブランチ名を `- [ ]` の後に記載する。
3. マージ時に競合があった場合は必ず「マージ対応ログ」に 1 行追加する。
4. 完了した項目は `## 完了` セクションに日付付きで移動する。
