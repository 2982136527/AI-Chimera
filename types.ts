
export interface CreatureStats {
  vitality: number;    // Was HP
  power: number;       // Was Attack
  armor: number;       // Was Defense
  magic: number;       // Was Sp. Attack
  spirit: number;      // Was Sp. Defense
  agility: number;     // Was Speed
}

export interface Ability {
  name: string;
  type: string;
  description: string;
}

export interface CreatureData {
  id: string; // Unique Blockchain/Hash ID
  name: string;
  englishName: string; // Changed from japaneseName to reduce JP/Anime specificity
  types: string[];
  species: string; // Was classification
  height: string;
  weight: string;
  stats: CreatureStats;
  trait: { // Was ability
    name: string;
    description: string;
  };
  skills: Ability[]; // Was moves
  archiveLog: string; // Was pokedexEntry
  evolutionChain: string[]; // e.g. ["Beast A", "Beast B", "Beast C"]
}

export interface SavedCreature {
  id: string;
  data: CreatureData;
  imageUrl: string | null;
  timestamp: number;
}

export enum GenerationStatus {
  IDLE,
  GENERATING_DATA,
  GENERATING_IMAGE,
  COMPLETE,
  ERROR
}