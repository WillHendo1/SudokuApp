// src/screens/StoreScreen.tsx

import React, { useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import types from App.tsx or a shared types file
import { AppAction, AppState } from '../../App'; // Adjust path if AppAction/AppState are elsewhere
import { PASTEL_COLORS } from '../constants/colors';

// --- COSMETIC ITEM DATA (Define your items here!) ---
type CosmeticItem = {
  id: string;
  name: string;
  cost: number;
  image: any; // Use `any` for require() path, or string for URL
  type: 'grid_image' | 'theme_accent' | 'background'; // Example types
  value?: string; // e.g., hex color for theme_accent, or image key for grid_image
};

const COSMETIC_ITEMS: CosmeticItem[] = [
  { id: 'item_panda_set', name: 'Panda Numbers', cost: 0, image: require('../../assets/chicken.png'), type: 'grid_image', value: 'panda_set' },
  { id: 'item_cat_set', name: 'Cat Numbers', cost: 500, image: require('../../assets/chicken.png'), type: 'grid_image', value: 'cat_set' }, // You'd need to create cat images!
  { id: 'item_dog_set', name: 'Dog Numbers', cost: 500, image: require('../../assets/chicken.png'), type: 'grid_image', value: 'dog_set' }, // And dog images!
  { id: 'theme_gold', name: 'Golden Theme', cost: 200, image: null, type: 'theme_accent', value: '#FFD700' },
  { id: 'theme_lavender', name: 'Lavender Theme', cost: 200, image: null, type: 'theme_accent', value: '#DBCDF0' },
  // Add more cosmetic items here
];
// --- END COSMETIC ITEM DATA ---

type StoreScreenProps = {
  dispatch: React.Dispatch<AppAction>;
  appState: AppState;
};

const StoreScreen = ({ dispatch, appState }: StoreScreenProps) => {
  const insets = useSafeAreaInsets();
  const { pixos, unlockedItems, equippedCosmetic } = appState;

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

    // Determine visual style based on item type if it's a color theme
    let itemPreviewStyle: any = null;
    if (item.type === 'theme_accent' && item.value) {
      itemPreviewStyle = { backgroundColor: item.value + '80' }; // Use item's value as background
    }

    return (
      <View style={styles.storeItemContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.storeItemImage} resizeMode="contain" />
        ) : (
          <View style={[styles.storeItemImagePlaceholder, itemPreviewStyle]} /> // Placeholder for non-image items
        )}
        <Text style={styles.storeItemName}>{item.name}</Text>
        <Text style={styles.storeItemCost}>{isOwned ? 'Owned' : `${item.cost} pixos`}</Text>
        <TouchableOpacity
          style={[
            styles.storeActionButton,
            isEquipped && styles.equippedActionButton,
            !isOwned && styles.disabledActionButton,
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
    <View style={[styles.storeContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.storeHeader}>
        <TouchableOpacity onPress={() => dispatch({ type: 'SET_SCREEN', payload: 'Home' })} style={styles.backButton}>
          <Icon name="arrow-left" size={32} color={PASTEL_COLORS[0].darker} />
        </TouchableOpacity>
        <Text style={styles.storeTitle}>Cosmetic Store</Text>
        <View style={styles.currencyDisplay}>
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
    padding: 10,
  },
  storeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1, // Allow title to take space
    textAlign: 'center',
    marginLeft: -40, // Offset for back button
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderRadius: 20,
  },
  currencyText: {
    fontSize: 20,
    fontWeight: 'bold',
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
    width: Dimensions.get('window').width / 2 - 20, // 2 columns with margin
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
    backgroundColor: '#EEE', // Default placeholder color
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeItemName: {
    fontSize: 18,
    fontWeight: 'bold',
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
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  equippedActionButton: {
    backgroundColor: '#27AE60', // Darker green when equipped
  },
  disabledActionButton: {
    backgroundColor: '#BDBDBD', // Gray when disabled
  },
});