<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::paginate(15); // Get users from the DB and display them by 15 per page

        return response()->json($users);
    }

    
    private function validateUser(Request $request, $userId = null)
    {
        $rules = [
            'name' => 'required|max:255',
            'email' =>
                'required|email',
                Rule::unique('users')->ignore($userId),
            'password' => 'required|min:6|confirmed',
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedUser = $this->validateUser($request); // Confirm the data from the request
        $validatedUser['password'] = bcrypt($validatedUser['password']); // Hash the password

        User::create($validatedUser); // Create the user in the DB

        return response()->json(['message' => 'User created successfully.']);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);

        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $user->update($validatedData);

        return response()->json(['message' => 'Profile updated successfully.']);
    }

    public function create()
    {
        return response()->json(['message' => 'User created successfully.']);
    }

    public function edit()
    {
        $user = Auth::user();
        return response()->json(['user' => $user, 'message' => 'User updated successfully.']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        User::findOrFail($id)->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    private function ban($id) {
        $user = User::findOrFail($id);
        $user->banned = true;
        $user->save();

        return response()->json(['message' => 'User banned successfully.']);
    }
}
