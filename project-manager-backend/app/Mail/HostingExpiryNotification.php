<?php

namespace App\Mail;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class HostingExpiryNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Project $project,
        public string $recipientType = 'client',
    ) {}

    public function envelope(): Envelope
    {
        $isExpired = $this->project->own_hosting_expiry_date?->isPast();
        $subject = $isExpired
            ? "[KHẨN CẤP] Hosting dự án \"{$this->project->name}\" đã hết hạn"
            : "Thông báo: Hosting dự án \"{$this->project->name}\" sắp hết hạn";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.hosting-expiry');
    }
}
