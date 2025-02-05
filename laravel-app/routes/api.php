<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

const USER_ID = '/users/{id}';

Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get(USER_ID, [UserController::class, 'show']);
Route::put(USER_ID, [UserController::class, 'update']);
Route::delete(USER_ID, [UserController::class, 'destroy']);
