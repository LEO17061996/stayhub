import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import ImageGallery from "@/components/ImageGallery";
import BookingForm from "@/components/BookingForm";
import ReviewCard from "@/components/ReviewCard";
import { formatPrice, getTypeLabel } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { title: true, description: true, city: true },
  });

  if (!listing) {
    return { title: "Không tìm thấy" };
  }

  return {
    title: `${listing.title} - StayHub`,
    description: listing.description?.slice(0, 160),
  };
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
    </svg>
  ),
  parking: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  pool: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  kitchen: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  ),
  ac: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
};

const amenityLabels: Record<string, string> = {
  wifi: "Wi-Fi miễn phí",
  parking: "Bãi đỗ xe",
  pool: "Hồ bơi",
  kitchen: "Bếp",
  ac: "Điều hòa",
  tv: "TV",
  washer: "Máy giặt",
  balcony: "Ban công",
  garden: "Sân vườn",
  bbq: "Khu BBQ",
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      host: {
        select: { id: true, name: true, avatar: true, email: true, createdAt: true },
      },
      reviews: {
        include: {
          guest: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      bookings: {
        where: {
          status: { in: ["CONFIRMED", "PENDING"] },
        },
        select: { checkIn: true, checkOut: true },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  const avgRating =
    listing.reviews.length > 0
      ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/listings" className="hover:text-blue-600">
          Tìm kiếm
        </Link>
        <span>/</span>
        <span className="text-gray-900">{listing.title}</span>
      </nav>

      {/* Image Gallery */}
      <ImageGallery images={listing.images} />

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {listing.title}
                </h1>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {getTypeLabel(listing.type)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                  {listing.address}, {listing.city}
                </span>
                {avgRating > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {avgRating.toFixed(1)} ({listing.reviews.length} đánh giá)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-6 flex flex-wrap gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Tối đa {listing.maxGuests} khách
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              {listing.bedrooms} phòng ngủ
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              {formatPrice(listing.pricePerNight)} / đêm
            </div>
          </div>

          {/* Host Info */}
          <div className="mt-8 flex items-center gap-4 rounded-xl border border-gray-200 p-6">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-200">
              {listing.host.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.host.avatar}
                  alt={listing.host.name || "Host"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-100 text-xl font-semibold text-blue-600">
                  {listing.host.name?.[0]?.toUpperCase() || "H"}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Chủ nhà</p>
              <p className="font-semibold text-gray-900">{listing.host.name}</p>
              <p className="text-xs text-gray-400">
                Thành viên từ{" "}
                {new Date(listing.host.createdAt).toLocaleDateString("vi-VN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Mô tả</h2>
            <div className="mt-4 whitespace-pre-line text-gray-600 leading-relaxed">
              {listing.description}
            </div>
          </div>

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Tiện nghi</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {(JSON.parse(listing.amenities) as string[]).map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                  >
                    <span className="text-gray-500">
                      {amenityIcons[amenity] || (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm text-gray-700">
                      {amenityLabels[amenity] || amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900">
              Đánh giá ({listing.reviews.length})
            </h2>
            {listing.reviews.length > 0 ? (
              <div className="mt-6 space-y-6">
                {listing.reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    guestName={review.guest.name}
                    guestAvatar={review.guest.avatar}
                    rating={review.rating}
                    comment={review.comment}
                    createdAt={review.createdAt.toISOString()}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-gray-500">Chưa có đánh giá nào.</p>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <aside className="w-full shrink-0 lg:w-96">
          <div className="sticky top-8">
            <BookingForm
              listingId={listing.id}
              pricePerNight={listing.pricePerNight}
              maxGuests={listing.maxGuests}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
