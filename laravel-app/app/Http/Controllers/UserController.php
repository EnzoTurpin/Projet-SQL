<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Scripts\ResponseApi;

class UserController extends Controller
{
    /**
     * Affiche une liste des utilisateurs avec pagination
     */
    public function index()
    {
        $users = User::all();

        return ResponseApi::sendApiResponse('success', 'Liste des utilisateurs récupérée avec succès', ['users' => $users], 200);
    }

    /**
     * Valide les données utilisateur
     */
    private function create(Request $request, $userId = null)
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($userId)
            ],
            'password' => $userId ? 'nullable|string|min:6|confirmed' : 'required|string|min:6|confirmed',
        ], [
            'name.required' => 'Le champ nom est obligatoire.',
            'email.required' => 'Le champ email est obligatoire.',
            'email.email' => 'L\'adresse email doit être valide.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.'
        ]);
    }

    /**
     * Création d'un utilisateur
     */
    public function store(Request $request)
    {
        $validatedUser = $this->create($request);

        // User creation
        $user = User::create($validatedUser);

        // Response in json format
        return ResponseApi::sendApiResponse('success', 'Utilisateur créé avec succès !', ['user' => $user], 201);
    }

    /**
     * Affiche l'utilisateur authentifié (/api/me)
     */
    public function show(Request $request)
    {
        try {
            // Pour l'endpoint /api/me, nous utilisons l'utilisateur authentifié
            $user = Auth::user();
            
            // Journalisons les informations de session et d'authentification
            Log::info('Accès à /api/me', [
                'auth_check' => Auth::check(),
                'session_id' => $request->session()->getId(),
                'cookies' => array_keys($request->cookie()),
                'url' => $request->url(),
                'method' => $request->method(),
                'user_id' => Auth::id(),
                'origin' => $request->header('Origin'),
                'has_auth_header' => $request->hasHeader('Authorization'),
                'has_csrf_token' => $request->hasHeader('X-XSRF-TOKEN'),
                'csrf_token_length' => $request->header('X-XSRF-TOKEN') ? strlen($request->header('X-XSRF-TOKEN')) : 0
            ]);
            
            if (!$user) {
                // Renvoyer une réponse 401 détaillée pour faciliter le débogage
                return response()->json([
                    'status' => 'error',
                    'message' => 'Non authentifié ou session expirée',
                    'debug' => [
                        'session_id' => $request->session()->getId(),
                        'has_session' => $request->hasSession(),
                        'has_auth_user_id' => $request->session()->has('auth_user_id'),
                        'auth_user_id' => $request->session()->get('auth_user_id'),
                        'csrf_token_cookie' => $request->cookie('XSRF-TOKEN') ? 'présent' : 'absent',
                        'laravel_session' => $request->cookie(config('session.cookie')) ? 'présent' : 'absent',
                        'origin_header' => $request->header('Origin'),
                        'auth_header' => $request->header('Authorization'),
                        'csrf_header' => $request->hasHeader('X-XSRF-TOKEN') ? 'présent' : 'absent',
                    ]
                ], 401);
            }
            
            // Créer une réponse de succès avec les données utilisateur
            $response = ResponseApi::sendApiResponse('success', 'Utilisateur récupéré avec succès', ['user' => $user], 200);
            
            // Rafraîchir les cookies dans la réponse
            $this->refreshResponseCookies($request, $response);
            
            return $response;
        } catch (\Exception $e) {
            Log::error('Exception dans show() de UserController', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ResponseApi::sendApiResponse('fail', 'Erreur lors de la récupération de l\'utilisateur: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Rafraîchit les cookies dans la réponse
     */
    private function refreshResponseCookies($request, $response)
    {
        // Ensure CORS headers are directly added to the response
        if ($request->hasHeader('Origin')) {
            $origin = $request->header('Origin');
            $allowed_origins = config('cors.allowed_origins', []);
            if (in_array($origin, $allowed_origins) || in_array('*', $allowed_origins)) {
                $response->header('Access-Control-Allow-Origin', $origin);
                $response->header('Access-Control-Allow-Credentials', 'true');
                $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                $response->header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token, X-XSRF-TOKEN, X-Requested-With, Accept, Authorization');
                $response->header('Access-Control-Expose-Headers', 'X-XSRF-TOKEN');
            }
        }
        
        // Generate a fresh CSRF token for the response
        $xsrfToken = csrf_token();
        
        if ($xsrfToken) {
            // Set as a cookie with correct parameters
            $isLocalDev = config('app.env') === 'local';
            
            $response->cookie(
                'XSRF-TOKEN',
                $xsrfToken,
                config('session.lifetime', 120),
                '/',
                null,
                !$isLocalDev, // secure - false in local dev
                false, // httpOnly - must be false so JS can read it
                false, // raw
                'none' // sameSite - use 'none' for cross-origin requests
            );
            
            // Also add it as a header (some applications prefer this)
            $response->header('X-XSRF-TOKEN', $xsrfToken);
            
            Log::debug('New CSRF token set in response', [
                'token_length' => strlen($xsrfToken),
                'as_cookie' => true,
                'as_header' => true
            ]);
        }
        
        return $response;
    }

    /**
     * Affiche un utilisateur spécifique par ID (utilisé pour les requêtes qui ne sont pas /api/me)
     */
    public function showById(string $id)
    {
        try {
            $user = User::where('_id', $id)->firstOrFail();
            return response()->json($user);
        } catch (\Exception $e) {
            return ResponseApi::sendApiResponse('fail', 'Utilisateur non trouvé', null, 404);
        }
    }

    /**
     * Mise à jour des informations utilisateur
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        // Debug pour voir les données reçues
        Log::info('Update User Request', [
            'user' => $user,
            'request_data' => $request->all(),
            'is_authenticated' => Auth::check()
        ]);

        $validatedData = $this->create($request, $user->id);

        if (!empty($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        } else {
            unset($validatedData['password']);
        }

        // Mettre à jour les informations utilisateur
        try {
            // Using update method instead of save for MongoDB
            User::where('_id', $user->_id)->update($validatedData);
            
            return ResponseApi::sendApiResponse('success', 'Profil mis à jour avec succès.', $validatedData, 200);
        } catch (\Exception $e) {
            Log::error('Error updating user', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ResponseApi::sendApiResponse('fail', 'Erreur lors de la mise à jour du profil: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Supprime un utilisateur
     */
    public function destroy(string $id)
    {
        if(!Auth::check()) {
            return ResponseApi::sendApiResponse('fail','Vous devez êtres connecté pour supprimer votre profil', null,404);
        }

        $user = User::findOrFail($id);

        if(Auth::id() !== $user->id  && Auth::user()->user_type !== 'admin') {
            return ResponseApi::sendApiResponse('fail','Vous ne pouvez pas supprimer un autre utilisateur', null,403);
        } else {
            $user->delete();
            Auth::logout();

            return ResponseApi::sendApiResponse('success','Profil supprimé avec succès, Vous allez être redirigé vers l\'accueil', null,0);
        }
    }

    /**
     * Bannir un utilisateur
     */
    public function ban(string $id)
    {
        if(!Auth::check()) {
            return ResponseApi::sendApiResponse('fail','Vous devez être connecté pour effectuer cette action.', null,401);
        }

        $admin = Auth::user();

        if($admin->user_type !== 'admin') {
            return ResponseApi::sendApiResponse('fail','Vous n\'avez pas les droits pour effectuer cette action.', null,403);
        } else {
            try {
                $user = User::findOrFail($id);
                $updated = $user->update(['banned' => true]);

                if(!$updated) {
                    return ResponseApi::sendApiResponse('fail','Une erreur est survenue lors du bannissement de l\'utilisateur.', null,500);
                } else {
                    return ResponseApi::sendApiResponse('success','Utilisateur banni avec succès.', null,0);
                }
            } catch (\Exception $e) {
                return ResponseApi::sendApiResponse('fail','Utilisateur non trouvé.', null,404);
            }
        }
    }

    /**
     * Mise à jour d'un utilisateur via l'API publique (alternative sans authentification)
     */
    public function updatePublic(Request $request, string $id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Debug des données reçues
            Log::info('Update User Request via Public API', [
                'user_id' => $id,
                'request_data' => $request->all()
            ]);
            
            // Valider d'abord les champs de base (sans mot de passe)
            $baseRules = [
                'name' => 'required|string|max:255',
                'email' => [
                    'required',
                    'email',
                    Rule::unique('users', 'email')->ignore($id)
                ]
            ];
            
            $baseMessages = [
                'name.required' => 'Le champ nom est obligatoire.',
                'email.required' => 'Le champ email est obligatoire.',
                'email.email' => 'L\'adresse email doit être valide.',
            ];
            
            // Valider les champs de base
            $validatedData = $request->validate($baseRules, $baseMessages);
            
            // Mise à jour des données de base
            $user->name = $validatedData['name'];
            $user->email = $validatedData['email'];
            
            // Vérifier si un mot de passe a été fourni
            if ($request->filled('password')) {
                Log::info('Password update requested', ['user_id' => $id]);
                
                // Validation spécifique au mot de passe
                $passwordRules = [
                    'password' => [
                        'required',
                        'string',
                        'min:6',
                        'confirmed',
                        'regex:/[a-z]/',      // Au moins une lettre minuscule
                        'regex:/[A-Z]/',      // Au moins une lettre majuscule
                        'regex:/[0-9]/',      // Au moins un chiffre
                        'regex:/[@$!%*#?&]/', // Au moins un caractère spécial
                    ],
                ];
                
                $passwordMessages = [
                    'password.min' => 'Le mot de passe doit contenir au moins 6 caractères.',
                    'password.confirmed' => 'Les mots de passe ne correspondent pas.',
                    'password.regex' => 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial (@$!%*#?&).',
                ];
                
                try {
                    // Valider le mot de passe séparément
                    $validatedPassword = $request->validate($passwordRules, $passwordMessages);
                    
                    // Si la validation réussit, mettre à jour le mot de passe
                    $user->password = Hash::make($validatedPassword['password']);
                    Log::info('Password validation successful', ['user_id' => $id]);
                } catch (\Illuminate\Validation\ValidationException $passwordError) {
                    Log::error('Password validation failed', [
                        'user_id' => $id,
                        'error' => $passwordError->getMessage(),
                        'errors' => $passwordError->errors()
                    ]);
                    
                    // Renvoyer les erreurs de validation formatées pour le frontend
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Erreur de validation du mot de passe',
                        'errors' => $passwordError->errors()
                    ], 422);
                }
            }
            
            // Enregistrer les modifications
            try {
                $user->save();
                Log::info('User updated successfully', ['user_id' => $id]);
                return ResponseApi::sendApiResponse('success', 'Profil mis à jour avec succès.', $validatedData, 200);
            } catch (\Exception $saveError) {
                Log::error('Error saving user', [
                    'user_id' => $id,
                    'error' => $saveError->getMessage()
                ]);
                return ResponseApi::sendApiResponse('error', 'Erreur lors de l\'enregistrement: ' . $saveError->getMessage(), null, 500);
            }
        } catch (\Exception $e) {
            Log::error('Error updating user via public API', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ResponseApi::sendApiResponse('error', 'Erreur lors de la mise à jour du profil: ' . $e->getMessage(), null, 500);
        }
    }
}
