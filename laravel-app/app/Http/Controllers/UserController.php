<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Affiche une liste des utilisateurs avec pagination
     */
    public function index()
    {
        $users = User::paginate(15);

        return response()->json($users);
    }

    /**
     * Valide les données utilisateur
     */
    private function create(Request $request, $userId = null)
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($userId)
            ],
            'password' => $userId ? 'nullable|string|min:6|confirmed' : 'required|string|min:6|confirmed',
        ], [
            'name.required' => 'Le champ nom est obligatoire.',
            'email.required' => 'Le champ email est obligatoire.',
            'email.email' => 'L\'adresse email doit être valide.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.'
        ]);
    }

    /**
     * Création d'un utilisateur
     */
    public function store(Request $request)
    {
        $validatedUser = $this->create($request);

        // Hachage du mot de passe
        $validatedUser['password'] = Hash::make($validatedUser['password']);

        // Création de l'utilisateur
        $user = User::create($validatedUser);

        return response()->json([
            'message' => 'Utilisateur créé avec succès !',
            'user' => $user
        ], 201);
    }

    /**
     * Affiche un utilisateur spécifique
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Mise à jour des informations utilisateur
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validatedData = $this->create($request, $user->id);

        // Mise à jour des champs sauf mot de passe
        if ($request->filled('password')) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        } else {
            unset($validatedData['password']);
        }

        $user->update($validatedData);

        return response()->json(['message' => 'Profil mis à jour avec succès.']);
    }

    /**
     * Supprime un utilisateur
     */
    public function destroy(string $id)
    {
        if(!Auth::check()) {
            return response()->json(['message' => 'Vous devez être connecté pour effectuer voir un profil.'], 401);
        }

        $user = User::findOrFail($id);

        if(Auth::id() !== $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer un autre utilisateur.'], 403);
        } else {
            $user->delete();
            Auth::logout();

            return response()->json(['message' => 'Profil supprimé avec succès. Vous êtes désormais déconnecté.']);
        }
    }

    /**
     * Bannir un utilisateur
     */
    public function ban(string $id)
    {
        $user = User::findOrFail($id);
        $user->banned = true;
        $user->save();

        return response()->json(['message' => 'Utilisateur banni avec succès.']);
    }
}
