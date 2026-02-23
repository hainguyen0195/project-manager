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
                        <td style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:32px;text-align:center;">
                            <h1 style="color:#ffffff;margin:0;font-size:24px;">
                                @if($project->payment_due_date?->isPast())
                                    ⚠️ Quá hạn thanh toán
                                @else
                                    💰 Nhắc nhở thanh toán
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

                            @if($project->payment_due_date?->isPast())
                                <p style="color:#dc2626;font-size:15px;font-weight:600;margin:16px 0;">
                                    Dự án dưới đây đã quá hạn thanh toán. Vui lòng hoàn tất thanh toán sớm nhất có thể.
                                </p>
                            @else
                                <p style="color:#374151;font-size:15px;margin:16px 0;">
                                    Chúng tôi xin nhắc nhở rằng dự án dưới đây sắp đến hạn thanh toán.
                                </p>
                            @endif

                            {{-- Project Info Card --}}
                            <table width="100%" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin:20px 0;" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding:6px 0;color:#6b7280;font-size:13px;width:160px;">Dự án:</td>
                                                <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">{{ $project->name }}</td>
                                            </tr>
                                            @if($project->client)
                                            <tr>
                                                <td style="padding:6px 0;color:#6b7280;font-size:13px;">Khách hàng:</td>
                                                <td style="padding:6px 0;color:#111827;font-size:14px;">{{ $project->client->name }}</td>
                                            </tr>
                                            @endif
                                            <tr>
                                                <td style="padding:6px 0;color:#6b7280;font-size:13px;">Giá dự án:</td>
                                                <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">{{ number_format($project->project_price, 0, ',', '.') }}₫</td>
                                            </tr>
                                            @if($project->deposit_amount > 0)
                                            <tr>
                                                <td style="padding:6px 0;color:#6b7280;font-size:13px;">Đã cọc:</td>
                                                <td style="padding:6px 0;color:#16a34a;font-size:14px;">{{ number_format($project->deposit_amount, 0, ',', '.') }}₫</td>
                                            </tr>
                                            @endif
                                            <tr>
                                                <td style="padding:6px 0;color:#6b7280;font-size:13px;">Số tiền còn lại:</td>
                                                <td style="padding:6px 0;color:#dc2626;font-size:16px;font-weight:700;">{{ number_format($project->remaining_amount, 0, ',', '.') }}₫</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;color:#6b7280;font-size:13px;">Hạn thanh toán:</td>
                                                <td style="padding:6px 0;font-size:14px;font-weight:600;color:{{ $project->payment_due_date?->isPast() ? '#dc2626' : '#f59e0b' }};">
                                                    {{ $project->payment_due_date?->format('d/m/Y') ?? 'N/A' }}
                                                    @if($project->payment_due_date)
                                                        @php
                                                            $days = (int) now()->diffInDays($project->payment_due_date, false);
                                                        @endphp
                                                        @if($days < 0)
                                                            <span style="color:#dc2626;"> (quá hạn {{ abs($days) }} ngày)</span>
                                                        @elseif($days === 0)
                                                            <span style="color:#dc2626;"> (hết hạn hôm nay)</span>
                                                        @else
                                                            <span style="color:#f59e0b;"> (còn {{ $days }} ngày)</span>
                                                        @endif
                                                    @endif
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="color:#6b7280;font-size:14px;margin:20px 0 0;">
                                Nếu bạn đã thanh toán, vui lòng bỏ qua email này. Liên hệ chúng tôi nếu cần hỗ trợ.
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
