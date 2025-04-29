<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Garnish extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';

    protected $collection = 'garnishes';

    protected $fillable = [
        'name',
    ];

    public $timestamps = false;
} 