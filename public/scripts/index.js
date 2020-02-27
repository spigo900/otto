const canvas = document.getElementsByClassName('viewport')[0];
const ctx = canvas.getContext('2d');

// The size of each tile on the screen, in Canvas coordinates.
const tileSize = 24;
const DEFAULT_BOARD_SIZE = 18;
const DEAD_COLOR = 'white';
const ALIVE_COLOR = 'green';
const MAX_ADJACENT_TILES = 8;

// Birth and survival rules for Conway's Game of Life.
const CONWAY_BIRTH = [false, false, false, true, false, false, false, false, false];
const CONWAY_SURVIVAL = [false, false, true, true, false, false, false, false, false];

GameBoardProto = {
  board: Array(DEFAULT_BOARD_SIZE * DEFAULT_BOARD_SIZE).fill(false),
  swapBoard: Array(DEFAULT_BOARD_SIZE * DEFAULT_BOARD_SIZE).fill(false),
  boardSize: {
    width: DEFAULT_BOARD_SIZE,
    height: DEFAULT_BOARD_SIZE
  },
  birthRule: CONWAY_BIRTH,
  survivalRule: CONWAY_SURVIVAL,

  // Initialize the board and canvas.
  initialize() {
    canvas.width = this.boardSize.width * tileSize;
    canvas.height = this.boardSize.height * tileSize;
  },

  // Clear the board.
  clear() {
    this.board.fill(false);
  },

  // Get the row and column of board item i.
  rowColOf(i) {
    const row = Math.floor(i / this.boardSize.width);
    const col = i % this.boardSize.width;
    return [row, col]
  },

  // Get the index of the board item at the given row and column.
  boardIndex(row, col) {
    return row * this.boardSize.width + col;
  },

  // Resize the board to the given width and height.
  resize(width, height) {
    // Create a new empty board and copy over all the tiles from the existing
    // board.
    let newBoard = Array(width * height).fill(false);
    for (let i = 0; i < this.board.length; i++) {
      const [row, col] = this.rowColOf(i);
      if ((row * width + col) < newBoard.length) {
        newBoard[row * width + col] = this.board[i];
      }
    }

    this.board = newBoard;
    this.boardSize = {width, height};
    this.swapBoard = Array(width * height).fill(false);
  },

  neighborsAlive(i) {
    // First, figure out which tiles are neighbors of tile i.
    const lastRow = this.boardSize.height - 1;
    const lastCol = this.boardSize.width - 1;

    const [row, col] = this.rowColOf(i);
    const up = (row > 0) ? (row - 1) : lastRow;
    const down = (row < lastRow) ? (row + 1) : 0;
    const left = (col > 0) ? (col - 1) : lastCol;
    const right = (col < lastCol) ? (col + 1) : 0;

    const neighbors = [
      [  up, left], [  up, col], [  up, right],
      [ row, left],              [ row, right],
      [down, left], [down, col], [down, right]
    ];

    // Now compute how many of the neighboring tiles are alive.
    let alive = 0;
    for (let i = 0; i < neighbors.length; i++) {
      let [neighborRow, neighborCol] = neighbors[i];
      if (this.board[this.boardIndex(neighborRow, neighborCol)]) {
        alive += 1;
      }
    }
    return alive;
  },

  // Compute the next state for Conway's game of life, writing the state to
  // swapBoard.
  calculateStep(swapBoard) {
    for (let i = 0; i < this.board.length; i++) {
      let neighbors = this.neighborsAlive(i);

      // If alive, use survival rule
      if (this.board[i]) {
        swapBoard[i] = this.survivalRule[neighbors];
      }
      
      // If dead, use birth rule.
      else {
        swapBoard[i] = this.birthRule[neighbors];
      }
    }
  },

  step() {
    this.calculateStep(this.swapBoard);
    
    // Swap the boards.
    let newSwap = this.board;
    this.board = this.swapBoard;
    this.swapBoard = newSwap;
  },

  render() {
    // First clear the context.
    ctx.fillStyle = DEAD_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Now render the board.
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i]) {
        const [row, col] = this.rowColOf(i);
        ctx.fillStyle = ALIVE_COLOR;
        ctx.fillRect(col*tileSize, row*tileSize, tileSize, tileSize);
      }
    }
  },

  handleClick(ev) {
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    const index = this.boardIndex(row, col);
    this.board[index] = !this.board[index];
    this.render();
  }
}

