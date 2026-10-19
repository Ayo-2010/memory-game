const EMOJIS = ['🍎','🍌','🍇','🍓','🍍','🥝','🍑','🍒','🥑','🌽','🍄','🌶️','🍉','🥕','🍋','🫐','🍊','🍅'];

const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const pairsEl = document.getElementById('pairs');
const timeEl = document.getElementById('time');
const bestEl = document.getElementById('best');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restart');
const diffButtons = document.querySelectorAll('.diff');
const winOverlay = document.getElementById('winOverlay');
const winStats = document.getElementById('winStats');
const playAgain = document.getElementById('playAgain');

let cols = 4;
let pairCount = 6;
let firstCard = null;
let secondCard = null;
let lock = false;
let moves = 0;
let matched = 0;
let seconds = 0;
let timerId = null;
let started = false;

function bestKey() {
  return `memory.best.${cols}x${pairCount}`;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function updateBest() {
  const best = JSON.parse(localStorage.getItem(bestKey()) || 'null');
  bestEl.textContent = best ? `${best.moves} mv` : '—';
}

function startTimer() {
  if (started) return;
  started = true;
  timerId = setInterval(() => {
    seconds++;
    timeEl.textContent = formatTime(seconds);
  }, 1000);
}

function newGame() {
  clearInterval(timerId);
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  firstCard = null;
  secondCard = null;
  lock = false;
  moves = 0;
  matched = 0;
  seconds = 0;
  started = false;

  movesEl.textContent = '0';
  pairsEl.textContent = `0 / ${pairCount}`;
  timeEl.textContent = '0:00';
  messageEl.textContent = 'Find all the pairs to win!';
  winOverlay.hidden = true;
  updateBest();

  const deck = shuffle([...EMOJIS.slice(0, pairCount), ...EMOJIS.slice(0, pairCount)]);

  deck.forEach((emoji) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.innerHTML = `<div class="card-inner">
        <div class="card-face card-front"></div>
        <div class="card-face card-back">${emoji}</div>
      </div>`;
    card.addEventListener('click', () => flip(card, emoji));
    board.appendChild(card);
  });
}

function flip(card, emoji) {
  if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;

  startTimer();
  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = { card, emoji };
    return;
  }

  secondCard = { card, emoji };
  moves++;
  movesEl.textContent = moves;
  lock = true;

  if (firstCard.emoji === secondCard.emoji) {
    setTimeout(() => {
      firstCard.card.classList.add('matched');
      secondCard.card.classList.add('matched');
      matched++;
      pairsEl.textContent = `${matched} / ${pairCount}`;
      resetTurn();
      messageEl.textContent = matched === pairCount ? 'You matched every pair!' : 'Nice — a match!';
      if (matched === pairCount) endGame();
    }, 520);
  } else {
    firstCard.card.classList.add('wrong');
    secondCard.card.classList.add('wrong');
    messageEl.textContent = 'Not a match — try again.';
    setTimeout(() => {
      firstCard.card.classList.remove('flipped', 'wrong');
      secondCard.card.classList.remove('flipped', 'wrong');
      resetTurn();
    }, 850);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lock = false;
}

function endGame() {
  clearInterval(timerId);
  messageEl.textContent = 'You matched every pair!';

  const best = JSON.parse(localStorage.getItem(bestKey()) || 'null');
  const isBest = !best || moves < best.moves;
  if (isBest) localStorage.setItem(bestKey(), JSON.stringify({ moves, seconds }));
  updateBest();

  setTimeout(() => {
    winStats.textContent = `${moves} moves · ${formatTime(seconds)}${isBest ? ' · New best!' : ''}`;
    winOverlay.hidden = false;
  }, 500);
}

diffButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    diffButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
    cols = Number(btn.dataset.cols);
    pairCount = Number(btn.dataset.pairs);
    newGame();
  });
});

restartBtn.addEventListener('click', newGame);
playAgain.addEventListener('click', newGame);

newGame();
