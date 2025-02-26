<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredients extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';

    protected $collection = 'ingredients';

    protected $fillable = [
        'name',
    ];
}
