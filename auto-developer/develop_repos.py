#!/usr/bin/env python3
"""
repo-auto-developer: Claude APIを使ってGitHubリポジトリを自動開発するスクリプト

必要な環境変数:
  ANTHROPIC_API_KEY  : AnthropicのAPIキー
  REPO_ACCESS_TOKEN  : GitHub Personal Access Token (repo スコープ)
  GITHUB_USERNAME    : GitHubユーザー名 (デフォルト: toukanno)
"""

import os
import json
import base64
import time
import re
import traceback
import anthropic
import requests

GITHUB_USERNAME = os.environ.get("GITHUB_USERNAME", "toukanno")
GITHUB_TOKEN = os.environ["REPO_ACCESS_TOKEN"]
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]

HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json",
    "Content-Type": "application/json",
}

# 1回の実行で開発するリポジトリ数の上限 (API節約のため)
MAX_REPOS_PER_RUN = 3


def get_all_repos() -> list[dict]:
    """ユーザーのリポジトリ一覧を取得"""
    repos = []
    page = 1
    while True:
        resp = requests.get(
            f"https://api.github.com/users/{GITHUB_USERNAME}/repos",
            headers=HEADERS,
            params={"per_page": 100, "page": page, "sort": "created", "direction": "desc"},
        )
        resp.raise_for_status()
        batch = resp.json()
        if not batch:
            break
        repos.extend(batch)
        page += 1
    return repos


def get_repo_tree(repo_name: str) -> list[dict]:
    """リポジトリのファイルツリーを取得"""
    for branch in ("main", "master"):
        resp = requests.get(
            f"https://api.github.com/repos/{GITHUB_USERNAME}/{repo_name}/git/trees/{branch}",
            headers=HEADERS,
            params={"recursive": 1},
        )
        if resp.status_code == 200:
            return resp.json().get("tree", [])
    return []


def is_incomplete(tree: list[dict]) -> bool:
    """コードファイルがREADME以外にないか確認 → Trueなら開発が必要"""
    code_files = [
        f for f in tree
        if f["type"] == "blob" and f["path"] not in ("README.md", "readme.md")
    ]
    return len(code_files) == 0


def upsert_file(repo_name: str, path: str, content: str, message: str) -> bool:
    """ファイルを作成または更新"""
    url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{repo_name}/contents/{path}"
    data: dict = {
        "message": message,
        "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
    }

    # 既存ファイルのSHAを取得（更新時に必要）
    check = requests.get(url, headers=HEADERS)
    if check.status_code == 200:
        data["sha"] = check.json()["sha"]

    resp = requests.put(url, headers=HEADERS, json=data)
    if resp.status_code not in (200, 201):
        print(f"    [WARN] {path}: {resp.status_code} {resp.text[:200]}")
        return False
    return True


def extract_json(text: str) -> list[dict]:
    """レスポンステキストからJSONを抽出"""
    # コードブロック内のJSONを抽出
    match = re.search(r"```(?:json)?\s*(\[.*?\])\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    # 生のJSON配列を抽出
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    raise ValueError("JSONが見つかりませんでした")


def develop_repo(repo: dict) -> int:
    """Claude APIを使ってリポジトリを開発し、生成したファイル数を返す"""
    name = repo["name"]
    description = repo.get("description") or ""

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    prompt = f"""
あなたは優秀なソフトウェアエンジニアです。
以下のGitHubリポジトリを**完成した実用的なプロジェクト**として実装してください。

リポジトリ名: {name}
説明: {description}

# 要件
- 実際に動作するコードを書くこと
- ゲームであればゲームとして遊べるようにすること（Pythonまたは HTML/JS で実装）
- アプリであれば主要機能が揃っていること
- README.md にセットアップ手順・使い方を記載すること
- ファイル数は最低 3 個以上

# 出力フォーマット
以下のJSON配列**のみ**を返してください（説明文は一切不要）:
[
  {{
    "path": "ファイルパス（例: src/main.py）",
    "content": "ファイルの内容（完全なソースコード）"
  }},
  ...
]
"""

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=16000,
        thinking={"type": "adaptive"},
        messages=[{"role": "user", "content": prompt}],
    )

    # thinking ブロックを除いた最後のテキストブロックを取得
    text = ""
    for block in response.content:
        if block.type == "text":
            text = block.text

    files = extract_json(text)
    created = 0
    for file_info in files:
        path = file_info.get("path", "")
        content = file_info.get("content", "")
        if not path or not content:
            continue
        ok = upsert_file(name, path, content, f"feat: implement {path}")
        if ok:
            print(f"    ✓ {path}")
            created += 1
        time.sleep(0.3)  # GitHub API レート制限対策

    return created


def main():
    print(f"=== repo-auto-developer 起動 (user: {GITHUB_USERNAME}) ===\n")

    repos = get_all_repos()
    print(f"リポジトリ数: {len(repos)}\n")

    developed = 0
    for repo in repos:
        if developed >= MAX_REPOS_PER_RUN:
            print(f"\n上限 ({MAX_REPOS_PER_RUN} repos) に達したため終了")
            break

        name = repo["name"]
        # 自分自身は除外
        if name == "repo-auto-developer":
            continue

        print(f"[{name}] チェック中...")
        tree = get_repo_tree(name)

        if not is_incomplete(tree):
            print(f"  -> コードあり、スキップ\n")
            continue

        print(f"  -> 未実装のため開発開始...")
        try:
            count = develop_repo(repo)
            print(f"  -> 完了！{count} ファイル作成\n")
            developed += 1
        except Exception:
            print(f"  -> エラー:")
            traceback.print_exc()
            print()

    print(f"=== 完了 (開発したリポジトリ: {developed}) ===")


if __name__ == "__main__":
    main()
