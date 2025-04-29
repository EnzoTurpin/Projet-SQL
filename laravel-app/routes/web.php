<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/', function () {
    return view('welcome');
});

// Route de test pour l'upload d'images
Route::get('/test-upload', function () {
    return view('test-upload');
});

Route::post('/test-upload', function (Request $request) {
    if ($request->hasFile('image')) {
        $image = $request->file('image');
        $imageName = time() . '_' . Str::slug('test') . '.' . $image->getClientOriginalExtension();
        
        $path = $image->storeAs('public/images/cocktails', $imageName);
        
        return "Image uploadée avec succès à: " . $path;
    }
    
    return "Aucune image trouvée";
});
