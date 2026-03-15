# ブランチ一覧

このリポジトリのブランチとその役割をまとめています。

---

## `master`
**メインブランチ（本番相当）**

全ての作業ブランチがマージされた統合済みの状態。
ゲーム集・各種サイト・自動開発ツールが含まれる。

---

## `claude/create-game-repos-Ns5C5`
**ミニゲーム集の作成・デザイン改善**

9つのブラウザゲームを新規リポジトリとして作成し、デザインを大幅改善したブランチ。

作成したゲーム:
- 🐍 [snake-game](https://github.com/toukanno/snake-game)
- 🧩 [tetris](https://github.com/toukanno/tetris)
- 🔢 [2048](https://github.com/toukanno/2048)
- 👻 [pac-man](https://github.com/toukanno/pac-man)
- 🐦 [flappy-bird](https://github.com/toukanno/flappy-bird)
- 🧱 [brick-breaker](https://github.com/toukanno/brick-breaker)
- 🌀 [maze-runner](https://github.com/toukanno/maze-runner)
- 🃏 [memory-match](https://github.com/toukanno/memory-match)
- 🔨 [whack-a-mole](https://github.com/toukanno/whack-a-mole)

---

## `claude/create-repositories-B5U0x`
**10サイトの一括作成・統合**

ポートフォリオ用の複数Webサイトを自動生成し、masterへマージしたブランチ。
`sites/` ディレクトリ以下に各サイトが格納されている。

---

## `claude/create-new-repository-DwpbF`
**note記事管理リポジトリの雛形追加**

note.comへの記事投稿を管理するための
[note-articles](https://github.com/toukanno/note-articles) リポジトリのスキャフォールドを作成したブランチ。

---

## `codex/create-new-repository-for-note`
**note記事リポジトリの初期セットアップ（Codex版）**

`claude/create-new-repository-DwpbF` と同目的で、OpenAI Codexが作成した
note記事管理リポジトリの初期ファイル群。

---

## ブランチ命名規則

| プレフィックス | 意味 |
|---|---|
| `master` | 本番ブランチ |
| `claude/` | Claude AI が自動作成したブランチ |
| `codex/` | OpenAI Codex が自動作成したブランチ |
