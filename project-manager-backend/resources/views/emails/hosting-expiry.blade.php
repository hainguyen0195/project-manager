<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
                    {{-- Header --}}
                    <tr>
                        <td style="background:linear-gradient(135deg,#ef4444,#f97316);padding:32px;text-align:center;">
                            <h1 style="color:#ffffff;margin:0;font-size:24px;">
                                @if($project->own_hosting_expiry_date?->isPast())
                                    ⚠️ Hosting đã hết hạn
                                @else
                                    🔔 Hosting sắp hết hạn
                                @endif
                            </h1>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:32px;">
                            <p style="color:#374151;font-size:16px;margin:0 0 8px;">
                                Xin chào{{ $recipientType === 'client' && $project->client ? ' <strong>' . $project->client->name . '</strong>' : '' }},
                            </p>

                            @if($project->own_hosting_expiry_date?->isPast())
                                <p style="color:#dc2626;font-size:15px;font-weight:600;margin:16px 0;">
                                    Hosting cho dự án dưới đây đã hết hạn. Vui lòng gia hạn ngay để tránh gián đoạn dịch vụ.
                                </p>
                            @else
                                <p style="color:#374151;font-size:15px;margin:16px 0;">
                                    Chúng tôi xin thông báo hosting cho dự án dưới đây sắp hết hạn. Vui lòng chuẩn bị gia hạn để đảm bảo website hoạt động liên tục.
                                </p>
                            @endif

                            {{-- Project Info Card --}}
                            <table width="100%" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin:20px 0;" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px;">Dự án:</td>
                                                <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">{{ $project->name }}</td>
                                            </tr>
                                            @if($project->domain_name)
                                            <tr>
                                                <td style="padding:6px 0;color:#6b7280;font-size:13px;">Domain:</td>
                                                <td style="padding:6px 0;color:#2563eb;font-size:14px;">{{ $project->domain_name }}</td>
                                            </tr>
                                            @endif
                                            <tr>
                                                <td style="padding:6px 0;color:#6b7280;font-size:13px;">Gói hosting:</td>
                                                <td style="padding:6px 0;color:#111827;font-size:14px;">{{ $project->own_hosting_package ?? 'N/A' }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;color:#6b7280;font-size:13px;">Ngày hết hạn:</td>
                                                <td style="padding:6px 0;font-size:14px;font-weight:600;color:{{ $project->own_hosting_expiry_date?->isPast() ? '#dc2626' : '#f59e0b' }};">
                                                    {{ $project->own_hosting_expiry_date?->format('d/m/Y') ?? 'N/A' }}
                                                    @if($project->own_hosting_expiry_date)
                                                        @php
                                                            $days = (int) now()->diffInDays($project->own_hosting_expiry_date, false);
                                                        @endphp
                                                        @if($days < 0)
                                                            <span style="color:#dc2626;"> (đã hết hạn {{ abs($days) }} ngày)</span>
                                                        @elseif($days === 0)
                                                            <span style="color:#dc2626;"> (hết hạn hôm nay)</span>
                                                        @else
                                                            <span style="color:#f59e0b;"> (còn {{ $days }} ngày)</span>
                                                        @endif
                                                    @endif
                                                </td>
                                            </tr>
                                            @if($project->own_hosting_price > 0)
                                            <tr>
                                                <td style="padding:6px 0;color:#6b7280;font-size:13px;">Phí gia hạn:</td>
                                                <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">{{ number_format($project->own_hosting_price, 0, ',', '.') }}₫</td>
                                            </tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="color:#6b7280;font-size:14px;margin:20px 0 0;">
                                Nếu bạn cần hỗ trợ hoặc muốn gia hạn, vui lòng liên hệ chúng tôi ngay.
                            </p>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
                            <p style="color:#9ca3af;font-size:12px;margin:0;">
                                {{ config('app.name') }} — Hệ thống quản lý dự án
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
