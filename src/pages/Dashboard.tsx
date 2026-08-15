import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { Plus, Search, Clock, Zap, ChefHat } from 'lucide-react';
import { cn } from '../App';

export default function Dashboard() {
  const recipes = useAppStore((state) => state.recipes);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('Vše');

  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'Vše' || r.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [recipes, searchTerm, filterType]);

  const types = ['Vše', ...Array.from(new Set(recipes.map(r => r.type)))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moje Recepty</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Uloženo {recipes.length} receptů
          </p>
        </div>
        <Link 
          to="/recipe/new" 
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          <Plus size={20} />
          Nový Recept
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input 
            type="text" 
            placeholder="Hledat recept..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          />
        </div>
        <div className="flex overflow-x-auto gap-2 pb-2 sm:pb-0 scrollbar-hide">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border",
                filterType === t 
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent" 
                  : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-orange-500"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-4">
            <ChefHat size={32} />
          </div>
          <h2 className="text-xl font-medium text-neutral-900 dark:text-white">Žádné recepty</h2>
          <p className="text-neutral-500 mt-2 max-w-md mx-auto">
            Zatím nemáte uloženy žádné recepty. Přidejte nový manuálně, nechte AI vygenerovat recept nebo naimportujte z fotky.
          </p>
          <Link 
            to="/recipe/new" 
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium mt-6 hover:bg-orange-700 transition-colors"
          >
            <Plus size={20} />
            Přidat první recept
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <Link 
              key={recipe.id} 
              to={`/recipe/${recipe.id}`}
              className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
                {recipe.image ? (
                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                    <ChefHat size={48} opacity={0.2} />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-md text-neutral-900 dark:text-neutral-100">
                  {recipe.type}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                  {recipe.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 mt-auto pt-4">
                  <span className="flex items-center gap-1.5"><Clock size={16} /> {recipe.prepTime} min</span>
                  <span className="flex items-center gap-1.5"><Zap size={16} /> {recipe.calories} kcal</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
