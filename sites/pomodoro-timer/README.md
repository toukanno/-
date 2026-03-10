# ポモドーロタイマー (Pomodoro Timer)

A beautiful, minimalist Pomodoro timer web application with Japanese UI.

## Features

- Circular SVG progress timer display
- 3 modes: ポモドーロ (25min), 短い休憩 (5min), 長い休憩 (15min)
- Start, Pause, Reset controls
- Automatic session cycling (4 pomodoros then long break)
- Customizable durations via settings panel
- Audio notification (Web Audio API beep) when timer ends
- Task name input for current focus
- Daily stats tracking (completed pomodoros)
- LocalStorage persistence for settings and stats
- Mobile responsive design
- Tomato red accent color scheme

## Usage

Open `index.html` in a browser. No build step or server required.

1. Enter a task name in the input field
2. Select a mode (作業 / 短い休憩 / 長い休憩)
3. Press 開始 to start the timer
4. Work until the timer beeps
5. Take a break, then repeat

After 4 completed pomodoros, a long break is automatically suggested.

## Files

- `index.html` — Main HTML structure
- `style.css` — Styles and responsive layout
- `app.js` — Timer logic, state management, localStorage
