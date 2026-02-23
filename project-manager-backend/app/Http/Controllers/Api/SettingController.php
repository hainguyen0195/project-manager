<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable|string',
            'settings.*.type' => 'nullable|string|in:text,image,json',
        ]);

        foreach ($validated['settings'] as $item) {
            Setting::set($item['key'], $item['value'], $item['type'] ?? 'text');
        }

        return response()->json(Setting::all()->pluck('value', 'key'));
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,gif,svg,webp|max:2048',
        ]);

        $path = $request->file('logo')->store('settings', 'public');
        Setting::set('site_logo', $path, 'image');

        return response()->json([
            'path' => $path,
            'url' => Storage::url($path),
        ]);
    }
}
