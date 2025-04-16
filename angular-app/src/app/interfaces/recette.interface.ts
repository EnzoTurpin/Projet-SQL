export interface Recette {
  id: string;
  name: string;
  description: string;
  image: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  preparationTime: string;
  isFavorite: boolean;
  ingredients?: Ingredient[];
  instructions?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
}
