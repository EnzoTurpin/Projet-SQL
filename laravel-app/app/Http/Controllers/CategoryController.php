<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Scripts\ResponseApi;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    public function index() {
        $recipe = Category::all();
        
        return response()->json($recipe);
    }

    public function create(Request $request){
        return Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ], [
            'name.required' => 'Le champ nom est obligatoire.',
        ]);
    }

    public function store(Request $request)
    {
        $validator = $this->create($request);

        // Si la validation échoue, on renvoie les erreurs
        if ($validator->fails()) {
            return ResponseApi::sendApiResponse('fail', 'Certains champs sont manquants ou invalides.', $validator->errors(), 422);
        }

        $category = Category::create($validator->validated());

        return ResponseApi::sendApiResponse('success', 'Ingrédient créé avec succès !', $category, 0);
    }

    public function show($id){
        try {
            $category = Category::where('_id', $id)->firstOrFail();
            return response()->json($category);
        } catch (\Exception $e) {
            return ResponseApi::sendApiResponse('fail', 'Verre non trouvé', null, 404);
        }
    }

    public function update(Request $request, $id) {
        $user = Auth::user();

        // Vérification de la connexion de l'utilisateur
        if (!$user) {
            return ResponseApi::sendApiResponse('fail', 'Vous devez être connecté pour effectuer cette action.', [], 401);
        }

        $category = Category::findOrFail($id);
        $validator = $this->create($request);
    
        // Si la validation échoue, on renvoie les erreurs
        if ($validator->fails()) {
            return ResponseApi::sendApiResponse('fail', 'Certains champs sont manquants ou invalides.', $validator->errors(), 422);
        }

        // Mise à jour des données de l'ingrédient
        $category->name = $validator->validated()['name'];
        $category->quantity = $validator->validated()['quantity'];

        $category->save();

        return ResponseApi::sendApiResponse('success', 'Ingrédient mis à jour avec succès.', $category, 0);
    }

    public function destroy($id) {
        // Vérification que l'utilisateur est connecté
        if (!Auth::check()) {
            return ResponseApi::sendApiResponse('fail', 'Vous devez être connecté pour supprimer un ingrédient', null, 404);
        }

        $category = Category::findOrFail($id);

        // Si l'utilisateur n'est pas un administrateur, vérifie qu'il est le propriétaire de l'ingrédient
        if (Auth::id() !== $category->user_id && Auth::user()->user_type !== 'admin') {
            return ResponseApi::sendApiResponse('fail', 'Vous ne pouvez pas supprimer un ingrédient que vous ne possédez pas', null, 403);
        } else {
            $category->delete();

            return ResponseApi::sendApiResponse('success', 'Ingrédient supprimé avec succès.', null, 0);
        }
    }
}
