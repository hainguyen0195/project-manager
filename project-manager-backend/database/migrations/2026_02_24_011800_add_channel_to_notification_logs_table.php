<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notification_logs', function (Blueprint $table) {
            $table->string('channel', 20)->default('email')->after('type');
            $table->string('recipient_phone')->nullable()->after('recipient_email');
            $table->index(['project_id', 'type', 'channel']);
        });
    }

    public function down(): void
    {
        Schema::table('notification_logs', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'type', 'channel']);
            $table->dropColumn(['channel', 'recipient_phone']);
        });
    }
};
