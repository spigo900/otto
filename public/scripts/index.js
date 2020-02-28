const canvas = document.getElementsByClassName('viewport')[0];
const ctx = canvas.getContext('2d');

// Visual size of each tile when rendered on the canvas, in pixels.
const CELL_DISPLAY_SIZE = 24;
const DEFAULT_BOARD_SIZE = 18;  // Default size of the board, in cells.
const DEAD_COLOR = 'white';  // Display color of dead cells.
const ALIVE_COLOR = 'green';  // Display color of living cells.
// The maximum number of neighbors that a cell can have.
const MAX_NEIGHBORS = 8;

// Birth and survival rules for Conway's Game of Life.
const CONWAY_BIRTH = [false, false, false, true, false, false, false, false, false];
const CONWAY_SURVIVAL = [false, false, true, true, false, false, false, false, false];

// Prototype game board object.
GameBoardProto = {
  // The cellular automaton board.
  board: Array(DEFAULT_BOARD_SIZE * DEFAULT_BOARD_SIZE).fill(false),
  // A buffer array which can hold the new automaton state while it is being
  // computed, like a back buffer.
  swapBoard: Array(DEFAULT_BOARD_SIZE * DEFAULT_BOARD_SIZE).fill(false),
  boardSize: {
    width: DEFAULT_BOARD_SIZE,
    height: DEFAULT_BOARD_SIZE
  },
  // The birth and survival rules, represented as boolean arrays of size equal
  // to the maximum number of neighbors, plus one. rule[n] should be true when
  // the given cell should live according to the rule (ex: be born if dead and
  // birthRule[n] is true) and false when the given cell should die (or stay
  // dead).
  birthRule: CONWAY_BIRTH,
  survivalRule: CONWAY_SURVIVAL,

  // Initialize the board and canvas.
  //
  // This primarily means setting the canvas to be exactly big enough to hold
  // the board.
  initialize() {
    canvas.width = this.boardSize.width * CELL_DISPLAY_SIZE;
    canvas.height = this.boardSize.height * CELL_DISPLAY_SIZE;
  },

  // Clear the board, setting all cells' state to dead.
  clear() {
    this.board.fill(false);
  },

  // Get the row and column of the item at the given board index.
  rowCol(boardIndex) {
    const row = Math.floor(boardIndex / this.boardSize.width);
    const col = boardIndex % this.boardSize.width;
    return [row, col]
  },

  // Get the index of the board item at the given row and column.
  boardIndex(row, col) {
    return row * this.boardSize.width + col;
  },

  // Resize the board to the given width and height.
  resizeBoard(width, height) {
    // Create a new empty board and copy over all the tiles from the existing
    // board.
    let newBoard = Array(width * height).fill(false);
    for (let i = 0; i < this.board.length; i++) {
      const [row, col] = this.rowCol(i);
      if ((row * width + col) < newBoard.length) {
        newBoard[row * width + col] = this.board[i];
      }
    }

    this.board = newBoard;
    this.boardSize = {width, height};
    this.swapBoard = Array(width * height).fill(false);
  },

  // Compute and return the number of neighbors of the cell at board index i.
  neighborsAlive(i) {
    // First, figure out which tiles are neighbors of tile i.
    const lastRow = this.boardSize.height - 1;
    const lastCol = this.boardSize.width - 1;

    const [row, col] = this.rowCol(i);
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

  // Advance the cellular automaton by one step.
  step() {
    this.calculateStep(this.swapBoard);
    
    // Swap the boards.
    let newSwap = this.board;
    this.board = this.swapBoard;
    this.swapBoard = newSwap;
  },

  // Render the cellular automaton's current state to the canvas.
  render() {
    // First clear the context.
    ctx.fillStyle = DEAD_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Now render the board.
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i]) {
        const [row, col] = this.rowCol(i);
        ctx.fillStyle = ALIVE_COLOR;
        ctx.fillRect(
          col * CELL_DISPLAY_SIZE, row * CELL_DISPLAY_SIZE,
          CELL_DISPLAY_SIZE, CELL_DISPLAY_SIZE
        );
      }
    }
  },

  // Handle a click on the canvas to allow painting tiles.
  handleCanvasClick(ev) {
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const col = Math.floor(x / CELL_DISPLAY_SIZE);
    const row = Math.floor(y / CELL_DISPLAY_SIZE);
    const index = this.boardIndex(row, col);
    this.board[index] = !this.board[index];
    this.render();
  },

  // Update the birth rule when the checkboxes change.
  handleBirthRuleChange(newBirthRule) {
    this.birthRule = newBirthRule;
  },

  // Update the survival rule when the checkboxes change.
  handleSurvivalRuleChange(newSurvivalRule) {
    this.survivalRule = newSurvivalRule;
  }
}

