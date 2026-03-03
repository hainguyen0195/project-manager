<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Facades\Http;

class ZaloNotificationService
{
    public static function send(Project $project, string $type): array
    {
        $phone = self::normalizePhone($project->client ? $project->client->phone : null);
        if (empty($phone)) {
            throw new \RuntimeException('Khách hàng chưa có số điện thoại để gửi Zalo.');
        }

        $message = self::buildMessage($project, $type);

        $payload = [
            'channel' => 'zalo',
            'type' => $type,
            'phone' => $phone,
            'client' => [
                'id' => $project->client ? $project->client->id : null,
                'name' => $project->client ? $project->client->name : null,
                'email' => $project->client ? $project->client->email : null,
            ],
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'domain_name' => $project->domain_name,
                'payment_status' => $project->payment_status,
                'payment_due_date' => $project->payment_due_date ? $project->payment_due_date->format('Y-m-d') : null,
                'own_hosting_expiry_date' => $project->own_hosting_expiry_date ? $project->own_hosting_expiry_date->format('Y-m-d') : null,
                'remaining_amount' => (float) ($project->remaining_amount ?? 0),
            ],
            'message' => $message,
            'sent_at' => now()->toIso8601String(),
        ];

        return self::sendPayload($payload);
    }

    public static function sendToPhone(string $phone, string $message, array $meta = []): array
    {
        $normalizedPhone = self::normalizePhone($phone);
        if (empty($normalizedPhone)) {
            throw new \RuntimeException('Số điện thoại Zalo không hợp lệ.');
        }

        $payload = array_merge([
            'channel' => 'zalo',
            'type' => $meta['type'] ?? 'custom',
            'phone' => $normalizedPhone,
            'message' => $message,
            'sent_at' => now()->toIso8601String(),
        ], $meta);

        return self::sendPayload($payload);
    }

    private static function normalizePhone(?string $phone): ?string
    {
        if (empty($phone)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $phone);
        if (empty($digits)) {
            return null;
        }

        if (str_starts_with($digits, '84')) {
            return $digits;
        }

        if (str_starts_with($digits, '0')) {
            return '84' . substr($digits, 1);
        }

        return $digits;
    }

    private static function buildMessage(Project $project, string $type): string
    {
        $clientName = ($project->client && $project->client->name) ? $project->client->name : 'Quý khách';
        $domain = $project->domain_name ?: 'N/A';

        return match ($type) {
            'hosting_expiry' => "Chào {$clientName}, hosting của dự án \"{$project->name}\" ({$domain}) sắp/đã hết hạn vào ngày "
                . ($project->own_hosting_expiry_date ? $project->own_hosting_expiry_date->format('d/m/Y') : 'N/A') . '. Vui lòng kiểm tra để gia hạn.',
            'payment_due' => "Chào {$clientName}, dự án \"{$project->name}\" ({$domain}) đang đến hạn thanh toán. Số tiền còn lại: "
                . number_format((float) ($project->remaining_amount ?? 0), 0, ',', '.') . "đ. Vui lòng kiểm tra để thanh toán đúng hạn.",
            default => "Thông báo từ hệ thống cho dự án \"{$project->name}\".",
        };
    }

    private static function sendPayload(array $payload): array
    {
        $enabled = (bool) config('services.zalo.enabled');
        $webhookUrl = config('services.zalo.webhook_url');
        $timeout = (int) config('services.zalo.timeout', 10);

        if (!$enabled || empty($webhookUrl)) {
            throw new \RuntimeException('Zalo chưa được cấu hình. Vui lòng bật ZALO_ENABLED và thiết lập ZALO_WEBHOOK_URL.');
        }

        $response = Http::timeout($timeout)->post($webhookUrl, $payload);

        if ($response->failed()) {
            throw new \RuntimeException('Zalo webhook lỗi: HTTP ' . $response->status() . ' - ' . $response->body());
        }

        return [
            'phone' => $payload['phone'] ?? null,
            'status' => 'sent',
            'provider_response' => $response->json(),
        ];
    }
}
