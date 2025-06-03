import React, { useRef } from 'react'; // Added useRef
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import the logic functions and types
import { generatePuzzle, Difficulty, PuzzleData } from '../utils/sudokuLogic'; // Adjust path based on your exact structure
import { PASTEL_COLORS } from '../constants/colors'; // Adjust path based on your exact structure

// Define actions for the appReducer
type AppAction =
  | { type: 'SET_SCREEN'; payload: 'Home' | 'Game' }
  | { type: 'SET_GAME_DATA'; payload: PuzzleData };

// Define props for HomeScreen
type HomeScreenProps = {
dispatch: React.Dispatch<AppAction>;
};
  

// HomeScreen Component
const HomeScreen = ({ dispatch }: HomeScreenProps) => { // Add type for props
    const insets = useSafeAreaInsets();
  
    const randomPastelColor = useRef(PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)]);
  
    const handleStartGame = (difficulty: Difficulty) => { // Use Difficulty type
      const { puzzle, solution } = generatePuzzle(difficulty);
      dispatch({ type: 'SET_GAME_DATA', payload: { puzzle, solution, initialPuzzle: puzzle.map(row => [...row]) } }); // initialPuzzle needs to be added to PuzzleData type as well.
      dispatch({ type: 'SET_SCREEN', payload: 'Game' });
    };
  
    return (
      <View style={[
        styles.homeContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        { backgroundColor: randomPastelColor.current}
      ]}>
        <Text style={styles.homeTitle}>Zen Sudoku</Text>
        <TouchableOpacity
          style={styles.difficultyButton}
          onPress={() => handleStartGame('easy')}
        >
          <Text style={styles.difficultyButtonText}>Easy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.difficultyButton}
          onPress={() => handleStartGame('medium')}
        >
          <Text style={styles.difficultyButtonText}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.difficultyButton}
          onPress={() => handleStartGame('hard')}
        >
          <Text style={styles.difficultyButtonText}>Hard</Text>
        </TouchableOpacity>
      </View>
    );
  };

  export default HomeScreen;

// --- Styles specific to HomeScreen (cut these from App.tsx) ---
const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#E0F2F7', // This will be overridden by the dynamic color above
    paddingHorizontal: 20,
  },
  homeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 40,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  difficultyButton: {
    // backgroundColor: '#81C784', // This will be overridden by the dynamic color
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
    width: '70%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  difficultyButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});