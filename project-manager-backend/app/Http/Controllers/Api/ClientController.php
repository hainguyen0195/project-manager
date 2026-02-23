<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::withCount('projects');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $sortField = $request->get('sort_field', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);

        return response()->json($query->paginate($request->get('per_page', 20)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:255|unique:clients,code',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $client = Client::create($validated);

        return response()->json($client, 201);
    }

    public function show(Client $client)
    {
        $client->loadCount('projects');
        $client->load('projects.images');

        $stats = [
            'total_projects' => $client->projects->count(),
            'total_revenue' => $client->projects->sum('project_price'),
            'total_deposit' => $client->projects->sum('deposit_amount'),
            'total_paid' => $client->projects->where('payment_status', 'fully_paid')->sum('project_price'),
            'total_debt' => $client->projects->sum('remaining_amount'),
        ];

        return response()->json([
            'client' => $client,
            'stats' => $stats,
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:255|unique:clients,code,' . $client->id,
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $client->update($validated);

        return response()->json($client);
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return response()->json(null, 204);
    }

    public function findByCode($code)
    {
        $client = Client::where('code', $code)->firstOrFail();
        $client->load(['projects' => function ($query) {
            $query->with('images')->orderBy('created_at', 'desc');
        }]);

        $stats = [
            'total_projects' => $client->projects->count(),
            'total_revenue' => $client->projects->sum('project_price'),
            'total_deposit' => $client->projects->sum('deposit_amount'),
            'total_debt' => $client->projects->sum('remaining_amount'),
        ];

        return response()->json([
            'client' => $client,
            'stats' => $stats,
        ]);
    }

    public function all()
    {
        return response()->json(Client::orderBy('name')->get(['id', 'name', 'code']));
    }
}
