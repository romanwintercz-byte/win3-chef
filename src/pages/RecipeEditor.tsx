import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-form'; // Actually, using react-hook-form
import { useForm as useRHForm, useFieldArray as useRHFieldArray } from 'react-hook-form';
import { useAppStore, Recipe } from '../store';
import { parseRecipe } from '../api';
import { Camera, FileText, Loader2, Save, ArrowLeft, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

export default function RecipeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, addRecipe, updateRecipe } = useAppStore();
  const existingRecipe = id ? recipes.find(r => r.id === id) : null;

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, control, handleSubmit, setValue, watch, reset } = useRHForm<Recipe>({
    defaultValues: existingRecipe || {
      title: '',
      description: '',
      equipment: [],
      ingredients: [{ name: '', amount: '', unit: '' }],
      instructions: [''],
      prepTime: 30,
      difficulty: 'Snadné',
      calories: 0,
      macros: { protein: 0, carbs: 0, fats: 0 },
      type: 'Oběd',
      tags: [],
    }
  });

  const { fields: eqFields, append: appendEq, remove: removeEq } = useRHFieldArray({ control, name: "equipment" as never });
  const { fields: ingFields, append: appendIng, remove: removeIng } = useRHFieldArray({ control, name: "ingredients" });
  const { fields: instFields, append: appendInst, remove: removeInst } = useRHFieldArray({ control, name: "instructions" as never });

  const watchImage = watch('image');
  const watchGallery = watch('gallery') || [];

  const handleSave = (data: any) => {
    if (existingRecipe) {
      updateRecipe(existingRecipe.id, data);
    } else {
      addRecipe(data);
    }
    navigate('/');
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const compressedBase64 = await compressImage(file);
        newImages.push(compressedBase64);
      } catch (error) {
        console.error("Failed to compress image:", error);
      }
    }

    if (newImages.length > 0) {
      setValue('gallery', [...(watch('gallery') || []), ...newImages]);
      if (!watch('image')) {
        setValue('image', newImages[0]);
      }
    }
    
    // Clear input so the same files can be selected again
    e.target.value = '';
  };

  const handleAIImportImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoadingAI(true);
    setAiError('');
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const generatedRecipe = await parseRecipe({ imageBase64: base64 });
        reset({ ...generatedRecipe, image: base64 });
      } catch (err) {
        setAiError('Nepodařilo se extrahovat recept z obrázku.');
      } finally {
        setIsLoadingAI(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const [importText, setImportText] = useState('');
  const handleAIImportText = async () => {
    if (!importText) return;
    setIsLoadingAI(true);
    setAiError('');
    try {
      const generatedRecipe = await parseRecipe({ text: importText });
      reset(generatedRecipe);
      setImportText('');
    } catch (err) {
      setAiError('Nepodařilo se extrahovat recept z textu.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <ArrowLeft size={20} />
          Zpět
        </button>
        <h1 className="text-2xl font-bold tracking-tight">
          {existingRecipe ? 'Upravit Recept' : 'Nový Recept'}
        </h1>
        <div className="w-20"></div>
      </div>

      {!existingRecipe && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-4 flex items-center gap-2">
            <Bot size={20} /> AI Import Receptu
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <textarea 
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Vložte text receptu z webu nebo zpráv..."
                className="w-full p-3 rounded-xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-orange-500 min-h-[100px] resize-none"
              />
              <button 
                onClick={handleAIImportText}
                disabled={isLoadingAI || !importText}
                className="w-full flex justify-center items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {isLoadingAI ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                Importovat z textu
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-xl p-6 bg-white dark:bg-neutral-900 text-center relative overflow-hidden">
              {isLoadingAI ? (
                <Loader2 className="animate-spin text-orange-500" size={32} />
              ) : (
                <>
                  <Camera size={32} className="text-orange-400 mb-2" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Vyfoťte recept z kuchařky</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAIImportImage}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>
          {aiError && <p className="text-red-500 mt-4 text-sm font-medium">{aiError}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit(handleSave)} className="space-y-8 bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Název receptu</label>
            <input {...register('title', { required: true })} className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:ring-2 focus:ring-orange-500" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Popis</label>
            <textarea {...register('description')} className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:ring-2 focus:ring-orange-500 min-h-[80px]" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Druh jídla</label>
              <select {...register('type')} className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:ring-2 focus:ring-orange-500">
                <option value="Snídaně">Snídaně</option>
                <option value="Oběd">Oběd</option>
                <option value="Večeře">Večeře</option>
                <option value="Svačina">Svačina</option>
                <option value="Dezert">Dezert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Čas (min)</label>
              <input type="number" {...register('prepTime')} className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Obtížnost</label>
              <select {...register('difficulty')} className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:ring-2 focus:ring-orange-500">
                <option value="Snadné">Snadné</option>
                <option value="Střední">Střední</option>
                <option value="Těžké">Těžké</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Kalorie</label>
              <input type="number" {...register('calories')} className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-500">Bílkoviny (g)</label>
              <input type="number" {...register('macros.protein')} className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-500">Sacharidy (g)</label>
              <input type="number" {...register('macros.carbs')} className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-500">Tuky (g)</label>
              <input type="number" {...register('macros.fats')} className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Fotografie jídla</label>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-4">
                {watchImage && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-800 group">
                    <img src={watchImage} alt="Hlavní" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-md">Hlavní</div>
                    <button type="button" onClick={() => setValue('image', undefined)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Trash2 size={20} />
                    </button>
                  </div>
                )}
                {watchGallery.map((img, idx) => {
                  if (img === watchImage) return null; // Don't duplicate main image
                  return (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-800 group">
                      <img src={img} alt={`Další foto ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-md hidden group-hover:block cursor-pointer" onClick={() => setValue('image', img)}>Nastavit hlavní</div>
                      <button type="button" onClick={() => {
                        const newGallery = [...watchGallery];
                        newGallery.splice(idx, 1);
                        setValue('gallery', newGallery);
                      }} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" id="file-upload" />
                <input type="file" accept="image/*" capture="environment" onChange={handleGalleryUpload} className="hidden" id="camera-upload" />
                
                <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-medium">
                  <ImageIcon size={18} /> Nahrát foto
                </label>
                <label htmlFor="camera-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors font-medium">
                  <Camera size={18} /> Vyfotit z mobilu
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Video URL (YouTube/TikTok)</label>
            <input {...register('videoUrl')} placeholder="https://..." className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Vybavení a zařízení</h3>
            <button type="button" onClick={() => appendEq('')} className="text-sm font-medium text-orange-600 hover:underline flex items-center gap-1">
              <Plus size={16} /> Přidat zařízení
            </button>
          </div>
          <div className="space-y-3">
            {eqFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input {...register(`equipment.${index}` as never)} placeholder="Např. Trouba, mixér, pánev wok..." className="flex-1 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950" />
                <button type="button" onClick={() => removeEq(index)} className="p-2.5 text-neutral-400 hover:text-red-500 transition-colors h-fit">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Suroviny</h3>
            <button type="button" onClick={() => appendIng({ name: '', amount: '', unit: '' })} className="text-sm font-medium text-orange-600 hover:underline flex items-center gap-1">
              <Plus size={16} /> Přidat
            </button>
          </div>
          <div className="space-y-3">
            {ingFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input {...register(`ingredients.${index}.name`)} placeholder="Název (např. Mouka)" className="flex-[2] p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950" />
                <input {...register(`ingredients.${index}.amount`)} placeholder="Množství" className="flex-1 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950" />
                <input {...register(`ingredients.${index}.unit`)} placeholder="Jednotka (g, ks)" className="flex-1 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950" />
                <button type="button" onClick={() => removeIng(index)} className="p-2.5 text-neutral-400 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Postup</h3>
            <button type="button" onClick={() => appendInst('')} className="text-sm font-medium text-orange-600 hover:underline flex items-center gap-1">
              <Plus size={16} /> Přidat krok
            </button>
          </div>
          <div className="space-y-3">
            {instFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <div className="w-8 flex justify-center pt-3 font-medium text-neutral-400">{index + 1}.</div>
                <textarea {...register(`instructions.${index}` as never)} className="flex-1 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 min-h-[60px]" />
                <button type="button" onClick={() => removeInst(index)} className="p-2.5 text-neutral-400 hover:text-red-500 transition-colors h-fit mt-2">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-4 rounded-xl font-bold text-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex justify-center items-center gap-2">
            <Save size={20} />
            Uložit Recept
          </button>
        </div>
      </form>
    </div>
  );
}

import { Bot } from 'lucide-react';
