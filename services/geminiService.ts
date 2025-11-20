
import { GoogleGenAI, Type } from "@google/genai";
import { CreatureData } from "../types";
import { ART_STYLES } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in process.env");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper function to retry API calls on failure
const callWithRetry = async <T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`API call failed, retrying... (${retries} attempts left). Error:`, error);
    await new Promise(resolve => setTimeout(resolve, delay));
    return callWithRetry(fn, retries - 1, delay * 1.5);
  }
};

export const optimizePrompt = async (input: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getClient();
    const prompt = `You are a creative assistant for a Fantasy Creature generator. 
    Rewrite the following short user description into a detailed, vivid visual description suitable for monster/creature design. 
    Keep it under 50 words. Focus on appearance, element, and mood.
    Input: "${input}"
    Language: Chinese (Simplified)`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || input;
  });
};

export const generateRandomPrompt = async (): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getClient();
    const prompt = `Generate a short, highly creative, and vivid description for a unique fantasy creature or monster.
    Focus on its appearance, element, and a unique trait.
    Avoid generic tropes. Be imaginative.
    Keep it under 30 words.
    Language: Simplified Chinese (简体中文).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 1.2, // High creativity
      }
    });

    return response.text || "一只在雷暴中诞生的晶体巨龙，背部生长着能够引导闪电的黑曜石尖刺";
  });
};

const CREATURE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Creature Name in Simplified Chinese (e.g. 炎魔龙)" },
    englishName: { type: Type.STRING, description: "Creature English/Latin Name" },
    types: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "List of elemental types in Chinese, e.g. ['炎', '龙']" 
    },
    species: { type: Type.STRING, description: "Species classification in Chinese, e.g. '古代龙种'" },
    height: { type: Type.STRING, description: "Height in m" },
    weight: { type: Type.STRING, description: "Weight in kg" },
    stats: {
      type: Type.OBJECT,
      properties: {
        vitality: { type: Type.NUMBER },
        power: { type: Type.NUMBER },
        armor: { type: Type.NUMBER },
        magic: { type: Type.NUMBER },
        spirit: { type: Type.NUMBER },
        agility: { type: Type.NUMBER },
      },
      required: ["vitality", "power", "armor", "magic", "spirit", "agility"]
    },
    trait: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Trait/Passive Ability name in Chinese" },
        description: { type: Type.STRING, description: "Trait description in Chinese" }
      },
      required: ["name", "description"]
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Skill name in Chinese" },
          type: { type: Type.STRING, description: "Skill elemental type in Chinese" },
          description: { type: Type.STRING, description: "Skill description in Chinese" }
        },
        required: ["name", "type", "description"]
      }
    },
    archiveLog: { type: Type.STRING, description: "A lore entry for the creature archives in Simplified Chinese" },
    evolutionChain: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Full evolution/ascension line names in Chinese including this one"
    }
  },
  required: ["name", "englishName", "types", "species", "height", "weight", "stats", "trait", "skills", "archiveLog", "evolutionChain"]
};

export const generatePokemonData = async (prompt: string, customName?: string): Promise<CreatureData> => {
  return callWithRetry(async () => {
    const ai = getClient();
    
    let fullPrompt = `Design a unique Fantasy Creature/Monster (NOT a Pokémon) based on: "${prompt}".
    IMPORTANT: All text fields (name, types, species, archiveLog, trait, skills, etc.) MUST be in Simplified Chinese (简体中文).
    'englishName' should be a cool English or Latin name.
    Use generic RPG elemental types translated to Chinese (e.g. 'Fire' -> '炎', 'Dragon' -> '龙', 'Light' -> '光').
    Stats should be balanced for an RPG.`;
    
    if (customName) {
      fullPrompt += ` The Creature's name MUST be "${customName}".`;
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: CREATURE_SCHEMA,
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Validation to prevent crashes
    if (!data.name || !data.stats || !data.types) {
      throw new Error("Invalid data structure returned from AI");
    }

    // Generate a simulated Blockchain ID
    const uniqueId = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

    return { ...data, id: uniqueId };
  });
};

export const generateEvolutionData = async (currentData: CreatureData, isUltimate: boolean): Promise<CreatureData> => {
  return callWithRetry(async () => {
    const ai = getClient();
    
    let prompt = "";
    if (isUltimate) {
      prompt = `Generate an Awakened/Ascended form for the creature ${currentData.name}. 
      It should be god-like, extremely powerful, and have a design that exceeds the original limits.
      Stats should be significantly boosted (Total around 650-750).
      Name should usually start with "真·" (True) or "觉醒·" (Awakened) or "终焉·" (Final), but keep it consistent with ${currentData.name}.
      Current Chain: ${JSON.stringify(currentData.evolutionChain)}.
      Add the new name to the end of the evolution chain.
      IMPORTANT: All text output MUST be in Simplified Chinese (简体中文).`;
    } else {
      prompt = `Generate the next evolutionary/metamorphic stage for the creature ${currentData.name}.
      It should be stronger, larger, and more mature.
      Current Chain: ${JSON.stringify(currentData.evolutionChain)}.
      Ensure the evolution chain array includes the previous forms and the new form.
      IMPORTANT: All text output MUST be in Simplified Chinese (简体中文).`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: CREATURE_SCHEMA,
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Validation to prevent crashes on Ultimate forms which sometimes miss stats
    if (!data.name || !data.stats || !data.evolutionChain) {
      throw new Error("Invalid evolution data returned from AI");
    }

    const uniqueId = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    return { ...data, id: uniqueId };
  });
};

export const generatePreEvolutionData = async (currentData: CreatureData, targetName: string): Promise<CreatureData> => {
  return callWithRetry(async () => {
    const ai = getClient();
    
    const prompt = `Generate the pre-evolution/younger form for the creature ${currentData.name}.
    The name of this younger form MUST be "${targetName}".
    It should be smaller, cuter, or weaker (Initial form).
    Stats should be lower (Total around 250-350).
    Current Chain: ${JSON.stringify(currentData.evolutionChain)}.
    Ensure the evolution chain remains exactly the same.
    IMPORTANT: All text output MUST be in Simplified Chinese (简体中文).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: CREATURE_SCHEMA,
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    if (!data.name || !data.stats || !data.evolutionChain) {
      throw new Error("Invalid pre-evolution data returned from AI");
    }

    const uniqueId = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    return { ...data, id: uniqueId };
  });
};

export const generatePokemonImage = async (prompt: string, data: CreatureData, styleId: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getClient();
    
    const styleConfig = ART_STYLES.find(s => s.id === styleId) || ART_STYLES[0];
    
    const imagePrompt = `
      Full body illustration of a Fantasy Creature/Monster named ${data.name}.
      Appearance: ${prompt}.
      Elements: ${data.types.join(', ')}.
      Style: ${styleConfig.prompt}.
      IMPORTANT: Pure solid white background (Hex #FFFFFF). No shadows on the background.
      High contrast, masterpiece, best quality, sharp focus.
      NO TEXT, NO LABELS, NO UI elements in the image.
      Make it look like professional game concept art or trading card art.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }]
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part && part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    
    throw new Error("Failed to generate image");
  });
};
