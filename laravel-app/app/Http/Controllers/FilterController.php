<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Glass;
use App\Models\Ingredient;

class FilterController extends Controller
{
    /**
     * Get all filter options (categories, glasses, ingredients).
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $categories = Category::all();
        $glasses = Glass::all();
        $ingredients = Ingredient::all();

        return response()->json([
            'categories' => $categories,
            'glasses' => $glasses,
            'ingredients' => $ingredients,
        ]);
    }
} 