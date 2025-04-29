<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class UnbanRequest extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';

    protected $collection = 'unban_requests';

    protected $fillable = [
        'user_id',
        'user_email',
        'user_name',
        'reason',
        'status'
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // Définir la relation avec l'utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 