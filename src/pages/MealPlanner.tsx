import { useState } from 'react';
import { useAppStore } from '../store';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Calendar as CalendarIcon, Plus, Trash2, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import PantryReviewModal from '../components/PantryReviewModal';

const mealTypes = ['Snídaně', 'Svačina', 'Oběd', 'Večeře'];

export default function MealPlanner() {
  const { mealPlan, recipes, addMealPlanItem, removeMealPlanItem, addToShoppingList } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('Oběd');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [emptyListError, setEmptyListError] = useState(false);

  const [isPantryModalOpen, setIsPantryModalOpen] = useState(false);
  const [weeklyIngredients, setWeeklyIngredients] = useState<any[]>([]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  const handleAddItem = () => {
    if (selectedDate && selectedRecipeId && selectedMealType) {
      addMealPlanItem({
        date: selectedDate,
        recipeId: selectedRecipeId,
        mealType: selectedMealType
      });
      setIsAdding(false);
    }
  };

  const handleGenerateWeeklyList = () => {
    setEmptyListError(false);
    const startStr = format(weekDays[0], 'yyyy-MM-dd');
    const endStr = format(weekDays[6], 'yyyy-MM-dd');
    
    // Find all meal plan items in the current week view
    const currentWeekPlan = mealPlan.filter(m => m.date >= startStr && m.date <= endStr);
    
    const aggregatedIngredients: any[] = [];

    currentWeekPlan.forEach(planItem => {
      const recipe = recipes.find(r => r.id === planItem.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach(ing => {
        // Try to find if we already have this ingredient in the aggregated list
        const existing = aggregatedIngredients.find(
          a => a.name.toLowerCase() === ing.name.toLowerCase() && a.unit.toLowerCase() === ing.unit.toLowerCase()
        );

        if (existing) {
          const existingAmt = Number(String(existing.amount).replace(',', '.'));
          const newAmt = Number(String(ing.amount).replace(',', '.'));
          if (!isNaN(existingAmt) && !isNaN(newAmt)) {
             existing.amount = existingAmt + newAmt;
          }
          if (!existing.sourceRecipes.includes(recipe.title)) {
             existing.sourceRecipes.push(recipe.title);
          }
        } else {
          aggregatedIngredients.push({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            sourceRecipes: [recipe.title]
          });
        }
      });
    });

    if (aggregatedIngredients.length === 0) {
      setEmptyListError(true);
      setTimeout(() => setEmptyListError(false), 4000);
      return;
    }

    setWeeklyIngredients(aggregatedIngredients);
    setIsPantryModalOpen(true);
  };

  const handleConfirmAddToCart = (selectedItems: any[]) => {
    addToShoppingList(selectedItems);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jídelníček</h1>
          <p className="text-neutral-500 mt-1 capitalize">
            {format(weekStart, 'MMMM yyyy', { locale: cs })}
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-1">
              <button onClick={handlePrevWeek} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"><ChevronLeft size={20} /></button>
              <div className="px-4 font-medium min-w-[120px] text-center">
                Týden {format(weekStart, 'w')}
              </div>
              <button onClick={handleNextWeek} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"><ChevronRight size={20} /></button>
            </div>
            <button 
              onClick={() => {
                setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
                setIsAdding(true);
              }}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus size={20} /> Přidat Jídlo
            </button>
          </div>
          <button 
            onClick={handleGenerateWeeklyList}
            className="flex items-center justify-center gap-2 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 px-4 py-2.5 rounded-lg font-medium transition-colors w-full"
          >
            <ShoppingCart size={20} /> Vygenerovat nákup
          </button>
          {emptyListError && (
            <p className="text-red-500 text-sm font-medium animate-in fade-in">Žádná jídla k nákupu.</p>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg mb-8 animate-in slide-in-from-top-4">
          <h2 className="text-lg font-bold mb-4">Naplánovat Recept</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Datum</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Druh jídla</label>
              <select 
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
              >
                {mealTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Recept</label>
              <select 
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
              >
                <option value="">-- Vyberte --</option>
                {recipes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 font-medium text-neutral-600 hover:text-neutral-900">Zrušit</button>
            <button 
              onClick={handleAddItem}
              disabled={!selectedDate || !selectedRecipeId}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              Uložit
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, new Date());
          const dayItems = mealPlan.filter(m => m.date === dateStr);

          return (
            <div 
              key={dateStr}
              className={`flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border ${isToday ? 'border-orange-500 shadow-md ring-1 ring-orange-500/20' : 'border-neutral-200 dark:border-neutral-800'} overflow-hidden h-[500px] xl:h-auto xl:min-h-[600px]`}
            >
              <div className={`p-4 text-center border-b ${isToday ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/50' : 'border-neutral-100 dark:border-neutral-800'}`}>
                <div className={`text-sm font-semibold uppercase tracking-wider mb-1 ${isToday ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-500'}`}>
                  {format(day, 'EEEE', { locale: cs })}
                </div>
                <div className={`text-2xl font-bold ${isToday ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                  {format(day, 'd. M.')}
                </div>
              </div>
              
              <div className="flex-1 p-2 space-y-4 overflow-y-auto scrollbar-hide">
                {mealTypes.map(type => {
                  const item = dayItems.find(i => i.mealType === type);
                  const recipe = item ? recipes.find(r => r.id === item.recipeId) : null;
                  
                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide px-2">{type}</div>
                      {recipe && item ? (
                        <div className="group relative bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 transition-colors hover:border-orange-300">
                          <Link to={`/recipe/${recipe.id}`} className="block">
                            <h4 className="font-bold text-sm leading-tight mb-1 line-clamp-2">{recipe.title}</h4>
                            <div className="text-xs text-neutral-500">{recipe.calories} kcal</div>
                          </Link>
                          <button 
                            onClick={() => removeMealPlanItem(item.id)}
                            className="absolute top-2 right-2 p-1.5 bg-white dark:bg-neutral-800 rounded-md text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-neutral-200 dark:border-neutral-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setSelectedMealType(type);
                            setIsAdding(true);
                          }}
                          className="w-full h-[68px] flex items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-400 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <PantryReviewModal 
        isOpen={isPantryModalOpen}
        onClose={() => setIsPantryModalOpen(false)}
        onConfirm={handleConfirmAddToCart}
        items={weeklyIngredients}
        title="Týdenní revize spíže"
      />
    </div>
  );
}
