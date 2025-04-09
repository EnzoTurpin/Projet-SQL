<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\GlassController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthController;

// Routes publiques
Route::post('/register', [UserController::class, 'store']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/recipes', [RecipeController::class, 'index']);
Route::get('/recipes/{id}', [RecipeController::class, 'show']);

Route::get('/ingredients', [IngredientController::class, 'index']);
Route::get('/ingredients/{id}', [IngredientController::class, 'show']);

Route::get('/glass', [GlassController::class, 'index']);
Route::get('/glass/{id}', [GlassController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Routes protégées par auth:sanctum
Route::middleware('auth:sanctum')->group(function () {

    // Authentification
    Route::get('/me', [UserController::class, 'show']);
    Route::put('/me', [UserController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Gestion utilisateurs
    Route::get('/users', [UserController::class, 'index']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/ban', [UserController::class, 'ban']);

    // Gestion recettes
    Route::post('/recipes', [RecipeController::class, 'store']);
    Route::put('/recipes', [RecipeController::class, 'update']);
    Route::delete('/recipes/{id}', [RecipeController::class, 'destroy']);
    Route::post('/recipes/{id}/ban', [RecipeController::class, 'ban']);

    // Gestion ingrédients
    Route::post('/ingredients', [IngredientController::class, 'store']);
    Route::put('/ingredients', [IngredientController::class, 'update']);
    Route::delete('/ingredients/{id}', [IngredientController::class, 'destroy']);
    Route::post('/ingredients/{id}/ban', [IngredientController::class, 'ban']);

    // Gestion verres
    Route::post('/glass', [GlassController::class, 'store']);
    Route::put('/glass', [GlassController::class, 'update']);
    Route::delete('/glass/{id}', [GlassController::class, 'destroy']);
    Route::post('/glass/{id}/ban', [GlassController::class, 'ban']);

    // Gestion catégories
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    Route::post('/categories/{id}/ban', [CategoryController::class, 'ban']);
});
