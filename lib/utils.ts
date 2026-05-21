export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function calcNights(checkIn: Date | string, checkOut: Date | string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
    CONFIRMED: { label: "Đã xác nhận", color: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
    COMPLETED: { label: "Hoàn thành", color: "bg-blue-100 text-blue-800" },
    ACTIVE: { label: "Đang hoạt động", color: "bg-green-100 text-green-800" },
    INACTIVE: { label: "Ngừng hoạt động", color: "bg-gray-100 text-gray-800" },
  };
  return map[status] || { label: status, color: "bg-gray-100 text-gray-800" };
}

export function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    HOMESTAY: "Homestay",
    HOTEL: "Khách sạn",
    APARTMENT: "Căn hộ",
    VILLA: "Biệt thự",
  };
  return map[type] || type;
}

export const AMENITIES = [
  { key: "wifi", label: "Wifi", icon: "📶" },
  { key: "pool", label: "Hồ bơi", icon: "🏊" },
  { key: "parking", label: "Bãi đỗ xe", icon: "🅿️" },
  { key: "kitchen", label: "Bếp", icon: "🍳" },
  { key: "ac", label: "Điều hòa", icon: "❄️" },
  { key: "washer", label: "Máy giặt", icon: "🫧" },
  { key: "tv", label: "TV", icon: "📺" },
  { key: "garden", label: "Sân vườn", icon: "🌿" },
  { key: "bbq", label: "BBQ", icon: "🔥" },
  { key: "gym", label: "Phòng gym", icon: "💪" },
];

export const CITIES = [
  "TP. Hồ Chí Minh",
  "Đà Lạt",
  "Nha Trang",
  "Hội An",
  "Hà Nội",
  "Phú Quốc",
  "Đà Nẵng",
  "Vũng Tàu",
];
