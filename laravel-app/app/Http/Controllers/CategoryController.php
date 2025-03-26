<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index() {
        $recipe = Category::all();
        
        return response()->json($recipe);
    }

    public function create(Request $request){
        return $request->validate([
            'name' => 'required|string|max:255',
        ], [
            'name.required' => 'Le champ nom est obligatoire.',
        ]);
    }

    public function store(Request $request){

    }

    public function show(Category $category){

    }

    public function update(Request $request, $id){

    }

    public function destroy(Category $category){

    }
}
