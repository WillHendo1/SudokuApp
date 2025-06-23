// --- COSMETIC ITEM DATA  ---
export type CosmeticItem = {
  id: string;
  name: string;
  cost: number;
  image: any; // Use `any` for require() path, or string for URL
  type: 'grid_image'
  value?: string; // image key for grid_image
};

 export const COSMETIC_ITEMS: CosmeticItem[] = [
  { id: 'item_farm_set', name: 'Farm', cost: 10, image: require('../../assets/images/farm_set/chicken.png'), type: 'grid_image', value: 'farm_set' },
  { id: 'item_fish_set', name: 'Fish', cost: 10, image: require('../../assets/images/fish_set/great-white-shark.png'), type: 'grid_image', value: 'fish_set' },
  { id: 'item_forest_set', name: 'Forest', cost: 10, image: require('../../assets/images/forest_set/bear.png'), type: 'grid_image', value: 'forest_set' },
  { id: 'item_desert_set', name: 'Safari', cost: 10, image: require('../../assets/images/safari_set/elephant.png'), type: 'grid_image', value: 'safari_set' },
  { id: 'item_ocean_set', name: 'Ocean', cost: 10, image: require('../../assets/images/ocean_set/octopus.png'), type: 'grid_image', value: 'ocean_set' },
  { id: 'item_animal_set', name: 'Animals', cost: 10, image: require('../../assets/images/animal_set/kangaroo.png'), type: 'grid_image', value: 'animal_set' },
  { id: 'item_pet_set', name: 'Pets', cost: 10, image: require('../../assets/images/pet_set/orange-cat.png'), type: 'grid_image', value: 'pet_set' },
];

// Map for quick lookup by ID
export const COSMETIC_ITEM_MAP = new Map(COSMETIC_ITEMS.map(item => [item.id, item]));

// --- END COSMETIC ITEM DATA ---