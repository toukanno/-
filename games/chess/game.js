// ============================================================
// Chess Game - Full implementation
// ============================================================

const PIECES = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
};

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

const WHITE = 'w';
const BLACK = 'b';

// Board is 8x8 array, row 0 = rank 8 (top), row 7 = rank 1 (bottom)
// null = empty, otherwise { type, color }

function initialBoard() {
  const b = Array.from({ length: 8 }, () => Array(8).fill(null));
  const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  for (let c = 0; c < 8; c++) {
    b[0][c] = { type: backRank[c], color: BLACK };
    b[1][c] = { type: 'p', color: BLACK };
    b[6][c] = { type: 'p', color: WHITE };
    b[7][c] = { type: backRank[c], color: WHITE };
  }
  return b;
}

function cloneBoard(board) {
  return board.map(row => row.map(sq => sq ? { ...sq } : null));
}

function pieceChar(piece) {
  if (!piece) return '';
  return piece.color === WHITE
    ? PIECES[piece.type.toUpperCase()]
    : PIECES[piece.type.toLowerCase()];
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c] && board[r][c].type === 'k' && board[r][c].color === color)
        return [r, c];
  return null;
}

// ============================================================
// Move generation (pseudo-legal, then filtered for legality)
// ============================================================

function pseudoLegalMoves(board, r, c, enPassantTarget, castlingRights) {
  const piece = board[r][c];
  if (!piece) return [];
  const moves = [];
  const color = piece.color;
  const enemy = color === WHITE ? BLACK : WHITE;
  const dir = color === WHITE ? -1 : 1;

  function addMove(tr, tc, special) {
    if (inBounds(tr, tc)) {
      const target = board[tr][tc];
      if (!target || target.color === enemy) {
        moves.push({ fr: r, fc: c, tr, tc, special: special || null });
      }
    }
  }

  function addSlide(dr, dc) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      const target = board[nr][nc];
      if (target) {
        if (target.color === enemy) moves.push({ fr: r, fc: c, tr: nr, tc: nc });
        break;
      }
      moves.push({ fr: r, fc: c, tr: nr, tc: nc });
      nr += dr;
      nc += dc;
    }
  }

  switch (piece.type) {
    case 'p': {
      const startRow = color === WHITE ? 6 : 1;
      // Forward
      if (inBounds(r + dir, c) && !board[r + dir][c]) {
        if ((color === WHITE && r + dir === 0) || (color === BLACK && r + dir === 7)) {
          moves.push({ fr: r, fc: c, tr: r + dir, tc: c, special: 'promotion' });
        } else {
          moves.push({ fr: r, fc: c, tr: r + dir, tc: c });
        }
        // Double push
        if (r === startRow && !board[r + 2 * dir][c]) {
          moves.push({ fr: r, fc: c, tr: r + 2 * dir, tc: c, special: 'double' });
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        const nr = r + dir, nc = c + dc;
        if (!inBounds(nr, nc)) continue;
        const target = board[nr][nc];
        if (target && target.color === enemy) {
          if ((color === WHITE && nr === 0) || (color === BLACK && nr === 7)) {
            moves.push({ fr: r, fc: c, tr: nr, tc: nc, special: 'promotion' });
          } else {
            moves.push({ fr: r, fc: c, tr: nr, tc: nc });
          }
        }
        // En passant
        if (enPassantTarget && enPassantTarget[0] === nr && enPassantTarget[1] === nc) {
          moves.push({ fr: r, fc: c, tr: nr, tc: nc, special: 'enpassant' });
        }
      }
      break;
    }
    case 'n': {
      for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
        addMove(r + dr, c + dc);
      }
      break;
    }
    case 'b': {
      for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) addSlide(dr, dc);
      break;
    }
    case 'r': {
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) addSlide(dr, dc);
      break;
    }
    case 'q': {
      for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) addSlide(dr, dc);
      break;
    }
    case 'k': {
      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
        addMove(r + dr, c + dc);
      }
      // Castling
      if (castlingRights) {
        const row = color === WHITE ? 7 : 0;
        if (r === row && c === 4) {
          // Kingside
          const ksKey = color === WHITE ? 'K' : 'k';
          if (castlingRights[ksKey] && !board[row][5] && !board[row][6]
              && board[row][7] && board[row][7].type === 'r' && board[row][7].color === color) {
            moves.push({ fr: r, fc: c, tr: row, tc: 6, special: 'castle-k' });
          }
          // Queenside
          const qsKey = color === WHITE ? 'Q' : 'q';
          if (castlingRights[qsKey] && !board[row][3] && !board[row][2] && !board[row][1]
              && board[row][0] && board[row][0].type === 'r' && board[row][0].color === color) {
            moves.push({ fr: r, fc: c, tr: row, tc: 2, special: 'castle-q' });
          }
        }
      }
      break;
    }
  }
  return moves;
}

