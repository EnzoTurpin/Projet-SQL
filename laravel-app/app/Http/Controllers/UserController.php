<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function home(){
        return view('user.home');
    }

    public function profile() {
        $user = Auth::user();
        return view('users.profile', compact('user'));
    }

    public function create()
    {
        return view('users.create');
    }

    public function store(Request $request){
        $validatedData = $this->validateUser($request);
        
        $validatedData['password'] = bcrypt($validatedData['password']);

        User::create($validatedData);

        return redirect()->route('user.profile')
            ->with('success', 'User created successfully.');
    }

    public function show() {
        $user = Auth::user();
        return view('users.show', compact('user'));
    }

    public function edit() {
        $user = Auth::user();
        return view('users.edit', compact('user'));
    }

    public function update(Request $request) {
        $user = Auth::user();

        $validateData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $user->update($validateData);

        return redirect()->route('user.profile')->with('success', 'Profil mis à jour avec succès.');
    }

    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        Auth::logout();

        return redirect()->route('login')
            ->with('success', 'User deleted successfully.');
    }

    private function validateUser(Request $request, $userId = null)
    {
        $rules = [
            'name' => 'required|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($userId),
            ],
            'password' => 'required|confirmed|min:6',
        ];

        $messages = [
            'name.required' => 'Le champ nom est obligatoire.',
            'email.required' => 'Le champ email est obligatoire.',
            'email.email' => 'L\'adresse email doit être valide.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.'
        ];

        return $request->validate($rules, $messages);
    }
}
