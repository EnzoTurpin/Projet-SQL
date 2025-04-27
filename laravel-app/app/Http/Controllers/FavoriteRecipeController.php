<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Scripts\ResponseApi;
use App\Models\Recipe;

class FavoriteRecipeController extends Controller
{
    /**
     * Retourne la liste des recettes favorites de l'utilisateur connecté
     */
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return ResponseApi::sendApiResponse('fail', 'Utilisateur non authentifié.', null, 401);
        }

        $favorites = $user->favoriteRecipes()
            ->with(['ingredients:name', 'category:name', 'glass:name'])
            ->get();

        return ResponseApi::sendApiResponse('success', 'Recettes favorites récupérées.', $favorites, 200);
    }

    /**
     * Ajoute une recette aux favoris de l'utilisateur
     */
    public function store($recipeId)
    {
        $user = Auth::user();

        if (!$user) {
            return ResponseApi::sendApiResponse('fail', 'Utilisateur non authentifié.', null, 401);
        }

        // Vérifie que la recette existe
        $recipe = Recipe::find($recipeId);
        if (!$recipe) {
            return ResponseApi::sendApiResponse('fail', 'Recette introuvable.', null, 404);
        }

        // Ajout sans duplication
        if (!$user->favoriteRecipes()->where('_id', $recipeId)->exists()) {
            $user->favoriteRecipes()->attach($recipeId);
        }

        return ResponseApi::sendApiResponse('success', 'Recette ajoutée aux favoris.', null, 200);
    }

    /**
     * Retire une recette des favoris de l'utilisateur
     */
    public function destroy($recipeId)
    {
        $user = Auth::user();

        if (!$user) {
            return ResponseApi::sendApiResponse('fail', 'Utilisateur non authentifié.', null, 401);
        }

        $user->favoriteRecipes()->detach($recipeId);

        return ResponseApi::sendApiResponse('success', 'Recette retirée des favoris.', null, 200);
    }
} 