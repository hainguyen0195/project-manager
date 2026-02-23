<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServicePackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'category', 'name', 'description', 'price', 'price_max',
        'unit', 'features', 'is_popular', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'price' => 'decimal:0',
        'price_max' => 'decimal:0',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
    ];
}
