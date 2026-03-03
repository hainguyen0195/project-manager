<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\HostingExpiryNotification;
use App\Mail\PaymentDueNotification;
use App\Models\NotificationLog;
use App\Models\Project;
use App\Services\ZaloNotificationService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NotificationController extends Controller
{
    /**
     * Gửi thông báo thủ công cho 1 dự án (Email + Zalo).
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

        // Send to client email
        if ($project->client && $project->client->email) {
            $result = $this->sendMail($project, $type, $project->client->email, 'client', true);
            $results[] = $result;
        }

        // Send to client zalo
        if ($project->client && self::isZaloConfigured()) {
            $result = $this->sendZalo($project, $type, true);
            $results[] = $result;
        }

        // Send to admin email
        if ($adminEmail) {
            $result = $this->sendMail($project, $type, $adminEmail, 'admin', true);
            $results[] = $result;
        }

        $sent = collect($results)->where('status', 'sent')->count();
        $failed = collect($results)->where('status', 'failed')->count();

        if ($sent === 0 && $failed === 0) {
            return response()->json([
                'message' => 'Không có thông báo nào để gửi. Kiểm tra email/số điện thoại khách hàng và cấu hình Zalo.',
                'results' => [],
            ], 422);
        }

        $emailSent = collect($results)->where('status', 'sent')->where('channel', 'email')->count();
        $zaloSent = collect($results)->where('status', 'sent')->where('channel', 'zalo')->count();

        return response()->json([
            'message' => "Đã gửi {$sent} thông báo (Email: {$emailSent}, Zalo: {$zaloSent})" . ($failed > 0 ? ", {$failed} thất bại" : ''),
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
                'channel' => 'email',
                'recipient_email' => $email,
                'recipient_phone' => null,
                'recipient_type' => $recipientType,
                'status' => 'sent',
                'is_manual' => $isManual,
            ]);

            return ['channel' => 'email', 'email' => $email, 'type' => $recipientType, 'status' => 'sent'];
        } catch (\Throwable $e) {
            NotificationLog::create([
                'project_id' => $project->id,
                'type' => $type,
                'channel' => 'email',
                'recipient_email' => $email,
                'recipient_phone' => null,
                'recipient_type' => $recipientType,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'is_manual' => $isManual,
            ]);

            return ['channel' => 'email', 'email' => $email, 'type' => $recipientType, 'status' => 'failed', 'error' => $e->getMessage()];
        }
    }

    /**
     * Gửi Zalo cho khách hàng.
     */
    public static function sendZalo(Project $project, string $type, bool $isManual = false): array
    {
        try {
            $result = ZaloNotificationService::send($project, $type);
            $phone = $result['phone'] ?? null;

            NotificationLog::create([
                'project_id' => $project->id,
                'type' => $type,
                'channel' => 'zalo',
                'recipient_email' => '',
                'recipient_phone' => $phone,
                'recipient_type' => 'client',
                'status' => 'sent',
                'is_manual' => $isManual,
            ]);

            return ['channel' => 'zalo', 'phone' => $phone, 'type' => 'client', 'status' => 'sent'];
        } catch (\Throwable $e) {
            NotificationLog::create([
                'project_id' => $project->id,
                'type' => $type,
                'channel' => 'zalo',
                'recipient_email' => '',
                'recipient_phone' => $project->client ? $project->client->phone : null,
                'recipient_type' => 'client',
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'is_manual' => $isManual,
            ]);

            return [
                'channel' => 'zalo',
                'phone' => $project->client ? $project->client->phone : null,
                'type' => 'client',
                'status' => 'failed',
                'error' => $e->getMessage(),
            ];
        }
    }

    private function getAdminEmail(): ?string
    {
        $admin = User::where('role', 'admin')->first();
        return $admin ? $admin->email : null;
    }

    public static function isZaloConfigured(): bool
    {
        return (bool) config('services.zalo.enabled') && !empty(config('services.zalo.webhook_url'));
    }
}
