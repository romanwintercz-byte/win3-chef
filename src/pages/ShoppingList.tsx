import { useState } from 'react';
import { useAppStore } from '../store';
import { Trash2, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../App';

export default function ShoppingList() {
  const { shoppingList, toggleShoppingListItem, removeShoppingListItem, clearShoppingList } = useAppStore();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const activeItems = shoppingList.filter(i => !i.checked);
  const completedItems = shoppingList.filter(i => i.checked);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nákupní seznam</h1>
          <p className="text-neutral-500 mt-1">Položek k nákupu: {activeItems.length}</p>
        </div>
        {shoppingList.length > 0 && (
          showClearConfirm ? (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30">
              <span className="text-sm text-red-800 dark:text-red-300 font-medium">Opravdu vymazat?</span>
              <div className="flex gap-2 border-l border-red-200 dark:border-red-800 pl-3">
                <button onClick={() => { clearShoppingList(); setShowClearConfirm(false); }} className="text-red-600 dark:text-red-400 hover:text-red-700 font-bold text-sm">Ano</button>
                <button onClick={() => setShowClearConfirm(false)} className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium text-sm">Ne</button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
            >
              Vymazat vše
            </button>
          )
        )}
      </div>

      {shoppingList.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-medium">Seznam je prázdný</h2>
          <p className="text-neutral-500 mt-2">Přidejte suroviny z detailu receptu.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeItems.length > 0 && (
            <div className="space-y-2">
              {activeItems.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => toggleShoppingListItem(item.id)} className="text-neutral-300 hover:text-orange-500 transition-colors">
                      <Circle size={24} />
                    </button>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      {item.sourceRecipes && item.sourceRecipes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.sourceRecipes.map((r, i) => (
                            <span key={i} className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0">
                    <span className="text-neutral-500 text-sm font-medium bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
                      {item.amount} {item.unit}
                    </span>
                    <button onClick={() => removeShoppingListItem(item.id)} className="text-neutral-400 hover:text-red-500 p-1 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {completedItems.length > 0 && (
            <div className="space-y-2 opacity-60">
              <h3 className="font-semibold text-neutral-500 px-2 py-1">Koupeno</h3>
              {completedItems.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => toggleShoppingListItem(item.id)} className="text-orange-500 transition-colors">
                      <CheckCircle2 size={24} />
                    </button>
                    <div className="flex flex-col">
                      <span className="font-medium line-through text-neutral-500">{item.name}</span>
                      {item.sourceRecipes && item.sourceRecipes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 opacity-50">
                          {item.sourceRecipes.map((r, i) => (
                            <span key={i} className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0">
                    <span className="text-neutral-400 text-sm">{item.amount} {item.unit}</span>
                    <button onClick={() => removeShoppingListItem(item.id)} className="text-neutral-400 hover:text-red-500 p-1 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
