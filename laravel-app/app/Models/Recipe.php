<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Recipe extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'recipes';

    protected $fillable = [
        'name',
        'ingredient_id',
        'quantity',
        'instructions',
        'category_id',
        'glass_id',
        'garnish',
        'mainAlcohol',
    ];

    // Relation avec les ingrédients
    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class, null, 'ingredient_id', '_id');
    }

    // Relation avec la catégorie
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', '_id');
    }

    // Relation avec le verre
    public function glass()
    {
        return $this->belongsTo(Glass::class, 'glass_id', '_id');
    }
}

