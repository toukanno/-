(() => {
  "use strict";

  // ── Word list with categories ──
  const WORDS = {
    "動物": [
      "ELEPHANT", "GIRAFFE", "DOLPHIN", "PENGUIN", "CHEETAH",
      "GORILLA", "LEOPARD", "BUFFALO", "HAMSTER", "PARROT",
      "OCTOPUS", "JELLYFISH", "FLAMINGO", "CROCODILE", "SQUIRREL",
      "HEDGEHOG", "CHAMELEON", "KANGAROO", "TORTOISE", "PANTHER"
    ],
    "果物": [
      "APPLE", "BANANA", "CHERRY", "MANGO", "GRAPE",
      "ORANGE", "PAPAYA", "LEMON", "PEACH", "MELON",
      "AVOCADO", "COCONUT", "APRICOT", "BLUEBERRY", "PINEAPPLE",
      "RASPBERRY", "TANGERINE", "POMEGRANATE", "DRAGONFRUIT", "STRAWBERRY"
    ],
    "国名": [
      "JAPAN", "BRAZIL", "FRANCE", "CANADA", "MEXICO",
      "EGYPT", "SWEDEN", "TURKEY", "ICELAND", "GERMANY",
      "PORTUGAL", "AUSTRALIA", "ARGENTINA", "THAILAND", "COLOMBIA",
      "MOROCCO", "VIETNAM", "IRELAND", "SINGAPORE", "SWITZERLAND"
    ],
    "スポーツ": [
      "SOCCER", "TENNIS", "CRICKET", "SURFING", "BOXING",
      "HOCKEY", "ARCHERY", "FENCING", "KARATE", "ROWING",
      "BASEBALL", "SWIMMING", "HANDBALL", "CLIMBING", "FOOTBALL",
      "BADMINTON", "WRESTLING", "VOLLEYBALL", "BASKETBALL", "GYMNASTICS"
    ],
    "食べ物": [
      "PIZZA", "SUSHI", "PASTA", "STEAK", "SALAD",
      "BURGER", "TACO", "CURRY", "WAFFLE", "PRETZEL",
      "LASAGNA", "OMELETTE", "SANDWICH", "DUMPLING", "CROISSANT",
      "PANCAKE", "RISOTTO", "BURRITO", "NOODLES", "CHOCOLATE"
    ]
  };

  const BODY_PARTS = [
    "head", "body", "left-arm", "right-arm", "left-leg", "right-leg"
  ];
  const MAX_WRONG = BODY_PARTS.length;

  // ── State ──
  let word = "";
  let category = "";
  let guessed = new Set();
  let wrongCount = 0;
  let gameOver = false;
  let wins = 0;
  let losses = 0;

  // ── DOM refs ──
  const $wins = document.getElementById("wins");
  const $losses = document.getElementById("losses");
  const $category = document.getElementById("category");
  const $wordDisplay = document.getElementById("word-display");
  const $remaining = document.getElementById("remaining");
  const $message = document.getElementById("message");
  const $keyboard = document.getElementById("keyboard");
  const $newGameBtn = document.getElementById("new-game-btn");

  // ── Pick a random word ──
  function pickWord() {
    const categories = Object.keys(WORDS);
    category = categories[Math.floor(Math.random() * categories.length)];
    const list = WORDS[category];
    word = list[Math.floor(Math.random() * list.length)];
  }

  // ── Render the word with blanks ──
  function renderWord() {
    const display = word
      .split("")
      .map(ch => (guessed.has(ch) ? ch : "_"))
      .join(" ");
    $wordDisplay.textContent = display;
  }

  // ── Show / hide body parts ──
  function renderHangman() {
    BODY_PARTS.forEach((id, i) => {
      document.getElementById(id).classList.toggle("visible", i < wrongCount);
    });
  }

  // ── Build the A-Z keyboard ──
  function buildKeyboard() {
    $keyboard.innerHTML = "";
    for (let code = 65; code <= 90; code++) {
      const letter = String.fromCharCode(code);
      const btn = document.createElement("button");
      btn.className = "key-btn";
      btn.textContent = letter;
      btn.dataset.letter = letter;
      btn.addEventListener("click", () => guess(letter));
      $keyboard.appendChild(btn);
    }
  }

  // ── Get button for a letter ──
  function getKeyBtn(letter) {
    return $keyboard.querySelector(`[data-letter="${letter}"]`);
  }

  // ── Process a guess ──
  function guess(letter) {
    if (gameOver || guessed.has(letter)) return;
    guessed.add(letter);

    const btn = getKeyBtn(letter);
    if (!btn) return;
    btn.disabled = true;

    if (word.includes(letter)) {
      btn.classList.add("correct");
    } else {
      btn.classList.add("wrong");
      wrongCount++;
    }

    renderWord();
    renderHangman();
    $remaining.textContent = MAX_WRONG - wrongCount;

    checkEndCondition();
  }

  // ── Win / lose check ──
  function checkEndCondition() {
    const allRevealed = word.split("").every(ch => guessed.has(ch));

    if (allRevealed) {
      gameOver = true;
      wins++;
      $wins.textContent = wins;
      $message.textContent = "正解！おめでとう！";
      $message.className = "message win";
      disableAllKeys();
      return;
    }

    if (wrongCount >= MAX_WRONG) {
      gameOver = true;
      losses++;
      $losses.textContent = losses;
      $message.textContent = `残念！正解は「${word}」`;
      $message.className = "message lose";
      revealWord();
      disableAllKeys();
    }
  }

  function revealWord() {
    $wordDisplay.textContent = word.split("").join(" ");
  }

  function disableAllKeys() {
    $keyboard.querySelectorAll(".key-btn").forEach(btn => {
      btn.disabled = true;
    });
  }

  // ── Keyboard input ──
  function handleKeydown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
      guess(key);
    }
  }

  // ── New game ──
  function newGame() {
    pickWord();
    guessed = new Set();
    wrongCount = 0;
    gameOver = false;

    $category.textContent = `カテゴリ: ${category}`;
    $remaining.textContent = MAX_WRONG;
    $message.textContent = "";
    $message.className = "message";

    renderHangman();
    buildKeyboard();
    renderWord();
  }

  // ── Init ──
  document.addEventListener("keydown", handleKeydown);
  $newGameBtn.addEventListener("click", newGame);
  newGame();
})();