function isSquareAttacked(board, r, c, byColor) {
  // Check if square (r,c) is attacked by any piece of byColor
  for (let rr = 0; rr < 8; rr++) {
    for (let cc = 0; cc < 8; cc++) {
      const p = board[rr][cc];
      if (!p || p.color !== byColor) continue;
      // Use pseudo-legal without castling/en-passant for attack check
      const moves = pseudoLegalMoves(board, rr, cc, null, null);
      for (const m of moves) {
        if (m.tr === r && m.tc === c) return true;
      }
    }
  }
  return false;
}

function isInCheck(board, color) {
  const kpos = findKing(board, color);
  if (!kpos) return false;
  const enemy = color === WHITE ? BLACK : WHITE;
  return isSquareAttacked(board, kpos[0], kpos[1], enemy);
}

function applyMoveOnBoard(board, move, promoPiece) {
  const b = cloneBoard(board);
  const piece = { ...b[move.fr][move.fc] };
  b[move.fr][move.fc] = null;
  let captured = b[move.tr][move.tc];

  if (move.special === 'enpassant') {
    const capturedRow = piece.color === WHITE ? move.tr + 1 : move.tr - 1;
    captured = b[capturedRow][move.tc];
    b[capturedRow][move.tc] = null;
  }

  if (move.special === 'castle-k') {
    const row = move.tr;
    b[row][5] = b[row][7];
    b[row][7] = null;
  } else if (move.special === 'castle-q') {
    const row = move.tr;
    b[row][3] = b[row][0];
    b[row][0] = null;
  }

  if (move.special === 'promotion') {
    piece.type = promoPiece || 'q';
  }

  b[move.tr][move.tc] = piece;
  return { board: b, captured };
}

function legalMovesForPiece(board, r, c, enPassantTarget, castlingRights) {
  const piece = board[r][c];
  if (!piece) return [];
  const color = piece.color;
  const enemy = color === WHITE ? BLACK : WHITE;
  const pseudo = pseudoLegalMoves(board, r, c, enPassantTarget, castlingRights);
  const legal = [];

  for (const move of pseudo) {
    // For castling, check that king doesn't pass through or end in check
    if (move.special === 'castle-k' || move.special === 'castle-q') {
      if (isInCheck(board, color)) continue;
      const row = move.fr;
      if (move.special === 'castle-k') {
        if (isSquareAttacked(board, row, 5, enemy)) continue;
        if (isSquareAttacked(board, row, 6, enemy)) continue;
      } else {
        if (isSquareAttacked(board, row, 3, enemy)) continue;
        if (isSquareAttacked(board, row, 2, enemy)) continue;
      }
    }
    const { board: newBoard } = applyMoveOnBoard(board, move, 'q');
    if (!isInCheck(newBoard, color)) {
      legal.push(move);
    }
  }
  return legal;
}

function allLegalMoves(board, color, enPassantTarget, castlingRights) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] && board[r][c].color === color) {
        moves.push(...legalMovesForPiece(board, r, c, enPassantTarget, castlingRights));
      }
    }
  }
  return moves;
}