function GameBoard(width, height, birthRule, survivalRule) {
  if (birthRule.length !== MAX_ADJACENT_TILES + 1) {
    console.error('Bad birth rule!');
    return {};
  }

  if (survivalRule.length !== MAX_ADJACENT_TILES + 1) {
    console.error('Bad survival rule!');
    return {};
  }

  // Set up the board.
  let board = Object.assign({}, GameBoardProto);
  board.resize(width, height);
  board.birthRule = birthRule.slice();
  board.survivalRule = survivalRule.slice();
  return board;
}

function defaultGameBoard() {
  let board = GameBoard(
    DEFAULT_BOARD_SIZE, DEFAULT_BOARD_SIZE, CONWAY_BIRTH, CONWAY_SURVIVAL
  );
  return board;
}

function randomizedGameBoard() {
  const p = 0.5;
  let gameBoard = defaultGameBoard();
  let board = gameBoard.board;

  for (let i = 0; i < board.length; i++) {
    board[i] = (Math.random() < p);
  }

  return gameBoard;
}

let gameBoard = randomizedGameBoard();
gameBoard.initialize();
gameBoard.render();


//////////////
// CONTROLS //
//////////////

// Rule textbox and parse button
const ruleField = document.getElementsByClassName('automaton-rule-field')[0];
const ruleParseButton = document.getElementsByClassName('automaton-rule-parse')[0];

// Survival rule checkboxes
const survivalCheckbox = document.getElementsByClassName('automaton-survival-rule-checkbox');

// Birth rule checkboxes
const birthCheckbox = document.getElementsByClassName('automaton-birth-rule-checkbox');

// Step button
const stepButton = document.getElementsByClassName('automaton-step')[0];
stepButton.addEventListener('click', () => {
  gameBoard.step();
  gameBoard.render();
}, false)

// Clear button
const clearButton = document.getElementsByClassName('automaton-clear')[0];
clearButton.addEventListener('click', () => {
  gameBoard.clear();
  gameBoard.render();
}, false)

// Randomize button
const randomizeButton = document.getElementsByClassName('automaton-randomize')[0];
randomizeButton.addEventListener('click', () => {
  gameBoard = randomizedGameBoard();
  gameBoard.initialize();
  gameBoard.render();
}, false)

// Click-to-toggle
canvas.addEventListener('click', (ev) => {
  gameBoard.handleClick(ev);
})

// Updates-per-second box
let updatesPerSecondBox = document.getElementsByClassName('automaton-updates-per-second')[0];
const DEFAULT_UPDATES_PER_SECOND = 10.0;

// Play/Stop button
let playing = false;
let playStopButton = document.getElementsByClassName('automaton-play-stop')[0];
let playStateUpdateHandlerID;
const CONTROLS_TO_DISABLE_WHEN_PLAYING = [
  ruleField,
  ruleParseButton,
  survivalCheckbox[0], survivalCheckbox[1], survivalCheckbox[2],
  survivalCheckbox[3], survivalCheckbox[4], survivalCheckbox[5],
  survivalCheckbox[6], survivalCheckbox[7], survivalCheckbox[8],
  birthCheckbox[0], birthCheckbox[1], birthCheckbox[2],
  birthCheckbox[3], birthCheckbox[4], birthCheckbox[5],
  birthCheckbox[6], birthCheckbox[7], birthCheckbox[8],
  stepButton, updatesPerSecondBox, clearButton, randomizeButton
]
function toggleStoppedStateControls() {
  for (let i = 0; i < CONTROLS_TO_DISABLE_WHEN_PLAYING.length; i++) {
    const control = CONTROLS_TO_DISABLE_WHEN_PLAYING[i];
    control.disabled = !control.disabled;
  }
}
playStopButton.addEventListener('click', () => {
  if (!playing) {
    playStopButton.value = "Stop";
    
    let updatesPerSecond = parseFloat(updatesPerSecondBox.value);
    if (!updatesPerSecond || isNaN(updatesPerSecond) || updatesPerSecond < 0) {
      updatesPerSecond = DEFAULT_UPDATES_PER_SECOND;
    }

    playStateUpdateHandlerID = setInterval(
      () => {
        gameBoard.step();
        gameBoard.render();
      },
      1000.0 / updatesPerSecond
    );
    toggleStoppedStateControls();
  } else {
    playStopButton.value = "Play";
    clearInterval(playStateUpdateHandlerID);
    playStateUpdateHandlerID = null;
    toggleStoppedStateControls();
  }
  playing = !playing;
})