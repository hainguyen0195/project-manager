<?php

namespace Database\Seeders;

use App\Models\Portfolio;
use App\Models\PortfolioCategory;
use App\Models\Project;
use App\Models\ServicePackage;
use Illuminate\Database\Seeder;

class ServiceAndPortfolioSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedServicePackages();
        $this->seedPortfolio();
    }

    private function seedServicePackages(): void
    {
        $packages = [
            [
                'category' => 'website',
                'name' => 'Website Cơ Bản',
                'description' => 'Phù hợp giới thiệu doanh nghiệp nhỏ, giao diện responsive.',
                'price' => 4500000,
                'price_max' => 7000000,
                'unit' => 'dự án',
                'features' => ['Responsive', 'Form liên hệ', 'SEO cơ bản', 'Tốc độ tối ưu'],
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'category' => 'website',
                'name' => 'Website Nâng Cao',
                'description' => 'Có quản trị nội dung, nhiều module, tối ưu chuyển đổi.',
                'price' => 9000000,
                'price_max' => 18000000,
                'unit' => 'dự án',
                'features' => ['CMS quản trị', 'Trang dịch vụ', 'Portfolio', 'Chuẩn UI/UX'],
                'is_popular' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'category' => 'hosting',
                'name' => 'Hosting Basic',
                'description' => 'Gói hosting phù hợp website giới thiệu.',
                'price' => 1200000,
                'price_max' => null,
                'unit' => 'năm',
                'features' => ['1GB SSD', 'SSL miễn phí', 'Daily backup'],
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'category' => 'hosting',
                'name' => 'Hosting Standard',
                'description' => 'Gói hosting cho website doanh nghiệp vừa.',
                'price' => 2200000,
                'price_max' => null,
                'unit' => 'năm',
                'features' => ['5GB SSD', 'SSL', 'Backup tự động', 'Anti-DDoS'],
                'is_popular' => true,
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'category' => 'service',
                'name' => 'Bảo Trì Website',
                'description' => 'Theo dõi hoạt động website, backup, cập nhật định kỳ.',
                'price' => 800000,
                'price_max' => 2500000,
                'unit' => 'tháng',
                'features' => ['Giám sát uptime', 'Backup', 'Vá lỗi bảo mật', 'Hỗ trợ kỹ thuật'],
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'category' => 'service',
                'name' => 'SEO Tổng Thể',
                'description' => 'Tối ưu kỹ thuật và nội dung, tăng thứ hạng tìm kiếm.',
                'price' => 3500000,
                'price_max' => 12000000,
                'unit' => 'tháng',
                'features' => ['Audit SEO', 'Keyword plan', 'Onpage', 'Báo cáo hàng tháng'],
                'is_popular' => true,
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'category' => 'addon',
                'name' => 'Tích Hợp Chat/Zalo',
                'description' => 'Tích hợp kênh chat và chăm sóc khách hàng.',
                'price' => 500000,
                'price_max' => 1500000,
                'unit' => 'dịch vụ',
                'features' => ['Nút liên hệ', 'Theo dõi chuyển đổi', 'Tùy biến giao diện'],
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 7,
            ],
            [
                'category' => 'addon',
                'name' => 'Landing Page Chiến Dịch',
                'description' => 'Trang đích tối ưu quảng cáo cho chiến dịch ngắn hạn.',
                'price' => 1800000,
                'price_max' => 4500000,
                'unit' => 'dự án',
                'features' => ['A/B layout', 'Tối ưu CTA', 'Form thu lead'],
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 8,
            ],
        ];

        foreach ($packages as $package) {
            ServicePackage::updateOrCreate(
                ['category' => $package['category'], 'name' => $package['name']],
                $package
            );
        }
    }

    private function seedPortfolio(): void
    {
        $categories = [
            [
                'name' => 'Website Doanh Nghiệp',
                'slug' => 'website-doanh-nghiep',
                'description' => 'Các dự án website giới thiệu công ty, thương hiệu.',
                'icon' => 'Building2',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Website Bán Hàng',
                'slug' => 'website-ban-hang',
                'description' => 'Các dự án e-commerce, landing page bán hàng.',
                'icon' => 'ShoppingCart',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Landing Page',
                'slug' => 'landing-page',
                'description' => 'Các mẫu landing page chạy chiến dịch quảng cáo.',
                'icon' => 'Rocket',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        $categoryMap = [];
        foreach ($categories as $category) {
            $saved = PortfolioCategory::updateOrCreate(['slug' => $category['slug']], $category);
            $categoryMap[] = $saved;
        }

        $projects = Project::query()
            ->whereIn('status', ['production', 'completed', 'demo'])
            ->orderByDesc('created_at')
            ->take(18)
            ->get();

        if ($projects->isEmpty()) {
            if ($this->command) {
                $this->command->warn('Không có project phù hợp để tạo portfolio.');
            }
            return;
        }

        foreach ($projects as $index => $project) {
            $category = $categoryMap[$index % count($categoryMap)];

            Portfolio::updateOrCreate(
                [
                    'project_id' => $project->id,
                    'portfolio_category_id' => $category->id,
                ],
                [
                    'display_name' => $project->name,
                    'short_description' => $project->description ?: 'Dự án tiêu biểu cho danh mục ' . $category->name,
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ]
            );
        }
    }
}

