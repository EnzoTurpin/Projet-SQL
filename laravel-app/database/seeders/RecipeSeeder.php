<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Recipe;
use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Glass;
use Illuminate\Support\Str;

class RecipeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Assurer qu'il y a des catégories, des verres et des ingrédients dans la base avant de créer des recettes
        $category = Category::firstOrCreate(['name' => 'Cocktail']);
        $glass = Glass::firstOrCreate(['name' => 'Verre à cocktail']);
        $garnish = Ingredient::firstOrCreate(['name' => 'Citron vert']);

        // Créer des ingrédients
        $ingredient1 = Ingredient::firstOrCreate(['name' => 'Rhum']);
        $ingredient2 = Ingredient::firstOrCreate(['name' => 'Menthe']);
        $ingredient3 = Ingredient::firstOrCreate(['name' => 'Sucre']);

        // Exemple de recette
        Recipe::create([
            'name' => 'Mojito',
            'ingredients' => [
                ['ingredient_id' => $ingredient1->name, 'quantity' => '50 ml'],
                ['ingredient_id' => $ingredient2->name, 'quantity' => '10 feuilles'],
                ['ingredient_id' => $ingredient3->name, 'quantity' => '2 cuillères à café'],
            ],
            'quantity' => 1,
            'instructions' => 'Mélangez tous les ingrédients dans un verre avec de la glace.',
            'category_id' => $category->name,
            'glass_id' => $glass->_name,
            'garnish' => $garnish->name,
            'mainAlcohol' => 'Rhum',
        ]);
    }
}
