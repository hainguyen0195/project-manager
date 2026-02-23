<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('portfolio_category_id')->constrained()->onDelete('cascade');
            $table->string('display_name')->nullable();
            $table->text('short_description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['project_id', 'portfolio_category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolios');
    }
};
