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
        'description',
        'image',
        'difficulty',
        'preparationTime',
        'ingredients',  
        'instructions',
        'glassType',     // Type de verre
        'alcoholLevel',  // Niveau d'alcool en %
        'garnish',       // Garniture
        'category_id',   // ID de la catégorie
        'isMocktail'     // Si c'est un mocktail (sans alcool)
    ];

    protected $appends = [
        // Ajoute automatiquement l'URL complète dans le champ image
        // sans toucher à la valeur stockée en base
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

    // Relation avec les utilisateurs qui ont mis la recette en favoris
    public function favoredByUsers()
    {
        return $this->belongsToMany(User::class, 'favorite_recipes', 'recipe_id', 'user_id');
    }

    // Accessor pour transformer le chemin relatif de l'image en URL complète
    public function getImageAttribute($value)
    {
        // Si le champ est vide, on renvoie null
        if (!$value) {
            return $value;
        }

        // Si c'est déjà une URL, on la renvoie telle quelle
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        // On construit l'URL complète via le helper url()
        return url(ltrim($value, '/'));
    }
}

