<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id', 'name', 'project_type', 'features',
        'description', 'design_link', 'demo_link', 'production_link',
        'domain_name', 'domain_provider', 'domain_expiry_date',
        'hosting_provider', 'hosting_package', 'hosting_details',
        'ftp_host', 'ftp_username', 'ftp_password', 'ftp_port',
        'web_config', 'ssl_provider', 'ssl_expiry_date', 'ssl_details',
        'demo_upload_date', 'hosting_upload_date',
        'using_own_hosting', 'own_hosting_package', 'own_hosting_price',
        'own_hosting_start_date', 'own_hosting_duration_months', 'own_hosting_expiry_date',
        'project_price', 'deposit_amount', 'deposit_date', 'remaining_amount',
        'payment_completion_date', 'payment_due_date',
        'status', 'payment_status',
    ];

    protected $casts = [
        'features' => 'array',
        'domain_expiry_date' => 'date',
        'ssl_expiry_date' => 'date',
        'demo_upload_date' => 'date',
        'hosting_upload_date' => 'date',
        'own_hosting_start_date' => 'date',
        'own_hosting_expiry_date' => 'date',
        'deposit_date' => 'date',
        'payment_completion_date' => 'date',
        'payment_due_date' => 'date',
        'using_own_hosting' => 'boolean',
        'own_hosting_price' => 'decimal:0',
        'project_price' => 'decimal:0',
        'deposit_amount' => 'decimal:0',
        'remaining_amount' => 'decimal:0',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function images()
    {
        return $this->hasMany(ProjectImage::class)->orderBy('sort_order');
    }

    public function hostingHistories()
    {
        return $this->hasMany(HostingHistory::class)->orderBy('created_at', 'desc');
    }

    public function notificationLogs()
    {
        return $this->hasMany(NotificationLog::class)->orderBy('created_at', 'desc');
    }
}
