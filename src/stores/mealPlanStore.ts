import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MealType = 'breakfast' | 'lunch' | 'dinner'
export type Category = 'Produce' | 'Pantry' | 'Dairy' | 'Meat' | 'Other'

export interface MealRef {
  recipeId: string
  name: string
  spicesOwned: number
  spicesTotal: number
}

export interface DayPlan {
  date: string
  breakfast?: MealRef
  lunch?: MealRef
  dinner?: MealRef
}

export interface ShoppingItem {
  id: string
  name: string
  qty: string
  category: Category
  purchased: boolean
}

export interface Suggestion {
  recipeId: string
  name: string
  spicesOwned: number
  spicesTotal: number
  prepMin: number
  difficulty: 1 | 2 | 3
  ingredients: { name: string; qty: string; category: Category }[]
}

interface MealPlanState {
  weekStart: string
  days: DayPlan[]
  ownedSpices: string[]
  checkedItems: Record<string, boolean>
  setWeekStart: (date: string) => void
  setMeal: (date: string, mealType: MealType, meal: MealRef | undefined) => void
  addSpice: (spice: string) => void
  removeSpice: (spice: string) => void
  toggleChecked: (itemId: string) => void
  clearChecked: () => void
  navigateWeek: (direction: 'prev' | 'next') => void
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function generateWeekDays(weekStart: string): DayPlan[] {
  const start = new Date(weekStart)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return { date: d.toISOString().split('T')[0] }
  })
}

const today = getMonday(new Date())
const initialWeekStart = today.toISOString().split('T')[0]

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set, get) => ({
      weekStart: initialWeekStart,
      days: generateWeekDays(initialWeekStart),
      ownedSpices: [],
      checkedItems: {},
      setWeekStart: (date: string) =>
        set({ weekStart: date, days: generateWeekDays(date), checkedItems: {} }),
      setMeal: (date, mealType, meal) =>
        set((state) => ({
          days: state.days.map((d) =>
            d.date === date ? { ...d, [mealType]: meal } : d
          ),
        })),
      addSpice: (spice) =>
        set((state) => ({
          ownedSpices: state.ownedSpices.includes(spice)
            ? state.ownedSpices
            : [...state.ownedSpices, spice],
        })),
      removeSpice: (spice) =>
        set((state) => ({
          ownedSpices: state.ownedSpices.filter((s) => s !== spice),
        })),
      toggleChecked: (itemId) =>
        set((state) => ({
          checkedItems: {
            ...state.checkedItems,
            [itemId]: !state.checkedItems[itemId],
          },
        })),
      clearChecked: () => set({ checkedItems: {} }),
      navigateWeek: (direction) => {
        const current = new Date(get().weekStart)
        current.setDate(current.getDate() + (direction === 'next' ? 7 : -7))
        const newStart = current.toISOString().split('T')[0]
        set({ weekStart: newStart, days: generateWeekDays(newStart), checkedItems: {} })
      },
    }),
    { name: 'spicescale-meal-plan' }
  )
)

