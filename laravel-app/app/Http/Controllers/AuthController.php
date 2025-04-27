<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Scripts\ResponseApi;

class AuthController extends Controller
{
    /**
     * Connexion
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            return ResponseApi::sendApiResponse('fail', 'Identifiants invalides.', null, 401);
        }

        // Regenerate session to prevent fixation and ensure cookie is set
        $request->session()->regenerate();

        $user = Auth::user();

        return ResponseApi::sendApiResponse('success', 'Connexion réussie.', ['user' => $user], 200);
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        // Déconnexion côté session (guard "web")
        Auth::guard('web')->logout();

        // On invalide la session existante et on régénère le jeton CSRF
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ResponseApi::sendApiResponse('success', 'Déconnexion réussie.', null, 200);
    }

    /**
     * Utilisateur connecté
     */
    public function user(Request $request)
    {
        return ResponseApi::sendApiResponse('success', 'Utilisateur connecté récupéré.', ['user' => $request->user()], 200);
    }
}
