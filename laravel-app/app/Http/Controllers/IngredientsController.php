<?php

namespace App\Http\Controllers;

use App\Models\Ingredients;
use Illuminate\Http\Request;

class IngredientsController extends Controller
{
    public function index() {
        $ingredients = Ingredients::all();

        return response()->json($ingredients);
    }

    protected function create(Request $request) {
        return $request->validate([
            'name' => 'required|string|max:255',
        ], [
            'name.required' => 'Le champ nom est obligatoire.',
        ]);
    }

    public function store(Request $request) {
        $validatedIngredient = $this->create($request);

        $ingredient = Ingredients::create($validatedIngredient);

        return response()->json([
            'message' => 'Ingrédient créé avec succès !',
            'ingredient' => $ingredient
        ], 201);
    }

    public function show($id) {
        $ingredient = Ingredients::findOrFail($id);
        return response()->json($ingredient);
    }

    public function update(Request $request, $id) {
        $validatedIngredient = $this->create($request);

        $ingredient = Ingredients::findOrFail($id);
        $ingredient->update($validatedIngredient);

        return response()->json([
            'message' => 'Ingrédient mis à jour avec succès !',
            'ingredient' => $ingredient
        ]);
    }
}
