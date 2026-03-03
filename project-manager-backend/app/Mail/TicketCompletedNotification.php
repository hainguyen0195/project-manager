<?php

namespace App\Mail;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketCompletedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Ticket $ticket,
        public string $publicTicketUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Đã hoàn thành] Ticket: ' . $this->ticket->title
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ticket-completed'
        );
    }
}

