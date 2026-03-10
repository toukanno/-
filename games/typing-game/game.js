// ===== Word Lists =====
const WORDS = {
  easy: [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
    'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
    'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
    'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
    'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
    'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
    'any', 'these', 'give', 'day', 'most', 'us', 'great', 'big', 'small',
    'run', 'find', 'long', 'help', 'old', 'home', 'hand', 'high', 'last',
    'keep', 'eye', 'tell', 'life', 'write', 'play', 'try', 'move', 'need',
    'house', 'live', 'world', 'next', 'still', 'name', 'read', 'city',
    'tree', 'fish', 'book', 'open', 'food', 'door', 'water', 'room'
  ],
  normal: [
    'about', 'again', 'always', 'another', 'because', 'before', 'begin',
    'between', 'both', 'building', 'business', 'called', 'change', 'children',
    'company', 'continue', 'country', 'develop', 'different', 'during',
    'education', 'enough', 'every', 'example', 'family', 'follow', 'found',
    'general', 'government', 'group', 'happen', 'health', 'history', 'however',
    'human', 'important', 'include', 'increase', 'interest', 'issue', 'large',
    'later', 'learn', 'level', 'local', 'market', 'member', 'million',
    'money', 'morning', 'mother', 'movement', 'national', 'natural', 'never',
    'number', 'offer', 'office', 'order', 'others', 'party', 'people',
    'percent', 'period', 'person', 'place', 'point', 'power', 'present',
    'problem', 'program', 'provide', 'public', 'question', 'really',
    'reason', 'report', 'result', 'return', 'right', 'school', 'second',
    'service', 'several', 'should', 'small', 'social', 'something', 'special',
    'start', 'state', 'still', 'story', 'student', 'study', 'system',
    'teacher', 'technology', 'thing', 'through', 'together', 'under',
    'understand', 'university', 'until', 'water', 'without', 'woman',
    'working', 'world', 'writing', 'already', 'among', 'available',
    'beautiful', 'certain', 'complete', 'computer', 'consider', 'control',
    'describe', 'direction', 'discover', 'economy', 'election', 'employee',
    'environment', 'especially', 'establish', 'evidence', 'everything',
    'experience', 'explain', 'finally', 'financial', 'foreign', 'forward',
    'hospital', 'identify', 'imagine', 'industry', 'information', 'instead',
    'language', 'material', 'measure', 'medical', 'meeting', 'military',
    'minute', 'network', 'nothing', 'official', 'operation', 'opportunity',
    'organization', 'original', 'painting', 'particular', 'perform',
    'physical', 'planning', 'platform', 'position', 'possible', 'practice',
    'pressure', 'probably', 'produce', 'professional', 'project', 'property',
    'protect', 'quality', 'quickly', 'reality', 'recently', 'recognize',
    'remember', 'require', 'research', 'resource', 'response', 'security',
    'significant', 'similar', 'situation', 'society', 'software', 'sometimes',
    'standard', 'strategy', 'strength', 'structure', 'success', 'suddenly',
    'suggest', 'support', 'surprise', 'thousand', 'thought', 'tonight',
    'training', 'treatment', 'trouble', 'various', 'whether', 'yourself'
  ],
  hard: [
    'The quick brown fox jumps over the lazy dog.',
    'She sells seashells by the seashore every morning.',
    'A journey of a thousand miles begins with a single step.',
    'All that glitters is not gold, but it sure looks nice.',
    'Practice makes perfect; keep going every single day.',
    'To be or not to be, that is the question we ask.',
    'The early bird catches the worm before sunrise.',
    'Actions speak louder than words in every situation.',
    'Knowledge is power, and power brings responsibility.',
    'Time flies when you are having fun with friends.',
    'Every cloud has a silver lining, so stay positive.',
    'Where there is a will, there is always a way forward.',
    'Better late than never, but better never late at all.',
    'Curiosity killed the cat, but satisfaction brought it back.',
    'Fortune favors the bold who take risks in life.',
    'The pen is mightier than the sword in many ways.',
    'An apple a day keeps the doctor away from you.',
    'When in Rome, do as the Romans do without question.',
    'The only thing we have to fear is fear itself.',
    'Life is what happens when you are busy making other plans.',
    'Not all those who wander are lost in this world.',
    'The best way to predict the future is to create it.',
    'In the middle of difficulty lies great opportunity ahead.',
    'It does not matter how slowly you go as long as you do not stop.',
    'Success is not final; failure is not fatal. Courage is what counts.',
    'Do what you can, with what you have, where you are right now.',
    'The greatest glory is not in never falling, but in rising every time.',
    'You miss one hundred percent of the shots you never take.',
    'Be the change that you wish to see in the world today.',
    'Happiness depends upon ourselves and our own inner strength.',
    'The function returned an unexpected null pointer exception.',
    'Please enter your username and password to continue.',
    'The server responded with a 404 error: page not found.',
    'Debugging is twice as hard as writing the code initially.',
    'There are only two hard things: cache invalidation and naming.',
    'The algorithm has O(n log n) time complexity on average.',
    'Version 3.2.1 includes several critical bug fixes.',
    'Remember to commit your changes before switching branches.',
    'The database query returned 1,542 rows in 0.03 seconds.',
    'Check the configuration file for missing semicolons.'
  ]
};

