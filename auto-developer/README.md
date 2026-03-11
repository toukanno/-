# repo-auto-developer

Claude APIを使って、未実装のGitHubリポジトリを自動で開発するシステムです。
毎日1回自動実行し、コードが空のリポジトリを最大3つ選んで実装します。

必要に応じて、環境変数で「全リポジトリ対象モード」に切り替えできます。

## セットアップ

### 1. このリポジトリをGitHubに作成

```bash
gh repo create toukanno/repo-auto-developer --public
git init
git remote add origin git@github.com:toukanno/repo-auto-developer.git
git add .
git commit -m "feat: initial setup"
git push -u origin main
```

### 2. GitHub Secrets を設定

リポジトリの **Settings → Secrets and variables → Actions** で以下を追加:

| Secret名 | 内容 |
|---|---|
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com/) で取得 |
| `REPO_ACCESS_TOKEN` | GitHubのPersonal Access Token (`repo` スコープ) |
| `GITHUB_USERNAME` | 対象のGitHubユーザー名（省略時: `toukanno`） |
| `DEVELOP_ALL_REPOS` | `true` にすると上限なしで全未実装リポジトリを開発（省略時: `false`） |

### 3. GitHub Actions を有効化

リポジトリの **Actions** タブ → 「I understand my workflows, go ahead and enable them」

これで毎日 **日本時間 18:00** に自動実行されます。

## 手動実行

Actions タブ → `Auto Develop Repositories` → `Run workflow`

## 動作仕組み

```
1. GitHub API でリポジトリ一覧取得
2. README.md しかないリポジトリを検出
3. Claude Opus 4.6 (adaptive thinking) でコード生成
4. GitHub API でファイルをコミット
5. 1回あたり最大3リポジトリを処理
```

## カスタマイズ

`develop_repos.py` の上部の定数を変更:

```python
MAX_REPOS_PER_RUN = 3  # 1回の実行で開発する最大リポジトリ数
```

### 全リポジトリを対象にする

デフォルトでは1回の実行で最大3リポジトリまでですが、以下を設定すると全未実装リポジトリを対象にできます。

```bash
export DEVELOP_ALL_REPOS=true
python develop_repos.py
```

`auto-develop.yml` のcron式を変更してスケジュールを調整:
```yaml
- cron: '0 9 * * *'  # 毎日9時UTC = 日本時間18時
- cron: '0 9 * * 1'  # 毎週月曜
```