// ============================================================
// Algebraic notation
// ============================================================

function colToFile(c) { return 'abcdefgh'[c]; }
function rowToRank(r) { return String(8 - r); }
function sqName(r, c) { return colToFile(c) + rowToRank(r); }

function moveToAlgebraic(board, move, allMoves, inCheck, isCheckmate, promoPiece) {
  if (move.special === 'castle-k') return isCheckmate ? 'O-O#' : inCheck ? 'O-O+' : 'O-O';
  if (move.special === 'castle-q') return isCheckmate ? 'O-O-O#' : inCheck ? 'O-O-O+' : 'O-O-O';

  const piece = board[move.fr][move.fc];
  const isCapture = !!board[move.tr][move.tc] || move.special === 'enpassant';
  let notation = '';

  if (piece.type === 'p') {
    if (isCapture) notation = colToFile(move.fc) + 'x';
    notation += sqName(move.tr, move.tc);
    if (move.special === 'promotion') {
      notation += '=' + (promoPiece || 'Q').toUpperCase();
    }
  } else {
    const typeLetter = piece.type.toUpperCase();
    notation = typeLetter;
    // Disambiguation
    const samePieceMoves = allMoves.filter(m =>
      m.tr === move.tr && m.tc === move.tc &&
      board[m.fr][m.fc] && board[m.fr][m.fc].type === piece.type &&
      (m.fr !== move.fr || m.fc !== move.fc)
    );
    if (samePieceMoves.length > 0) {
      const sameFile = samePieceMoves.some(m => m.fc === move.fc);
      const sameRank = samePieceMoves.some(m => m.fr === move.fr);
      if (!sameFile) {
        notation += colToFile(move.fc);
      } else if (!sameRank) {
        notation += rowToRank(move.fr);
      } else {
        notation += sqName(move.fr, move.fc);
      }
    }
    if (isCapture) notation += 'x';
    notation += sqName(move.tr, move.tc);
  }

  if (isCheckmate) notation += '#';
  else if (inCheck) notation += '+';

  return notation;
}

// ============================================================
// Game state
// ============================================================

class ChessGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = initialBoard();
    this.turn = WHITE;
    this.castlingRights = { K: true, Q: true, k: true, q: true };
    this.enPassantTarget = null;
    this.moveHistory = [];        // array of { notation, move, captured, prevState }
    this.capturedWhite = [];      // pieces captured from white (black took them)
    this.capturedBlack = [];      // pieces captured from black (white took them)
    this.selectedSquare = null;
    this.validMoves = [];
    this.lastMove = null;
    this.gameOver = false;
    this.gameResult = null;
    this.pendingPromotion = null;
    this.halfMoveClock = 0;
    this.positionHistory = [];
  }

  getLegalMoves(r, c) {
    return legalMovesForPiece(this.board, r, c, this.enPassantTarget, this.castlingRights);
  }

  getAllLegalMoves() {
    return allLegalMoves(this.board, this.turn, this.enPassantTarget, this.castlingRights);
  }

  makeMove(move, promoPiece) {
    const prevState = {
      board: cloneBoard(this.board),
      turn: this.turn,
      castlingRights: { ...this.castlingRights },
      enPassantTarget: this.enPassantTarget ? [...this.enPassantTarget] : null,
      capturedWhite: [...this.capturedWhite],
      capturedBlack: [...this.capturedBlack],
      lastMove: this.lastMove,
      gameOver: this.gameOver,
      gameResult: this.gameResult,
      halfMoveClock: this.halfMoveClock,
      positionHistory: [...this.positionHistory],
    };

    const piece = this.board[move.fr][move.fc];
    const allMoves = this.getAllLegalMoves();
    const { board: newBoard, captured } = applyMoveOnBoard(this.board, move, promoPiece);

    // Update captured pieces
    if (captured) {
      if (captured.color === WHITE) {
        this.capturedWhite.push(captured);
      } else {
        this.capturedBlack.push(captured);
      }
    }

    this.board = newBoard;

    // Update castling rights
    if (piece.type === 'k') {
      if (piece.color === WHITE) { this.castlingRights.K = false; this.castlingRights.Q = false; }
      else { this.castlingRights.k = false; this.castlingRights.q = false; }
    }
    if (piece.type === 'r') {
      if (piece.color === WHITE && move.fr === 7) {
        if (move.fc === 0) this.castlingRights.Q = false;
        if (move.fc === 7) this.castlingRights.K = false;
      }
      if (piece.color === BLACK && move.fr === 0) {
        if (move.fc === 0) this.castlingRights.q = false;
        if (move.fc === 7) this.castlingRights.k = false;
      }
    }
    // If a rook is captured on its starting square
    if (move.tr === 0 && move.tc === 0) this.castlingRights.q = false;
    if (move.tr === 0 && move.tc === 7) this.castlingRights.k = false;
    if (move.tr === 7 && move.tc === 0) this.castlingRights.Q = false;
    if (move.tr === 7 && move.tc === 7) this.castlingRights.K = false;

    // En passant target
    if (move.special === 'double') {
      this.enPassantTarget = [(move.fr + move.tr) / 2, move.fc];
    } else {
      this.enPassantTarget = null;
    }

    // Switch turn
    this.turn = this.turn === WHITE ? BLACK : WHITE;
    this.lastMove = move;

    // Check for check/checkmate/stalemate
    const inCheck = isInCheck(this.board, this.turn);
    const legalMoves = this.getAllLegalMoves();
    let isCheckmate = false;
    let isStalemate = false;

    if (legalMoves.length === 0) {
      this.gameOver = true;
      if (inCheck) {
        isCheckmate = true;
        this.gameResult = this.turn === WHITE ? 'black-wins' : 'white-wins';
      } else {
        isStalemate = true;
        this.gameResult = 'stalemate';
      }
    }

    // Half-move clock for 50-move rule
    if (piece.type === 'p' || captured) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }
    if (this.halfMoveClock >= 100) {
      this.gameOver = true;
      this.gameResult = 'fifty-move';
    }

    // Insufficient material check
    if (this.isInsufficientMaterial()) {
      this.gameOver = true;
      this.gameResult = 'insufficient';
    }

    // Notation
    const notation = moveToAlgebraic(prevState.board, move, allMoves, inCheck, isCheckmate, promoPiece);

    this.moveHistory.push({ notation, move, captured, prevState, promoPiece });

    return { inCheck, isCheckmate, isStalemate, notation };
  }

  undoMove() {
    if (this.moveHistory.length === 0) return false;
    const last = this.moveHistory.pop();
    const s = last.prevState;
    this.board = s.board;
    this.turn = s.turn;
    this.castlingRights = s.castlingRights;
    this.enPassantTarget = s.enPassantTarget;
    this.capturedWhite = s.capturedWhite;
    this.capturedBlack = s.capturedBlack;
    this.lastMove = s.lastMove;
    this.gameOver = s.gameOver;
    this.gameResult = s.gameResult;
    this.halfMoveClock = s.halfMoveClock;
    this.positionHistory = s.positionHistory;
    this.selectedSquare = null;
    this.validMoves = [];
    this.pendingPromotion = null;
    return true;
  }

  isInsufficientMaterial() {
    const pieces = { w: [], b: [] };
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) pieces[p.color].push({ type: p.type, r, c });
      }
    }
    const wp = pieces.w, bp = pieces.b;
    // K vs K
    if (wp.length === 1 && bp.length === 1) return true;
    // K+B vs K or K+N vs K
    if (wp.length === 1 && bp.length === 2) {
      if (bp.some(p => p.type === 'n' || p.type === 'b')) return true;
    }
    if (bp.length === 1 && wp.length === 2) {
      if (wp.some(p => p.type === 'n' || p.type === 'b')) return true;
    }
    // K+B vs K+B same color bishops
    if (wp.length === 2 && bp.length === 2) {
      const wb = wp.find(p => p.type === 'b');
      const bb = bp.find(p => p.type === 'b');
      if (wb && bb) {
        if ((wb.r + wb.c) % 2 === (bb.r + bb.c) % 2) return true;
      }
    }
    return false;
  }
}

