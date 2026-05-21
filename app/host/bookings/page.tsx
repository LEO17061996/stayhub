import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatPrice, formatDate, getStatusLabel } from "@/lib/utils";
import BookingActions from "@/components/BookingActions";

export default async function HostBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  if ((session.user as any).role !== "HOST") {
    redirect("/");
  }

  const bookings = await prisma.booking.findMany({
    where: { listing: { hostId: (session.user as any).id } },
    include: {
      listing: {
        select: { id: true, title: true, city: true, images: true },
      },
      guest: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    COMPLETED: "bg-blue-100 text-blue-700",
  };

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý đặt phòng
          </h1>
          <p className="mt-2 text-gray-500">
            {bookings.length} đặt phòng
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                {pendingCount} chờ xác nhận
              </span>
            )}
          </p>
        </div>
        <Link
          href="/host"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Quay lại bảng điều khiển
        </Link>
      </div>

      {bookings.length > 0 ? (
        <div className="mt-8 space-y-4">
          {bookings.map((booking) => {
            const statusColor =
              statusColors[booking.status] || "bg-gray-100 text-gray-700";
            const thumbnail = booking.listing.images?.[0];

            return (
              <div
                key={booking.id}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Listing Thumbnail */}
                  <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:w-32">
                    {thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnail}
                        alt={booking.listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 3h18" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/listings/${booking.listing.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {booking.listing.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {booking.listing.city}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}
                      >
                        {getStatusLabel(booking.status).label}
                      </span>
                    </div>

                    {/* Guest Info */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-200">
                        {booking.guest.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={booking.guest.avatar}
                            alt={booking.guest.name || "Guest"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-blue-100 text-xs font-semibold text-blue-600">
                            {booking.guest.name?.[0]?.toUpperCase() || "G"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.guest.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.guest.email}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {formatDate(booking.checkIn)} -{" "}
                        {formatDate(booking.checkOut)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        {booking.guests} khách
                      </span>
                      <span className="font-semibold text-blue-600">
                        {formatPrice(booking.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions for pending bookings */}
                {booking.status === "PENDING" && (
                  <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
                    <BookingActions bookingId={booking.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-20">
          <svg
            className="h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Chưa có đặt phòng nào
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Khi có khách đặt phòng, thông tin sẽ hiển thị tại đây
          </p>
        </div>
      )}
    </div>
  );
}
