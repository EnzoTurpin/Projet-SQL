<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ingredient;

class IngredientSeeder extends Seeder
{
    public function run(): void
    {
        Ingredient::create([
            'name' => 'Citron',
            'quantity' => '2 morceaux'
        ]);

        Ingredient::create([
            'name' => 'Menthe',
            'quantity' => '5 feuilles'
        ]);
    }
}
