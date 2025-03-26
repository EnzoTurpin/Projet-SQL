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
        ]);

        Ingredient::create([
            'name' => 'Menthe',
        ]);
    }
}
