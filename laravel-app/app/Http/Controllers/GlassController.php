<?php

namespace App\Http\Controllers;

use App\Models\Glass;
use Illuminate\Http\Request;

class GlassController extends Controller
{
    public function index() {
        $recipe = Glass::all();
        
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

    public function show(Glass $glass){

    }

    public function update(Request $request, $id){

    }

    public function destroy(Glass $glass){

    }
}
