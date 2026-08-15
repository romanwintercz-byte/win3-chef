import { Recipe } from './store';

export async function chatWithChef(message: string, context?: Recipe, history?: {text: string}[]) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context, history }),
  });
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

export async function generateRecipe(ingredients: string[], preferences?: string) {
  const res = await fetch('/api/generate-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, preferences }),
  });
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

export async function parseRecipe(data: { text?: string; imageBase64?: string }) {
  const res = await fetch('/api/parse-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

export async function suggestAlternatives(recipe: Recipe, preferences: string) {
  const res = await fetch('/api/healthier-alternative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipe, preferences }),
  });
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}
