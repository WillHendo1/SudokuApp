import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Dialog, Button } from '@rneui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import the logic functions and types
import { isValid, solveSudoku, Board, PuzzleData } from '../utils/sudokuLogic';
import { AppAction, AppState } from '../../App'
import { PASTEL_COLORS } from '../constants/colors';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

  // This function maps a cosmetic ID (like 'panda_set') to its actual image array.
  const getImageSet = (setName: string) => {
    switch (setName) {
        case 'farm_set':
            return [
                require('../../assets/images/farm_set/chicken.png'),
                require('../../assets/images/farm_set/cow.png'),
                require('../../assets/images/farm_set/rooster.png'),
                require('../../assets/images/farm_set/sheep.png'),
                require('../../assets/images/farm_set/pig.png'),
                require('../../assets/images/farm_set/goat.png'),
                require('../../assets/images/farm_set/horse.png'),
                require('../../assets/images/farm_set/rabbit.png'),
                require('../../assets/images/farm_set/yellow-bird.png'),
            ];
        case 'fish_set':
            return [
                require('../../assets/images/fish_set/light-gray-fish.png'),
                require('../../assets/images/fish_set/brown-fish.png'),
                require('../../assets/images/fish_set/great-white-shark.png'),
                require('../../assets/images/fish_set/lobster.png'),
                require('../../assets/images/fish_set/hammerhead-shark.png'),
                require('../../assets/images/fish_set/red-fish.png'),
                require('../../assets/images/fish_set/whale.png'),
                require('../../assets/images/fish_set/gray-fish.png'),
                require('../../assets/images/fish_set/dark-orange-fish.png'),
            ];
        case 'forest_set':
            return [
                require('../../assets/images/forest_set/squirrel.png'),
                require('../../assets/images/forest_set/hedgehog.png'),
                require('../../assets/images/forest_set/fox.png'),
                require('../../assets/images/forest_set/wolf.png'),
                require('../../assets/images/forest_set/mouse.png'),
                require('../../assets/images/forest_set/bear.png'),
                require('../../assets/images/forest_set/green-parrot.png'),
                require('../../assets/images/forest_set/monkey.png'),
                require('../../assets/images/forest_set/deer.png'),
            ];
        case 'safari_set':
            return [
                require('../../assets/images/safari_set/wildebeest.png'),
                require('../../assets/images/safari_set/camel.png'),
                require('../../assets/images/safari_set/buffalo.png'),
                require('../../assets/images/safari_set/boar.png'),
                require('../../assets/images/safari_set/rhino.png'),
                require('../../assets/images/safari_set/elephant.png'),
                require('../../assets/images/safari_set/vulture.png'),
                require('../../assets/images/safari_set/antelope.png'),
                require('../../assets/images/safari_set/giraffe.png'),
            ];
        case 'ocean_set':
            return [
                require('../../assets/images/ocean_set/dolphin.png'),
                require('../../assets/images/ocean_set/octopus.png'),
                require('../../assets/images/ocean_set/seagull.png'),
                require('../../assets/images/ocean_set/stingray.png'),
                require('../../assets/images/ocean_set/squid.png'),
                require('../../assets/images/ocean_set/clam.png'),
                require('../../assets/images/ocean_set/crab.png'),
                require('../../assets/images/ocean_set/starfish.png'),
                require('../../assets/images/ocean_set/seahorse.png'),                
            ];
        case 'animal_set':
            return [
                require('../../assets/images/animal_set/brown-rabbit.png'),
                require('../../assets/images/animal_set/dog.png'),
                require('../../assets/images/animal_set/toucan.png'),
                require('../../assets/images/animal_set/seabird.png'),
                require('../../assets/images/animal_set/red-bird.png'),
                require('../../assets/images/animal_set/donkey.png'),
                require('../../assets/images/animal_set/kangaroo.png'),
                require('../../assets/images/animal_set/yellow-fish.png'),
                require('../../assets/images/animal_set/ostrich.png'),
            ];
        case 'pet_set':
            return [
                require('../../assets/images/pet_set/beige-dog.png'),
                require('../../assets/images/pet_set/orange-cat.png'),
                require('../../assets/images/pet_set/pug.png'),
                require('../../assets/images/pet_set/brown-dog.png'),
                require('../../assets/images/pet_set/ginger-dog.png'),
                require('../../assets/images/pet_set/gray-cat.png'),
                require('../../assets/images/pet_set/yellow-dog.png'),
                require('../../assets/images/pet_set/light-cat.png'),
                require('../../assets/images/pet_set/gray-dog.png'),
            ];
        default:
            console.warn(`Image set "${setName}" not found, defaulting to panda_set.`);
            return [ // Fallback to farm set if set name is not found
              require('../../assets/images/farm_set/chicken.png'),
              require('../../assets/images/farm_set/cow.png'),
              require('../../assets/images/farm_set/rooster.png'),
              require('../../assets/images/farm_set/sheep.png'),
              require('../../assets/images/farm_set/pig.png'),
              require('../../assets/images/farm_set/goat.png'),
              require('../../assets/images/farm_set/horse.png'),
              require('../../assets/images/farm_set/rabbit.png'),
              require('../../assets/images/farm_set/yellow-bird.png'),
            ];
    }
  };

