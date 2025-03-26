<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Recipe;

class RecipeController extends Controller
{
    public function index() {
        $recipe = Recipe::all();
        
        return response()->json($recipe);
    }

    public function create(Request $request){
        return $request->validate([
            'name' => 'required|string|max:255',
            'ingredient_id' => 'required|array',
            'ingredient.*.ingredients_id' => 'required|exist:ingredients,_id',
            'ingredients.*.quantity' => 'required|string',
            'quantity' => 'required|min:1',
            'instructions' => 'required|string',
            'category' => 'required|exist:category,_id',
            'glass' => 'required|exist:glass,_id',
            'garnish' => 'required|exist:ingredients,_id',
            'mainAlcohol' => 'required',
        ]);
    }

    public function store(Request $request){

    }

    public function show(Recipe $recipe){

    }

    public function update(Request $request, $id){

    }

    public function destroy(Recipe $recipe){

    }
}
