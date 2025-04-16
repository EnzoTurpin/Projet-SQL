export interface Recette {
  id: string;
  name: string;
  description: string;
  image: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  preparationTime: string;
  ingredients?: any[];
  instructions?: string[] | string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
}
