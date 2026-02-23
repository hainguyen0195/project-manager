<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\HostingExpiryNotification;
use App\Mail\PaymentDueNotification;
use App\Models\NotificationLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NotificationController extends Controller
{
    /**
     * Gửi mail thủ công cho 1 dự án.
     * POST /api/notifications/send
     * Body: { project_id, type: "hosting_expiry"|"payment_due" }
     */
    public function send(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'type' => 'required|in:hosting_expiry,payment_due',
        ]);

        $project = Project::with('client')->findOrFail($request->project_id);
        $type = $request->type;
        $results = [];

        $adminEmail = $this->getAdminEmail();

        // Send to client
        if ($project->client?->email) {
            $result = $this->sendMail($project, $type, $project->client->email, 'client', true);
            $results[] = $result;
        }

        // Send to admin
        if ($adminEmail) {
            $result = $this->sendMail($project, $type, $adminEmail, 'admin', true);
            $results[] = $result;
        }

        $sent = collect($results)->where('status', 'sent')->count();
        $failed = collect($results)->where('status', 'failed')->count();

        if ($sent === 0 && $failed === 0) {
            return response()->json([
                'message' => 'Không có email nào để gửi. Kiểm tra email khách hàng và admin.',
                'results' => [],
            ], 422);
        }

        return response()->json([
            'message' => "Đã gửi {$sent} email" . ($failed > 0 ? ", {$failed} thất bại" : ''),
            'results' => $results,
        ]);
    }

    /**
     * Lấy lịch sử notification của 1 project.
     * GET /api/notifications/project/{project}
     */
    public function projectLogs(Project $project)
    {
        $logs = $project->notificationLogs()
            ->latest()
            ->take(50)
            ->get();

        return response()->json($logs);
    }

    /**
     * Lấy tất cả notification logs gần đây.
     * GET /api/notifications/logs
     */
    public function allLogs(Request $request)
    {
        $logs = NotificationLog::with('project:id,name')
            ->latest()
            ->paginate(30);

        return response()->json($logs);
    }

    /**
     * Gửi mail logic chung — dùng cho cả manual và auto.
     */
    public static function sendMail(Project $project, string $type, string $email, string $recipientType, bool $isManual = false): array
    {
        try {
            $mailable = match ($type) {
                'hosting_expiry' => new HostingExpiryNotification($project, $recipientType),
                'payment_due' => new PaymentDueNotification($project, $recipientType),
            };

            Mail::to($email)->send($mailable);

            NotificationLog::create([
                'project_id' => $project->id,
                'type' => $type,
                'recipient_email' => $email,
                'recipient_type' => $recipientType,
                'status' => 'sent',
                'is_manual' => $isManual,
            ]);

            return ['email' => $email, 'type' => $recipientType, 'status' => 'sent'];
        } catch (\Throwable $e) {
            NotificationLog::create([
                'project_id' => $project->id,
                'type' => $type,
                'recipient_email' => $email,
                'recipient_type' => $recipientType,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'is_manual' => $isManual,
            ]);

            return ['email' => $email, 'type' => $recipientType, 'status' => 'failed', 'error' => $e->getMessage()];
        }
    }

    private function getAdminEmail(): ?string
    {
        $admin = User::where('role', 'admin')->first();
        return $admin?->email;
    }
}