// ============================================================
// UI
// ============================================================

const game = new ChessGame();

const boardEl = document.getElementById('board');
const turnIndicator = document.getElementById('turn-indicator');
const statusMessage = document.getElementById('status-message');
const moveHistoryEl = document.getElementById('move-history');
const capturedBlackEl = document.querySelector('#captured-black .captured-pieces');
const capturedWhiteEl = document.querySelector('#captured-white .captured-pieces');
const promotionModal = document.getElementById('promotion-modal');
const promotionChoices = document.getElementById('promotion-choices');
const btnNewGame = document.getElementById('btn-new-game');
const btnUndo = document.getElementById('btn-undo');

function renderBoard() {
  boardEl.innerHTML = '';
  const inCheck = isInCheck(game.board, game.turn);
  const kingPos = inCheck ? findKing(game.board, game.turn) : null;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      const isLight = (r + c) % 2 === 0;
      sq.className = 'square ' + (isLight ? 'light' : 'dark');
      sq.dataset.r = r;
      sq.dataset.c = c;

      // Highlight last move
      if (game.lastMove) {
        if (game.lastMove.fr === r && game.lastMove.fc === c) sq.classList.add('last-move-from');
        if (game.lastMove.tr === r && game.lastMove.tc === c) sq.classList.add('last-move-to');
      }

      // Highlight selected
      if (game.selectedSquare && game.selectedSquare[0] === r && game.selectedSquare[1] === c) {
        sq.classList.add('selected');
      }

      // Highlight valid moves
      const vm = game.validMoves.find(m => m.tr === r && m.tc === c);
      if (vm) {
        if (game.board[r][c] || vm.special === 'enpassant') {
          sq.classList.add('valid-capture');
        } else {
          sq.classList.add('valid-move');
        }
      }

      // Highlight king in check
      if (kingPos && kingPos[0] === r && kingPos[1] === c) {
        sq.classList.add('in-check');
      }

      // Piece
      const piece = game.board[r][c];
      if (piece) {
        sq.textContent = pieceChar(piece);
      }

      // Coordinates
      if (c === 0) {
        const rank = document.createElement('span');
        rank.className = 'coord coord-rank';
        rank.textContent = 8 - r;
        sq.appendChild(rank);
      }
      if (r === 7) {
        const file = document.createElement('span');
        file.className = 'coord coord-file';
        file.textContent = 'abcdefgh'[c];
        sq.appendChild(file);
      }

      sq.addEventListener('click', () => onSquareClick(r, c));
      boardEl.appendChild(sq);
    }
  }
}

function renderCaptured() {
  const sortFn = (a, b) => PIECE_VALUES[b.type] - PIECE_VALUES[a.type];

  capturedBlackEl.innerHTML = '';
  [...game.capturedBlack].sort(sortFn).forEach(p => {
    const span = document.createElement('span');
    span.textContent = pieceChar(p);
    capturedBlackEl.appendChild(span);
  });

  capturedWhiteEl.innerHTML = '';
  [...game.capturedWhite].sort(sortFn).forEach(p => {
    const span = document.createElement('span');
    span.textContent = pieceChar(p);
    capturedWhiteEl.appendChild(span);
  });
}

