<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Scripts\ResponseApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class IngredientController extends Controller
{
    public function index() {
        $ingredients = Ingredient::all();
        return response()->json($ingredients);
    }

    protected function create(Request $request) {
        // Validation des données de l'ingrédient
        return Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'quantity' => 'string',
        ], [
            'name.required' => 'Le champ nom est obligatoire.',
            'quantity.string' => 'La quantité doit être une chaîne de caractères.',
        ]);
    }

    public function store(Request $request) {
        $validator = $this->create($request);

        // Si la validation échoue, on renvoie les erreurs
        if ($validator->fails()) {
            return ResponseApi::sendApiResponse('fail', 'Certains champs sont manquants ou invalides.', $validator->errors(), 422);
        }

        $ingredient = Ingredient::create($validator->validated());

        return ResponseApi::sendApiResponse('success', 'Ingrédient créé avec succès !', $ingredient, 0);
    }

    public function show($id) {
        try {
            $ingredient = Ingredient::where('_id', $id)->firstOrFail();
            return response()->json($ingredient);
        } catch (\Exception $e) {
            return ResponseApi::sendApiResponse('fail', 'Ingrédient non trouvé', null, 404);
        }
    }

    public function update(Request $request, $id) {
        $user = Auth::user();

        // Vérification de la connexion de l'utilisateur
        if (!$user) {
            return ResponseApi::sendApiResponse('fail', 'Vous devez être connecté pour effectuer cette action.', [], 401);
        }

        $ingredient = Ingredient::findOrFail($id);
        $validator = $this->create($request);
    
        // Si la validation échoue, on renvoie les erreurs
        if ($validator->fails()) {
            return ResponseApi::sendApiResponse('fail', 'Certains champs sont manquants ou invalides.', $validator->errors(), 422);
        }

        // Mise à jour des données de l'ingrédient
        $ingredient->name = $validator->validated()['name'];
        $ingredient->quantity = $validator->validated()['quantity'];

        $ingredient->save();

        return ResponseApi::sendApiResponse('success', 'Ingrédient mis à jour avec succès.', $ingredient, 0);
    }

    public function destroy($id) {
        // Vérification que l'utilisateur est connecté
        if (!Auth::check()) {
            return ResponseApi::sendApiResponse('fail', 'Vous devez être connecté pour supprimer un ingrédient', null, 404);
        }

        $ingredient = Ingredient::findOrFail($id);

        // Si l'utilisateur n'est pas un administrateur, vérifie qu'il est le propriétaire de l'ingrédient
        if (Auth::id() !== $ingredient->user_id && Auth::user()->user_type !== 'admin') {
            return ResponseApi::sendApiResponse('fail', 'Vous ne pouvez pas supprimer un ingrédient que vous ne possédez pas', null, 403);
        } else {
            $ingredient->delete();

            return ResponseApi::sendApiResponse('success', 'Ingrédient supprimé avec succès.', null, 0);
        }
    }
}
