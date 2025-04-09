<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Web routes
Route::middleware('web')->group(function () {
    Route::get('/', fn () => view('welcome'));
});

// API routes
Route::middleware('api')->prefix('api')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/ban', [UserController::class, 'ban']);
});