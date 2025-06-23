// Define types for better readability and type safety
export type Board = number[][]; // A Sudoku board is a 2D array of numbers (0-9)
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Solution = Board; // A solution is also a Board
export type PuzzleData = {
  puzzle: Board;
  solution: Solution;
  initialPuzzle: Board;
  difficulty: Difficulty;
};

// Helper to check if a number is valid in a given cell (row, col, box)
const isValid = (board: Board, row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) {
      return false;
    }
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }
  return true;
};

// Finds the next empty cell (represented by 0)
// Returns [row, col] or null if no empty cells
const findEmpty = (board: Board): [number, number] | null => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        return [r, c];
      }
    }
  }
  return null;
};

// Backtracking solver to find a solution (or check for uniqueness)
const solveSudoku = (board: Board): boolean => {
  let emptyCell = findEmpty(board);
  if (!emptyCell) {
    return true; // Board is solved
  }

  const [row, col] = emptyCell;

  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      if (solveSudoku(board)) {
        return true;
      }
      board[row][col] = 0; // Backtrack
    }
  }
  return false;
};

// Counts the number of solutions for a given board
const countSolutions = (board: Board): number => {
  let solutions = 0;
  // Create a deep copy to avoid modifying the original board during solution counting
  const tempBoard: Board = board.map(row => [...row]);

  const backtrack = () => {
    if (solutions > 1) return; // Stop if more than one solution found

    let emptyCell = findEmpty(tempBoard);
    if (!emptyCell) {
      solutions++;
      return;
    }

    const [row, col] = emptyCell;
    for (let num = 1; num <= 9; num++) {
      if (isValid(tempBoard, row, col, num)) {
        tempBoard[row][col] = num;
        backtrack();
        tempBoard[row][col] = 0; // Backtrack
      }
    }
  };

  backtrack();
  return solutions;
};

// Generates a full, solved Sudoku board
const generateSolvedBoard = (): Board => {
  const board: Board = Array(9).fill(0).map(() => Array(9).fill(0));
  const fillCell = (row: number, col: number): boolean => {
    if (row === 9) { // All rows filled
      return true;
    }

    const nextRow = col === 8 ? row + 1 : row;
    const nextCol = col === 8 ? 0 : col + 1;

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5); // Randomize numbers

    for (let num of numbers) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num;
        if (fillCell(nextRow, nextCol)) {
          return true;
        }
      }
    }
    board[row][col] = 0; // Backtrack
    return false;
  };

  fillCell(0, 0);
  return board;
};

// Creates a Sudoku puzzle by removing cells from a solved board
const generatePuzzle = (difficulty: Difficulty): PuzzleData => {
  const solvedBoard: Board = generateSolvedBoard();
  const puzzle: Board = solvedBoard.map(row => [...row]); // Deep copy

  let cellsToRemove: number;
  switch (difficulty) {
    case 'easy':
      cellsToRemove = 40; // Fewer cells removed, easier
      break;
    case 'medium':
      cellsToRemove = 50; // Moderate cells removed
      break;
    case 'hard':
      cellsToRemove = 58; // More cells removed, harder
      break;
    default:
      cellsToRemove = 45; // Default for unexpected difficulty
  }

  let removedCount = 0;
  const positions = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5); // Randomize positions

  for (let i = 0; i < positions.length && removedCount < cellsToRemove; i++) {
    const row = Math.floor(positions[i] / 9);
    const col = positions[i] % 9;

    if (puzzle[row][col] === 0) continue; // Already removed

    const temp = puzzle[row][col];
    puzzle[row][col] = 0; // Temporarily remove

    const solutions = countSolutions(puzzle);

    if (solutions !== 1) {
      puzzle[row][col] = temp; // If not unique, put back
    } else {
      removedCount++;
    }
  }
  return { puzzle, solution: solvedBoard,  initialPuzzle: puzzle, difficulty};
};

// Export all the functions you need to use elsewhere
export {
  isValid,
  solveSudoku,
  // findEmpty, findEmpty and countSolutions are helpers, don't need to be exported
  // countSolutions,
  // generateSolvedBoard, generateSolvedBoard is also an internal helper for generatePuzzle
  generatePuzzle,
};