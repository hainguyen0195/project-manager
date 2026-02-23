import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, Check, Star, Zap, Shield, Globe,
  Server, Palette, Code, Headphones, ArrowLeft
} from 'lucide-react';

const websitePackages = [
  {
    name: 'Landing Page',
    price: '3.000.000',
    description: 'Trang giới thiệu cơ bản, phù hợp cho cá nhân và startup',
    features: [
      'Thiết kế 1 trang responsive',
      'Tối ưu SEO cơ bản',
      'Form liên hệ',
      'Tích hợp Google Maps',
      'Bàn giao trong 3-5 ngày',
      'Hỗ trợ 1 tháng miễn phí',
    ],
    icon: Zap,
    popular: false,
    color: 'blue',
  },
  {
    name: 'Website Doanh Nghiệp',
    price: '8.000.000',
    description: 'Website chuyên nghiệp cho doanh nghiệp vừa và nhỏ',
    features: [
      'Thiết kế 5-7 trang responsive',
      'Quản trị nội dung CMS',
      'Tối ưu SEO nâng cao',
      'Blog/Tin tức',
      'Đa ngôn ngữ',
      'SSL miễn phí',
      'Bàn giao trong 7-14 ngày',
      'Hỗ trợ 3 tháng miễn phí',
    ],
    icon: Star,
    popular: true,
    color: 'purple',
  },
  {
    name: 'Website Thương Mại',
    price: '15.000.000',
    description: 'Website bán hàng với đầy đủ tính năng thương mại điện tử',
    features: [
      'Thiết kế không giới hạn trang',
      'Quản lý sản phẩm & đơn hàng',
      'Thanh toán trực tuyến',
      'Quản lý kho hàng',
      'Báo cáo doanh thu',
      'Chat trực tuyến',
      'App quản lý mobile',
      'Bàn giao trong 14-30 ngày',
      'Hỗ trợ 6 tháng miễn phí',
    ],
    icon: Shield,
    popular: false,
    color: 'emerald',
  },
];

const hostingPackages = [
  { name: 'Cơ bản', price: '500.000', period: '/năm', specs: '1GB SSD, 10GB BW, 1 Domain', suitable: 'Landing Page' },
  { name: 'Tiêu chuẩn', price: '1.000.000', period: '/năm', specs: '5GB SSD, 50GB BW, 3 Domains', suitable: 'Website DN' },
  { name: 'Nâng cao', price: '2.000.000', period: '/năm', specs: '20GB SSD, Unlimited BW, 10 Domains', suitable: 'E-Commerce' },
  { name: 'VPS', price: '3.000.000', period: '/năm', specs: '4GB RAM, 80GB SSD, Root Access', suitable: 'Dự án lớn' },
];

const services = [
  { name: 'Thiết kế UI/UX', description: 'Thiết kế giao diện chuyên nghiệp theo yêu cầu', price: 'Từ 2.000.000₫', icon: Palette },
  { name: 'Lập trình Web App', description: 'Phát triển ứng dụng web theo yêu cầu (React, Laravel...)', price: 'Từ 10.000.000₫', icon: Code },
  { name: 'Quản lý Hosting & Domain', description: 'Đăng ký, gia hạn, quản lý hosting và tên miền', price: 'Từ 500.000₫/năm', icon: Server },
  { name: 'SSL Certificate', description: 'Chứng chỉ bảo mật SSL cho website', price: 'Miễn phí (Let\'s Encrypt)', icon: Shield },
  { name: 'SEO & Marketing', description: 'Tối ưu SEO, Google Ads, Facebook Ads', price: 'Từ 3.000.000₫/tháng', icon: Globe },
  { name: 'Bảo trì & Hỗ trợ', description: 'Bảo trì website, cập nhật nội dung, sửa lỗi', price: 'Từ 1.000.000₫/tháng', icon: Headphones },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 no-underline">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <FolderKanban size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">PM Tool</h1>
                <p className="text-xs text-gray-500">Bảng giá dịch vụ</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Bảng giá Dịch vụ</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Chúng tôi cung cấp các giải pháp website chuyên nghiệp với mức giá cạnh tranh,
            phù hợp cho mọi quy mô doanh nghiệp.
          </p>
        </div>

        {/* Website Packages */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Gói Website</h3>
          <p className="text-gray-500 text-center mb-8">Chọn gói phù hợp với nhu cầu của bạn</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {websitePackages.map((pkg, i) => {
              const Icon = pkg.icon;
              return (
                <div key={i} className={`bg-white rounded-2xl border-2 ${pkg.popular ? 'border-purple-400 shadow-lg shadow-purple-100' : 'border-gray-200'} p-6 relative flex flex-col`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      PHỔ BIẾN NHẤT
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    pkg.color === 'blue' ? 'bg-blue-100' : pkg.color === 'purple' ? 'bg-purple-100' : 'bg-emerald-100'
                  }`}>
                    <Icon size={24} className={
                      pkg.color === 'blue' ? 'text-blue-600' : pkg.color === 'purple' ? 'text-purple-600' : 'text-emerald-600'
                    } />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">{pkg.name}</h4>
                  <p className="text-sm text-gray-500 mt-1 mb-4">{pkg.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900">{pkg.price}₫</span>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {pkg.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full mt-6 py-3 rounded-xl font-medium text-sm transition-colors ${
                    pkg.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                    Liên hệ tư vấn
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Hosting Packages */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Gói Hosting</h3>
          <p className="text-gray-500 text-center mb-8">Hosting chất lượng cao, uptime 99.9%</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hostingPackages.map((pkg, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-md transition-all">
                <h4 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h4>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-primary-600">{pkg.price}₫</span>
                  <span className="text-sm text-gray-500">{pkg.period}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{pkg.specs}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                  Phù hợp: {pkg.suitable}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Dịch vụ khác</h3>
          <p className="text-gray-500 text-center mb-8">Các dịch vụ bổ sung đi kèm</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                      <p className="text-sm font-bold text-primary-600 mt-2">{service.price}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-3">Bạn cần tư vấn?</h3>
          <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">
            Liên hệ ngay để được tư vấn miễn phí và nhận báo giá chi tiết cho dự án của bạn.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="tel:0123456789" className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors no-underline">
              📞 0123 456 789
            </a>
            <a href="mailto:contact@pmtool.vn" className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors no-underline border border-white/30">
              ✉️ contact@pmtool.vn
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} PM Tool — Quản lý Dự án
        </div>
      </footer>
    </div>
  );
}
