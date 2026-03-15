# 全リポジトリコードレビュー（2026-03-11）

## 対象
- ルートの問い合わせフォーム（PHP/HTML/CSS）
- `auto-developer/` の自動開発スクリプト（Python）
- `games/` と `sites/` 配下の静的コンテンツ（存在・構造確認）

## 総評
- **機能面**: 静的サイト／ゲームのボリュームは十分。
- **品質面**: 問い合わせフォームに重大なセキュリティ課題あり（SQLインジェクション、XSS）。
- **運用面**: 自動生成系スクリプトは実用的だが、HTTPタイムアウト未設定など堅牢性改善余地あり。

## 主要な指摘（優先度順）

### 1) [Critical] SQLインジェクション
- `insert.php` で `$_POST` を文字列連結して `INSERT` 実行しており、任意SQL注入が可能。
- 対応: `PDO::prepare` + バインド変数へ変更。

### 2) [High] 反射型XSS
- `mail_confirm.php` で `$_POST` を `htmlspecialchars` せずに直接出力。
- hidden input への埋め込みも未エスケープ。
- 対応: 表示/属性値の双方で `htmlspecialchars(..., ENT_QUOTES, 'UTF-8')` を適用。

### 3) [Medium] 入力検証・CSRF対策不足
- フォーム送信値のサーバーサイド検証がない（mail形式・長さ・必須）。
- CSRFトークンがないため、外部サイトからのPOST誘導に脆弱。
- 対応: セッションベースCSRFトークン導入、バリデーション追加。

### 4) [Medium] DB認証情報ハードコード
- `insert.php` の接続情報（DB名/ユーザー/パスワード）がコード直書き。
- 対応: `.env` やサーバー環境変数へ移動。

### 5) [Low] Python API呼び出しの堅牢性
- `auto-developer/develop_repos.py` の `requests.get/put` に timeout 指定がなく、ネットワーク障害時にハングしうる。
- `extract_json` の正規表現が広く、想定外文字列で誤抽出リスク。
- 対応: `timeout=` 明示、抽出処理の厳格化。

### 6) [Low] 生成物のコミット
- `games/vertical-scroll-shooter-android/build/reports/problems/problems-report.html` はビルド生成物で、通常はVCS管理対象外。
- 対応: `.gitignore` で `build/` を除外。

## 推奨アクションプラン
1. **即日対応**: 1, 2（SQLi / XSS）
2. **短期対応**: 3, 4（入力検証/CSRF、認証情報管理）
3. **中期対応**: 5, 6（運用堅牢化、リポジトリ衛生）

## 実施した確認コマンド
- `php -l insert.php`
- `php -l mail_confirm.php`
- `python -m py_compile auto-developer/develop_repos.py`
- `rg --files`

