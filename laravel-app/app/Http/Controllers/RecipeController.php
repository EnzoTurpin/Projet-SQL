<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use Illuminate\Http\Request;
use App\Scripts\ResponseApi;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Glass;

class RecipeController extends Controller
{
    public function index()
    {
        $recipes = Recipe::with(['category:name', 'glass:name'])->get();
    
        return response()->json($recipes);
    }

    public function create(Request $request)
    {
        // Log pour le debugging
        Log::info('Création de recette');
        Log::info('Données reçues', ['files' => $request->files, 'hasFile' => $request->hasFile('image')]);
        
        // Récupérer et préparer les données
        $data = $request->all();
        
        // Décoder les données JSON des ingrédients et instructions
        if (isset($data['ingredients']) && is_string($data['ingredients'])) {
            $data['ingredients'] = json_decode($data['ingredients'], true);
        }
        
        if (isset($data['instructions']) && is_string($data['instructions'])) {
            $data['instructions'] = json_decode($data['instructions'], true);
        }
        
        // Valide les données envoyées
        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'image' => 'required|file|mimes:jpeg,png,jpg,gif|max:2048',
            'difficulty' => 'required|string|in:Facile,Moyen,Difficile',
            'preparationTime' => 'required|string',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.name' => 'required|string',
            'ingredients.*.quantity' => 'required|string',
            'ingredients.*.unit' => 'nullable|string',
            'instructions' => 'required|array|min:1',
            'glassType' => 'nullable|string',
            'alcoholLevel' => 'nullable|string',
            'garnish' => 'nullable|string',
            'isMocktail' => 'nullable|string|in:true,false',
        ], [
            'name.required' => 'Le nom du cocktail est obligatoire.',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            'description.required' => 'La description est obligatoire.',
            'description.min' => 'La description doit contenir au moins 10 caractères.',
            'image.required' => 'Une image est requise pour le cocktail.',
            'image.file' => 'Le fichier doit être une image.',
            'image.mimes' => 'L\'image doit être au format jpeg, png, jpg ou gif.',
            'image.max' => 'L\'image ne doit pas dépasser 2Mo.',
            'difficulty.required' => 'La difficulté est obligatoire.',
            'difficulty.in' => 'La difficulté doit être Facile, Moyen ou Difficile.',
            'preparationTime.required' => 'Le temps de préparation est obligatoire.',
            'ingredients.required' => 'Au moins un ingrédient est obligatoire.',
            'ingredients.min' => 'Au moins un ingrédient est obligatoire.',
            'ingredients.*.name.required' => 'Le nom de chaque ingrédient est obligatoire.',
            'ingredients.*.quantity.required' => 'La quantité est obligatoire pour chaque ingrédient.',
            'instructions.required' => 'Les instructions sont obligatoires.',
            'instructions.min' => 'Au moins une étape d\'instruction est obligatoire.',
        ]);

        if ($validator->fails()) {
            return ResponseApi::sendApiResponse('fail', 'Certains champs sont manquants ou invalides.', $validator->errors(), 422);
        }
        
        // Récupérer les données validées
        $validatedData = $validator->validated();
        
        // Gérer l'upload de l'image
        if ($request->hasFile('image')) {
            Log::info('Fichier image présent', ['file' => $request->file('image')]);
            $image = $request->file('image');
            $imageName = time() . '_' . Str::slug($validatedData['name']) . '.' . $image->getClientOriginalExtension();
            
            try {
                // S'assurer que le dossier public/images/cocktails existe
                $destinationPath = public_path('images/cocktails');
                if (!is_dir($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }

                // Déplacer l'image directement dans le dossier public pour un accès plus simple
                $image->move($destinationPath, $imageName);

                // Le chemin web relatif (avec un slash en tête)
                $path = '/images/cocktails/' . $imageName;
                Log::info('Image enregistrée', ['path' => $path]);
                
                // Stocker uniquement le chemin de l'image dans la base de données
                $validatedData['image'] = $path;
            } catch (\Exception $e) {
                Log::error('Erreur lors de l\'enregistrement de l\'image', ['error' => $e->getMessage()]);
                return ResponseApi::sendApiResponse('fail', 'Erreur lors de l\'enregistrement de l\'image', ['error' => $e->getMessage()], 500);
            }
        } else {
            Log::warning('Aucun fichier image trouvé dans la requête');
            // Vous pouvez soit renvoyer une erreur, soit utiliser une image par défaut
            return ResponseApi::sendApiResponse('fail', 'Aucune image fournie', null, 422);
        }

        // Création de la recette avec les données validées
        try {
            // Convertir isMocktail en booléen
            if (isset($validatedData['isMocktail'])) {
                $validatedData['isMocktail'] = $validatedData['isMocktail'] === 'true';
            }
            
            $recipe = Recipe::create($validatedData);
            Log::info('Recette créée avec succès', ['recipe_id' => $recipe->id]);
            return ResponseApi::sendApiResponse('success', 'Cocktail créé avec succès !', $recipe, 201);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la création de la recette', ['error' => $e->getMessage()]);
            return ResponseApi::sendApiResponse('fail', 'Erreur lors de la création de la recette', ['error' => $e->getMessage()], 500);
        }
    }
    

    public function store(Request $request)
    {
        // Déléguer à la méthode create qui contient déjà toute la logique
        return $this->create($request);
    }

    public function show($id)
    {
        try {
            $recipe = Recipe::with(['category:name', 'glass:name'])
                ->where('_id', $id)
                ->firstOrFail();
            
            // Si l'image est un chemin, construire l'URL complète
            if ($recipe->image && !filter_var($recipe->image, FILTER_VALIDATE_URL)) {
                // Assurer que le chemin commence par storage/
                $recipe->image = url('storage/' . ltrim(str_replace('storage/', '', $recipe->image), '/'));
            }
            
            return response()->json($recipe);
        } catch (\Exception $e) {
            return ResponseApi::sendApiResponse('fail', 'Recette non trouvée', null, 404);
        }
    }
    
    public function update(Request $request, $id) {
        $user = Auth::user();

        // Logs ultra détaillés pour débugger
        Log::info('===== DÉBUT MISE À JOUR COCKTAIL =====');
        Log::info('ID reçu pour mise à jour:', ['id' => $id, 'type' => gettype($id)]);
        
        // Vérification de la connexion de l'utilisateur
        if (!$user) {
            Log::error('Utilisateur non authentifié');
            return ResponseApi::sendApiResponse('fail', 'Vous devez être connecté pour effectuer cette action.', [], 401);
        }

        // Rechercher l'ancienne recette
        try {
            // Utiliser uniquement findOrFail ici
            $recipe = Recipe::findOrFail($id);
            
            Log::info('Recette existante trouvée', [
                'recipe_id' => $recipe->id,
                'recipe_name' => $recipe->name
            ]);
        } catch (\Exception $e) {
            Log::error('Recette non trouvée', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return ResponseApi::sendApiResponse('fail', 'Cocktail non trouvé', null, 404);
        }

        // Récupérer et préparer les données
        $data = $request->all();
        
        // Décoder les données JSON des ingrédients et instructions
        if (isset($data['ingredients']) && is_string($data['ingredients'])) {
            $data['ingredients'] = json_decode($data['ingredients'], true);
        }
        
        if (isset($data['instructions']) && is_string($data['instructions'])) {
            $data['instructions'] = json_decode($data['instructions'], true);
        }

        // Validation des données
        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'difficulty' => 'required|string|in:Facile,Moyen,Difficile',
            'preparationTime' => 'required|string',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.name' => 'required|string',
            'ingredients.*.quantity' => 'required|string',
            'ingredients.*.unit' => 'nullable|string',
            'instructions' => 'required|array|min:1',
            'glassType' => 'nullable|string',
            'alcoholLevel' => 'nullable|string',
            'garnish' => 'nullable|string',
            'isMocktail' => 'nullable|string|in:true,false',
        ]);

        if ($validator->fails()) {
            Log::error('Validation échouée pour mise à jour', [
                'recipe_id' => $id,
                'errors' => $validator->errors()->toArray()
            ]);
            return ResponseApi::sendApiResponse('fail', 'Certains champs sont manquants ou invalides.', $validator->errors(), 422);
        }

        // Récupérer les données validées
        $validatedData = $validator->validated();
        
        // Convertir isMocktail en booléen
        if (isset($validatedData['isMocktail'])) {
            $validatedData['isMocktail'] = $validatedData['isMocktail'] === 'true';
        }
        
        // Gérer l'upload de la nouvelle image si fournie
        if ($request->hasFile('image')) {
            // Supprimer l'ancienne image si elle existe
            if ($recipe->image && !filter_var($recipe->image, FILTER_VALIDATE_URL)) {
                if (str_starts_with($recipe->image, '/images/')) {
                    $fullPath = public_path(ltrim($recipe->image, '/'));
                    if (file_exists($fullPath)) {
                        @unlink($fullPath);
                    }
                } else {
                    Storage::disk('public')->delete($recipe->image);
                }
            }
            
            $image = $request->file('image');
            $imageName = time() . '_' . Str::slug($validatedData['name']) . '.' . $image->getClientOriginalExtension();
            
            // S'assurer que le dossier public/images/cocktails existe
            $destinationPath = public_path('images/cocktails');
            if (!is_dir($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            // Déplacer l'image directement dans le dossier public pour un accès plus simple
            $image->move($destinationPath, $imageName);
            
            // Mettre à jour le chemin de l'image
            $validatedData['image'] = '/images/cocktails/' . $imageName;
        }

        // Mettre à jour les données du cocktail
        try {
            // SOLUTION RADICALE : Supprimer et recréer avec le même ID
            // 1. D'abord forcer l'ID pour qu'il corresponde à l'ancien ID mongoDB
            $validatedData['_id'] = $recipe->_id ?? $id;
            
            // 2. Supprimer l'ancienne recette
            $recipe->delete();
            
            // 3. Recréer avec les mêmes IDs
            $newRecipe = Recipe::create($validatedData);
            
            Log::info('Recette mise à jour par suppression/recréation', [
                'old_id' => $id,
                'new_id' => $newRecipe->id,
                'new__id' => $newRecipe->_id,
                'name' => $newRecipe->name
            ]);
            
            Log::info('===== FIN MISE À JOUR COCKTAIL =====');
            
            return ResponseApi::sendApiResponse('success', 'Cocktail mis à jour avec succès.', $newRecipe, 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de la recette', [
                'recipe_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            Log::info('===== FIN MISE À JOUR COCKTAIL (ERREUR) =====');
            return ResponseApi::sendApiResponse('fail', 'Erreur lors de la mise à jour du cocktail', ['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id) {
        // Vérification que l'utilisateur est connecté
        if (!Auth::check()) {
            return ResponseApi::sendApiResponse('fail', 'Vous devez être connecté pour supprimer un cocktail', null, 404);
        }

        $recipe = Recipe::findOrFail($id);

        // Si l'utilisateur n'est pas un administrateur, vérifie qu'il est le propriétaire du cocktail
        if (Auth::id() !== $recipe->user_id && Auth::user()->user_type !== 'admin') {
            return ResponseApi::sendApiResponse('fail', 'Vous ne pouvez pas supprimer un cocktail que vous ne possédez pas', null, 403);
        } else {
            // Supprimer l'image si elle existe
            if ($recipe->image && !filter_var($recipe->image, FILTER_VALIDATE_URL)) {
                if (str_starts_with($recipe->image, '/images/')) {
                    $fullPath = public_path(ltrim($recipe->image, '/'));
                    if (file_exists($fullPath)) {
                        @unlink($fullPath);
                    }
                } else {
                    Storage::disk('public')->delete($recipe->image);
                }
            }
            
            $recipe->delete();

            return ResponseApi::sendApiResponse('success', 'Cocktail supprimé avec succès.', null, 200);
        }
    }
    public function filter(Request $request)
{
    $query = Recipe::query();

    if ($request->has('category_id')) {
        $query->where('category_id', $request->category_id);
    }

    if ($request->has('glass_id')) {
        $query->where('glass_id', $request->glass_id);
    }

    if ($request->has('ingredient_ids')) {
        $ingredientIds = explode(',', $request->ingredient_ids);
        $query->whereHas('ingredients', function($q) use ($ingredientIds) {
            $q->whereIn('ingredient_id', $ingredientIds);
        });
    }

    $recipes = $query->get();

    return response()->json($recipes);
}

    public function testRecipes()
    {
        // Créer des recettes de test statiques pour le débogage
        $testRecipes = [
            [
                'id' => 'test-recipe-1',
                'name' => 'Mojito de Test',
                'description' => 'Un mojito de test pour déboguer l\'application',
                'image' => 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=60',
                'difficulty' => 'Facile',
                'preparationTime' => '5 min',
                'ingredients' => [
                    ['name' => 'Rhum', 'quantity' => '50 ml'],
                    ['name' => 'Menthe', 'quantity' => '10 feuilles'],
                    ['name' => 'Sucre', 'quantity' => '2 cuillères à café']
                ],
                'instructions' => ['Mélangez tous les ingrédients dans un verre avec de la glace.'],
                'glassType' => 'Verre à cocktail',
                'alcoholLevel' => '40',
                'garnish' => 'Citron vert',
                'category' => ['name' => 'Cocktail'],
                'glass' => ['name' => 'Verre à cocktail'],
                'isMocktail' => false
            ],
            [
                'id' => 'test-recipe-2',
                'name' => 'Mocktail de Test',
                'description' => 'Un mocktail de test sans alcool',
                'image' => 'https://images.unsplash.com/photo-1621881538090-b2b5ffaa25ce?w=800&auto=format&fit=crop&q=60',
                'difficulty' => 'Facile',
                'preparationTime' => '3 min',
                'ingredients' => [
                    ['name' => 'Jus d\'orange', 'quantity' => '100 ml'],
                    ['name' => 'Sirop de grenadine', 'quantity' => '20 ml']
                ],
                'instructions' => ['Mélangez les ingrédients dans un verre.', 'Ajoutez des glaçons.'],
                'glassType' => 'Verre à jus',
                'alcoholLevel' => '0',
                'garnish' => 'Tranche d\'orange',
                'category' => ['name' => 'Mocktail'],
                'glass' => ['name' => 'Verre à jus'],
                'isMocktail' => true
            ],
            [
                'id' => 'test-recipe-3',
                'name' => 'Piña Colada de Test',
                'description' => 'Une piña colada pour tester l\'affichage',
                'image' => 'https://images.unsplash.com/photo-1662487034741-3beb6812793d?w=800&auto=format&fit=crop&q=60',
                'difficulty' => 'Moyen',
                'preparationTime' => '10 min',
                'ingredients' => [
                    ['name' => 'Rhum blanc', 'quantity' => '50 ml'],
                    ['name' => 'Lait de coco', 'quantity' => '30 ml'],
                    ['name' => 'Jus d\'ananas', 'quantity' => '90 ml']
                ],
                'instructions' => ['Mélangez tous les ingrédients dans un blender avec de la glace.', 'Mixez jusqu\'à obtenir une consistance lisse.'],
                'glassType' => 'Verre à cocktail',
                'alcoholLevel' => '35',
                'garnish' => 'Tranche d\'ananas',
                'category' => ['name' => 'Cocktail'],
                'glass' => ['name' => 'Verre à cocktail'],
                'isMocktail' => false
            ],
        ];

        return response()->json($testRecipes);
    }
}
