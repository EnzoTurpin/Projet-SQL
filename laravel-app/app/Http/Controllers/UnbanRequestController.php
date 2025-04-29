<?php

namespace App\Http\Controllers;

use App\Models\UnbanRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class UnbanRequestController extends Controller
{
    /**
     * Créer une nouvelle demande de débanissement
     */
    public function store(Request $request)
    {
        // Afficher les données reçues pour le débogage
        Log::info('Données de demande de débanissement reçues:', $request->all());

        // Valider la requête
        $validator = Validator::make($request->all(), [
            'user_id' => 'required',
            'user_email' => 'required|email',
            'user_name' => 'required|string',
            'reason' => 'required|string|min:10',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation échouée:', $validator->errors()->toArray());
            return response()->json([
                'status' => 'error',
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        // Vérifier si l'utilisateur a déjà une demande en attente
        $existingRequest = UnbanRequest::where('user_id', $request->user_id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous avez déjà une demande de débanissement en attente.'
            ], 400);
        }

        // Créer la demande
        $unbanRequest = UnbanRequest::create([
            'user_id' => $request->user_id,
            'user_email' => $request->user_email,
            'user_name' => $request->user_name,
            'reason' => $request->reason,
            'status' => 'pending'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Votre demande a été envoyée avec succès.',
            'data' => ['request' => $unbanRequest]
        ]);
    }

    /**
     * Récupérer toutes les demandes (pour les administrateurs)
     */
    public function index()
    {
        // Vérifier si l'utilisateur est connecté et admin
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Non authentifié',
            ], 401);
        }

        if ($user->user_type !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Non autorisé'
            ], 403);
        }

        // Récupérer toutes les demandes, triées par date (les plus récentes d'abord)
        $requests = UnbanRequest::orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'requests' => $requests
            ]
        ]);
    }

    /**
     * Approuver une demande de débanissement
     */
    public function approve($id)
    {
        // Vérifier si l'utilisateur est admin
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Non authentifié',
            ], 401);
        }

        if ($user->user_type !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Non autorisé'
            ], 403);
        }

        // Trouver la demande
        $request = UnbanRequest::find($id);
        
        if (!$request) {
            return response()->json([
                'status' => 'error',
                'message' => 'Demande non trouvée'
            ], 404);
        }

        // Si la demande n'est pas en attente, retourner une erreur
        if ($request->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cette demande a déjà été traitée.'
            ], 400);
        }

        // Mettre à jour le statut de la demande
        $request->status = 'approved';
        $request->save();

        // Mettre à jour le statut de bannissement de l'utilisateur
        $user = User::find($request->user_id);
        if ($user) {
            $user->banned = false;
            $user->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'La demande a été approuvée avec succès.',
            'data' => ['request' => $request]
        ]);
    }

    /**
     * Rejeter une demande de débanissement
     */
    public function reject($id)
    {
        // Vérifier si l'utilisateur est admin
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Non authentifié',
            ], 401);
        }

        if ($user->user_type !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Non autorisé'
            ], 403);
        }

        // Trouver la demande
        $request = UnbanRequest::find($id);
        
        if (!$request) {
            return response()->json([
                'status' => 'error',
                'message' => 'Demande non trouvée'
            ], 404);
        }

        // Si la demande n'est pas en attente, retourner une erreur
        if ($request->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cette demande a déjà été traitée.'
            ], 400);
        }

        // Mettre à jour le statut de la demande
        $request->status = 'rejected';
        $request->save();

        return response()->json([
            'status' => 'success',
            'message' => 'La demande a été rejetée.',
            'data' => ['request' => $request]
        ]);
    }
} 