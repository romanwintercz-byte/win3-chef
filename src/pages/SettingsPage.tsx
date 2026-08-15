import { useState } from 'react';
import { useAppStore, DietaryPreference } from '../store';
import { Download, Upload, Moon, Sun, Monitor, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { preferences, updatePreferences, exportData, importData } = useAppStore();
  const [importText, setImportText] = useState('');

  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportContent, setPendingImportContent] = useState<string | null>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `win3-chef-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPendingImportContent(content);
        setShowImportConfirm(true);
      };
      reader.readAsText(file);
    }
  };

  const confirmImport = () => {
    if (pendingImportContent) {
      importData(pendingImportContent);
    }
    setShowImportConfirm(false);
    setPendingImportContent(null);
  };

  const cancelImport = () => {
    setShowImportConfirm(false);
    setPendingImportContent(null);
  };

  const dietOptions: DietaryPreference[] = ['Vše', 'Vegetarián', 'Vegan', 'Bez lepku', 'Low Carb'];

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Nastavení</h1>
        
        <div className="space-y-6 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <h2 className="text-xl font-bold">Dietní Preference</h2>
          <p className="text-neutral-500 text-sm -mt-4 mb-4">Tyto preference používá AI při generování receptů.</p>
          
          <div className="flex flex-wrap gap-3">
            {dietOptions.map(diet => (
              <button
                key={diet}
                onClick={() => updatePreferences({ diet })}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors border ${
                  preferences.diet === diet 
                    ? 'bg-orange-600 text-white border-orange-600' 
                    : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-orange-500'
                }`}
              >
                {diet}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <h2 className="text-xl font-bold">Záloha Dat</h2>
        <p className="text-neutral-500 text-sm -mt-4 mb-4">
          Aplikace funguje offline. Vaše recepty se ukládají pouze v tomto prohlížeči. Pro přesun do jiného zařízení si data vyexportujte.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white px-4 py-3 rounded-xl font-medium transition-colors"
          >
            <Download size={20} /> Exportovat (JSON)
          </button>
          
          <label className="flex-1 flex items-center justify-center gap-2 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer">
            <Upload size={20} /> Importovat (JSON)
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
        
        {showImportConfirm && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-900/30 text-sm font-medium">
            <p className="font-bold mb-2 flex items-center gap-2"><AlertTriangle size={18} /> Opravdu importovat?</p>
            <p className="mb-4">Tato akce nenávratně smaže všechna vaše stávající data a nahradí je daty ze souboru.</p>
            <div className="flex gap-3">
              <button onClick={confirmImport} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">Ano, přepsat data</button>
              <button onClick={cancelImport} className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-4 py-2 rounded-lg transition-colors">Zrušit</button>
            </div>
          </div>
        )}
        
        {!showImportConfirm && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-500 rounded-xl flex gap-3 text-sm font-medium">
            <AlertTriangle className="shrink-0" size={20} />
            <p>Importování přepíše všechna vaše současná data. Před importem doporučujeme provést zálohu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
