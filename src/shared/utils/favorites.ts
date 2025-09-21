// @/utils/favorites.ts

export interface FavoriteItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  addedAt: number;
}

export const FAVORITES_KEY = 'favorites';

export const getFavorites = (): FavoriteItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
};

export const saveFavorites = (favorites: FavoriteItem[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

export const addToFavorites = (item: Omit<FavoriteItem, 'addedAt'>): void => {
  const favorites = getFavorites();
  const existingIndex = favorites.findIndex(fav => fav.id === item.id);
  
  if (existingIndex === -1) {
    favorites.push({ ...item, addedAt: Date.now() });
    saveFavorites(favorites);
  }
};

export const removeFromFavorites = (id: number): void => {
  const favorites = getFavorites();
  const filtered = favorites.filter(item => item.id !== id);
  saveFavorites(filtered);
};

export const isFavorite = (id: number): boolean => {
  const favorites = getFavorites();
  return favorites.some(item => item.id === id);
};

export const toggleFavorite = (item: Omit<FavoriteItem, 'addedAt'>): boolean => {
  const favorites = getFavorites();
  const existingIndex = favorites.findIndex(fav => fav.id === item.id);
  
  if (existingIndex !== -1) {
    removeFromFavorites(item.id);
    return false;
  } else {
    addToFavorites(item);
    return true;
  }
};

// Добавьте в конец файла @/utils/favorites.ts

// Создаем систему событий для синхронизации между компонентами
type FavoriteEventListener = (favorites: FavoriteItem[]) => void;

const eventListeners: FavoriteEventListener[] = [];

export const addFavoriteListener = (listener: FavoriteEventListener): void => {
  eventListeners.push(listener);
};

export const removeFavoriteListener = (listener: FavoriteEventListener): void => {
  const index = eventListeners.indexOf(listener);
  if (index > -1) {
    eventListeners.splice(index, 1);
  }
};

const notifyListeners = (): void => {
  const favorites = getFavorites();
  eventListeners.forEach(listener => listener(favorites));
};

// Обновляем функции для уведомления слушателей
export const saveFavoritesWithNotify = (favorites: FavoriteItem[]): void => {
  saveFavorites(favorites);
  notifyListeners();
};

export const toggleFavoriteWithNotify = (item: Omit<FavoriteItem, 'addedAt'>): boolean => {
  const result = toggleFavorite(item);
  notifyListeners();
  return result;
};