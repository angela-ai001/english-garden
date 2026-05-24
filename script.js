const words = [
  { id: 'apple', text: 'apple', emoji: '🍎' },
  { id: 'cat', text: 'cat', emoji: '🐱' },
  { id: 'sun', text: 'sun', emoji: '☀️' },
  { id: 'book', text: 'book', emoji: '📘' },
  { id: 'fish', text: 'fish', emoji: '🐟' },
  { id: 'car', text: 'car', emoji: '🚗' }
];

const gameBoard = document.getElementById('gameBoard');
const scoreEl = document.getElementById('score');
const matchedEl = document.getElementById('matched');
const totalEl = document.getElementById('total');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

let deck = [];
let flipped = [];
let lockBoard = false;
let score = 0;
let matchedCount = 0;

function shuffle(array) {
  return array
    .map((item) => ({ sort: Math.random(), item }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function playSuccessSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const now = ctx.currentTime;

  [523.25, 659.25, 783.99].forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, now + index * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.16);
    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 0.2);
  });
}

function updateScoreBoard() {
  scoreEl.textContent = score;
  matchedEl.textContent = matchedCount;
  totalEl.textContent = words.length;
}

function createDeck() {
  const imageCards = words.map((w) => ({ ...w, type: 'image', display: w.emoji }));
  const wordCards = words.map((w) => ({ ...w, type: 'word', display: w.text }));
  deck = shuffle([...imageCards, ...wordCards]);
}

function createCardElement(cardData, index) {
  const button = document.createElement('button');
  button.className = 'card';
  button.type = 'button';
  button.dataset.id = cardData.id;
  button.dataset.type = cardData.type;
  button.dataset.index = index;
  button.setAttribute('aria-label', '配對卡片');

  button.innerHTML = `
    <span class="card-face card-back">⭐</span>
    <span class="card-face card-front ${cardData.type === 'image' ? 'image' : ''}">${cardData.display}</span>
  `;

  button.addEventListener('click', onCardClick);
  return button;
}

function resetTurn() {
  flipped = [];
  lockBoard = false;
}

function checkWin() {
  if (matchedCount === words.length) {
    messageEl.textContent = '太棒了！你完成所有配對 🎉';
  }
}

function onCardClick(e) {
  const card = e.currentTarget;
  if (lockBoard || card.classList.contains('is-flipped') || card.classList.contains('matched')) {
    return;
  }

  card.classList.add('is-flipped');
  flipped.push(card);

  if (flipped.length < 2) return;

  const [first, second] = flipped;
  const isMatch =
    first.dataset.id === second.dataset.id && first.dataset.type !== second.dataset.type;

  if (isMatch) {
    first.classList.add('matched');
    second.classList.add('matched');
    score += 10;
    matchedCount += 1;
    messageEl.textContent = '答對了！再接再厲！';
    playSuccessSound();
    updateScoreBoard();
    resetTurn();
    checkWin();
    return;
  }

  score = Math.max(0, score - 2);
  updateScoreBoard();
  messageEl.textContent = '再想想看～';
  lockBoard = true;
  setTimeout(() => {
    first.classList.remove('is-flipped');
    second.classList.remove('is-flipped');
    resetTurn();
  }, 700);
}

function renderBoard() {
  gameBoard.innerHTML = '';
  deck.forEach((cardData, index) => {
    gameBoard.appendChild(createCardElement(cardData, index));
  });
}

function startGame() {
  score = 0;
  matchedCount = 0;
  messageEl.textContent = '準備好了嗎？一起學英文！';
  updateScoreBoard();
  createDeck();
  renderBoard();
  resetTurn();
}

restartBtn.addEventListener('click', startGame);
startGame();
