<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('type', 30); // hosting_expiry, payment_due
            $table->string('recipient_email');
            $table->string('recipient_type', 20); // client, admin
            $table->string('status', 20)->default('sent'); // sent, failed
            $table->text('error_message')->nullable();
            $table->boolean('is_manual')->default(false);
            $table->timestamps();

            $table->index(['project_id', 'type']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
