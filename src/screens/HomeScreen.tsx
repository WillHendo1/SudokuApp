import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppAction, AppState } from '../../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import the logic functions and types
import { generatePuzzle, Difficulty, PuzzleData } from '../utils/sudokuLogic';
import { PASTEL_COLORS } from '../constants/colors';

// Define props for HomeScreen
type HomeScreenProps = {
  dispatch: React.Dispatch<AppAction>;
  appState: AppState;
};
  

// HomeScreen Component
const HomeScreen = ({ dispatch, appState }: HomeScreenProps) => {
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
        <View style={[styles.currencyDisplay, {backgroundColor: gameDarkerAccentColor}]}>
        <Text style={styles.currencyText}>{appState.pixos}</Text>
          <Icon name="arrange-bring-to-front" size={24} color="#FFD700" />
      </View>
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
        <TouchableOpacity
          style={[styles.difficultyButton, { backgroundColor: gameDarkerAccentColor, marginTop: 30 }]} // Adjust margin as needed
          onPress={() => dispatch({ type: 'SET_SCREEN', payload: 'Store' })}
      >
        <Text style={styles.difficultyButtonText}>PixelPacks</Text>
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
    fontSize: 60,
    fontFamily: 'pixelart',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  currencyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginRight: 5,
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