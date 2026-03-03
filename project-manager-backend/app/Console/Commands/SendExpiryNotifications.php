<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\NotificationController;
use App\Models\NotificationLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Console\Command;

class SendExpiryNotifications extends Command
{
    protected $signature = 'notifications:send-expiry {--days=7 : Số ngày trước hết hạn để gửi thông báo}';
    protected $description = 'Tự động gửi thông báo email + Zalo cho hosting hết hạn và thanh toán đến hạn';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $admin = User::where('role', 'admin')->first();
        $adminEmail = $admin ? $admin->email : null;
        $today = now()->startOfDay();
        $threshold = now()->addDays($days)->endOfDay();

        $this->info("Kiểm tra hosting & thanh toán hết hạn trong {$days} ngày tới...");

        $sentCount = 0;

        // 1. Hosting expiry
        $hostingProjects = Project::with('client')
            ->where('using_own_hosting', true)
            ->whereNotNull('own_hosting_expiry_date')
            ->where('own_hosting_expiry_date', '<=', $threshold)
            ->where('status', '!=', 'cancelled')
            ->get();

        foreach ($hostingProjects as $project) {
            if ($this->wasRecentlySent($project->id, 'hosting_expiry')) {
                $this->line("  ⏭ Đã gửi gần đây: {$project->name} (hosting)");
                continue;
            }

            $this->line("  📧 Gửi thông báo hosting: {$project->name}");

            if ($project->client && $project->client->email) {
                NotificationController::sendMail($project, 'hosting_expiry', $project->client->email, 'client', false);
                $sentCount++;
            }
            if (NotificationController::isZaloConfigured()) {
                NotificationController::sendZalo($project, 'hosting_expiry', false);
                $sentCount++;
            }
            if ($adminEmail) {
                NotificationController::sendMail($project, 'hosting_expiry', $adminEmail, 'admin', false);
                $sentCount++;
            }
        }

        // 2. Payment due
        $paymentProjects = Project::with('client')
            ->whereNotNull('payment_due_date')
            ->where('payment_due_date', '<=', $threshold)
            ->whereIn('payment_status', ['unpaid', 'deposit_paid'])
            ->where('status', '!=', 'cancelled')
            ->get();

        foreach ($paymentProjects as $project) {
            if ($this->wasRecentlySent($project->id, 'payment_due')) {
                $this->line("  ⏭ Đã gửi gần đây: {$project->name} (thanh toán)");
                continue;
            }

            $this->line("  📧 Gửi nhắc thanh toán: {$project->name}");

            if ($project->client && $project->client->email) {
                NotificationController::sendMail($project, 'payment_due', $project->client->email, 'client', false);
                $sentCount++;
            }
            if (NotificationController::isZaloConfigured()) {
                NotificationController::sendZalo($project, 'payment_due', false);
                $sentCount++;
            }
            if ($adminEmail) {
                NotificationController::sendMail($project, 'payment_due', $adminEmail, 'admin', false);
                $sentCount++;
            }
        }

        $this->info("Hoàn thành! Đã gửi {$sentCount} thông báo.");
        return Command::SUCCESS;
    }

    /**
     * Kiểm tra đã gửi loại thông báo này cho project trong 3 ngày gần đây chưa
     * (tránh spam khi chạy schedule hàng ngày).
     */
    private function wasRecentlySent(int $projectId, string $type): bool
    {
        return NotificationLog::where('project_id', $projectId)
            ->where('type', $type)
            ->where('status', 'sent')
            ->where('is_manual', false)
            ->where('created_at', '>=', now()->subDays(3))
            ->exists();
    }
}
