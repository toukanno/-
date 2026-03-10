// ブロック崩し - Breakout Game
(function () {
  'use strict';

  // --- Canvas setup ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayMessage = document.getElementById('overlay-message');
  const hudScore = document.getElementById('hud-score');
  const hudLevel = document.getElementById('hud-level');
  const hudLives = document.getElementById('hud-lives');

  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 600;
  let scale = 1;

  function resizeCanvas() {
    const maxW = Math.min(window.innerWidth - 16, BASE_WIDTH);
    const maxH = Math.min(window.innerHeight - 80, BASE_HEIGHT);
    scale = Math.min(maxW / BASE_WIDTH, maxH / BASE_HEIGHT);
    canvas.width = BASE_WIDTH * scale;
    canvas.height = BASE_HEIGHT * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // --- Game state ---
  const STATE = { START: 0, PLAYING: 1, PAUSED: 2, GAME_OVER: 3, LEVEL_CLEAR: 4 };
  let state = STATE.START;
  let score = 0;
  let lives = 3;
  let level = 1;

  // --- Paddle ---
  const paddle = {
    width: 100,
    baseWidth: 100,
    height: 14,
    x: 0,
    y: BASE_HEIGHT - 40,
    speed: 8,
    color: '#6be6ff',
    wideTimer: 0,
  };
  paddle.x = (BASE_WIDTH - paddle.width) / 2;

  // --- Ball ---
  let balls = [];
  const BALL_RADIUS = 7;
  const BASE_BALL_SPEED = 5;
  let ballSpeed = BASE_BALL_SPEED;
  let slowTimer = 0;

  function createBall(x, y, dx, dy) {
    return { x, y, dx, dy, radius: BALL_RADIUS };
  }

  function resetBall() {
    balls = [];
    const b = createBall(
      paddle.x + paddle.width / 2,
      paddle.y - BALL_RADIUS - 1,
      ballSpeed * (Math.random() > 0.5 ? 1 : -1) * 0.7,
      -ballSpeed
    );
    balls.push(b);
    slowTimer = 0;
  }

  // --- Bricks ---
  const BRICK_ROWS_BASE = 5;
  const BRICK_COLS = 10;
  const BRICK_W = 70;
  const BRICK_H = 22;
  const BRICK_PAD = 4;
  const BRICK_OFFSET_TOP = 50;
  const BRICK_OFFSET_LEFT = (BASE_WIDTH - (BRICK_COLS * (BRICK_W + BRICK_PAD) - BRICK_PAD)) / 2;

  const ROW_COLORS = ['#ff4466', '#ff8844', '#ffcc33', '#44ee66', '#44aaff', '#aa66ff', '#ff66cc'];
  const ROW_POINTS = [70, 60, 50, 40, 30, 20, 10];

  let bricks = [];

  function buildBricks() {
    bricks = [];
    const rows = Math.min(BRICK_ROWS_BASE + Math.floor((level - 1) / 2), ROW_COLORS.length);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: BRICK_OFFSET_LEFT + c * (BRICK_W + BRICK_PAD),
          y: BRICK_OFFSET_TOP + r * (BRICK_H + BRICK_PAD),
          w: BRICK_W,
          h: BRICK_H,
          color: ROW_COLORS[r],
          points: ROW_POINTS[r],
          alive: true,
        });
      }
    }
  }

  // --- Power-ups ---
  const POWERUP_SIZE = 22;
  const POWERUP_SPEED = 2.5;
  const POWERUP_TYPES = ['W', 'M', 'S']; // wide, multi, slow
  const POWERUP_COLORS = { W: '#6be6ff', M: '#ff6be6', S: '#aaff66' };
  const POWERUP_CHANCE = 0.18;
  let powerups = [];

  function spawnPowerup(x, y) {
    if (Math.random() < POWERUP_CHANCE) {
      const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
      powerups.push({ x, y, type, vy: POWERUP_SPEED });
    }
  }

  function applyPowerup(type) {
    if (type === 'W') {
      paddle.width = paddle.baseWidth * 1.6;
      paddle.wideTimer = 600; // ~10 seconds at 60fps
    } else if (type === 'M') {
      const extra = [];
      for (const b of balls) {
        extra.push(createBall(b.x, b.y, b.dx * 0.8 + ballSpeed * 0.5, -Math.abs(b.dy)));
        extra.push(createBall(b.x, b.y, b.dx * 0.8 - ballSpeed * 0.5, -Math.abs(b.dy)));
      }
      balls.push(...extra);
    } else if (type === 'S') {
      slowTimer = 480; // ~8 seconds
    }
  }

  // --- Particles ---
  let particles = [];

  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  // --- Input ---
  let keys = {};
  let mouseX = BASE_WIDTH / 2;
  let useMouseControl = false;

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      handleAction();
    }
    useMouseControl = false;
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / scale;
    useMouseControl = true;
  });

  canvas.addEventListener('click', handleAction);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleAction();
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.touches[0].clientX - rect.left) / scale;
    useMouseControl = true;
  }, { passive: false });

  function handleAction() {
    if (state === STATE.START || state === STATE.GAME_OVER) {
      startGame();
    } else if (state === STATE.LEVEL_CLEAR) {
      nextLevel();
    }
  }

  // --- Game flow ---
  function startGame() {
    score = 0;
    lives = 3;
    level = 1;
    ballSpeed = BASE_BALL_SPEED;
    paddle.width = paddle.baseWidth;
    paddle.wideTimer = 0;
    powerups = [];
    particles = [];
    buildBricks();
    resetBall();
    state = STATE.PLAYING;
    overlay.classList.add('hidden');
    updateHUD();
  }

  function nextLevel() {
    level++;
    ballSpeed = BASE_BALL_SPEED + (level - 1) * 0.5;
    paddle.width = paddle.baseWidth;
    paddle.wideTimer = 0;
    powerups = [];
    particles = [];
    buildBricks();
    resetBall();
    state = STATE.PLAYING;
    overlay.classList.add('hidden');
    updateHUD();
  }

  function loseLife() {
    lives--;
    updateHUD();
    if (lives <= 0) {
      gameOver();
    } else {
      powerups = [];
      paddle.width = paddle.baseWidth;
      paddle.wideTimer = 0;
      slowTimer = 0;
      resetBall();
    }
  }

  function gameOver() {
    state = STATE.GAME_OVER;
    overlayTitle.textContent = 'ゲームオーバー';
    overlayMessage.textContent = `スコア: ${score} | クリックでリトライ`;
    overlay.classList.remove('hidden');
  }

  function levelClear() {
    state = STATE.LEVEL_CLEAR;
    overlayTitle.textContent = 'レベルクリア！';
    overlayMessage.textContent = `レベル ${level + 1} へ | クリックで続行`;
    overlay.classList.remove('hidden');
  }

  function updateHUD() {
    hudScore.textContent = `スコア: ${score}`;
    hudLevel.textContent = `レベル: ${level}`;
    const hearts = '♥'.repeat(lives) + '♡'.repeat(Math.max(0, 3 - lives));
    hudLives.textContent = `ライフ: ${hearts}`;
  }

  // --- Update ---
  function update() {
    if (state !== STATE.PLAYING) return;

    // Timers
    if (paddle.wideTimer > 0) {
      paddle.wideTimer--;
      if (paddle.wideTimer <= 0) paddle.width = paddle.baseWidth;
    }
    if (slowTimer > 0) slowTimer--;

    const speedMult = slowTimer > 0 ? 0.55 : 1;

    // Paddle movement
    if (useMouseControl) {
      paddle.x = mouseX - paddle.width / 2;
    } else {
      if (keys['ArrowLeft'] || keys['KeyA']) paddle.x -= paddle.speed;
      if (keys['ArrowRight'] || keys['KeyD']) paddle.x += paddle.speed;
    }
    paddle.x = Math.max(0, Math.min(BASE_WIDTH - paddle.width, paddle.x));

    // Balls
    const deadBalls = [];
    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      b.x += b.dx * speedMult;
      b.y += b.dy * speedMult;

      // Wall collisions
      if (b.x - b.radius <= 0) { b.x = b.radius; b.dx = Math.abs(b.dx); }
      if (b.x + b.radius >= BASE_WIDTH) { b.x = BASE_WIDTH - b.radius; b.dx = -Math.abs(b.dx); }
      if (b.y - b.radius <= 0) { b.y = b.radius; b.dy = Math.abs(b.dy); }

      // Bottom
      if (b.y + b.radius >= BASE_HEIGHT) {
        deadBalls.push(i);
        continue;
      }

      // Paddle collision
      if (
        b.dy > 0 &&
        b.y + b.radius >= paddle.y &&
        b.y + b.radius <= paddle.y + paddle.height + 4 &&
        b.x >= paddle.x &&
        b.x <= paddle.x + paddle.width
      ) {
        // Calculate reflection angle based on where the ball hit
        const hitPos = (b.x - paddle.x) / paddle.width; // 0..1
        const angle = (hitPos - 0.5) * Math.PI * 0.7; // -63..+63 degrees
        const currentSpeed = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
        const speed = Math.max(currentSpeed, ballSpeed);
        b.dx = speed * Math.sin(angle);
        b.dy = -speed * Math.cos(angle);
        b.y = paddle.y - b.radius;
        spawnParticles(b.x, b.y, '#6be6ff', 4);
      }

      // Brick collisions
      for (const brick of bricks) {
        if (!brick.alive) continue;
        if (
          b.x + b.radius > brick.x &&
          b.x - b.radius < brick.x + brick.w &&
          b.y + b.radius > brick.y &&
          b.y - b.radius < brick.y + brick.h
        ) {
          brick.alive = false;
          score += brick.points;
          updateHUD();
          spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color, 10);
          spawnPowerup(brick.x + brick.w / 2, brick.y + brick.h / 2);

          // Determine reflection side
          const overlapLeft = b.x + b.radius - brick.x;
          const overlapRight = brick.x + brick.w - (b.x - b.radius);
          const overlapTop = b.y + b.radius - brick.y;
          const overlapBottom = brick.y + brick.h - (b.y - b.radius);
          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

          if (minOverlap === overlapLeft || minOverlap === overlapRight) {
            b.dx = -b.dx;
          } else {
            b.dy = -b.dy;
          }
          break; // one brick per frame per ball
        }
      }
    }

    // Remove dead balls (iterate backwards)
    for (let i = deadBalls.length - 1; i >= 0; i--) {
      balls.splice(deadBalls[i], 1);
    }
    if (balls.length === 0) {
      loseLife();
    }

    // Power-ups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.y += p.vy;
      if (
        p.y + POWERUP_SIZE / 2 >= paddle.y &&
        p.y - POWERUP_SIZE / 2 <= paddle.y + paddle.height &&
        p.x + POWERUP_SIZE / 2 >= paddle.x &&
        p.x - POWERUP_SIZE / 2 <= paddle.x + paddle.width
      ) {
        applyPowerup(p.type);
        spawnParticles(p.x, p.y, POWERUP_COLORS[p.type], 8);
        powerups.splice(i, 1);
        continue;
      }
      if (p.y > BASE_HEIGHT + 20) {
        powerups.splice(i, 1);
      }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Check level clear
    if (bricks.every((b) => !b.alive)) {
      levelClear();
    }
  }

  // --- Draw ---
  function draw() {
    ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    // Background grid
    ctx.strokeStyle = 'rgba(40, 40, 80, 0.3)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < BASE_WIDTH; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, BASE_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y < BASE_HEIGHT; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(BASE_WIDTH, y); ctx.stroke();
    }

    // Bricks
    for (const brick of bricks) {
      if (!brick.alive) continue;
      ctx.fillStyle = brick.color;
      const r = 3;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.w, brick.h, r);
      ctx.fill();
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.w, brick.h / 2, [r, r, 0, 0]);
      ctx.fill();
    }

    // Paddle
    const paddleGrad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    paddleGrad.addColorStop(0, paddle.wideTimer > 0 ? '#ff6be6' : '#6be6ff');
    paddleGrad.addColorStop(1, paddle.wideTimer > 0 ? '#aa33aa' : '#2277aa');
    ctx.fillStyle = paddleGrad;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6);
    ctx.fill();
    // Paddle glow
    ctx.shadowColor = paddle.wideTimer > 0 ? '#ff6be6' : '#6be6ff';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Balls
    for (const b of balls) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Power-ups
    for (const p of powerups) {
      ctx.fillStyle = POWERUP_COLORS[p.type];
      ctx.shadowColor = POWERUP_COLORS[p.type];
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, POWERUP_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.type, p.x, p.y + 1);
    }

    // Particles
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Slow effect indicator
    if (slowTimer > 0 && state === STATE.PLAYING) {
      ctx.fillStyle = 'rgba(170,255,100,0.12)';
      ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    }
  }

  // --- Main loop ---
  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // --- Init ---
  updateHUD();
  overlayTitle.textContent = 'ブロック崩し';
  overlayMessage.textContent = 'クリックまたはスペースでスタート';
  overlay.classList.remove('hidden');
  loop();
})();
