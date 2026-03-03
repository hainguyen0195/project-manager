<?php

namespace App\Mail;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewTicketCreatedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Ticket $ticket,
        public string $adminProjectUrl,
        public string $publicTicketUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Ticket mới] ' . $this->ticket->title
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ticket-created'
        );
    }
}