type GameScreenProps = {
  gameData: PuzzleData;
  dispatch: React.Dispatch<AppAction>;
  equippedImageSetName: string;
};


// GameScreen Component
const GameScreen = ({ gameData, dispatch, equippedImageSetName }: GameScreenProps) => { // Add type for props
  const insets = useSafeAreaInsets();
  const [board, setBoard] = useState<Board>(gameData.puzzle); // Specify Board type for useState
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null); // Type for selected cell
  const [showErrors, setShowErrors] = useState<boolean>(true);
  const [isSolved, setIsSolved] = useState<boolean>(false);

  const currentPalette = useRef(PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)]).current;
  const gameAccentColor = currentPalette.primary; 
  const gameDarkerAccentColor = currentPalette.darker;

  const lastTapTimeRef = useRef(0);
  const lastTappedCellRef = useRef<[number, number] | null>(null);
  const DOUBLE_TAP_THRESHOLD = 500;

  const activeNumberImages = useMemo(() => getImageSet(equippedImageSetName), [getImageSet, equippedImageSetName]);

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogButtons, setDialogButtons] = useState<any[]>([]);


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
        // --- Calculate reward based on difficulty ---
        let pixosEarned = 0;
        switch (gameData.difficulty) { // Access difficulty from gameData
            case 'easy':
                pixosEarned = 3;
                break;
            case 'medium':
                pixosEarned = 5;
                break;
            case 'hard':
                pixosEarned = 7;
                break;
            default:
                pixosEarned = 1; // Fallback
        }
        showCustomDialog(
          "Congratulations!",
          `You solved the puzzle! You earned ${pixosEarned} pixos!`,
          [
            { text: "Awesome!", onPress: () => {
                setIsDialogVisible(false); // Hide dialog
                dispatch({ type: 'EARN_PIXOS', payload: pixosEarned });
                dispatch({ type: 'SET_SCREEN', payload: 'Home' });
            }}
          ]
        );
      } else if (isBoardFull) {
        setIsSolved(false);
        showCustomDialog( // <--- Use custom dialog here
          "Puzzle Failed!",
          "The grid is full, but the solution is incorrect. Keep trying or start a new game!",
          [
            { text: "Keep Trying", onPress: () => setIsDialogVisible(false), type: "clear" }, // type="clear" for RNE buttons
            { text: "New Game", onPress: () => {
                setIsDialogVisible(false); // Hide dialog
                dispatch({ type: 'SET_SCREEN', payload: 'Home' });
            }, type: "clear" }
          ],
          false // Not cancelable
        );
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
      showCustomDialog(
        "Start New Game?",
        "You haven't finished this puzzle yet. Are you sure you want to start a new one?",
        [
          { text: "Cancel", onPress: () => setIsDialogVisible(false), type: "clear" },
          { text: "Yes, New Game", onPress: () => {
              setIsDialogVisible(false); // Hide dialog
              dispatch({ type: 'SET_SCREEN', payload: 'Home' });
          }, type: "clear" }
        ],
        false
      );
    } else {
      // If the puzzle IS solved, just go straight to the Home screen
      dispatch({ type: 'SET_SCREEN', payload: 'Home' });
    }
  };

  const numberCounts = useMemo(() => {
    const counts: { [key: number]: number } = {};
    for (let i = 1; i <= 9; i++) {
      counts[i] = 0; // Initialize counts for 1-9
    }
    board.forEach(rowArr => {
      rowArr.forEach(cellValue => {
        if (cellValue !== 0 && counts[cellValue] !== undefined) {
          counts[cellValue]++;
        }
      });
    });
    return counts;
  }, [board]); // Recalculate whenever the board changes

  // --- Determine if a number button should be disabled ---
  const isNumberUsedUp = useCallback((num: number): boolean => {
    return numberCounts[num] === 9;
  }, [numberCounts]);

  const showControlsAlert = () => {
    showCustomDialog(
      "Game Controls", // Dialog Title
      "• Tap a cell to select it.\n\n" +
      "• Tap a number/animal from the pad to enter it into the selected cell.\n\n" +
      "• Double-tap a cell to clear the number/animal you entered.\n\n" +
      "• Numbers/animals given at the start cannot be changed.\n\n" +
      "• Use the 'Clear' button to remove the selected user-entered number/animal.\n\n" +
      "• Use the 'Eye' button to toggle error highlighting (show/hide incorrect entries).\n\n" +
      "• Tap 'Refresh' button or 'Pixoku' title to start a new puzzle.",
      [
        {
          text: "Got It!", // Button text
          onPress: () => setIsDialogVisible(false), // Dismisses the dialog
          type: "solid" // RNE button type
        }
      ],
      true // Allow dismissing the alert by tapping outside
    );
  };

  // Helper function to show custom dialog
  const showCustomDialog = (title: string, message: string, buttons: any[], cancelable: boolean = true) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogButtons(buttons);
    setIsDialogVisible(true);
  };


  return (
    <View style={[styles.gameContainer,
     { paddingTop: insets.top, paddingBottom: insets.bottom },
     { backgroundColor: gameAccentColor }
     ]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
            style={styles.titleContainer}
            onPress={handleNewGameRequest}
          >
            <Text style={[styles.gameTitle, { color: gameDarkerAccentColor }]}>Pixoku</Text>
          </TouchableOpacity>
        {isSolved && <TouchableOpacity
            onPress={() => dispatch({ type: 'SET_SCREEN', payload: 'Home' })}
          >
            <Text style={styles.solvedMessage}>Puzzle Solved!</Text>
          </TouchableOpacity>}
        
        <View style={styles.buttonColumn}>
          <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: 'transparent' }]}
                  onPress={() => {showControlsAlert();}}
              >
              {<Icon name="information-outline" size={28} color={ gameDarkerAccentColor } />}
          </TouchableOpacity>

          <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: 'transparent' }]}
                  onPress={() => setShowErrors(!showErrors)}
              >
              {showErrors ? (
                  <Icon name="eye-off-outline" size={28} color={ gameDarkerAccentColor } /> // Eye with slash for "Hide"
              ) : (
                  <Icon name="eye-outline" size={28} color={ gameDarkerAccentColor } /> // Open eye for "Show"
              )}
          </TouchableOpacity>
        </View>
        
      </View>
      

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
                  {cellValue !== 0 ? (
                <Image
                  source={activeNumberImages[cellValue - 1]} // Use cellValue to pick correct image (value 1 is index 0)
                  style={styles.cellImage} // Define this style for width/height
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.cellText}>
                  {''} {/* Empty string for empty cells */}
                </Text>
              )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const shouldHideButton = isNumberUsedUp(num);

            if (shouldHideButton) {
              // If the number is used up, return a placeholder or null to hide it.
              // Using a transparent View maintains the grid layout, preventing other buttons from shifting.
              return <View key={num} style={styles.numberButtonPlaceholder} />;
            }

            return (
                <TouchableOpacity
                    key={num}
                    style={[styles.numberButton, {backgroundColor: '#FFFFFF'}]}
                    onPress={() => handleNumberInput(num)}
                    disabled={isSolved || isNumberUsedUp(num)}
                >
                    <Image
                source={activeNumberImages[num - 1]}
                style={styles.numberButtonImage} // Define this style
                resizeMode="contain"
                />
                </TouchableOpacity>
            );
        })}
      </View>

      <Dialog
          isVisible={isDialogVisible}
          // The onBackdropPress logic for controls/solved/failed dialogs
          onBackdropPress={() => {
            if (dialogButtons.length === 1 && dialogButtons[0].style !== 'cancel' && dialogTitle !== "Game Controls") {
                // If it's a critical single-button alert (like congrats/fail where no cancel is offered)
                // and not the controls dialog, tapping outside should NOT dismiss it if cancelable=false.
                // However, our showCustomDialog sets cancelable: false for critical alerts
                // so the onBackdropPress in Dialog should only respond if cancelable is true for THIS dialog instance.
                // Simpler: if dialog was set as cancelable, hide it on backdrop press.
                 if (dialogButtons.length === 1 && dialogButtons[0].text === "Got It!" && dialogTitle === "Game Controls") {
                     setIsDialogVisible(false); // Only dismiss controls dialog on backdrop
                 } else if (dialogButtons.length > 1 && dialogButtons.find(btn => btn.style === 'cancel')) {
                     // If there's a cancel button, tapping backdrop dismisses it like cancel.
                     setIsDialogVisible(false);
                 } else {
                     // For critical alerts, do nothing on backdrop if not explicitly cancelable
                 }

            } else {
                 // For the controls dialog (where we pass true for cancelable), this will dismiss.
                 setIsDialogVisible(false);
            }
          }}
          animationType="fade"
      >
          <Dialog.Title title={dialogTitle} titleStyle={styles.dialogTitleText} />
          <Text style={styles.dialogMessageText}>{dialogMessage}</Text>
          <Dialog.Actions>
              {dialogButtons.map((btn, index) => (
                  <Button
                      key={index}
                      title={btn.text}
                      onPress={btn.onPress}
                      type={btn.type || "solid"}
                      buttonStyle={[
                        styles.dialogButton,
                        btn.style === 'cancel' ? styles.dialogCancelButton : {},
                        { backgroundColor: gameDarkerAccentColor }
                      ]}
                      titleStyle={styles.dialogButtonText}
                  />
              ))}
          </Dialog.Actions>
      </Dialog>
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
    paddingHorizontal: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 5,
  },
  titleContainer: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 60,
    fontFamily: 'pixelart',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  }, 
  controlButton: {
    paddingVertical: 3,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
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
    marginTop: 20,
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
  cellImage: {
    width: '80%', // Adjust width as needed for images to fit in cells
    height: '80%', // Adjust height
    // Ensure images don't stretch beyond cell boundaries
  },
  numberButtonImage: {
    width: '70%', // Adjust width as needed for images to fit buttons
    height: '70%', // Adjust height
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: Dimensions.get('window').width * 0.9,
    marginBottom: 20,
  },
  numberButton: {
    width: Dimensions.get('window').width * 0.17,
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
  numberButtonPlaceholder: {
    width: Dimensions.get('window').width * 0.09,
    aspectRatio: 1,
    margin: Dimensions.get('window').width * 0.005,
    backgroundColor: 'transparent', // Make it invisible
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginBottom: 20,
  },
  dialogTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 10,
  },
  dialogMessageText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  dialogButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  dialogButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dialogCancelButton: {
    backgroundColor: '#BDBDBD',
  },
});