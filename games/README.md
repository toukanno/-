# 🎮 ゲームコレクション

10種類のシンプルなゲーム集です。

## ゲーム一覧

| ゲーム | 種類 | 説明 |
|--------|------|------|
| [縦スクロールシューター](./vertical-scroll-shooter-android/) | Android (Kotlin) | タッチ操作の宇宙シューティング |
| [スネーク](./snake-game/) | Web (HTML/JS) | 古典的なスネークゲーム |
| [テトリス](./tetris/) | Web (HTML/JS) | テトリス（ゴーストピース付き）|
| [ブロック崩し](./brick-breaker/) | Web (HTML/JS) | パワーアップ付きブロック崩し |
| [フラッピーバード](./flappy-bird/) | Web (HTML/JS) | 障害物をよけて飛ぶ鳥 |
| [迷路ランナー](./maze-runner/) | Web (HTML/JS) | 自動生成迷路 |
| [神経衰弱](./memory-match/) | Web (HTML/JS) | カード神経衰弱 |
| [モグラたたき](./whack-a-mole/) | Web (HTML/JS) | モグラたたきゲーム |
| [2048](./2048/) | Web (HTML/JS) | 2048パズルゲーム |
| [パックマン](./pac-man/) | Web (HTML/JS) | パックマン風ゲーム |

## 遊び方

### Webゲーム
各ゲームの `index.html` をブラウザで開くだけで遊べます。
モバイル対応（タッチ操作）もしています。

### Androidゲーム (縦スクロールシューター)
Android Studioでプロジェクトを開いてビルドしてください。
```bash
cd vertical-scroll-shooter-android
./gradlew assembleDebug
```