// ===== State =====
let state = {
  difficulty: 'normal',
  timeLimit: 60,
  timeRemaining: 60,
  timerInterval: null,
  started: false,
  finished: false,
  textChars: [],       // array of characters to type
  currentIndex: 0,     // current character position
  correctCount: 0,
  wrongCount: 0,
  wordsCompleted: 0,
  startTime: null
};

// ===== DOM Elements =====
const settingsScreen = document.getElementById('settings-screen');
const gameScreen = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const retryBtn = document.getElementById('retry-btn');
const backBtn = document.getElementById('back-btn');
const textDisplay = document.getElementById('text-display');
const inputField = document.getElementById('input-field');
const timerEl = document.getElementById('timer');
const liveWpmEl = document.getElementById('live-wpm');
const liveAccuracyEl = document.getElementById('live-accuracy');
const highScoreDisplay = document.getElementById('high-score-display');

const resultWpm = document.getElementById('result-wpm');
const resultAccuracy = document.getElementById('result-accuracy');
const resultCorrect = document.getElementById('result-correct');
const resultWrong = document.getElementById('result-wrong');
const resultWords = document.getElementById('result-words');
const resultHighscore = document.getElementById('result-highscore');
const newRecordEl = document.getElementById('new-record');

// ===== Screen Switching =====
function showScreen(screen) {
  [settingsScreen, gameScreen, resultsScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// ===== Option Buttons =====
document.querySelectorAll('[data-difficulty]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.difficulty = btn.dataset.difficulty;
    updateHighScoreDisplay();
  });
});

document.querySelectorAll('[data-time]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-time]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.timeLimit = parseInt(btn.dataset.time);
    updateHighScoreDisplay();
  });
});

// ===== High Score Helpers =====
function hsKey() {
  return `typing-hs-${state.difficulty}-${state.timeLimit}`;
}

function getHighScore() {
  return parseInt(localStorage.getItem(hsKey()) || '0');
}

function setHighScore(wpm) {
  localStorage.setItem(hsKey(), String(wpm));
}

function updateHighScoreDisplay() {
  const hs = getHighScore();
  highScoreDisplay.textContent = hs > 0
    ? `ハイスコア: ${hs} WPM (${state.difficulty} / ${state.timeLimit}秒)`
    : '';
}

// ===== Generate Text =====
function generateText() {
  const list = WORDS[state.difficulty];
  let text = '';

  if (state.difficulty === 'hard') {
    // Sentences: pick enough to fill ~2 minutes of typing
    const shuffled = shuffle([...list]);
    text = shuffled.join(' ');
  } else {
    // Words: generate a long string of random words
    const count = state.timeLimit * 4; // rough estimate: 4 words per second max
    const words = [];
    for (let i = 0; i < count; i++) {
      words.push(list[Math.floor(Math.random() * list.length)]);
    }
    text = words.join(' ');
  }

  return text;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ===== Render Text Display =====
function renderText() {
  textDisplay.innerHTML = '';
  state.textChars.forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'char pending';
    span.textContent = ch;
    span.dataset.index = i;
    textDisplay.appendChild(span);
  });
  updateCursor();
}

function updateCursor() {
  const spans = textDisplay.querySelectorAll('.char');
  spans.forEach((span, i) => {
    span.classList.remove('current');
    if (i === state.currentIndex) {
      span.classList.add('current');
    }
  });

  // Auto-scroll so current char is visible
  const currentSpan = textDisplay.querySelector('.char.current');
  if (currentSpan) {
    const displayRect = textDisplay.getBoundingClientRect();
    const spanRect = currentSpan.getBoundingClientRect();
    if (spanRect.top > displayRect.bottom - 40 || spanRect.bottom < displayRect.top) {
      currentSpan.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
}

// ===== Timer =====
function startTimer() {
  state.startTime = Date.now();
  state.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    state.timeRemaining = Math.max(0, state.timeLimit - elapsed);
    timerEl.textContent = state.timeRemaining;

    updateLiveStats();

    if (state.timeRemaining <= 0) {
      endGame();
    }
  }, 200);
}

