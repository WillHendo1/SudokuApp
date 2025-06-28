import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Dialog, Button } from '@rneui/themed';
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

      const [isDialogVisible, setIsDialogVisible] = useState(false);
      const [dialogTitle, setDialogTitle] = useState('');
      const [dialogMessage, setDialogMessage] = useState('');
      const [dialogButtons, setDialogButtons] = useState<any[]>([]);
  
    const handleStartGame = (difficulty: Difficulty) => { // Use Difficulty type
      const { puzzle, solution } = generatePuzzle(difficulty);
      dispatch({ 
        type: 'SET_GAME_DATA', 
        payload: { 
          puzzle, 
          solution, 
          initialPuzzle: puzzle.map(row => [...row]), 
          difficulty } });
      dispatch({ type: 'SET_SCREEN', payload: 'Game' });
    };

    const showPixosInfo = () => {
      showCustomDialog(
        "What are Pixos?", // Dialog Title
        "Collect Pixos by solving puzzles.\n\n" +
        "Spend them in the Store to customize your game with new cosmetic packs!\n\n",
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
      <View style={[
        styles.homeContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        { backgroundColor: gameAccentColor }
      ]}>
        <Image
          source={require('../../assets/images/clouds/cloud_1.png')}
          style={styles.cloudOne}
          resizeMode="contain"
        />
        <Image
          source={require('../../assets/images/clouds/cloud_2.png')}
          style={styles.cloudTwo}
          resizeMode="contain"
        />
        <Image
          source={require('../../assets/images/clouds/cloud_3.png')}
          style={styles.cloudThree}
          resizeMode="contain"
        />
        <Text style={[styles.homeTitle, {color: gameDarkerAccentColor}]}>Pixoku</Text>
        <TouchableOpacity 
          style={[styles.currencyDisplay, {backgroundColor: gameDarkerAccentColor}]}
          onPress={() => showPixosInfo()}>
        <Text style={styles.currencyText}>{appState.pixos}</Text>
          <Icon name="arrange-bring-to-front" size={24} color="#FFD700" />
        </TouchableOpacity>
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
        <Text style={styles.difficultyButtonText}>store</Text>
      </TouchableOpacity>
        
      <Dialog
                isVisible={isDialogVisible}
                // The onBackdropPress logic for controls/solved/failed dialogs
                onBackdropPress={() => {
                  if (dialogButtons.length === 1 && dialogButtons[0].style !== 'cancel' && dialogTitle !== "Game Controls") {
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
                overlayStyle = {styles.dialogOverlay}
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

  export default HomeScreen;

// --- Styles specific to HomeScreen (cut these from App.tsx) ---
const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: 'pixelart',
    fontWeight: 600,
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
  dialogOverlay: {
    borderRadius: 20,
  },
  cloudOne: {
    position: 'absolute',
    width: 250,
    height: 250,
    left: -30,
    top: 10,
  },
  cloudTwo: {
    position: 'absolute',
    width: 400,
    height: 400,
    left: 100,
    top: 600,
  },
  cloudThree: {
    position: 'absolute',
    width: 250,
    height: 250,
    right: -10,
    top: 80,
  },

});