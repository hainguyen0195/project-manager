<?php

namespace App\Mail;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentDueNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Project $project,
        public string $recipientType = 'client',
    ) {}

    public function envelope(): Envelope
    {
        $isOverdue = $this->project->payment_due_date?->isPast();
        $subject = $isOverdue
            ? "[KHẨN CẤP] Dự án \"{$this->project->name}\" đã quá hạn thanh toán"
            : "Nhắc nhở: Dự án \"{$this->project->name}\" sắp đến hạn thanh toán";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.payment-due');
    }
}
