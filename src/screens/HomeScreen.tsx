import React, { useRef } from 'react'; // Added useRef
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import the logic functions and types
import { generatePuzzle, Difficulty, PuzzleData } from '../utils/sudokuLogic'; // Adjust path based on your exact structure
import { PASTEL_COLORS } from '../constants/colors'; // Adjust path based on your exact structure
import { color } from '@rneui/base';

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
  
      const currentPalette = useRef(PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)]).current;
      const gameAccentColor = currentPalette.primary; 
      const gameDarkerAccentColor = currentPalette.darker;
  
    const handleStartGame = (difficulty: Difficulty) => { // Use Difficulty type
      const { puzzle, solution } = generatePuzzle(difficulty);
      dispatch({ type: 'SET_GAME_DATA', payload: { puzzle, solution, initialPuzzle: puzzle.map(row => [...row]) } }); // initialPuzzle needs to be added to PuzzleData type as well.
      dispatch({ type: 'SET_SCREEN', payload: 'Game' });
    };
  
    return (
      <View style={[
        styles.homeContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        { backgroundColor: gameAccentColor }
      ]}>
        <Text style={[styles.homeTitle, {color: gameDarkerAccentColor}]}>Pixoku</Text>
        <TouchableOpacity
          style={[styles.difficultyButton, {backgroundColor: gameDarkerAccentColor }]}
          onPress={() => handleStartGame('easy')}
        >
          <Text style={styles.difficultyButtonText}>easy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.difficultyButton, {backgroundColor: gameDarkerAccentColor }]}
          onPress={() => handleStartGame('medium')}
        >
          <Text style={styles.difficultyButtonText}>medium</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.difficultyButton, {backgroundColor: gameDarkerAccentColor }]}
          onPress={() => handleStartGame('hard')}  
        >
          <Text style={styles.difficultyButtonText}>hard</Text>
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
    fontSize: 50,
    fontFamily: 'pixelart',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  difficultyButton: {
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
    fontFamily: 'pixelart',
    fontWeight: '600',
    color: '#FFFFFF',
  },
});