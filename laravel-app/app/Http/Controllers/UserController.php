<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Scripts\ResponseApi;

class UserController extends Controller
{
    /**
     * Affiche une liste des utilisateurs avec pagination
     */
    public function index()
    {
        $users = User::all();

        return ResponseApi::sendApiResponse('success', 'Liste 
        des utilisateurs récupérée avec succès', ['users' => $users], 200);
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

        // User creation
        $user = User::create($validatedUser);

        // Response in json format
        return ResponseApi::sendApiResponse('success', 'Utilisateur créé avec succès !', ['user' => $user], 201);
    }

    /**
     * Affiche un utilisateur spécifique
     */
    public function show(string $id)
    {
        try {
            $user = User::where('_id', $id)->firstOrFail();
            return response()->json($user);
        } catch (\Exception $e) {
            return ResponseApi::sendApiResponse('fail', 'Utilisateur non trouvé', null,404);
        }
    }

    /**
     * Mise à jour des informations utilisateur
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validatedData = $this->create($request, $user->id);

        if (!empty($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        } else {
            unset($validatedData['password']);
        }

        return ResponseApi::sendApiResponse('success', 'Profil mis à jour avec succès.', $validatedData,0);
    }

    /**
     * Supprime un utilisateur
     */
    public function destroy(string $id)
    {
        if(!Auth::check()) {
            return ResponseApi::sendApiResponse('fail','Vous devez êtres connecté pour supprimer votre profil', null,404);
        }

        $user = User::findOrFail($id);

        if(Auth::id() !== $user->id  && Auth::user()->user_type !== 'admin') {
            return ResponseApi::sendApiResponse('fail','Vous ne pouvez pas supprimer un autre utilisateur', null,403);
        } else {
            $user->delete();
            Auth::logout();

            return ResponseApi::sendApiResponse('success','Profil supprimé avec succès, Vous allez être redirigé vers l\'accueil', null,0);
        }
    }

    /**
     * Bannir un utilisateur
     */
    public function ban(string $id)
    {
        if(!Auth::check()) {
            return ResponseApi::sendApiResponse('fail','Vous devez être connecté pour effectuer cette action.', null,401);
        }

        $admin = Auth::user();

        if($admin->user_type !== 'admin') {
            return ResponseApi::sendApiResponse('fail','Vous n\'avez pas les droits pour effectuer cette action.', null,403);
        } else {
            try {
                $user = User::findOrFail($id);
                $updated = $user->update(['banned' => true]);

                if(!$updated) {
                    return ResponseApi::sendApiResponse('fail','Une erreur est survenue lors du bannissement de l\'utilisateur.', null,500);
                } else {
                    return ResponseApi::sendApiResponse('success','Utilisateur banni avec succès.', null,0);
                }
            } catch (\Exception $e) {
                return ResponseApi::sendApiResponse('fail','Utilisateur non trouvé.', null,404);
            }
        }
    }
}
