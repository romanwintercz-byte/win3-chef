import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { Clock, Zap, ChefHat, ShoppingCart, Trash2, Edit, PlayCircle, Flame, ArrowLeft, Bot } from 'lucide-react';
import PantryReviewModal from '../components/PantryReviewModal';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, deleteRecipe, addToShoppingList } = useAppStore();
  const recipe = recipes.find(r => r.id === id);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isPantryModalOpen, setIsPantryModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Recept nenalezen</h2>
        <Link to="/" className="text-orange-600 hover:underline mt-4 inline-block">Zpět na recepty</Link>
      </div>
    );
  }

  const handleOpenPantryReview = () => {
    setIsPantryModalOpen(true);
  };

  const handleConfirmAddToCart = (selectedItems: any[]) => {
    addToShoppingList(selectedItems);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const ingredientsForReview = recipe.ingredients.map(i => ({
    name: i.name,
    amount: i.amount,
    unit: i.unit,
    sourceRecipes: [recipe.title]
  }));

  const handleDelete = () => {
    deleteRecipe(recipe.id);
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <ArrowLeft size={20} />
          Zpět
        </button>
        <div className="flex gap-2">
          <Link to={`/recipe/edit/${recipe.id}`} className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <Edit size={20} />
          </Link>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 rounded-lg border border-red-100 dark:border-red-900/30">
              <span className="text-sm text-red-800 dark:text-red-300 font-medium">Smazat?</span>
              <button onClick={handleDelete} className="text-red-600 dark:text-red-400 font-bold hover:underline">Ano</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-neutral-500 hover:underline">Ne</button>
            </div>
          ) : (
            <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden relative">
            {recipe.image ? (
              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                <ChefHat size={64} opacity={0.2} />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleOpenPantryReview}
              className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-3 rounded-xl font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              <ShoppingCart size={20} />
              {addedToCart ? 'Přidáno do seznamu!' : 'Přidat suroviny do nákupu'}
            </button>
            <Link 
              to="/ai-chef"
              state={{ context: recipe }}
              className="flex items-center justify-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-6 py-3 rounded-xl font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
            >
              <Bot size={20} />
              AI Poradce
            </Link>
          </div>
          
          {recipe.videoUrl && (
            <a 
              href={recipe.videoUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-red-50 dark:bg-red-900/20 text-red-600 px-6 py-3 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <PlayCircle size={20} />
              Přehrát video
            </a>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-sm font-medium rounded-full">
                {recipe.type}
              </span>
              <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-sm font-medium rounded-full">
                {recipe.difficulty}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{recipe.title}</h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
              {recipe.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <div className="text-center">
              <div className="text-neutral-500 mb-1 flex justify-center"><Clock size={20} /></div>
              <div className="font-semibold">{recipe.prepTime} min</div>
              <div className="text-xs text-neutral-500">Čas</div>
            </div>
            <div className="text-center">
              <div className="text-neutral-500 mb-1 flex justify-center"><Zap size={20} /></div>
              <div className="font-semibold">{recipe.calories}</div>
              <div className="text-xs text-neutral-500">Kcal</div>
            </div>
            <div className="text-center">
              <div className="text-neutral-500 mb-1 flex justify-center"><Flame size={20} /></div>
              <div className="font-semibold">{recipe.macros.protein}g</div>
              <div className="text-xs text-neutral-500">Bílkoviny</div>
            </div>
            <div className="text-center">
              <div className="text-neutral-500 mb-1 flex justify-center"><div className="w-5 h-5 flex items-center justify-center font-bold text-sm">S</div></div>
              <div className="font-semibold">{recipe.macros.carbs}g</div>
              <div className="text-xs text-neutral-500">Sacharidy</div>
            </div>
          </div>

          {recipe.equipment && recipe.equipment.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Potřebné vybavení</h2>
              <div className="flex flex-wrap gap-2">
                {recipe.equipment.map((eq, i) => (
                  <span key={i} className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium border border-neutral-200 dark:border-neutral-700">
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-4">Suroviny</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <span className="font-medium">{ing.name}</span>
                  <span className="text-neutral-500">{ing.amount} {ing.unit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Postup</h2>
            <div className="space-y-6">
              {recipe.instructions.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 pt-1 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <PantryReviewModal 
        isOpen={isPantryModalOpen}
        onClose={() => setIsPantryModalOpen(false)}
        onConfirm={handleConfirmAddToCart}
        items={ingredientsForReview}
      />
    </div>
  );
}
