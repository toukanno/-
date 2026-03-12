#!/usr/bin/env bash
set -eu

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

TOKEN_FILE="$HOME/.github_token"

if [ -f "$TOKEN_FILE" ]; then
  TOKEN=$(cat "$TOKEN_FILE")
  echo "export REPO_ACCESS_TOKEN=\"$TOKEN\"" >> "$CLAUDE_ENV_FILE"
  echo "REPO_ACCESS_TOKEN loaded"
else
  # ローカルプロキシ経由でアクセス可能か確認
  if git ls-remote origin HEAD &>/dev/null; then
    echo "~/.github_token not found, but git access is available via proxy."
  else
    echo "WARNING: ~/.github_token not found. REPO_ACCESS_TOKEN is not set. Git access may be unavailable."
  fi
fi
