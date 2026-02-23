<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hosting_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('action'); // initial, renew, upgrade
            $table->string('package_from')->nullable();
            $table->string('package_to')->nullable();
            $table->decimal('price', 15, 0)->default(0);
            $table->integer('duration_months')->default(12);
            $table->date('start_date');
            $table->date('expiry_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hosting_histories');
    }
};
