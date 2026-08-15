import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

// Custom IndexedDB storage for Zustand
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export type DietaryPreference = 'Vše' | 'Vegetarián' | 'Vegan' | 'Bez lepku' | 'Low Carb';
export type Difficulty = 'Snadné' | 'Střední' | 'Těžké';

export interface Ingredient {
  id: string;
  name: string;
  amount: number | string;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  equipment?: string[];
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  difficulty: Difficulty;
  calories: number;
  macros: { protein: number; carbs: number; fats: number };
  type: string;
  tags: string[];
  image?: string; // Base64 or ObjectURL
  gallery?: string[]; // Additional photos
  videoUrl?: string;
  createdAt: number;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: number | string;
  unit: string;
  checked: boolean;
  sourceRecipes?: string[];
}

export interface MealPlanItem {
  id: string;
  date: string; // YYYY-MM-DD
  recipeId: string;
  mealType: string;
}

interface AppState {
  recipes: Recipe[];
  shoppingList: ShoppingListItem[];
  mealPlan: MealPlanItem[];
  preferences: {
    diet: DietaryPreference;
    theme: 'light' | 'dark' | 'system';
  };
  
  // Actions
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  
  addToShoppingList: (items: Omit<ShoppingListItem, 'id' | 'checked'>[]) => void;
  toggleShoppingListItem: (id: string) => void;
  removeShoppingListItem: (id: string) => void;
  clearShoppingList: () => void;
  
  addMealPlanItem: (item: Omit<MealPlanItem, 'id'>) => void;
  removeMealPlanItem: (id: string) => void;
  
  updatePreferences: (prefs: Partial<AppState['preferences']>) => void;
  
  importData: (data: string) => void;
  exportData: () => string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      recipes: [],
      shoppingList: [],
      mealPlan: [],
      preferences: {
        diet: 'Vše',
        theme: 'system',
      },

      addRecipe: (recipe) => set((state) => ({
        recipes: [{ ...recipe, id: uuidv4(), createdAt: Date.now() }, ...state.recipes]
      })),

      updateRecipe: (id, updatedRecipe) => set((state) => ({
        recipes: state.recipes.map((r) => r.id === id ? { ...r, ...updatedRecipe } : r)
      })),

      deleteRecipe: (id) => set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== id),
        mealPlan: state.mealPlan.filter((m) => m.recipeId !== id)
      })),

      addToShoppingList: (items) => set((state) => {
        const newList = [...state.shoppingList];
        
        items.forEach(newItem => {
          const existingItem = newList.find(i => 
            !i.checked && 
            i.name.toLowerCase().trim() === newItem.name.toLowerCase().trim() &&
            i.unit.toLowerCase().trim() === newItem.unit.toLowerCase().trim()
          );

          let merged = false;
          if (existingItem) {
            // Try to parse amounts to merge them
            const existingAmt = Number(String(existingItem.amount).replace(',', '.'));
            const newAmt = Number(String(newItem.amount).replace(',', '.'));
            
            if (!isNaN(existingAmt) && !isNaN(newAmt)) {
              existingItem.amount = existingAmt + newAmt;
              if (newItem.sourceRecipes) {
                existingItem.sourceRecipes = Array.from(new Set([...(existingItem.sourceRecipes || []), ...newItem.sourceRecipes]));
              }
              merged = true;
            }
          }

          if (!merged) {
            newList.push({ ...newItem, id: uuidv4(), checked: false });
          }
        });

        return { shoppingList: newList };
      }),

      toggleShoppingListItem: (id) => set((state) => ({
        shoppingList: state.shoppingList.map((i) => i.id === id ? { ...i, checked: !i.checked } : i)
      })),

      removeShoppingListItem: (id) => set((state) => ({
        shoppingList: state.shoppingList.filter((i) => i.id !== id)
      })),

      clearShoppingList: () => set({ shoppingList: [] }),

      addMealPlanItem: (item) => set((state) => ({
        mealPlan: [...state.mealPlan, { ...item, id: uuidv4() }]
      })),

      removeMealPlanItem: (id) => set((state) => ({
        mealPlan: state.mealPlan.filter((i) => i.id !== id)
      })),

      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),

      importData: (dataStr) => {
        try {
          const data = JSON.parse(dataStr);
          if (data && data.recipes) {
            set({
              recipes: data.recipes || [],
              shoppingList: data.shoppingList || [],
              mealPlan: data.mealPlan || [],
              preferences: data.preferences || { diet: 'Vše', theme: 'system' }
            });
          }
        } catch (e) {
          console.error("Failed to import data", e);
          alert("Nepodařilo se importovat data. Neplatný formát.");
        }
      },

      exportData: () => {
        const state = get();
        return JSON.stringify({
          recipes: state.recipes,
          shoppingList: state.shoppingList,
          mealPlan: state.mealPlan,
          preferences: state.preferences
        }, null, 2);
      }
    }),
    {
      name: 'win3-chef-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
