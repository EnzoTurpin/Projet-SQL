<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Notifications\Notifiable;

class User extends Model implements AuthenticatableContract
{
    use Authenticatable;
    use Notifiable;
    use HasFactory;

    protected $connection = 'mongodb';

    protected $collection = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'user_type',
        'banned',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'banned' => 'boolean',
        ];
    }

    // Hashes the password before saving it to the database
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Hash::make($value);
    }

    protected static function boot() {
        // Calls the parent boot function
        parent::boot();

        // Sets the default user type to 'user'
        static::creating(function ($user) {
            if (!isset($user->user_type)) {
                $user->user_type = 'user';
            }

            // Définir la valeur par défaut du champ "banned" à false si elle n'est pas définie
            if (!isset($user->banned)) {
                $user->banned = false;
            }
        });
    }

    // Relation avec les recettes favorites
    public function favoriteRecipes()
    {
        return $this->belongsToMany(Recipe::class, 'favorite_recipes', 'user_id', 'recipe_id');
    }
}
