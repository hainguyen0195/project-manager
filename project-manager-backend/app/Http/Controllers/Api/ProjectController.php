<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\HostingHistory;
use App\Models\ProjectImage;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::with(['client', 'images']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('domain_name', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('client_id') && $request->client_id) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_status') && $request->payment_status) {
            $query->where('payment_status', $request->payment_status);
        }

        $sortField = $request->get('sort_field', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);

        return response()->json($query->paginate($request->get('per_page', 20)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:255',
            'project_type' => 'nullable|string|in:new,upgrade,upload_source',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'description' => 'nullable|string',
            'design_link' => 'nullable|url|max:500',
            'demo_link' => 'nullable|url|max:500',
            'production_link' => 'nullable|url|max:500',
            'domain_name' => 'nullable|string|max:255',
            'domain_provider' => 'nullable|string|max:255',
            'domain_expiry_date' => 'nullable|date',
            'hosting_provider' => 'nullable|string|max:255',
            'hosting_package' => 'nullable|string|max:255',
            'hosting_details' => 'nullable|string',
            'ftp_host' => 'nullable|string|max:255',
            'ftp_username' => 'nullable|string|max:255',
            'ftp_password' => 'nullable|string|max:255',
            'ftp_port' => 'nullable|string|max:10',
            'web_config' => 'nullable|string',
            'ssl_provider' => 'nullable|string|max:255',
            'ssl_expiry_date' => 'nullable|date',
            'ssl_details' => 'nullable|string',
            'demo_upload_date' => 'nullable|date',
            'hosting_upload_date' => 'nullable|date',
            'using_own_hosting' => 'boolean',
            'own_hosting_package' => 'nullable|string|max:255',
            'own_hosting_price' => 'nullable|numeric|min:0',
            'own_hosting_start_date' => 'nullable|date',
            'own_hosting_duration_months' => 'nullable|integer',
            'own_hosting_expiry_date' => 'nullable|date',
            'project_price' => 'nullable|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'deposit_date' => 'nullable|date',
            'remaining_amount' => 'nullable|numeric|min:0',
            'payment_completion_date' => 'nullable|date',
            'payment_due_date' => 'nullable|date',
            'status' => 'nullable|in:pending,in_progress,demo,production,completed,cancelled',
            'payment_status' => 'nullable|in:unpaid,deposit_paid,fully_paid',
        ]);

        if (isset($validated['project_price']) && isset($validated['deposit_amount'])) {
            $validated['remaining_amount'] = $validated['project_price'] - $validated['deposit_amount'];
        }

        if (!empty($validated['production_link']) || !empty($validated['domain_name'])) {
            $currentStatus = $validated['status'] ?? 'pending';
            if (in_array($currentStatus, ['pending', 'in_progress', 'demo'])) {
                $validated['status'] = 'production';
            }
        }

        $project = Project::create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('projects', 'public');
                ProjectImage::create([
                    'project_id' => $project->id,
                    'image_path' => $path,
                    'original_name' => $image->getClientOriginalName(),
                    'sort_order' => $index,
                ]);
            }
        }

        if ($project->using_own_hosting && $project->own_hosting_start_date && $project->own_hosting_expiry_date) {
            HostingHistory::create([
                'project_id' => $project->id,
                'action' => 'initial',
                'package_to' => $project->own_hosting_package,
                'price' => $project->own_hosting_price ?? 0,
                'duration_months' => $project->own_hosting_duration_months ?? 12,
                'start_date' => $project->own_hosting_start_date,
                'expiry_date' => $project->own_hosting_expiry_date,
            ]);
        }

        return response()->json($project->load(['client', 'images', 'hostingHistories']), 201);
    }

    public function show(Project $project)
    {
        return response()->json($project->load(['client', 'images', 'hostingHistories']));
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'client_id' => 'sometimes|exists:clients,id',
            'name' => 'sometimes|required|string|max:255',
            'project_type' => 'nullable|string|in:new,upgrade,upload_source',
            'features' => 'nullable',
            'description' => 'nullable|string',
            'design_link' => 'nullable|max:500',
            'demo_link' => 'nullable|max:500',
            'production_link' => 'nullable|max:500',
            'domain_name' => 'nullable|string|max:255',
            'domain_provider' => 'nullable|string|max:255',
            'domain_expiry_date' => 'nullable|date',
            'hosting_provider' => 'nullable|string|max:255',
            'hosting_package' => 'nullable|string|max:255',
            'hosting_details' => 'nullable|string',
            'ftp_host' => 'nullable|string|max:255',
            'ftp_username' => 'nullable|string|max:255',
            'ftp_password' => 'nullable|string|max:255',
            'ftp_port' => 'nullable|string|max:10',
            'web_config' => 'nullable|string',
            'ssl_provider' => 'nullable|string|max:255',
            'ssl_expiry_date' => 'nullable|date',
            'ssl_details' => 'nullable|string',
            'demo_upload_date' => 'nullable|date',
            'hosting_upload_date' => 'nullable|date',
            'using_own_hosting' => 'boolean',
            'own_hosting_package' => 'nullable|string|max:255',
            'own_hosting_price' => 'nullable|numeric|min:0',
            'own_hosting_start_date' => 'nullable|date',
            'own_hosting_duration_months' => 'nullable|integer',
            'own_hosting_expiry_date' => 'nullable|date',
            'project_price' => 'nullable|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'deposit_date' => 'nullable|date',
            'remaining_amount' => 'nullable|numeric|min:0',
            'payment_completion_date' => 'nullable|date',
            'payment_due_date' => 'nullable|date',
            'status' => 'nullable|in:pending,in_progress,demo,production,completed,cancelled',
            'payment_status' => 'nullable|in:unpaid,deposit_paid,fully_paid',
        ]);

        if (isset($validated['features']) && is_string($validated['features'])) {
            $validated['features'] = json_decode($validated['features'], true);
        }

        if (isset($validated['project_price']) || isset($validated['deposit_amount'])) {
            $price = $validated['project_price'] ?? $project->project_price;
            $deposit = $validated['deposit_amount'] ?? $project->deposit_amount;
            $validated['remaining_amount'] = $price - $deposit;
        }

        $productionLink = $validated['production_link'] ?? $project->production_link;
        $domainName = $validated['domain_name'] ?? $project->domain_name;
        if (!empty($productionLink) || !empty($domainName)) {
            $currentStatus = $validated['status'] ?? $project->status;
            if (in_array($currentStatus, ['pending', 'in_progress', 'demo'])) {
                $validated['status'] = 'production';
            }
        }

        $project->update($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('projects', 'public');
                ProjectImage::create([
                    'project_id' => $project->id,
                    'image_path' => $path,
                    'original_name' => $image->getClientOriginalName(),
                    'sort_order' => $project->images()->count() + $index,
                ]);
            }
        }

        return response()->json($project->load(['client', 'images', 'hostingHistories']));
    }

    public function destroy(Project $project)
    {
        foreach ($project->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }
        $project->delete();
        return response()->json(null, 204);
    }

    public function deleteImage(ProjectImage $projectImage)
    {
        Storage::disk('public')->delete($projectImage->image_path);
        $projectImage->delete();
        return response()->json(null, 204);
    }

    public function allFeatures()
    {
        $features = Project::whereNotNull('features')
            ->pluck('features')
            ->flatten()
            ->unique()
            ->values();

        return response()->json($features);
    }

    public function statistics(Request $request)
    {
        $query = Project::query();

        if ($request->has('client_id') && $request->client_id) {
            $query->where('client_id', $request->client_id);
        }

        $projects = $query->get();

        return response()->json([
            'total_projects' => $projects->count(),
            'total_revenue' => $projects->sum('project_price'),
            'total_deposit' => $projects->sum('deposit_amount'),
            'total_paid' => $projects->where('payment_status', 'fully_paid')->sum('project_price'),
            'total_remaining' => $projects->sum('remaining_amount'),
            'by_status' => [
                'pending' => $projects->where('status', 'pending')->count(),
                'in_progress' => $projects->where('status', 'in_progress')->count(),
                'demo' => $projects->where('status', 'demo')->count(),
                'production' => $projects->where('status', 'production')->count(),
                'completed' => $projects->where('status', 'completed')->count(),
                'cancelled' => $projects->where('status', 'cancelled')->count(),
            ],
            'by_payment' => [
                'unpaid' => $projects->where('payment_status', 'unpaid')->count(),
                'deposit_paid' => $projects->where('payment_status', 'deposit_paid')->count(),
                'fully_paid' => $projects->where('payment_status', 'fully_paid')->count(),
            ],
        ]);
    }
}
