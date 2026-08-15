import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json({ limit: '50mb' }));

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    equipment: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of equipment, tools or appliances needed (e.g. Trouba, Mixér, Pánev)"
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          unit: { type: Type.STRING }
        },
        required: ['name', 'amount', 'unit']
      }
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    prepTime: { type: Type.NUMBER },
    difficulty: { type: Type.STRING, enum: ['Snadné', 'Střední', 'Těžké'] },
    calories: { type: Type.NUMBER },
    macros: {
      type: Type.OBJECT,
      properties: {
        protein: { type: Type.NUMBER },
        carbs: { type: Type.NUMBER },
        fats: { type: Type.NUMBER }
      },
      required: ['protein', 'carbs', 'fats']
    },
    type: { type: Type.STRING }
  },
  required: ['title', 'description', 'ingredients', 'instructions', 'prepTime', 'difficulty', 'calories', 'macros', 'type']
};

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context, history } = req.body;
    let systemInstruction = "Jsi špičkový šéfkuchař Michelinovy úrovně. Odpovídáš česky. Poskytuješ rady ohledně vaření, postupů, náhrad surovin a vylepšování chutí. Tvé odpovědi jsou stručné, profesionální, ale přátelské.";
    
    if (context) {
      systemInstruction += `\n\nKontext aktuálního receptu: ${JSON.stringify(context)}`;
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    if (history && history.length > 0) {
      for (const msg of history) {
        await chat.sendMessage({ message: msg.text });
      }
    }

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to chat with AI' });
  }
});

app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { ingredients, preferences } = req.body;
    const prompt = `Vytvoř recept z následujících surovin: ${ingredients.join(', ')}. 
    Dietní preference: ${preferences || 'Žádné'}.
    Vrať výsledek v přesném JSON formátu. Jazyk musí být čeština. Odhadni nutriční hodnoty a kalorie na 1 porci. Vymysli si smysluplné množství surovin pro 2 porce.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: recipeSchema,
        temperature: 0.5,
      }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

app.post('/api/parse-recipe', async (req, res) => {
  try {
    const { text, imageBase64 } = req.body;
    let contents = [];
    if (imageBase64) {
       const base64String = imageBase64.split(',')[1] || imageBase64;
       contents.push({
         inlineData: {
           data: base64String,
           mimeType: 'image/jpeg'
         }
       });
       contents.push("Extrahuj recept z tohoto obrázku a převeď ho do požadovaného JSON formátu v češtině. Pokud chybí nutriční hodnoty, odhadni je.");
    } else if (text) {
       contents.push(`Analyzuj tento text receptu a převeď ho do strukturovaného JSON formátu v češtině. Pokud chybí nutriční hodnoty, odhadni je:\n\n${text}`);
    } else {
       return res.status(400).json({ error: 'No input provided' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: recipeSchema,
      }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error('Error parsing recipe:', error);
    res.status(500).json({ error: 'Failed to parse recipe' });
  }
});

app.post('/api/healthier-alternative', async (req, res) => {
  try {
    const { recipe, preferences } = req.body;
    const prompt = `Navrhni zdravější alternativy surovin pro tento recept na základě těchto preferencí: ${preferences}.
    Recept: ${JSON.stringify(recipe)}
    Vrať odpověď v češtině, vysvětli proč je náhrada lepší a jak ovlivní chuť nebo postup.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.6,
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error('Error suggesting alternatives:', error);
    res.status(500).json({ error: 'Failed to suggest alternatives' });
  }
});

export default app;
