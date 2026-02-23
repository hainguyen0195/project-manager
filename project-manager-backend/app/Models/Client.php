<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'code', 'email', 'phone', 'company', 'address', 'notes',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($client) {
            if (empty($client->code)) {
                $client->code = Str::slug($client->name) . '-' . Str::random(4);
            }
        });
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function getTotalProjectsAttribute()
    {
        return $this->projects()->count();
    }

    public function getTotalRevenueAttribute()
    {
        return $this->projects()->sum('project_price');
    }

    public function getTotalPaidAttribute()
    {
        return $this->projects()->sum('deposit_amount') +
               $this->projects()->where('payment_status', 'fully_paid')->sum('remaining_amount');
    }

    public function getTotalDebtAttribute()
    {
        return $this->total_revenue - $this->total_paid;
    }
}
