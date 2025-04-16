<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\GlassController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FavoriteRecipeController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\DiagnosticController;

// Route de vérification d'authentification
Route::get('/auth/check', [AuthController::class, 'check']);

// Routes publiques
Route::post('/register', [UserController::class, 'store']);
Route::post('/login', [AuthController::class, 'login']);

// Route de diagnostic pour vérifier l'état de la session
Route::get('/session-debug', function (Request $request) {
    return response()->json([
        'session_id' => $request->session()->getId(),
        'has_session' => $request->hasSession() && count($request->session()->all()) > 0,
        'authenticated' => Auth::check(),
        'cookies' => $request->cookies->all(),
        'session_all' => $request->session()->all(),
        'user' => Auth::check() ? Auth::user() : null,
    ]);
});

// Route de diagnostic détaillé pour vérifier l'état de la session et auth
Route::get('/auth-diagnostic', function (Request $request) {
    return response()->json([
        'session_id' => session()->getId(),
        'has_laravel_session_cookie' => $request->hasCookie('laravel_session'),
        'has_xsrf_token_cookie' => $request->hasCookie('XSRF-TOKEN'),
        'session_data' => [
            'authenticated' => Auth::check(),
            'user_id' => Auth::id(),
        ],
        'cookies_received' => $request->cookies->all(),
        'headers' => [
            'origin' => $request->header('Origin'),
            'referer' => $request->header('Referer'),
            'user_agent' => $request->header('User-Agent'),
        ],
        'cors_headers' => [
            'allowed_origins' => config('cors.allowed_origins', []),
            'supports_credentials' => config('cors.supports_credentials', false),
            'session_secure' => config('session.secure', true),
            'session_same_site' => config('session.same_site', 'none'),
        ]
    ]);
});

// Route pour tester le stockage de session
Route::get('/session-test', function (Request $request) {
    // Stocker quelque chose dans la session
    $request->session()->put('test_key', 'test_value_' . time());
    
    return response()->json([
        'status' => 'success',
        'message' => 'Session test',
        'data' => [
            'session_id' => session()->getId(),
            'session_data' => $request->session()->all(),
            'cookies' => $request->cookies->all(),
            'auth' => [
                'check' => Auth::check(),
                'id' => Auth::id(),
                'user' => Auth::user(),
            ],
        ]
    ]);
});

// Route publique pour mettre à jour un utilisateur - alternative non-authentifiée
Route::put('/users/update/{id}', [UserController::class, 'updatePublic']);

Route::get('/recipes', [RecipeController::class, 'index']);
Route::get('/recipes/{id}', [RecipeController::class, 'show']);

// Routes for public endpoints
Route::get('/ingredients', [IngredientController::class, 'index']);
Route::get('/ingredients/{id}', [IngredientController::class, 'show']);

Route::get('/glass', [GlassController::class, 'index']);
Route::get('/glass/{id}', [GlassController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Route de test pour les recettes (accessible sans authentification)
Route::get('/test-recipes', [RecipeController::class, 'testRecipes']);

// Routes protégées par auth:sanctum
Route::middleware('auth:sanctum')->group(function () {

    // Authentification
    Route::get('/me', [UserController::class, 'show']);
    
    // Ajouter une route alternative pour gérer les appels à /api/me (les deux routes pointent vers la même action)
    Route::get('/api/me', [UserController::class, 'show']);
    
    Route::put('/me', [UserController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);


    // Gestion utilisateurs
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'showById']);
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
