<?php

namespace App\Http\Controllers;

use App\Models\Garnish;
use App\Scripts\ResponseApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class GarnishController extends Controller
{
    public function index()
    {
        return response()->json(Garnish::all());
    }

    protected function validation(Request $request)
    {
        return Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ], [
            'name.required' => 'Le champ nom est obligatoire.',
        ]);
    }

    public function store(Request $request)
    {
        $validator = $this->validation($request);

        if ($validator->fails()) {
            return ResponseApi::sendApiResponse('fail', 'Champs invalides', $validator->errors(), 422);
        }

        $garnish = Garnish::create($validator->validated());

        return ResponseApi::sendApiResponse('success', 'Garniture créée', $garnish, 200);
    }

    public function show($id)
    {
        $garnish = Garnish::where('_id', $id)->first();
        if (!$garnish) {
            return ResponseApi::sendApiResponse('fail', 'Garniture non trouvée', null, 404);
        }
        return response()->json($garnish);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user) {
            return ResponseApi::sendApiResponse('fail', 'Veuillez vous connecter', [], 401);
        }

        $garnish = Garnish::findOrFail($id);
        $validator = $this->validation($request);
        if ($validator->fails()) {
            return ResponseApi::sendApiResponse('fail', 'Champs invalides', $validator->errors(), 422);
        }

        $garnish->name = $validator->validated()['name'];
        $garnish->save();

        return ResponseApi::sendApiResponse('success', 'Garniture mise à jour', $garnish, 200);
    }

    public function destroy($id)
    {
        if (!Auth::check()) {
            return ResponseApi::sendApiResponse('fail', 'Vous devez être connecté', null, 404);
        }

        $garnish = Garnish::findOrFail($id);
        $garnish->delete();

        return ResponseApi::sendApiResponse('success', 'Garniture supprimée', null, 200);
    }
} 