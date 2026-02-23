<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $fillable = [
        'project_id', 'type', 'recipient_email',
        'recipient_type', 'status', 'error_message', 'is_manual',
    ];

    protected $casts = [
        'is_manual' => 'boolean',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
