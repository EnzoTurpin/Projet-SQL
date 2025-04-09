<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\GlassController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Routes users
Route::get('users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/users', [UserController::class, 'update']);
    Route::post('/users', [UserController::class, 'store']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/ban', [UserController::class, 'ban']);
});

// Route recipes
Route::get('recipes', [RecipeController::class, 'index']);
Route::get('/recipes/{id}', [RecipeController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/recipes', [RecipeController::class, 'update']);
    Route::post('/recipes', [RecipeController::class, 'store']);
    Route::delete('/recipes/{id}', [RecipeController::class, 'destroy']);
    Route::post('/recipes/{id}/ban', [RecipeController::class, 'ban']);
});

// Route ingredients
Route::get('ingredients', [IngredientController::class, 'index']);
Route::get('/ingredients/{id}', [IngredientController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/ingredients', [IngredientController::class, 'update']);
    Route::post('/ingredients', [IngredientController::class, 'store']);
    Route::delete('/ingredients/{id}', [IngredientController::class, 'destroy']);
    Route::post('/ingredients/{id}/ban', [IngredientController::class, 'ban']);
});

// Route glass
Route::get('glass', [GlassController::class, 'index']);
Route::get('/glass/{id}', [GlassController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/glass', [GlassController::class, 'update']);
    Route::post('/glass', [GlassController::class, 'store']);
    Route::delete('/glass/{id}', [GlassController::class, 'destroy']);
    Route::post('/glass/{id}/ban', [GlassController::class, 'ban']);
});

// Route categories
Route::get('categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/categories', [CategoryController::class, 'update']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    Route::post('/categories/{id}/ban', [CategoryController::class, 'ban']);
});

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
