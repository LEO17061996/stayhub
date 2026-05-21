import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatPrice, formatDate, getStatusLabel } from "@/lib/utils";

export default async function HostDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  if ((session.user as any).role !== "HOST") {
    redirect("/");
  }

  const hostId = (session.user as any).id;

  const [listings, bookings, reviews] = await Promise.all([
    prisma.listing.findMany({
      where: { hostId },
      select: { id: true, title: true, pricePerNight: true, rating: true },
    }),
    prisma.booking.findMany({
      where: { listing: { hostId } },
      include: {
        listing: { select: { title: true } },
        guest: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { listing: { hostId } },
      select: { rating: true },
    }),
  ]);

  const totalListings = listings.length;
  const totalBookings = bookings.length;
  const totalRevenue = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const recentBookings = bookings.slice(0, 10);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    COMPLETED: "bg-blue-100 text-blue-700",
  };

  const stats = [
    {
      label: "Tổng chỗ nghỉ",
      value: totalListings.toString(),
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Tổng đặt phòng",
      value: totalBookings.toString(),
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Tổng doanh thu",
      value: formatPrice(totalRevenue),
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Đánh giá TB",
      value: avgRating > 0 ? avgRating.toFixed(1) : "N/A",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bảng điều khiển
          </h1>
          <p className="mt-2 text-gray-500">
            Xin chào, {session.user.name}! Đây là tổng quan hoạt động của bạn.
          </p>
        </div>
        <Link
          href="/host/listings/new"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Thêm chỗ nghỉ
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/host/listings"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Quản lý chỗ nghỉ
        </Link>
        <Link
          href="/host/bookings"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Quản lý đặt phòng
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Đặt phòng gần đây
          </h2>
          <Link
            href="/host/bookings"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Xem tất cả
          </Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Khách</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Chỗ nghỉ</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ngày</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Tổng tiền</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookings.map((booking) => {
                  const statusColor =
                    statusColors[booking.status] || "bg-gray-100 text-gray-700";
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.guest.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.guest.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {booking.listing.title}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatDate(booking.checkIn)} -{" "}
                        {formatDate(booking.checkOut)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatPrice(booking.totalPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                        >
                          {getStatusLabel(booking.status).label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">Chưa có đặt phòng nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
