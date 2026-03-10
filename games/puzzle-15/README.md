# 15パズル (15-Puzzle Sliding Game)

A classic sliding puzzle game with a clean, modern Japanese UI.

## Features

- **Multiple grid sizes**: 3x3, 4x4, 5x5
- **Controls**: Click adjacent tiles or use arrow keys to slide
- **Move counter & timer**: Track your performance
- **Best records**: Best time and fewest moves saved per grid size (localStorage)
- **Solvable shuffles**: Fisher-Yates shuffle with inversion-count parity check
- **Win detection**: Celebration animation on completion
- **Responsive design**: Works on desktop and mobile

## How to Play

1. Open `index.html` in a browser.
2. Select a grid size (3x3 / 4x4 / 5x5).
3. Click シャッフル (Shuffle) to start.
4. Slide tiles by clicking an adjacent tile or using arrow keys.
5. Arrange tiles in order (1, 2, 3, ... ) with the empty space in the bottom-right corner.

## Files

| File         | Description              |
|--------------|--------------------------|
| `index.html` | Page structure           |
| `style.css`  | Styling and animations   |
| `game.js`    | Game logic and rendering |
