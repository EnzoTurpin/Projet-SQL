export interface Recette {
  id: string;
  _id?: string; // ID MongoDB
  name: string;
  description: string;
  image: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  preparationTime: string;
  ingredients?: any[];
  instructions?: string[] | string;
  glassType?: string;
  alcoholLevel?: string;
  mainAlcohol?: string;
  garnish?: string;
  category_id?: string;
  isMocktail?: boolean;
  category?: string; // ✅ Ajouté
  glass?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
}