function updateLiveStats() {
  if (!state.startTime) return;
  const elapsedMin = (Date.now() - state.startTime) / 60000;
  if (elapsedMin <= 0) return;

  // Standard WPM: 1 word = 5 characters
  const wpm = Math.round((state.correctCount / 5) / elapsedMin);
  const total = state.correctCount + state.wrongCount;
  const accuracy = total > 0 ? Math.round((state.correctCount / total) * 100) : 100;

  liveWpmEl.textContent = wpm;
  liveAccuracyEl.textContent = accuracy + '%';
}

// ===== Game Flow =====
function startGame() {
  // Reset state
  state.timeRemaining = state.timeLimit;
  state.started = false;
  state.finished = false;
  state.currentIndex = 0;
  state.correctCount = 0;
  state.wrongCount = 0;
  state.wordsCompleted = 0;
  state.startTime = null;
  clearInterval(state.timerInterval);

  // Generate text
  const text = generateText();
  state.textChars = text.split('');

  // Update UI
  timerEl.textContent = state.timeLimit;
  liveWpmEl.textContent = '0';
  liveAccuracyEl.textContent = '100%';
  inputField.value = '';

  renderText();
  showScreen(gameScreen);
  inputField.focus();
}

function endGame() {
  state.finished = true;
  clearInterval(state.timerInterval);

  const elapsedMin = (Date.now() - state.startTime) / 60000 || 1/60;
  const wpm = Math.round((state.correctCount / 5) / elapsedMin);
  const total = state.correctCount + state.wrongCount;
  const accuracy = total > 0 ? Math.round((state.correctCount / total) * 100) : 0;

  // High score
  const prevHs = getHighScore();
  const isNewRecord = wpm > prevHs;
  if (isNewRecord) {
    setHighScore(wpm);
  }

  // Populate results
  resultWpm.textContent = wpm;
  resultAccuracy.textContent = accuracy + '%';
  resultCorrect.textContent = state.correctCount;
  resultWrong.textContent = state.wrongCount;
  resultWords.textContent = state.wordsCompleted;
  resultHighscore.textContent = Math.max(wpm, prevHs);

  if (isNewRecord && wpm > 0) {
    newRecordEl.classList.remove('hidden');
  } else {
    newRecordEl.classList.add('hidden');
  }

  showScreen(resultsScreen);
}

// ===== Input Handling =====
inputField.addEventListener('input', (e) => {
  if (state.finished) return;

  // Start timer on first input
  if (!state.started) {
    state.started = true;
    startTimer();
  }

  const value = inputField.value;
  // We only care about the last character typed
  // But we process character-by-character via the inputField as a staging area

  handleTyping(value);
});

inputField.addEventListener('keydown', (e) => {
  if (state.finished) return;

  // Prevent Tab from leaving
  if (e.key === 'Tab') {
    e.preventDefault();
  }
});

function handleTyping(value) {
  if (state.currentIndex >= state.textChars.length) return;

  const expected = state.textChars[state.currentIndex];

  // When space or the character matches end of a "word chunk" we advance
  // Process each character in the input buffer
  for (let i = 0; i < value.length && state.currentIndex < state.textChars.length; i++) {
    const typed = value[i];
    const exp = state.textChars[state.currentIndex];
    const span = textDisplay.querySelector(`.char[data-index="${state.currentIndex}"]`);

    if (typed === exp) {
      state.correctCount++;
      span.classList.remove('pending');
      span.classList.add('correct');
    } else {
      state.wrongCount++;
      span.classList.remove('pending');
      span.classList.add('wrong');
    }

    // Track word completion (count spaces as word delimiters)
    if (exp === ' ') {
      state.wordsCompleted++;
    }

    state.currentIndex++;
  }

  // Clear the input field after processing
  inputField.value = '';
  updateCursor();

  // If all text typed, generate more or end
  if (state.currentIndex >= state.textChars.length) {
    state.wordsCompleted++; // last word
    // Append more text
    appendMoreText();
  }
}

function appendMoreText() {
  const extra = generateText();
  const newChars = (' ' + extra).split('');
  const baseIndex = state.textChars.length;
  state.textChars.push(...newChars);

  newChars.forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'char pending';
    span.textContent = ch;
    span.dataset.index = baseIndex + i;
    textDisplay.appendChild(span);
  });

  updateCursor();
}

// ===== Event Listeners =====
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);
backBtn.addEventListener('click', () => {
  clearInterval(state.timerInterval);
  updateHighScoreDisplay();
  showScreen(settingsScreen);
});

// Focus input when clicking on the text display area
textDisplay.addEventListener('click', () => {
  inputField.focus();
});

// ===== Init =====
updateHighScoreDisplay();