// Constructor-like function to create a new GameBoard (based on the GameBoard
// prototype GameBoardProto).
function GameBoard(width, height, birthRule, survivalRule) {
  if (birthRule.length !== MAX_NEIGHBORS + 1) {
    console.error('Bad birth rule!');
    return {};
  }

  if (survivalRule.length !== MAX_NEIGHBORS + 1) {
    console.error('Bad survival rule!');
    return {};
  }

  // Set up the board.
  let board = Object.assign({}, GameBoardProto);
  board.resizeBoard(width, height);
  board.birthRule = birthRule.slice();
  board.survivalRule = survivalRule.slice();
  return board;
}

///////////
// SETUP //
///////////

// Create a randomized game board with the specified birth and survival rules.
function randomizedGameBoard(birthRule, survivalRule) {
  const p = 0.5;
  let gameBoard = GameBoard(
    DEFAULT_BOARD_SIZE, DEFAULT_BOARD_SIZE, birthRule, survivalRule
  );
  let board = gameBoard.board;

  for (let i = 0; i < board.length; i++) {
    board[i] = (Math.random() < p);
  }

  return gameBoard;
}

// Set up and render the game board.
let gameBoard = randomizedGameBoard(CONWAY_BIRTH, CONWAY_SURVIVAL);
gameBoard.initialize();
gameBoard.render();


//////////////
// CONTROLS //
//////////////

// Survival rule checkboxes
const survivalCheckboxes = (
  [...document.getElementsByClassName('automaton-survival-rule-checkbox')]
    .sort((a, b) => (a.id > b.id))
);

// Get the current survival rule as specified by the UI. This is a boolean
// array.
function getUISurvivalRule() {
  return survivalCheckboxes.map((x) => x.checked);
}

// Setup a "survival rule changed" event handler for each checkbox.
survivalCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('click', () => {
    if (checkbox.disabled) {console.error('disabled'); return;}
    gameBoard.handleSurvivalRuleChange(getUISurvivalRule());
  }, false)
})

// Birth rule checkboxes
const birthCheckboxes = (
  [...document.getElementsByClassName('automaton-birth-rule-checkbox')]
    .sort((a, b) => (a.id > b.id))
);

// Get the current birth rule as specified by the UI. This is a boolean array.
function getUIBirthRule() {
  return birthCheckboxes.map((x) => x.checked);
}

// Setup a "birth rule changed" event handler for each checkbox.
birthCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('click', () => {
    if (checkbox.disabled) {console.error('disabled'); return;}
    gameBoard.handleBirthRuleChange(getUIBirthRule());
  }, false)
})

// Rule textbox and parse button
const ruleField = document.getElementsByClassName('automaton-rule-field')[0];
const ruleParseButton = document.getElementsByClassName('automaton-rule-parse')[0];

// Parse the birth and survival rules represented by the given string.
//
// The rules thus parsed are returned as an object with the rules under the
// keys 'birthRule' and 'survivalRule'.
function parseRuleString(rule) {
  let survivalRule = Array(MAX_NEIGHBORS + 1).fill(false);
  let birthRule = Array(MAX_NEIGHBORS + 1).fill(false);

  let idx = 0;
  if (rule[idx] === 'B') { idx += 1; }

  // https://stackoverflow.com/questions/8935632/check-if-character-is-number/8935688#8935688
  while (rule[idx] >= '0' && rule[idx] <= '9') {
    let nNeighbors = parseInt(rule[idx]);
    birthRule[nNeighbors] = true;
    idx += 1;
  }

  if (rule[idx] !== '/') { return null; }
  else { idx += 1; }

  if (rule[idx] === 'S') { idx += 1; }
  while (rule[idx] >= '0' && rule[idx] <= '9') {
    let nNeighbors = parseInt(rule[idx]);
    survivalRule[nNeighbors] = true;
    idx += 1;
  }

  return {survivalRule, birthRule}
}

// Rule parsing button functionality
handleRuleParse = () => {
  let parsed = parseRuleString(ruleField.value);
  if (!parsed) { return; }

  parsed.survivalRule.forEach((survives, i) => {
    survivalCheckboxes[i].checked = survives;
  })
  parsed.birthRule.forEach((born, i) => {
    birthCheckboxes[i].checked = born;
  })
}

ruleParseButton.addEventListener('click', handleRuleParse, false)
ruleField.addEventListener('keyup', (ev) => {
  if (ev.key === 'Enter') {
    handleRuleParse();
  }
}, false)

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
  gameBoard = randomizedGameBoard(getUIBirthRule(), getUISurvivalRule());
  gameBoard.initialize();
  gameBoard.render();
}, false)

// Clicking on the canvas should toggle the cell clicked on.
canvas.addEventListener('click', (ev) => {
  gameBoard.handleCanvasClick(ev);
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
  ...survivalCheckboxes,
  ...birthCheckboxes,
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
