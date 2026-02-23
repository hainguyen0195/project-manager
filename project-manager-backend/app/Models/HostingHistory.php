<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HostingHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', 'action', 'package_from', 'package_to',
        'price', 'duration_months', 'start_date', 'expiry_date', 'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'expiry_date' => 'date',
        'price' => 'decimal:0',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