const SAMPLE_RECIPES: Suggestion[] = [
  { recipeId: '1', name: 'Coconut Curry Lentils', spicesOwned: 5, spicesTotal: 5, prepMin: 25, difficulty: 2, ingredients: [{ name: 'Red lentils', qty: '1 cup', category: 'Pantry' }, { name: 'Coconut milk', qty: '1 can', category: 'Pantry' }, { name: 'Yellow onion', qty: '1', category: 'Produce' }, { name: 'Ginger', qty: '1 thumb', category: 'Produce' }, { name: 'Cilantro', qty: '1 bunch', category: 'Produce' }] },
  { recipeId: '2', name: 'Smoky Chickpea Wrap', spicesOwned: 4, spicesTotal: 5, prepMin: 15, difficulty: 1, ingredients: [{ name: 'Chickpeas', qty: '1 can', category: 'Pantry' }, { name: 'Tortillas', qty: '4', category: 'Pantry' }, { name: 'Lime', qty: '2', category: 'Produce' }, { name: 'Greek yogurt', qty: '200g', category: 'Dairy' }] },
  { recipeId: '3', name: 'Harissa Roasted Veg Bowl', spicesOwned: 3, spicesTotal: 5, prepMin: 35, difficulty: 3, ingredients: [{ name: 'Harissa paste', qty: '1 jar', category: 'Pantry' }, { name: 'Sweet potato', qty: '2', category: 'Produce' }, { name: 'Chickpeas', qty: '1 can', category: 'Pantry' }, { name: 'Feta cheese', qty: '100g', category: 'Dairy' }] },
  { recipeId: '4', name: 'Thai Basil Stir Fry', spicesOwned: 4, spicesTotal: 5, prepMin: 20, difficulty: 2, ingredients: [{ name: 'Chicken thigh', qty: '500g', category: 'Meat' }, { name: 'Thai basil', qty: '1 bunch', category: 'Produce' }, { name: 'Soy sauce', qty: '2 tbsp', category: 'Pantry' }] },
  { recipeId: '5', name: 'Spiced Shakshuka', spicesOwned: 5, spicesTotal: 5, prepMin: 30, difficulty: 2, ingredients: [{ name: 'Eggs', qty: '4', category: 'Dairy' }, { name: 'Canned tomatoes', qty: '1 can', category: 'Pantry' }, { name: 'Yellow onion', qty: '1', category: 'Produce' }, { name: 'Feta cheese', qty: '50g', category: 'Dairy' }] },
  { recipeId: '6', name: 'Cumin Lamb Flatbread', spicesOwned: 3, spicesTotal: 5, prepMin: 40, difficulty: 3, ingredients: [{ name: 'Ground lamb', qty: '400g', category: 'Meat' }, { name: 'Flatbread', qty: '4', category: 'Pantry' }, { name: 'Greek yogurt', qty: '150g', category: 'Dairy' }, { name: 'Cucumber', qty: '1', category: 'Produce' }] },
  { recipeId: '7', name: 'Turmeric Rice Bowl', spicesOwned: 4, spicesTotal: 5, prepMin: 25, difficulty: 1, ingredients: [{ name: 'Basmati rice', qty: '1 cup', category: 'Pantry' }, { name: 'Chicken breast', qty: '300g', category: 'Meat' }, { name: 'Spinach', qty: '2 cups', category: 'Produce' }] },
  { recipeId: '8', name: 'Paprika Grilled Shrimp', spicesOwned: 5, spicesTotal: 5, prepMin: 20, difficulty: 2, ingredients: [{ name: 'Shrimp', qty: '500g', category: 'Meat' }, { name: 'Lime', qty: '2', category: 'Produce' }, { name: 'Garlic', qty: '4 cloves', category: 'Produce' }] },
  { recipeId: '9', name: 'Cinnamon Overnight Oats', spicesOwned: 4, spicesTotal: 4, prepMin: 5, difficulty: 1, ingredients: [{ name: 'Rolled oats', qty: '1 cup', category: 'Pantry' }, { name: 'Milk', qty: '1 cup', category: 'Dairy' }, { name: 'Banana', qty: '1', category: 'Produce' }] },
  { recipeId: '10', name: 'Ginger Miso Soup', spicesOwned: 3, spicesTotal: 4, prepMin: 15, difficulty: 1, ingredients: [{ name: 'Miso paste', qty: '2 tbsp', category: 'Pantry' }, { name: 'Tofu', qty: '200g', category: 'Produce' }, { name: 'Green onion', qty: '3', category: 'Produce' }, { name: 'Ginger', qty: '1 thumb', category: 'Produce' }] },
  { recipeId: '11', name: 'Chili Garlic Noodles', spicesOwned: 5, spicesTotal: 5, prepMin: 15, difficulty: 1, ingredients: [{ name: 'Egg noodles', qty: '200g', category: 'Pantry' }, { name: 'Garlic', qty: '6 cloves', category: 'Produce' }, { name: 'Soy sauce', qty: '3 tbsp', category: 'Pantry' }] },
  { recipeId: '12', name: 'Moroccan Chicken Tagine', spicesOwned: 4, spicesTotal: 6, prepMin: 45, difficulty: 3, ingredients: [{ name: 'Chicken thigh', qty: '600g', category: 'Meat' }, { name: 'Dried apricots', qty: '100g', category: 'Pantry' }, { name: 'Yellow onion', qty: '2', category: 'Produce' }, { name: 'Olives', qty: '100g', category: 'Pantry' }] },
]

export function getSuggestions(_mealType: MealType): Suggestion[] {
  const shuffled = [...SAMPLE_RECIPES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

export function getShoppingItems(days: DayPlan[]): ShoppingItem[] {
  const items = new Map<string, ShoppingItem>()
  const meals: MealRef[] = []
  for (const day of days) {
    if (day.breakfast) meals.push(day.breakfast)
    if (day.lunch) meals.push(day.lunch)
    if (day.dinner) meals.push(day.dinner)
  }
  for (const meal of meals) {
    const recipe = SAMPLE_RECIPES.find((r) => r.recipeId === meal.recipeId)
    if (!recipe) continue
    for (const ing of recipe.ingredients) {
      const key = ing.name.toLowerCase()
      if (!items.has(key)) {
        items.set(key, {
          id: key,
          name: ing.name,
          qty: ing.qty,
          category: ing.category,
          purchased: false,
        })
      }
    }
  }
  return Array.from(items.values())
}
