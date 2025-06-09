// App.tsx

import React, { useReducer, useState, useEffect } from 'react'; // Removed unused hooks
import { StyleSheet, View, Text } from 'react-native'; // Keep necessary RN imports
import { SafeAreaProvider } from 'react-native-safe-area-context';

// --- Import your new screen components ---
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import StoreScreen from './src/screens/StoreScreen';

// --- Import types from sudokuLogic.ts (if not already imported by screens) ---
// It's good practice to centralize shared types or define them in appReducer's file.
// For now, let's keep them explicit if needed by App.tsx directly or passed as props.
import { PuzzleData } from './src/utils/sudokuLogic'; // Only PuzzleData is needed here directly for AppState

import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';


// --- App Component Types ---
export type AppState = {
  currentScreen: 'Home' | 'Game' | 'Store';
  gameData: PuzzleData | null;
  pixos: number;
  unlockedItems: string[]; // Array of item IDs that the user owns
  equippedCosmetic: string | null; // ID of the currently equipped cosmetic
};

// Define actions for the appReducer (these should stay in App.tsx or a central store file)
export type AppAction =
  | { type: 'SET_SCREEN'; payload: 'Home' | 'Game' | 'Store' }
  | { type: 'SET_GAME_DATA'; payload: PuzzleData }
  | { type: 'EARN_PIXOS'; payload: number }
  | { type: 'SPEND_PIXOS'; payload: number }
  | { type: 'UNLOCK_ITEM'; payload: string } // Payload is itemId
  | { type: 'EQUIP_ITEM'; payload: string | null } // Payload is itemId or null to unequip
  | { type: 'LOAD_USER_DATA'; payload: { pixos: number; unlockedItems: string[]; equippedCosmetic: string | null; } };

// --- appReducer (should stay here or in a central store file) ---
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    case 'SET_GAME_DATA':
      return { ...state, gameData: action.payload };
      case 'EARN_PIXOS':
        return { ...state, pixos: state.pixos + action.payload };
      case 'SPEND_PIXOS':
        return { ...state, pixos: Math.max(0, state.pixos - action.payload) }; // Ensure non-negative
      case 'UNLOCK_ITEM':
        if (state.unlockedItems.includes(action.payload)) {
          return state; // Already owned
        }
        return { ...state, unlockedItems: [...state.unlockedItems, action.payload] };
      case 'EQUIP_ITEM':
        return { ...state, equippedCosmetic: action.payload };
      case 'LOAD_USER_DATA':
        return {
          ...state,
          pixos: action.payload.pixos,
          unlockedItems: action.payload.unlockedItems,
          equippedCosmetic: action.payload.equippedCosmetic,
        };
      // --- END NEW ---
      default:
        return state;
    }
};

// --- Main App Component ---
const App = () => {

  const [appState, dispatch] = useReducer(appReducer, {
    currentScreen: 'Home',
    gameData: null,
    pixos: 0,
    unlockedItems: [],
    equippedCosmetic: null, 
  } as AppState);

  const [appIsReady, setAppIsReady] = useState(false); // New state to track if fonts/assets are loaded

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({
          'pixelart': require('./assets/fonts/pixelart.ttf'),
        });

        // Artificially delay for testing
        // await new Promise(resolve => setTimeout(resolve, 2000));

        // Load user data from AsyncStorage
        const savedPixos = await AsyncStorage.getItem('userPixos');
        const savedUnlockedItems = await AsyncStorage.getItem('userUnlockedItems');
        const savedEquippedCosmetic = await AsyncStorage.getItem('userEquippedCosmetic');

        dispatch({
          type: 'LOAD_USER_DATA',
          payload: {
            pixos: savedPixos ? parseInt(savedPixos, 10) : 0,
            unlockedItems: savedUnlockedItems ? JSON.parse(savedUnlockedItems) : [],
            equippedCosmetic: savedEquippedCosmetic,
          },
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []); // Run once on component mount

  useEffect(() => {
    // Save pixos
    AsyncStorage.setItem('userPixos', appState.pixos.toString());
    // Save unlocked items (needs to be stringified)
    AsyncStorage.setItem('userUnlockedItems', JSON.stringify(appState.unlockedItems));
    // Save equipped cosmetic
    AsyncStorage.setItem('userEquippedCosmetic', appState.equippedCosmetic || ''); // Save null as empty string
  }, [appState.pixos, appState.unlockedItems, appState.equippedCosmetic]); // Dependencies: save when these change

  // Hide splash screen once app is ready to render
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // --- END FONT LOADING STATE ---

  // Display a loading screen or null until app is ready
  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading App Assets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {appState.currentScreen === 'Home' ? (
        <HomeScreen dispatch={dispatch} appState={appState} />
      ) : appState.currentScreen === 'Game' ? (
        appState.gameData ? (
          <GameScreen gameData={appState.gameData} dispatch={dispatch} />
        ) : (
          <View style={styles.loadingContainer}>
            <Text>Loading game...</Text>
          </View>
        )
      ) : appState.currentScreen === 'Store' ? (
        <StoreScreen dispatch={dispatch} appState={appState} />
      ) : (
        <View style={styles.loadingContainer}>
          <Text>Unknown Screen</Text>
        </View>
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