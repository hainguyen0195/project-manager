<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HostingHistory;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Http\Request;

class HostingController extends Controller
{
    public function history(Project $project)
    {
        return response()->json(
            $project->hostingHistories()->get()
        );
    }

    public function renew(Request $request, Project $project)
    {
        $validated = $request->validate([
            'duration_months' => 'required|integer|min:1|max:36',
            'notes' => 'nullable|string',
        ]);

        $currentExpiry = $project->own_hosting_expiry_date
            ? Carbon::parse($project->own_hosting_expiry_date)
            : Carbon::now();

        $startDate = $currentExpiry->copy();
        $newExpiry = $currentExpiry->copy()->addMonths($validated['duration_months']);

        $history = HostingHistory::create([
            'project_id' => $project->id,
            'action' => 'renew',
            'package_from' => $project->own_hosting_package,
            'package_to' => $project->own_hosting_package,
            'price' => $project->own_hosting_price,
            'duration_months' => $validated['duration_months'],
            'start_date' => $startDate,
            'expiry_date' => $newExpiry,
            'notes' => $validated['notes'] ?? null,
        ]);

        $totalMonths = ($project->own_hosting_duration_months ?? 0) + $validated['duration_months'];
        $project->update([
            'own_hosting_expiry_date' => $newExpiry,
            'own_hosting_duration_months' => $totalMonths,
        ]);

        return response()->json([
            'history' => $history,
            'project' => $project->fresh()->load(['client', 'images', 'hostingHistories']),
        ]);
    }

    public function upgrade(Request $request, Project $project)
    {
        $validated = $request->validate([
            'new_package' => 'required|string|in:basic,standard,advanced,vps',
            'new_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $history = HostingHistory::create([
            'project_id' => $project->id,
            'action' => 'upgrade',
            'package_from' => $project->own_hosting_package,
            'package_to' => $validated['new_package'],
            'price' => $validated['new_price'],
            'duration_months' => 0,
            'start_date' => Carbon::now(),
            'expiry_date' => $project->own_hosting_expiry_date ?? Carbon::now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        $project->update([
            'own_hosting_package' => $validated['new_package'],
            'own_hosting_price' => $validated['new_price'],
        ]);

        return response()->json([
            'history' => $history,
            'project' => $project->fresh()->load(['client', 'images', 'hostingHistories']),
        ]);
    }

    public function expiring(Request $request)
    {
        $days = $request->get('days', 30);

        $projects = Project::with('client')
            ->where('using_own_hosting', true)
            ->whereNotNull('own_hosting_expiry_date')
            ->where('own_hosting_expiry_date', '<=', Carbon::now()->addDays($days))
            ->orderBy('own_hosting_expiry_date', 'asc')
            ->get()
            ->map(function ($p) {
                $expiry = Carbon::parse($p->own_hosting_expiry_date);
                $p->days_until_expiry = (int) Carbon::now()->startOfDay()->diffInDays($expiry->startOfDay(), false);
                $p->is_expired = $expiry->isPast();
                return $p;
            });

        return response()->json($projects);
    }
}
