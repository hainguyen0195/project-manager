<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Project;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $client1 = Client::create([
            'name' => 'Nguyễn Văn Minh',
            'email' => 'minhnguyen.test@gmail.com',
            'phone' => '0901234567',
            'company' => 'Công ty TNHH Minh Phát',
            'address' => '123 Nguyễn Huệ, Q.1, TP.HCM',
            'notes' => 'Khách hàng VIP, ưu tiên hỗ trợ',
        ]);

        $client2 = Client::create([
            'name' => 'Trần Thị Hương',
            'email' => 'huongtran.test@gmail.com',
            'phone' => '0912345678',
            'company' => 'Hương Boutique',
            'address' => '456 Lê Lợi, Q.3, TP.HCM',
            'notes' => 'Khách hàng thời trang',
        ]);

        $projects = [
            // Client 1 - 6 dự án
            [
                'client_id' => $client1->id,
                'name' => 'Website Minh Phát Corp',
                'project_type' => 'new',
                'domain_name' => 'minhphat.vn',
                'status' => 'production',
                'payment_status' => 'deposit_paid',
                'project_price' => 15000000,
                'deposit_amount' => 8000000,
                'remaining_amount' => 7000000,
                'deposit_date' => now()->subDays(30),
                'payment_due_date' => now()->addDays(3), // sắp đến hạn thanh toán
                'using_own_hosting' => true,
                'own_hosting_package' => 'standard',
                'own_hosting_price' => 1000000,
                'own_hosting_start_date' => now()->subMonths(11),
                'own_hosting_duration_months' => 12,
                'own_hosting_expiry_date' => now()->addDays(5), // sắp hết hạn hosting
            ],
            [
                'client_id' => $client1->id,
                'name' => 'Landing Page Sự kiện',
                'project_type' => 'new',
                'domain_name' => 'sukien-minhphat.com',
                'status' => 'completed',
                'payment_status' => 'fully_paid',
                'project_price' => 3000000,
                'deposit_amount' => 3000000,
                'remaining_amount' => 0,
                'deposit_date' => now()->subDays(60),
                'payment_completion_date' => now()->subDays(45),
                'using_own_hosting' => true,
                'own_hosting_package' => 'basic',
                'own_hosting_price' => 500000,
                'own_hosting_start_date' => now()->subMonths(10),
                'own_hosting_duration_months' => 12,
                'own_hosting_expiry_date' => now()->addMonths(2),
            ],
            [
                'client_id' => $client1->id,
                'name' => 'App Quản lý Kho',
                'project_type' => 'new',
                'domain_name' => 'kho.minhphat.vn',
                'status' => 'in_progress',
                'payment_status' => 'unpaid',
                'project_price' => 25000000,
                'deposit_amount' => 0,
                'remaining_amount' => 25000000,
                'payment_due_date' => now()->subDays(5), // đã quá hạn thanh toán
            ],
            [
                'client_id' => $client1->id,
                'name' => 'Website Tuyển dụng',
                'project_type' => 'new',
                'domain_name' => 'tuyendung-minhphat.vn',
                'status' => 'demo',
                'payment_status' => 'deposit_paid',
                'project_price' => 8000000,
                'deposit_amount' => 4000000,
                'remaining_amount' => 4000000,
                'deposit_date' => now()->subDays(15),
                'payment_due_date' => now()->addDays(15),
                'using_own_hosting' => true,
                'own_hosting_package' => 'standard',
                'own_hosting_price' => 1000000,
                'own_hosting_start_date' => now()->subDays(15),
                'own_hosting_duration_months' => 12,
                'own_hosting_expiry_date' => now()->addMonths(11),
            ],
            [
                'client_id' => $client1->id,
                'name' => 'Blog Doanh nghiệp',
                'project_type' => 'upgrade',
                'domain_name' => 'blog.minhphat.vn',
                'status' => 'production',
                'payment_status' => 'deposit_paid',
                'project_price' => 5000000,
                'deposit_amount' => 2500000,
                'remaining_amount' => 2500000,
                'deposit_date' => now()->subDays(20),
                'payment_due_date' => now()->addDays(1), // ngày mai hết hạn
                'using_own_hosting' => true,
                'own_hosting_package' => 'basic',
                'own_hosting_price' => 500000,
                'own_hosting_start_date' => now()->subMonths(12),
                'own_hosting_duration_months' => 12,
                'own_hosting_expiry_date' => now()->subDays(2), // đã hết hạn hosting
            ],
            [
                'client_id' => $client1->id,
                'name' => 'API Backend Nội bộ',
                'project_type' => 'new',
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'project_price' => 20000000,
                'deposit_amount' => 0,
                'remaining_amount' => 20000000,
                'payment_due_date' => now()->addDays(30),
            ],

            // Client 2 - 4 dự án
            [
                'client_id' => $client2->id,
                'name' => 'Website Hương Boutique',
                'project_type' => 'new',
                'domain_name' => 'huongboutique.vn',
                'status' => 'production',
                'payment_status' => 'deposit_paid',
                'project_price' => 12000000,
                'deposit_amount' => 6000000,
                'remaining_amount' => 6000000,
                'deposit_date' => now()->subDays(40),
                'payment_due_date' => now()->addDays(2), // sắp hết hạn
                'using_own_hosting' => true,
                'own_hosting_package' => 'advanced',
                'own_hosting_price' => 2000000,
                'own_hosting_start_date' => now()->subMonths(11),
                'own_hosting_duration_months' => 12,
                'own_hosting_expiry_date' => now()->addDays(6), // sắp hết hạn hosting
            ],
            [
                'client_id' => $client2->id,
                'name' => 'Shop Online Thời trang',
                'project_type' => 'new',
                'domain_name' => 'shop.huongboutique.vn',
                'status' => 'completed',
                'payment_status' => 'fully_paid',
                'project_price' => 18000000,
                'deposit_amount' => 18000000,
                'remaining_amount' => 0,
                'deposit_date' => now()->subDays(90),
                'payment_completion_date' => now()->subDays(30),
                'using_own_hosting' => true,
                'own_hosting_package' => 'advanced',
                'own_hosting_price' => 2000000,
                'own_hosting_start_date' => now()->subMonths(6),
                'own_hosting_duration_months' => 12,
                'own_hosting_expiry_date' => now()->addMonths(6),
            ],
            [
                'client_id' => $client2->id,
                'name' => 'Landing Page Flash Sale',
                'project_type' => 'new',
                'domain_name' => 'sale.huongboutique.vn',
                'status' => 'production',
                'payment_status' => 'unpaid',
                'project_price' => 3500000,
                'deposit_amount' => 0,
                'remaining_amount' => 3500000,
                'payment_due_date' => now()->subDays(10), // quá hạn 10 ngày
                'using_own_hosting' => true,
                'own_hosting_package' => 'basic',
                'own_hosting_price' => 500000,
                'own_hosting_start_date' => now()->subMonths(13),
                'own_hosting_duration_months' => 12,
                'own_hosting_expiry_date' => now()->subDays(30), // đã hết hạn hosting 30 ngày
            ],
            [
                'client_id' => $client2->id,
                'name' => 'App Mobile Boutique',
                'project_type' => 'new',
                'status' => 'in_progress',
                'payment_status' => 'deposit_paid',
                'project_price' => 30000000,
                'deposit_amount' => 15000000,
                'remaining_amount' => 15000000,
                'deposit_date' => now()->subDays(10),
                'payment_due_date' => now()->addDays(20),
            ],
        ];

        foreach ($projects as $data) {
            Project::create($data);
        }

        $this->command->info('Đã tạo 2 khách hàng và 10 dự án test.');
        $this->command->info('');
        $this->command->info('Dự án CẦN gửi mail (hosting sắp/đã hết hạn):');
        $this->command->info('  - Website Minh Phát Corp (còn 5 ngày)');
        $this->command->info('  - Blog Doanh nghiệp (đã hết 2 ngày)');
        $this->command->info('  - Website Hương Boutique (còn 6 ngày)');
        $this->command->info('  - Landing Page Flash Sale (đã hết 30 ngày)');
        $this->command->info('');
        $this->command->info('Dự án CẦN gửi mail (thanh toán sắp/quá hạn):');
        $this->command->info('  - Website Minh Phát Corp (còn 3 ngày)');
        $this->command->info('  - App Quản lý Kho (quá hạn 5 ngày)');
        $this->command->info('  - Blog Doanh nghiệp (còn 1 ngày)');
        $this->command->info('  - Website Hương Boutique (còn 2 ngày)');
        $this->command->info('  - Landing Page Flash Sale (quá hạn 10 ngày)');
    }
}
