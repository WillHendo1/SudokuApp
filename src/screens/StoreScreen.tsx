// src/screens/StoreScreen.tsx

import React, { useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  const handleBuyItem = (item: CosmeticItem) => {
    if (unlockedItems.includes(item.id)) {
      Alert.alert("Owned", "You already own this item!");
      return;
    }
    if (pixos >= item.cost) {
      Alert.alert(
        "Confirm Purchase",
        `Buy "${item.name}" for ${item.cost} pixos?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Buy", onPress: () => {
              dispatch({ type: 'SPEND_PIXOS', payload: item.cost });
              dispatch({ type: 'UNLOCK_ITEM', payload: item.id });
              Alert.alert("Success!", `You bought "${item.name}"!`);
            }
          }
        ]
      );
    } else {
      Alert.alert("Not Enough Pixos", `You need ${item.cost - pixos} more pixos to buy "${item.name}".`);
    }
  };

  const handleEquipItem = (item: CosmeticItem) => {
    if (!unlockedItems.includes(item.id)) {
      Alert.alert("Error", "You don't own this item!");
      return;
    }
    dispatch({ type: 'EQUIP_ITEM', payload: item.id });
    Alert.alert("Equipped!", `You equipped "${item.name}".`);
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
            <Text style={styles.noImagePlaceholderText}>No Image</Text> {/* Or an Icon */}
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
    backgroundColor: '#FFD700', // <--- A vibrant gold/yellow to indicate affordability
    // You could also add a border here for extra emphasis:
    // borderColor: '#FFA500',
    // borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
});