function renderHistory() {
  moveHistoryEl.innerHTML = '';
  for (let i = 0; i < game.moveHistory.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    const row = document.createElement('div');
    row.className = 'move-row';

    const numSpan = document.createElement('span');
    numSpan.className = 'move-num';
    numSpan.textContent = moveNum + '.';
    row.appendChild(numSpan);

    const whiteSpan = document.createElement('span');
    whiteSpan.className = 'move-white';
    whiteSpan.textContent = game.moveHistory[i].notation;
    row.appendChild(whiteSpan);

    if (i + 1 < game.moveHistory.length) {
      const blackSpan = document.createElement('span');
      blackSpan.className = 'move-black';
      blackSpan.textContent = game.moveHistory[i + 1].notation;
      row.appendChild(blackSpan);
    }

    moveHistoryEl.appendChild(row);
  }
  moveHistoryEl.scrollTop = moveHistoryEl.scrollHeight;
}

function updateStatus() {
  if (game.gameOver) {
    if (game.gameResult === 'white-wins') {
      turnIndicator.textContent = 'チェックメイト';
      statusMessage.textContent = '白の勝ち！';
    } else if (game.gameResult === 'black-wins') {
      turnIndicator.textContent = 'チェックメイト';
      statusMessage.textContent = '黒の勝ち！';
    } else if (game.gameResult === 'stalemate') {
      turnIndicator.textContent = '引き分け';
      statusMessage.textContent = 'ステイルメイト';
    } else if (game.gameResult === 'fifty-move') {
      turnIndicator.textContent = '引き分け';
      statusMessage.textContent = '50手ルール';
    } else if (game.gameResult === 'insufficient') {
      turnIndicator.textContent = '引き分け';
      statusMessage.textContent = '駒不足';
    }
  } else {
    turnIndicator.textContent = game.turn === WHITE ? '白の番' : '黒の番';
    if (isInCheck(game.board, game.turn)) {
      statusMessage.textContent = 'チェック！';
    } else {
      statusMessage.textContent = '';
    }
  }
}

function render() {
  renderBoard();
  renderCaptured();
  renderHistory();
  updateStatus();
}

function onSquareClick(r, c) {
  if (game.gameOver || game.pendingPromotion) return;

  const piece = game.board[r][c];

  // If a piece is already selected
  if (game.selectedSquare) {
    const [sr, sc] = game.selectedSquare;

    // Clicking the same square deselects
    if (sr === r && sc === c) {
      game.selectedSquare = null;
      game.validMoves = [];
      render();
      return;
    }

    // Clicking another own piece switches selection
    if (piece && piece.color === game.turn) {
      game.selectedSquare = [r, c];
      game.validMoves = game.getLegalMoves(r, c);
      render();
      return;
    }

    // Try to make a move
    const move = game.validMoves.find(m => m.tr === r && m.tc === c);
    if (move) {
      if (move.special === 'promotion') {
        game.pendingPromotion = move;
        showPromotionModal(game.turn);
        return;
      }
      executeMove(move);
    } else {
      // Invalid target - deselect
      game.selectedSquare = null;
      game.validMoves = [];
      render();
    }
    return;
  }

  // No piece selected - select one
  if (piece && piece.color === game.turn) {
    game.selectedSquare = [r, c];
    game.validMoves = game.getLegalMoves(r, c);
    render();
  }
}

function executeMove(move, promoPiece) {
  game.makeMove(move, promoPiece);
  game.selectedSquare = null;
  game.validMoves = [];
  game.pendingPromotion = null;
  render();
}

function showPromotionModal(color) {
  promotionModal.classList.remove('hidden');
  promotionChoices.innerHTML = '';
  const types = ['q', 'r', 'b', 'n'];
  for (const t of types) {
    const opt = document.createElement('div');
    opt.className = 'promo-option';
    const p = { type: t, color };
    opt.textContent = pieceChar(p);
    opt.addEventListener('click', () => {
      promotionModal.classList.add('hidden');
      executeMove(game.pendingPromotion, t);
    });
    promotionChoices.appendChild(opt);
  }
}

btnNewGame.addEventListener('click', () => {
  game.reset();
  render();
});

btnUndo.addEventListener('click', () => {
  game.undoMove();
  render();
});

// Keyboard shortcut: Ctrl+Z for undo
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    game.undoMove();
    render();
  }
});

// Initial render
render();
