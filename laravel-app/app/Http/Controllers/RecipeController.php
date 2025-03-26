<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Recipe;
use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Glass;
use App\Scripts\ResponseApi;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class RecipeController extends Controller
{
    public function index()
    {
        $recipes = Recipe::with(['ingredients:name', 'category:name', 'glass:name'])->get();
    
        return response()->json($recipes);
    }

    public function create(Request $request)
    {
        // Valide les données envoyées
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
    
            'ingredients' => 'array|required',
            'ingredients.*.ingredients_id' => 'exists:ingredients,_id',
            'ingredients.*.quantity' => 'required|string',
    
            'quantity' => 'required|integer|min:1',
            'instructions' => 'required|string',
    
            'category_name' => 'exists:categories,name',
            'glass_name' => 'required|exists:glasses,name',
            'garnish' => 'required|exists:ingredients,name',
            'mainAlcohol' => 'required|string',
        ], [
            'name.required' => 'Le champ nom est obligatoire.',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',
    
            'ingredients.*.ingredients_id.exists' => 'Certains ingrédients n\'existent pas.',
            'ingredients.*.quantity.required' => 'La quantité est obligatoire pour chaque ingrédient.',
            'ingredients.*.quantity.string' => 'La quantité de chaque ingrédient doit être une chaîne de caractères.',
    
            'quantity.required' => 'La quantité est obligatoire.',
            'quantity.integer' => 'La quantité doit être un nombre entier.',
            'quantity.min' => 'La quantité doit être au minimum 1.',
    
            'instructions.required' => 'Les instructions sont obligatoires.',
            'instructions.string' => 'Les instructions doivent être sous forme de texte.',
    
            'category_name.exists' => 'La catégorie sélectionnée n\'existe pas.',
            'glass_name.required' => 'Le nom du verre est obligatoire.',
            'glass_name.exists' => 'Le verre sélectionné n\'existe pas.',
            'garnish.required' => 'La garniture est obligatoire.',
            'garnish.exists' => 'La garniture sélectionnée n\'existe pas.',
            'mainAlcohol.required' => 'L\'alcool principal est obligatoire.',
            'mainAlcohol.string' => 'L\'alcool principal doit être une chaîne de caractères.',
        ]);
    
        if ($validator->fails()) {
            return ResponseApi::sendApiResponse('fail', 'Certains champs sont manquants ou invalides.', $validator->errors(), 422);
        }
    
        // Si validation réussie, récupérer les données des collections en fonction du 'name'
        $validated = $validator->validated();
    
        // Récupérer la catégorie, le verre et la garniture selon leur nom
        $category = Category::where('name', $validated['category_name'])->first();
        $glass = Glass::where('name', $validated['glass_name'])->first();
        $garnish = Ingredient::where('name', $validated['garnish'])->first();
    
        // Vérifie si les relations ont bien été trouvées
        if (!$category || !$glass || !$garnish) {
            return ResponseApi::sendApiResponse('fail', 'Une des relations est invalide.', null, 422);
        }
    
        // Traiter les ingrédients et récupérer leurs IDs
        $ingredientIds = [];
        foreach ($validated['ingredients'] as $ingredient) {
            $ingredientRecord = Ingredient::where('_id', $ingredient['ingredients_id'])->first();
            if ($ingredientRecord) {
                $ingredientIds[] = [
                    'ingredient_id' => $ingredientRecord->_id,
                    'quantity' => $ingredient['quantity'],
                ];
            } else {
                return ResponseApi::sendApiResponse('fail', 'Un ingrédient n\'existe pas.', null, 422);
            }
        }
    
        // Créer la recette avec les données validées et les IDs récupérés
        $recipe = Recipe::create([
            'name' => $validated['name'],
            'ingredients' => $ingredientIds,
            'quantity' => $validated['quantity'],
            'instructions' => $validated['instructions'],
            'category_id' => $category->_id,
            'glass_id' => $glass->_id,
            'garnish' => $garnish->_id,
            'mainAlcohol' => $validated['mainAlcohol'],
        ]);
    
        return ResponseApi::sendApiResponse('success', 'Recette créée avec succès !', $recipe, 0);
    }
    

    public function store(Request $request)
    {
        $validator = $this->create($request);

        // Si la validation échoue, on renvoie les erreurs
        if ($validator->fails()) {
            return ResponseApi::sendApiResponse('fail', 'Certains champs sont manquants ou invalides.', $validator->errors(), 422);
        }

        $recipe = Recipe::create($validator->validated());

        return ResponseApi::sendApiResponse('success', 'Recette créée avec succès !', $recipe, 0);
    }

    public function show($id)
    {
        try {
            $recipe = Recipe::with(['ingredients:name', 'category:name', 'glass:name'])
                ->where('_id', $id)
                ->firstOrFail();
            
            return response()->json($recipe);
        } catch (\Exception $e) {
            return ResponseApi::sendApiResponse('fail', 'Recette non trouvée', null, 404);
        }
    }
    public function update(Request $request, $id) {
        $user = Auth::user();

        // Vérification de la connexion de l'utilisateur
        if (!$user) {
            return ResponseApi::sendApiResponse('fail', 'Vous devez être connecté pour effectuer cette action.', [], 401);
        }

        $recipe = Recipe::findOrFail($id);
        $validator = $this->create($request);
    
        // Si la validation échoue, on renvoie les erreurs
        if ($validator->fails()) {
            return ResponseApi::sendApiResponse('fail', 'Certains champs sont manquants ou invalides.', $validator->errors(), 422);
        }

        // Mise à jour des données de l'ingrédient
        $recipe->name = $validator->validated()['name'];
        $recipe->quantity = $validator->validated()['quantity'];

        $recipe->save();

        return ResponseApi::sendApiResponse('success', 'Ingrédient mis à jour avec succès.', $recipe, 0);
    }

    public function destroy($id) {
        // Vérification que l'utilisateur est connecté
        if (!Auth::check()) {
            return ResponseApi::sendApiResponse('fail', 'Vous devez être connecté pour supprimer un ingrédient', null, 404);
        }

        $recipe = Recipe::findOrFail($id);

        // Si l'utilisateur n'est pas un administrateur, vérifie qu'il est le propriétaire de l'ingrédient
        if (Auth::id() !== $recipe->user_id && Auth::user()->user_type !== 'admin') {
            return ResponseApi::sendApiResponse('fail', 'Vous ne pouvez pas supprimer un ingrédient que vous ne possédez pas', null, 403);
        } else {
            $recipe->delete();

            return ResponseApi::sendApiResponse('success', 'Ingrédient supprimé avec succès.', null, 0);
        }
    }
}
