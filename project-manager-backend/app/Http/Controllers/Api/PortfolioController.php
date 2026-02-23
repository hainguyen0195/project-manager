<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use App\Models\PortfolioCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PortfolioController extends Controller
{
    // Categories
    public function categories()
    {
        return response()->json(
            PortfolioCategory::withCount(['portfolios' => function ($q) {
                $q->where('is_active', true);
            }])->orderBy('sort_order')->get()
        );
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:portfolio_categories',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = PortfolioCategory::create($validated);
        return response()->json($category, 201);
    }

    public function updateCategory(Request $request, PortfolioCategory $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255|unique:portfolio_categories,slug,' . $category->id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    public function destroyCategory(PortfolioCategory $category)
    {
        $category->delete();
        return response()->json(null, 204);
    }

    // Portfolios
    public function index(Request $request)
    {
        $query = Portfolio::with(['project.images', 'project.client', 'category'])
            ->orderBy('sort_order');

        if ($request->has('category_id')) {
            $query->where('portfolio_category_id', $request->category_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'portfolio_category_id' => 'required|exists:portfolio_categories,id',
            'display_name' => 'nullable|string|max:255',
            'short_description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $existing = Portfolio::where('project_id', $validated['project_id'])
            ->where('portfolio_category_id', $validated['portfolio_category_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Dự án đã tồn tại trong hạng mục này'], 422);
        }

        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('portfolios', 'public');
        }

        $portfolio = Portfolio::create($validated);
        return response()->json($portfolio->load(['project.images', 'project.client', 'category']), 201);
    }

    public function update(Request $request, Portfolio $portfolio)
    {
        $validated = $request->validate([
            'portfolio_category_id' => 'sometimes|exists:portfolio_categories,id',
            'display_name' => 'nullable|string|max:255',
            'short_description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('thumbnail')) {
            if ($portfolio->thumbnail) {
                Storage::disk('public')->delete($portfolio->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('portfolios', 'public');
        }

        $portfolio->update($validated);
        return response()->json($portfolio->load(['project.images', 'project.client', 'category']));
    }

    public function destroy(Portfolio $portfolio)
    {
        if ($portfolio->thumbnail) {
            Storage::disk('public')->delete($portfolio->thumbnail);
        }
        $portfolio->delete();
        return response()->json(null, 204);
    }

    // Batch add projects to portfolio
    public function batchAdd(Request $request)
    {
        $validated = $request->validate([
            'portfolio_category_id' => 'required|exists:portfolio_categories,id',
            'project_ids' => 'required|array',
            'project_ids.*' => 'exists:projects,id',
        ]);

        $added = [];
        foreach ($validated['project_ids'] as $projectId) {
            $existing = Portfolio::where('project_id', $projectId)
                ->where('portfolio_category_id', $validated['portfolio_category_id'])
                ->first();

            if (!$existing) {
                $added[] = Portfolio::create([
                    'project_id' => $projectId,
                    'portfolio_category_id' => $validated['portfolio_category_id'],
                ]);
            }
        }

        return response()->json(
            Portfolio::with(['project.images', 'project.client', 'category'])
                ->where('portfolio_category_id', $validated['portfolio_category_id'])
                ->orderBy('sort_order')
                ->get()
        );
    }

    // Batch remove
    public function batchRemove(Request $request)
    {
        $validated = $request->validate([
            'portfolio_ids' => 'required|array',
            'portfolio_ids.*' => 'exists:portfolios,id',
        ]);

        Portfolio::whereIn('id', $validated['portfolio_ids'])->delete();
        return response()->json(null, 204);
    }

    // Public endpoint
    public function publicIndex()
    {
        $categories = PortfolioCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->with(['portfolios' => function ($q) {
                $q->where('is_active', true)
                    ->orderBy('sort_order')
                    ->with(['project.images', 'project.client']);
            }])
            ->get();

        return response()->json($categories);
    }
}
