<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

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

// Routes publiques
Route::get('/test', function () {
  return response()->json(['message' => 'API is working']);
});
Route::get('users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);

// Routes nécessitant une authentification
Route::middleware('auth:sanctum')->group(function () {
    Route::put('/users', [UserController::class, 'update']);
    Route::post('/users', [UserController::class, 'store']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/ban', [UserController::class, 'ban']);
});