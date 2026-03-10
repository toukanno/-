# タイピングゲーム (Typing Speed Game)

A browser-based typing speed game with real-time feedback, multiple difficulty levels, and high score tracking.

## Features

- **Real-time character highlighting** - Green for correct, red for incorrect keystrokes
- **Multiple timer modes** - 30s, 60s, 120s
- **Difficulty levels** - Easy (common words), Normal (longer words/phrases), Hard (sentences with punctuation)
- **WPM calculation** - Words per minute based on correct characters typed
- **Accuracy tracking** - Percentage of correct keystrokes
- **High scores** - Persisted via localStorage, per difficulty and timer combination
- **Mobile responsive** - Works on desktop and mobile screens
- **Japanese UI** - Interface labels in Japanese

## How to Play

1. Open `index.html` in a browser
2. Select difficulty (難易度) and time limit (制限時間)
3. Click 開始 (Start) or just start typing
4. Type the displayed text as quickly and accurately as possible
5. View your results (WPM, accuracy, high score) when time runs out

## Files

| File | Description |
|------|-------------|
| `index.html` | Main HTML structure |
| `style.css` | Styling and responsive layout |
| `game.js` | Game logic, timer, scoring, high scores |

## Running

No build step required. Open `index.html` directly in any modern browser.

```bash
# Or use a simple HTTP server:
python3 -m http.server 8000 --directory /home/user/-/games/typing-game/
```
