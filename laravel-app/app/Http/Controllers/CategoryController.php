<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Scripts\ResponseApi;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::all()); // Ou Glass::all(), Ingredient::all()
    }

    protected function validator(Request $request)
    {
        return Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'isMocktail' => 'required|boolean',
        ], [
            'name.required' => 'Le champ nom est obligatoire.',
            'isMocktail.required' => 'Le champ isMocktail est obligatoire.',
            'isMocktail.boolean' => 'Le champ isMocktail doit être un booléen.',
        ]);
    }

    public function store(Request $request)
    {
        $validator = $this->validator($request);

        if ($validator->fails()) {
            return ResponseApi::sendApiResponse('fail', 'Certains champs sont manquants ou invalides.', $validator->errors(), 422);
        }

        $category = Category::create($validator->validated());

        return ResponseApi::sendApiResponse('success', 'Catégorie créée avec succès !', $category, 0);
    }

    public function show($id)
    {
        try {
            $category = Category::where('_id', $id)->firstOrFail();
            return response()->json($category);
        } catch (\Exception $e) {
            return ResponseApi::sendApiResponse('fail', 'Catégorie non trouvée', null, 404);
        }
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();

        // Vérification de la connexion de l'utilisateur
        if (!$user) {
            return ResponseApi::sendApiResponse('fail', 'Vous devez être connecté pour effectuer cette action.', [], 401);
        }

        $category = Category::findOrFail($id);
        $validator = $this->validator($request);
    
        // Si la validation échoue, on renvoie les erreurs
        if ($validator->fails()) {
            return ResponseApi::sendApiResponse('fail', 'Certains champs sont manquants ou invalides.', $validator->errors(), 422);
        }

        // Mise à jour des données de la catégorie
        $category->name = $validator->validated()['name'];
        $category->isMocktail = $validator->validated()['isMocktail'];

        $category->save();

        return ResponseApi::sendApiResponse('success', 'Catégorie mise à jour avec succès.', $category, 0);
    }

    public function destroy($id)
    {
        // Vérification que l'utilisateur est connecté
        if (!Auth::check()) {
            return ResponseApi::sendApiResponse('fail', 'Vous devez être connecté pour supprimer une catégorie', null, 404);
        }

        $category = Category::findOrFail($id);

        // Si l'utilisateur n'est pas un administrateur, vérifie qu'il est le propriétaire de la catégorie
        if (Auth::id() !== $category->user_id && Auth::user()->user_type !== 'admin') {
            return ResponseApi::sendApiResponse('fail', 'Vous ne pouvez pas supprimer une catégorie que vous ne possédez pas', null, 403);
        } else {
            $category->delete();

            return ResponseApi::sendApiResponse('success', 'Catégorie supprimée avec succès.', null, 0);
        }
    }
}
