// src/screens/StoreScreen.tsx

import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dialog, Button } from '@rneui/themed';

// Import types from App.tsx or a shared types file
import { AppAction, AppState } from '../../App'; // Adjust path if AppAction/AppState are elsewhere
import { PASTEL_COLORS } from '../constants/colors';
import { COSMETIC_ITEMS, CosmeticItem } from '../constants/cosmeticItems';


type StoreScreenProps = {
  dispatch: React.Dispatch<AppAction>;
  appState: AppState;
};

const StoreScreen = ({ dispatch, appState }: StoreScreenProps) => {
    const insets = useSafeAreaInsets();
    const { pixos, unlockedItems, equippedCosmetic } = appState;

    const currentPalette = useRef(PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)]).current;
    const gameAccentColor = currentPalette.primary; 
    const gameDarkerAccentColor = currentPalette.darker;

    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogButtons, setDialogButtons] = useState<any[]>([]);

      // Helper function to show custom dialog
    const showCustomDialog = (title: string, message: string, buttons: any[], cancelable: boolean = true) => {
        setDialogTitle(title);
        setDialogMessage(message);
        setDialogButtons(buttons);
        setIsDialogVisible(true);
    };

    const handleBuyItem = (item: CosmeticItem) => {
        if (pixos >= item.cost) {
        showCustomDialog(
            "Confirm Purchase",
            `Buy "${item.name}" for ${item.cost} pixos?`,
            [
            { 
                text: "Cancel", 
                style: "cancel",
                onPress: () => setIsDialogVisible(false),
            },
            { text: "Buy", onPress: () => {
                dispatch({ type: 'SPEND_PIXOS', payload: item.cost });
                dispatch({ type: 'UNLOCK_ITEM', payload: item.id });
                showCustomDialog(
                    "Success!", 
                    `You bought "${item.name}"!`,
                     [
                        {
                            text: "Great!", 
                            onPress: () => setIsDialogVisible(false),
                            type: "solid" 
                        }
                     ]
                );
                }
            }
            ]
        );
        } else {
            showCustomDialog(
                "Not Enough Pixos", 
                `You need ${item.cost - pixos} more pixos to buy "${item.name}".`,
                [
                    {
                        text: "Got It!", 
                        onPress: () => setIsDialogVisible(false),
                        type: "solid" 
                    }
                 ]
            );
        }
    };

  const handleEquipItem = (item: CosmeticItem) => {
    dispatch({ type: 'EQUIP_ITEM', payload: item.id });
    showCustomDialog(
        "Equipped!", 
        `You equipped "${item.name}".`,
        [
            {
                text: "Okay", 
                onPress: () => setIsDialogVisible(false),
                type: "solid" 
            }
         ]
    );
  };

  const renderItem = ({ item }: { item: CosmeticItem }) => {
    const isOwned = unlockedItems.includes(item.id);
    const isEquipped = equippedCosmetic === item.id;
    const canAfford = pixos >= item.cost; 

    return (
      <View style={styles.storeItemContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.storeItemImage} resizeMode="contain" />
        ) : (
        <View style={styles.storeItemImagePlaceholder}>
            <Text style={styles.noImagePlaceholderText}>No Image</Text>
        </View>
        )}
        <Text style={styles.storeItemName}>{item.name}</Text>
        <Text style={styles.storeItemCost}>{isOwned ? 'Owned' : `${item.cost} pixos`}</Text>
        <TouchableOpacity
          style={[
            styles.storeActionButton,
            isEquipped && styles.equippedActionButton,
            !isOwned && !canAfford && styles.disabledActionButton,
            !isOwned && canAfford && styles.affordableActionButton,
          ]}
          onPress={() => isOwned ? handleEquipItem(item) : handleBuyItem(item)}
          disabled={!isOwned && pixos < item.cost}
        >
          <Text style={styles.storeActionButtonText}>
            {isEquipped ? 'Equipped' : (isOwned ? 'Equip' : 'Buy')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.storeContainer, { backgroundColor: gameAccentColor, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.storeHeader}>
        <TouchableOpacity onPress={() => dispatch({ type: 'SET_SCREEN', payload: 'Home' })} style={styles.backButton}>
          <Icon name="arrow-left" size={32} color={gameDarkerAccentColor} />
        </TouchableOpacity>
        <Text style={[styles.storeTitle, {color: gameDarkerAccentColor}]}>Pixel Packs</Text>
        <View style={[styles.currencyDisplay, {backgroundColor: gameDarkerAccentColor}]}>
          <Text style={styles.currencyText}>{pixos}</Text>
          <Icon name="arrange-bring-to-front" size={24} color="#FFD700" />
        </View>
        
      </View>

      <FlatList
        data={COSMETIC_ITEMS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2} // Display items in 2 columns
        columnWrapperStyle={styles.rowWrapper} // Space between columns
        contentContainerStyle={styles.flatListContent}
      />
      <Dialog
                isVisible={isDialogVisible}
                // The onBackdropPress logic for controls/solved/failed dialogs
                onBackdropPress={() => {
                  if (dialogButtons.length === 1 && dialogButtons[0].style !== 'cancel' && dialogTitle !== "Confirm Purchase") {
                       if (dialogButtons.length === 1 && dialogButtons[0].text === "Got It!" && dialogTitle === "Confirm Purchase") {
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
                overlayStyle={styles.dialogOverlay}
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

export default StoreScreen;

// --- Store Screen Styles ---
const styles = StyleSheet.create({
  storeContainer: {
    flex: 1,
    backgroundColor: '#E0F2F7',
    paddingHorizontal: 10,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    marginTop: 20,
    paddingHorizontal: 5,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeTitle: {
    fontFamily: 'pixelart',
    fontSize: 32,
    flex: 1, // Allow title to take space
    textAlign: 'center',
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderRadius: 20,
  },
  currencyText: {
    fontFamily: 'pixelart',
    fontSize: 20,
    color: '#FFD700',
    marginRight: 5,
  },
  flatListContent: {
    paddingBottom: 20, // Add some padding at the bottom of the list
  },
  rowWrapper: {
    justifyContent: 'space-around', // Space items evenly in a row
  },
  storeItemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    margin: 10,
    alignItems: 'center',
    width: Dimensions.get('window').width / 2 - 30, // 2 columns with margin
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  storeItemImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  storeItemImagePlaceholder: {
    width: 80,
    height: 80,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#CCC', // A neutral gray placeholder
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagePlaceholderText: { // New style for text in placeholder
      fontSize: 12,
      color: '#666',
  },
  storeItemName: {
    fontFamily: 'pixelart',
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center',
  },
  storeItemCost: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  storeActionButton: {
    backgroundColor: '#81C784',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  storeActionButtonText: {
    fontFamily: 'pixelart',
    color: '#FFFFFF',
    fontSize: 16,
  },
  equippedActionButton: {
    backgroundColor: '#27AE60', // Darker green when equipped
  },
  disabledActionButton: {
    backgroundColor: '#BDBDBD', // Gray when disabled
  },
  affordableActionButton: {
    backgroundColor: '#C67664',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
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
});