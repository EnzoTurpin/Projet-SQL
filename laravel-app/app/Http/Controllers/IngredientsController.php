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
}
