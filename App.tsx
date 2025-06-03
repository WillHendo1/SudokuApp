// App.tsx

import React, { useReducer } from 'react'; // Removed unused hooks
import { StyleSheet, View, Text } from 'react-native'; // Keep necessary RN imports
import { SafeAreaProvider } from 'react-native-safe-area-context';

// --- Import your new screen components ---
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';

// --- Import types from sudokuLogic.ts (if not already imported by screens) ---
// It's good practice to centralize shared types or define them in appReducer's file.
// For now, let's keep them explicit if needed by App.tsx directly or passed as props.
import { PuzzleData } from './src/utils/sudokuLogic'; // Only PuzzleData is needed here directly for AppState

// --- App Component Types ---
type AppState = {
  currentScreen: 'Home' | 'Game';
  gameData: PuzzleData | null;
};

// Define actions for the appReducer (these should stay in App.tsx or a central store file)
type AppAction =
  | { type: 'SET_SCREEN'; payload: 'Home' | 'Game' }
  | { type: 'SET_GAME_DATA'; payload: PuzzleData };

// --- appReducer (should stay here or in a central store file) ---
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    case 'SET_GAME_DATA':
      return { ...state, gameData: action.payload };
    default:
      return state;
  }
};

// --- Main App Component ---
const App = () => {
  const [appState, dispatch] = useReducer(appReducer, {
    currentScreen: 'Home',
    gameData: null,
  } as AppState);

  return (
    <SafeAreaProvider>
      {/* Conditionally render screens based on currentScreen state */}
      {appState.currentScreen === 'Home' ? (
        <HomeScreen dispatch={dispatch} />
      ) : (
        // Ensure gameData is not null when GameScreen is rendered
        appState.gameData ? (
          <GameScreen gameData={appState.gameData} dispatch={dispatch} />
        ) : (
          // Fallback if gameData is unexpectedly null (shouldn't happen with current logic)
          <View style={styles.loadingContainer}>
            <Text>Loading game...</Text>
          </View>
        )
      )}
    </SafeAreaProvider>
  );
};

// --- Styles (Only App.tsx specific styles, or general app-level styles) ---
const styles = StyleSheet.create({
  // Add a basic loading container style if needed
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F2F7', // Keep a base background
  },
  // Removed all HomeScreen and GameScreen specific styles from here
});

export default App;