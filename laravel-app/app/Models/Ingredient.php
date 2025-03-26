<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Ingredient extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';

    protected $collection = 'ingredients';

    protected $fillable = [
        'name',
        'quantity',
    ];

    public $timestamps = false;
}
