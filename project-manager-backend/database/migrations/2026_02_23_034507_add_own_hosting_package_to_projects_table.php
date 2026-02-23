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
        Schema::table('projects', function (Blueprint $table) {
            $table->string('own_hosting_package')->nullable()->after('using_own_hosting');
            $table->decimal('own_hosting_price', 15, 0)->default(0)->after('own_hosting_package');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['own_hosting_package', 'own_hosting_price']);
        });
    }
};
