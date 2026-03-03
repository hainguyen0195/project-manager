<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ticket mới</title>
</head>
<body style="font-family:Arial,sans-serif;background:#f8fafc;color:#1f2937;padding:20px;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;">
    <h2 style="margin:0 0 12px;color:#111827;">Ticket mới từ khách hàng</h2>
    <p><strong>Tiêu đề:</strong> {{ $ticket->title }}</p>
    <p><strong>Khách hàng:</strong> {{ $ticket->client->name ?? 'N/A' }}</p>
    <p><strong>Dự án:</strong> {{ $ticket->project->name ?? 'N/A' }}</p>
    <p><strong>Mã ticket:</strong> {{ $ticket->public_code }}</p>
    <div style="margin:16px 0;padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
      {!! $ticket->content !!}
    </div>
    <p>
      <a href="{{ $adminProjectUrl }}" style="display:inline-block;padding:10px 14px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
        Mở nhanh dự án trong admin
      </a>
    </p>
    <p>
      <a href="{{ $publicTicketUrl }}" style="color:#2563eb;">Xem trang ticket công khai</a>
    </p>
  </div>
</body>
</html>

