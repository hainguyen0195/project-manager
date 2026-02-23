<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('design_link')->nullable();
            $table->string('demo_link')->nullable();
            $table->string('production_link')->nullable();

            // Domain info
            $table->string('domain_name')->nullable();
            $table->string('domain_provider')->nullable();
            $table->date('domain_expiry_date')->nullable();

            // Hosting info
            $table->string('hosting_provider')->nullable();
            $table->string('hosting_package')->nullable();
            $table->text('hosting_details')->nullable();

            // FTP info
            $table->string('ftp_host')->nullable();
            $table->string('ftp_username')->nullable();
            $table->string('ftp_password')->nullable();
            $table->string('ftp_port')->nullable();

            // Web config
            $table->text('web_config')->nullable();

            // SSL
            $table->string('ssl_provider')->nullable();
            $table->date('ssl_expiry_date')->nullable();
            $table->text('ssl_details')->nullable();

            // Dates
            $table->date('demo_upload_date')->nullable();
            $table->date('hosting_upload_date')->nullable();

            // Using own hosting/domain
            $table->boolean('using_own_hosting')->default(false);
            $table->date('own_hosting_start_date')->nullable();
            $table->integer('own_hosting_duration_months')->nullable();
            $table->date('own_hosting_expiry_date')->nullable();

            // Pricing
            $table->decimal('project_price', 15, 0)->default(0);
            $table->decimal('deposit_amount', 15, 0)->default(0);
            $table->date('deposit_date')->nullable();
            $table->decimal('remaining_amount', 15, 0)->default(0);
            $table->date('payment_completion_date')->nullable();
            $table->date('payment_due_date')->nullable();

            $table->enum('status', ['pending', 'in_progress', 'demo', 'production', 'completed', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'deposit_paid', 'fully_paid'])->default('unpaid');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
