import Link from "next/link";
import prisma from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import { getTypeLabel } from "@/lib/utils";
import { Prisma } from "@prisma/client";

const listingTypes = ["HOMESTAY", "HOTEL", "APARTMENT", "VILLA"] as const;

const sortOptions = [
  { value: "rating", label: "Đánh giá cao nhất" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "newest", label: "Mới nhất" },
];

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const {
    city,
    type,
    minPrice,
    maxPrice,
    guests,
    sort = "rating",
  } = await searchParams;

  const where: Prisma.ListingWhereInput = {};

  if (city && typeof city === "string") {
    where.city = { contains: city };
  }

  if (type && typeof type === "string" && listingTypes.includes(type as (typeof listingTypes)[number])) {
    where.type = type as (typeof listingTypes)[number];
  }

  if (minPrice && typeof minPrice === "string") {
    where.pricePerNight = { ...((where.pricePerNight as Prisma.IntFilter) || {}), gte: parseInt(minPrice) };
  }

  if (maxPrice && typeof maxPrice === "string") {
    where.pricePerNight = { ...((where.pricePerNight as Prisma.IntFilter) || {}), lte: parseInt(maxPrice) };
  }

  if (guests && typeof guests === "string") {
    where.maxGuests = { gte: parseInt(guests) };
  }

  let orderBy: Prisma.ListingOrderByWithRelationInput = { rating: "desc" };
  if (sort === "price_asc") orderBy = { pricePerNight: "asc" };
  else if (sort === "price_desc") orderBy = { pricePerNight: "desc" };
  else if (sort === "newest") orderBy = { createdAt: "desc" };

  const listings = await prisma.listing.findMany({
    where,
    orderBy,
    include: {
      host: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  const currentType = typeof type === "string" ? type : "";
  const currentCity = typeof city === "string" ? city : "";
  const currentMinPrice = typeof minPrice === "string" ? minPrice : "";
  const currentMaxPrice = typeof maxPrice === "string" ? maxPrice : "";
  const currentGuests = typeof guests === "string" ? guests : "";
  const currentSort = typeof sort === "string" ? sort : "rating";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tìm kiếm chỗ nghỉ</h1>
        <p className="mt-2 text-gray-500">
          {listings.length > 0
            ? `Tìm thấy ${listings.length} kết quả`
            : "Không tìm thấy kết quả phù hợp"}
          {currentCity && ` tại "${currentCity}"`}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filter Sidebar */}
        <aside className="w-full shrink-0 lg:w-72">
          <form method="GET" action="/listings" className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                Thành phố
              </label>
              <input
                type="text"
                id="city"
                name="city"
                defaultValue={currentCity}
                placeholder="Nhập tên thành phố..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loại hình
              </label>
              <div className="mt-2 space-y-2">
                {listingTypes.map((t) => (
                  <label key={t} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      defaultChecked={currentType === t}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{getTypeLabel(t)}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value=""
                    defaultChecked={!currentType}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Tất cả</span>
                </label>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Khoảng giá (VND)
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  name="minPrice"
                  defaultValue={currentMinPrice}
                  placeholder="Từ"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  name="maxPrice"
                  defaultValue={currentMaxPrice}
                  placeholder="Đến"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Guests */}
            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700">
                Số khách
              </label>
              <input
                type="number"
                id="guests"
                name="guests"
                min="1"
                defaultValue={currentGuests}
                placeholder="Số khách tối thiểu"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                Sắp xếp
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={currentSort}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Áp dụng bộ lọc
            </button>
          </form>
        </aside>

        {/* Listing Grid */}
        <div className="flex-1">
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} id={listing.id} title={listing.title} city={listing.city} type={listing.type} pricePerNight={listing.pricePerNight} rating={listing.rating} reviewCount={listing.reviewCount} images={listing.images} maxGuests={listing.maxGuests} bedrooms={listing.bedrooms} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-20">
              <svg
                className="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Không tìm thấy kết quả
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <Link
                href="/listings"
                className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Xóa bộ lọc
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
