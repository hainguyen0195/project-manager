<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewTicketCreatedNotification;
use App\Mail\TicketCompletedNotification;
use App\Models\Client;
use App\Models\Project;
use App\Models\Ticket;
use App\Models\User;
use App\Services\ZaloNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    public function storePublic(Request $request)
    {
        $validated = $request->validate([
            'client_code' => 'required|string|exists:clients,code',
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);

        $client = Client::where('code', $validated['client_code'])->firstOrFail();
        $project = Project::where('id', $validated['project_id'])
            ->where('client_id', $client->id)
            ->firstOrFail();

        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $attachments[] = Storage::disk('public')->putFile('tickets', $file);
            }
        }

        $ticket = Ticket::create([
            'client_id' => $client->id,
            'project_id' => $project->id,
            'public_code' => strtoupper(Str::random(10)),
            'title' => $validated['title'],
            'content' => $validated['content'],
            'attachments' => $attachments,
            'status' => 'open',
        ]);

        $ticket->load(['client', 'project']);
        $this->notifyAdminNewTicket($ticket);

        return response()->json([
            'message' => 'Đã gửi ticket thành công.',
            'ticket' => $ticket,
            'public_url' => rtrim(config('app.url'), '/') . '/ticket/' . $ticket->public_code,
        ], 201);
    }

    public function showPublic(string $code)
    {
        $ticket = Ticket::with(['project.client', 'completedBy'])->where('public_code', $code)->firstOrFail();
        $history = Ticket::where('project_id', $ticket->project_id)
            ->orderByDesc('created_at')
            ->take(20)
            ->get(['id', 'public_code', 'title', 'status', 'created_at', 'completed_at']);

        return response()->json([
            'ticket' => $ticket,
            'history' => $history,
        ]);
    }

    public function listPublicByProject(Request $request, Project $project)
    {
        $validated = $request->validate([
            'client_code' => 'required|string|exists:clients,code',
        ]);

        $client = Client::where('code', $validated['client_code'])->firstOrFail();
        if ((int) $project->client_id !== (int) $client->id) {
            return response()->json(['message' => 'Không có quyền truy cập ticket của dự án này.'], 403);
        }

        $tickets = Ticket::where('project_id', $project->id)
            ->orderByDesc('created_at')
            ->get(['id', 'public_code', 'title', 'status', 'created_at', 'completed_at']);

        return response()->json($tickets);
    }

    public function listByProject(Project $project)
    {
        $tickets = Ticket::with(['client:id,name,email,phone', 'completedBy:id,name'])
            ->where('project_id', $project->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($tickets);
    }

    public function complete(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'notify_channels' => 'nullable|array',
            'notify_channels.*' => 'in:email,zalo',
        ]);

        $ticket->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completed_by' => $request->user()->id,
        ]);

        $ticket->refresh()->load(['client', 'project']);

        $channels = $validated['notify_channels'] ?? [];
        $notifyResult = $this->notifyClientCompletedTicket($ticket, $channels);

        return response()->json([
            'message' => 'Đã hoàn thành ticket.',
            'ticket' => $ticket,
            'notify' => $notifyResult,
        ]);
    }

    public function destroy(Ticket $ticket)
    {
        if ($ticket->status !== 'completed') {
            return response()->json([
                'message' => 'Chỉ được xóa ticket đã hoàn thành.',
            ], 422);
        }

        foreach (($ticket->attachments ?? []) as $path) {
            Storage::disk('public')->delete($path);
        }

        $ticket->delete();
        return response()->json(null, 204);
    }

    private function notifyAdminNewTicket(Ticket $ticket): void
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            return;
        }

        $adminProjectUrl = rtrim(config('app.url'), '/') . '/projects/' . $ticket->project_id;
        $publicTicketUrl = rtrim(config('app.url'), '/') . '/ticket/' . $ticket->public_code;

        if ($admin->email) {
            Mail::to($admin->email)->send(
                new NewTicketCreatedNotification($ticket, $adminProjectUrl, $publicTicketUrl)
            );
        }

        $adminZaloPhone = env('ADMIN_ZALO_PHONE');
        if (!empty($adminZaloPhone)) {
            $message = "Ticket mới: {$ticket->title}\nDự án: {$ticket->project->name}\nMở nhanh: {$adminProjectUrl}";
            ZaloNotificationService::sendToPhone($adminZaloPhone, $message, [
                'type' => 'ticket_created',
                'ticket_code' => $ticket->public_code,
                'project_id' => $ticket->project_id,
            ]);
        }
    }

    private function notifyClientCompletedTicket(Ticket $ticket, array $channels): array
    {
        $results = [];
        $publicTicketUrl = rtrim(config('app.url'), '/') . '/ticket/' . $ticket->public_code;

        if (in_array('email', $channels, true) && $ticket->client && $ticket->client->email) {
            try {
                Mail::to($ticket->client->email)->send(new TicketCompletedNotification($ticket, $publicTicketUrl));
                $results[] = ['channel' => 'email', 'status' => 'sent'];
            } catch (\Throwable $e) {
                $results[] = ['channel' => 'email', 'status' => 'failed', 'error' => $e->getMessage()];
            }
        }

        if (in_array('zalo', $channels, true) && $ticket->client && $ticket->client->phone) {
            try {
                $message = "Ticket \"{$ticket->title}\" của bạn đã hoàn thành.\nXem chi tiết: {$publicTicketUrl}";
                ZaloNotificationService::sendToPhone($ticket->client->phone, $message, [
                    'type' => 'ticket_completed',
                    'ticket_code' => $ticket->public_code,
                    'project_id' => $ticket->project_id,
                ]);
                $results[] = ['channel' => 'zalo', 'status' => 'sent'];
            } catch (\Throwable $e) {
                $results[] = ['channel' => 'zalo', 'status' => 'failed', 'error' => $e->getMessage()];
            }
        }

        return $results;
    }
}

