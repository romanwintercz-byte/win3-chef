import { useState, useEffect } from 'react';
import { X, CheckSquare, Square, ShoppingCart } from 'lucide-react';

interface PantryReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedItems: any[]) => void;
  items: any[];
  title?: string;
}

export default function PantryReviewModal({ isOpen, onClose, onConfirm, items, title = "Revize spíže" }: PantryReviewModalProps) {
  const [checkedState, setCheckedState] = useState<boolean[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCheckedState(new Array(items.length).fill(true));
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const itemsToAdd = items.filter((_, index) => checkedState[index]);
    onConfirm(itemsToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-950">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border-b border-orange-100 dark:border-orange-900/30">
          <p className="text-sm text-orange-800 dark:text-orange-300 font-medium text-center">
            Odškrtněte suroviny, které už máte doma, abyste je zbytečně nekupovali.
          </p>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          <div className="space-y-2">
            {items.map((item, index) => {
              const isChecked = checkedState[index];
              return (
                <div 
                  key={index}
                  onClick={() => {
                    const newChecked = [...checkedState];
                    newChecked[index] = !newChecked[index];
                    setCheckedState(newChecked);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    isChecked 
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-500/10 dark:border-orange-500/50' 
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button className={`transition-colors ${isChecked ? 'text-orange-500' : 'text-neutral-400'}`}>
                      {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                    <div>
                      <span className={`font-medium block ${!isChecked && 'line-through text-neutral-500'}`}>
                        {item.name}
                      </span>
                      {item.sourceRecipes && item.sourceRecipes.length > 0 && (
                        <span className="text-xs text-neutral-500 line-clamp-1">
                          z: {item.sourceRecipes.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-medium px-2 py-1 rounded-md ${isChecked ? 'bg-white dark:bg-neutral-900 shadow-sm' : ''}`}>
                    {item.amount} {item.unit}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <button 
            onClick={handleConfirm}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors"
          >
            <ShoppingCart size={20} />
            Přidat do nákupního seznamu ({checkedState.filter(Boolean).length})
          </button>
        </div>
      </div>
    </div>
  );
}
