export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const statusLabels = {
  pending: 'Chờ xử lý',
  in_progress: 'Đang thực hiện',
  demo: 'Demo',
  production: 'Production',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  demo: 'bg-purple-100 text-purple-800',
  production: 'bg-teal-100 text-teal-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const paymentLabels = {
  unpaid: 'Chưa thanh toán',
  deposit_paid: 'Đã cọc',
  fully_paid: 'Đã thanh toán',
};

export const paymentColors = {
  unpaid: 'bg-red-100 text-red-800',
  deposit_paid: 'bg-orange-100 text-orange-800',
  fully_paid: 'bg-green-100 text-green-800',
};
