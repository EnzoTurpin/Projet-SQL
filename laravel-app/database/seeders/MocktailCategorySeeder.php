<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class MocktailCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Création de la catégorie Mocktail
        Category::firstOrCreate(['name' => 'Mocktail']);
        
        // Création de la catégorie Cocktail également pour s'assurer qu'elle existe
        Category::firstOrCreate(['name' => 'Cocktail']);
        
        $this->command->info('Catégories Mocktail et Cocktail créées avec succès!');
    }
}
