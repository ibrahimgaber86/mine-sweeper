const STATUS = {
  HIDDEN: "hidden",
  NUMBER: "number",
  MINE: "mine",
  MARKED: "marked",
};

const SIZE = 10;
let mines = 10;

// function to create Board
function createBoard(size, numberOfMines) {
  const mineCells = getMineCells(size, numberOfMines);
  let board = [];
  for (let i = 0; i < size; i++) {
    let row = [];
    for (let j = 0; j < size; j++) {
      let div = document.createElement("div");
      const mine = mineCells.some((c) => c.column === j && c.row === i);
      div.dataset.status = STATUS.HIDDEN;

      let cell = {
        div,
        row: i,
        column: j,
        mine,
        get status() {
          return this.div.dataset.status;
        },
        set status(value) {
          this.div.dataset.status = value;
        },
      };
      row.push(cell);
    }
    board.push(row);
  }
  return { board, mineCells };
}

// function to create mine cells
function getMineCells(boardSize, numberOfMines) {
  const cells = [];
  while (cells.length < numberOfMines) {
    const cell = {
      row: Math.floor(Math.random() * boardSize),
      column: Math.floor(Math.random() * boardSize),
    };
    if (!cells.some((c) => c.row === cell.row && c.column === cell.column)) {
      cells.push(cell);
    }
  }
  return cells;
}

// function to get flagged mines
function getMarked() {
  let count = 0;
  board.forEach((row) =>
    row.forEach((c) => {
      if (c.status === STATUS.MARKED) {
        count++;
      }
    })
  );
  minesNum.innerHTML = mines - count;
}

// get surronded cells
function getAdjacentCells(cell) {
  const { row, column, div } = cell;
  const adjacentCells = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (row === row + i && column === column + j) {
        continue;
      }
      const adjacent = board[row + i]?.[column + j];
      if (adjacent) {
        adjacentCells.push(adjacent);
      }
    }
  }
  return adjacentCells;
}

// function to reveal all empty cells
function reveal(cell) {
  if (cell.status !== STATUS.HIDDEN) {
    return;
  }
  if (cell.mine) {
    cell.status = STATUS.MINE;
    return;
  }
  cell.status = STATUS.NUMBER;
  const adjacentCells = getAdjacentCells(cell);
  const adJacentCount = adjacentCells.filter((c) => c.mine).length;
  if (adJacentCount === 0) {
    // calling reveal recursively to reveal all cells
    adjacentCells.forEach((c) => reveal(c));
  } else {
    cell.div.innerHTML = adJacentCount;
  }
}

//
function stopBoardElementEvent(e) {
  e.stopImmediatePropagation();
}
// function to check win or loose
function checkGame() {
  const win = checkWin();
  const loose = checkLoose();

  if (win || loose) {
    boardElement.addEventListener("click", stopBoardElementEvent, {
      capture: true,
    });
    boardElement.addEventListener("contextmenu", stopBoardElementEvent, {
      capture: true,
    });
  }
  if (win) {
    revealMines(STATUS.MARKED);
    gameResult.innerHTML = "Congratulation You Win 🎉🎉🎉🎉";
  }
  if (loose) {
    revealMines(STATUS.MINE);
    gameResult.innerHTML = "Sorry You Loose 😟😟😟😟";
  }
}

// function to check win
function checkWin() {
  return board.every((row) =>
    row.every(
      (cell) =>
        cell.status === STATUS.NUMBER ||
        (cell.mine &&
          (cell.status === STATUS.MARKED || cell.status === STATUS.HIDDEN))
    )
  );
}

// function to check loose
function checkLoose() {
  return board.some((row) =>
    row.some((cell) => cell.mine && cell.status === STATUS.MINE)
  );
}

// reveal all mines
function revealMines(status) {
  mineCells.forEach((cell) => (board[cell.row][cell.column].status = status));
}

// get html elements
const boardElement = document.querySelector(".board");
const minesNum = document.querySelector("#minesCount");
const gameResult = document.querySelector("#gameResult");
const chooseLevel = document.querySelector("#choose-mine-num");
const btnReset = document.querySelector(".btn-reset");

let chooseLevelEvent = new Event("change");
btnReset.addEventListener("click", () =>
  chooseLevel.dispatchEvent(chooseLevelEvent)
);

chooseLevel.addEventListener("change", ({ target: { value } }) => {
  boardElement.removeEventListener("contextmenu", stopBoardElementEvent, {
    capture: true,
  });
  boardElement.removeEventListener("click", stopBoardElementEvent, {
    capture: true,
  });

  gameResult.innerHTML = "";

  mines = parseInt(value);

  const res = fillBoard();
  board = res.board;
  mineCells = res.mineCells;
});

//
function reset() {
  chooseLevel.dispatchEvent("change");
}
// set grid size of board programatically
boardElement.style.setProperty("--size", SIZE);

// insert board inside page
function fillBoard() {
  minesNum.innerHTML = mines;
  // create board
  let { board, mineCells } = createBoard(SIZE, mines);
  boardElement.innerHTML = "";
  board.forEach((row) =>
    row.forEach((cell) => {
      boardElement.append(cell.div);
      cell.div.addEventListener("click", () => {
        reveal(cell);

        checkGame();
      });
      cell.div.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (cell.status === STATUS.MARKED || cell.status === STATUS.HIDDEN) {
          cell.status =
            cell.status === STATUS.MARKED ? STATUS.HIDDEN : STATUS.MARKED;
        }
        getMarked();
      });
    })
  );
  return { board, mineCells };
}
let { board, mineCells } = fillBoard();
