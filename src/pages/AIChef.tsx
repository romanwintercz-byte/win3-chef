import { useState } from 'react';
import { useAppStore } from '../store';
import { generateRecipe } from '../api';
import { Send, Bot, ChefHat, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AIChef() {
  const { preferences, addRecipe } = useAppStore();
  const navigate = useNavigate();
  
  const [ingredients, setIngredients] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const ings = ingredients.split(',').map(i => i.trim()).filter(Boolean);
      const generatedRecipe = await generateRecipe(ings, preferences.diet);
      addRecipe(generatedRecipe);
      navigate('/');
    } catch (err) {
      setError('Nepodařilo se vygenerovat recept. Zkuste to prosím znovu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 h-full flex flex-col pt-4">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Bot size={40} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Osobní AI Šéfkuchař</h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Napište, co máte v lednici a já vám vymyslím skvělý recept na míru.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 dark:border-neutral-800 flex-1">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <ChefHat size={18} className="text-orange-500"/>
              Co máte k dispozici?
            </label>
            <textarea 
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Např: kuřecí maso, rýže, mrkev, cibule, smetana..."
              className="w-full p-4 rounded-2xl border-2 border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-orange-500 focus:ring-0 min-h-[150px] resize-none text-lg transition-colors"
            />
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl flex items-start gap-3">
            <Sparkles className="text-orange-500 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-orange-800 dark:text-orange-300">
              Generování zohlední vaše dietní preference (<strong>{preferences.diet}</strong>). Můžete je změnit v Nastavení.
            </p>
          </div>

          {error && <p className="text-red-500 font-medium text-center">{error}</p>}

          <button 
            onClick={handleGenerate}
            disabled={isLoading || !ingredients.trim()}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isLoading ? (
              <><Loader2 className="animate-spin" size={24} /> Vymýšlím recept...</>
            ) : (
              <><Send size={20} /> Vytvořit Recept</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
