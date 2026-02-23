<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServicePackage;
use Illuminate\Http\Request;

class ServicePackageController extends Controller
{
    public function index(Request $request)
    {
        $query = ServicePackage::orderBy('sort_order')->orderBy('category');

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('active_only')) {
            $query->where('is_active', true);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|in:website,hosting,service,addon',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $package = ServicePackage::create($validated);
        return response()->json($package, 201);
    }

    public function show(ServicePackage $servicePackage)
    {
        return response()->json($servicePackage);
    }

    public function update(Request $request, ServicePackage $servicePackage)
    {
        $validated = $request->validate([
            'category' => 'sometimes|string|in:website,hosting,service,addon',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $servicePackage->update($validated);
        return response()->json($servicePackage);
    }

    public function destroy(ServicePackage $servicePackage)
    {
        $servicePackage->delete();
        return response()->json(null, 204);
    }
}
