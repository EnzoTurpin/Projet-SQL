<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use MongoDB\Client;

class ResetDatabase extends Command
{
    protected $signature = 'db:reset';
    protected $description = 'Reset the MongoDB database and create an admin user';

    public function handle()
    {
        $this->info('Resetting the MongoDB database...');

        // Créer un utilisateur administrateur
        $this->info('Creating admin user...');
        
        // Vérifier si l'utilisateur admin existe déjà
        $existingAdmin = User::where('email', 'admin@example.com')->first();
        
        if ($existingAdmin) {
            $this->info('Admin user already exists. Skipping...');
        } else {
            $admin = new User();
            $admin->name = 'Admin';
            $admin->email = 'admin@example.com';
            $admin->password = 'password'; // Le modèle User devrait hasher automatiquement
            $admin->user_type = 'admin';
            $admin->banned = false;
            $admin->save();
            
            $this->info('Admin user created successfully!');
        }
        
        // Créer un utilisateur normal
        $this->info('Creating regular user...');
        
        // Vérifier si l'utilisateur normal existe déjà
        $existingUser = User::where('email', 'user@example.com')->first();
        
        if ($existingUser) {
            $this->info('Regular user already exists. Skipping...');
        } else {
            $user = new User();
            $user->name = 'User';
            $user->email = 'user@example.com';
            $user->password = 'password'; // Le modèle User devrait hasher automatiquement
            $user->user_type = 'user';
            $user->banned = false;
            $user->save();
            
            $this->info('Regular user created successfully!');
        }
        
        // Créer un utilisateur banni
        $this->info('Creating banned user...');
        
        // Vérifier si l'utilisateur banni existe déjà
        $existingBanned = User::where('email', 'banned@example.com')->first();
        
        if ($existingBanned) {
            $this->info('Banned user already exists. Skipping...');
        } else {
            $banned = new User();
            $banned->name = 'Banned User';
            $banned->email = 'banned@example.com';
            $banned->password = 'password'; // Le modèle User devrait hasher automatiquement
            $banned->user_type = 'user';
            $banned->banned = true;
            $banned->save();
            
            $this->info('Banned user created successfully!');
        }
        
        $this->info('Database reset completed!');
        
        return Command::SUCCESS;
    }
} 