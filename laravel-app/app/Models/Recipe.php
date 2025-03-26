<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'category',
        'glass',
        'garnish',
        'mainAlcohol',
    ];
}
