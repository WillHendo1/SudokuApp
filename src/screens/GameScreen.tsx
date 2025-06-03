import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import the logic functions and types
import { isValid, solveSudoku, Board, PuzzleData } from '../utils/sudokuLogic';
import { PASTEL_COLORS } from '../constants/colors';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



// --- Define Types specific to this screen ---
// These types were previously in App.tsx. It's better to keep types close to where they are used,
// or move shared types to a central types.ts file in src/.
type AppAction =
  | { type: 'SET_SCREEN'; payload: 'Home' | 'Game' }
  | { type: 'SET_GAME_DATA'; payload: PuzzleData };

type GameScreenProps = {
  gameData: PuzzleData;
  dispatch: React.Dispatch<AppAction>;
};


// GameScreen Component
const GameScreen = ({ gameData, dispatch }: GameScreenProps) => { // Add type for props
  const insets = useSafeAreaInsets();
  const [board, setBoard] = useState<Board>(gameData.puzzle); // Specify Board type for useState
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null); // Type for selected cell
  const [showErrors, setShowErrors] = useState<boolean>(true);
  const [isSolved, setIsSolved] = useState<boolean>(false);

  const randomPastelColor = useRef(PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)]);

  const lastTapTimeRef = useRef(0);
  const lastTappedCellRef = useRef<[number, number] | null>(null);
  const DOUBLE_TAP_THRESHOLD = 500;

  // You'll need to update the PuzzleData type in sudokuLogic.ts
  // to include initialPuzzle, as it's being passed here.
  // Add initialPuzzle: Board; to the PuzzleData type in sudokuLogic.ts
  useEffect(() => {
    const isBoardFull = board.every(row => row.every(cell => cell !== 0));
    if (isBoardFull) {
      const tempBoard: Board = board.map(row => [...row]);
      // Note: solveSudoku modifies the board in place, so pass a copy
      if (solveSudoku(tempBoard) && JSON.stringify(tempBoard) === JSON.stringify(gameData.solution)) {
        setIsSolved(true);
        Alert.alert("Congratulations!", "You solved the puzzle!");
      } else {
        // If full but not correct, it's an invalid solution
      }
    } else {
      setIsSolved(false);
    }
  }, [board, gameData.solution]);

  const handleNumberInput = (num: number) => { // Add type for num
    if (!selectedCell || isSolved) return;

    const [r, c] = selectedCell;
    if (gameData.initialPuzzle[r][c] === 0) {
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = num;
      setBoard(newBoard);
    }
  };

  const handleCellSelect = (row: number, col: number) => { // Add types for row, col
    setSelectedCell([row, col]);
  };

  const handleClearCell = (rowToClear?: number, colToClear?: number) => {
    // Determine the target cell: if rowToClear/colToClear are provided, use them;
    // otherwise, fall back to the currently selectedCell state.
    const targetCell = (rowToClear !== undefined && colToClear !== undefined)
                       ? [rowToClear, colToClear]
                       : selectedCell;

    if (!targetCell || isSolved) return; // Exit if no cell to clear or game is solved

    const [r, c] = targetCell;
    if (gameData.initialPuzzle[r][c] === 0) { // Only clear if it's a user-entered number (initial is 0)
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = 0;
      setBoard(newBoard);
    }
  };

  const handleCellTap = (row: number, col: number) => {
    const currentTime = Date.now();
    const tappedCell: [number, number] = [row, col]; // Cast for TypeScript

    // Check if this tap is on the *same cell* as the last tap
    const isSameCell = lastTappedCellRef.current &&
                       lastTappedCellRef.current[0] === tappedCell[0] &&
                       lastTappedCellRef.current[1] === tappedCell[1];

    // Check if it's within the double-tap time threshold
    if (isSameCell && (currentTime - lastTapTimeRef.current < DOUBLE_TAP_THRESHOLD)) {
      // --- It's a Double Tap! ---
      handleClearCell(row, col); // Clear this specific cell
      setSelectedCell(null); // Deselect the cell after double tap action
      // Reset tap detection refs to prevent accidental triple/quadruple taps
      lastTapTimeRef.current = 0;
      lastTappedCellRef.current = null;
    } else {
      // --- It's a Single Tap (or start of a new tap sequence) ---
      setSelectedCell(tappedCell); // Select the cell
      // Store the current tap details for potential future double-tap detection
      lastTapTimeRef.current = currentTime;
      lastTappedCellRef.current = tappedCell;
    }
  };

  const isCellCorrect = useCallback((row: number, col: number): boolean => { // Add types
    if (board[row][col] === 0) return true;
    return board[row][col] === gameData.solution[row][col];
  }, [board, gameData.solution]);

  const isCellValidPlacement = useCallback((row: number, col: number): boolean => { // Add types
    if (board[row][col] === 0) return true;
    const num = board[row][col];
    // Create a temporary copy to check validity without altering the main board state
    const tempBoard: Board = board.map(r => [...r]);
    tempBoard[row][col] = 0; // Temporarily set to 0 to re-check validity without self-conflict
    const valid = isValid(tempBoard, row, col, num);
    return valid;
  }, [board]);

  const handleNewGameRequest = () => {
    if (!isSolved) { // Only ask for confirmation if the puzzle is not solved
      Alert.alert(
        "Start New Game?",
        "You haven't finished this puzzle yet. Are you sure you want to start a new one?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("New game cancelled"),
            style: "cancel" // On iOS, this button often appears on the left
          },
          {
            text: "Yes, New Game",
            onPress: () => dispatch({ type: 'SET_SCREEN', payload: 'Home' }) // Proceed to Home screen
          }
        ],
        { cancelable: false } // Prevent dismissing the alert by tapping outside
      );
    } else {
      // If the puzzle IS solved, just go straight to the Home screen
      dispatch({ type: 'SET_SCREEN', payload: 'Home' });
    }
  };


  return (
    <View style={[styles.gameContainer,
     { paddingTop: insets.top, paddingBottom: insets.bottom },
     { backgroundColor: randomPastelColor.current }
     ]}>
      <TouchableOpacity
          style={styles.gameTitle}
          onPress={handleNewGameRequest}
        >
          <Text style={styles.gameTitle}>Pixoku</Text>
        </TouchableOpacity>
      {isSolved && <TouchableOpacity
          style={styles.solvedMessage}
          onPress={() => dispatch({ type: 'SET_SCREEN', payload: 'Home' })}
        >
          <Text style={styles.solvedMessage}>Puzzle Solved!</Text>
        </TouchableOpacity>}

        <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: 'transparent' }]}
                onPress={() => setShowErrors(!showErrors)}
            >
            {showErrors ? (
                <Icon name="eye-off-outline" size={32} color="#FFFFFF" /> // Eye with slash for "Hide"
            ) : (
                <Icon name="eye-outline" size={32} color="#FFFFFF" /> // Open eye for "Show"
            )}
        </TouchableOpacity>

      <View style={styles.grid}>
        {board.map((rowArr, rowIndex) => ( // Renamed 'row' param to 'rowArr' to avoid conflict with 'row' in `selectedCell`
          <View key={rowIndex} style={styles.row}>
            {rowArr.map((cellValue, colIndex) => { // Renamed 'cell' param to 'cellValue'
              const isInitial = gameData.initialPuzzle[rowIndex][colIndex] !== 0;
              const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex;
              const isSameValue = selectedCell && board[selectedCell[0]][selectedCell[1]] === cellValue && cellValue !== 0;
              // Check if currently placed value is correct in final solution or violates rules in current board
              const isConflict = showErrors && cellValue !== 0 && (!isCellCorrect(rowIndex, colIndex) || !isCellValidPlacement(rowIndex, colIndex));


              return (
                <TouchableOpacity
                  key={colIndex}
                  style={[
                    styles.cell,
                    colIndex % 3 === 2 && colIndex !== 8 ? styles.borderRightThick : {},
                    rowIndex % 3 === 2 && rowIndex !== 8 ? styles.borderBottomThick : {},
                    isSelected ? styles.selectedCell : {},
                    isSameValue && !isSelected ? styles.sameValueCell : {},
                    isConflict ? styles.conflictCell : {},
                  ]}
                  onPress={() => handleCellTap(rowIndex, colIndex)}
                  disabled={isInitial || isSolved}
                >
                  <Text
                    style={[
                      styles.cellText,
                      isInitial ? styles.initialText : styles.userText,
                      isConflict ? styles.conflictText : {},
                    ]}
                  >
                    {cellValue !== 0 ? cellValue : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numberButton}
            onPress={() => handleNumberInput(num)}
            disabled={isSolved}
          >
            <Text style={styles.numberButtonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>

      
    </View>
  );
};

export default GameScreen;

// --- Styles specific to GameScreen (cut these from App.tsx) ---
const styles = StyleSheet.create({
  gameContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#E0F2F7', // This will be overridden by the dynamic color if you put one there
    paddingHorizontal: 10,
  },
  gameTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  solvedMessage: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  grid: {
    width: Dimensions.get('window').width * 0.9,
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#34495E',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: Dimensions.get('window').width * 0.05,
    fontWeight: 'bold',
  },
  initialText: {
    color: '#34495E',
  },
  userText: {
    color: '#2980B9',
  },
  selectedCell: {
    backgroundColor: '#BBDEFB',
    borderColor: '#2196F3', // This will be overridden by dynamic borderColor if applied
    borderWidth: 2,
  },
  sameValueCell: {
    backgroundColor: '#E8F5E9',
  },
  conflictCell: {
    backgroundColor: '#FFCDD2',
    color: '#C0392B',
  },
  conflictText: {
    color: '#C0392B',
  },
  borderRightThick: {
    borderRightWidth: 3,
    borderColor: '#BDC3C7',
    borderRightColor: '#34495E',
  },
  borderBottomThick: {
    borderBottomWidth: 3,
    borderColor: '#BDC3C7',
    borderBottomColor: '#34495E',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: Dimensions.get('window').width * 0.9,
    marginBottom: 20,
  },
  numberButton: {
    backgroundColor: '#A5D6A7', // This will be overridden by the dynamic color
    width: Dimensions.get('window').width * 0.09,
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: Dimensions.get('window').width * 0.005,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  numberButtonText: {
    fontSize: Dimensions.get('window').width * 0.04,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: '#95A5A6', // This will be overridden by the dynamic color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});