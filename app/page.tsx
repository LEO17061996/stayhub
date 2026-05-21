import Link from "next/link";
import prisma from "@/lib/prisma";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import { formatPrice } from "@/lib/utils";

const categories = [
  {
    name: "Homestay",
    type: "HOMESTAY",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    description: "Không gian ấm cúng, gần gũi thiên nhiên",
  },
  {
    name: "Khách sạn",
    type: "HOTEL",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    description: "Tiện nghi đầy đủ, dịch vụ chuyên nghiệp",
  },
  {
    name: "Căn hộ",
    type: "APARTMENT",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
      </svg>
    ),
    description: "Riêng tư, thoải mái như nhà của bạn",
  },
  {
    name: "Biệt thự",
    type: "VILLA",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
      </svg>
    ),
    description: "Sang trọng, đẳng cấp cho kỳ nghỉ trọn vẹn",
  },
];

const popularCities = [
  { name: "TP. Hồ Chí Minh", slug: "ho-chi-minh", image: "/images/cities/hcm.jpg" },
  { name: "Đà Lạt", slug: "da-lat", image: "/images/cities/dalat.jpg" },
  { name: "Nha Trang", slug: "nha-trang", image: "/images/cities/nhatrang.jpg" },
  { name: "Hội An", slug: "hoi-an", image: "/images/cities/hoian.jpg" },
  { name: "Phú Quốc", slug: "phu-quoc", image: "/images/cities/phuquoc.jpg" },
  { name: "Hà Nội", slug: "ha-noi", image: "/images/cities/hanoi.jpg" },
];

export default async function HomePage() {
  const featuredListings = await prisma.listing.findMany({
    take: 8,
    orderBy: { rating: "desc" },
    include: {
      host: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  const cityCounts = await Promise.all(
    popularCities.map(async (city) => {
      const count = await prisma.listing.count({
        where: { city: city.name },
      });
      return { ...city, count };
    })
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Khám phá Không gian Nghỉ dưỡng
              <br />
              Hoàn hảo
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl">
              Tìm kiếm và đặt phòng homestay, khách sạn, căn hộ trên khắp Việt Nam.
              Trải nghiệm kỳ nghỉ đáng nhớ cùng StayHub.
            </p>
            <div className="mx-auto mt-10 max-w-3xl">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Khám phá theo loại hình
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            Lựa chọn loại hình lưu trú phù hợp với nhu cầu của bạn
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.type}
              href={`/listings?type=${category.type}`}
              className="group rounded-2xl border border-gray-200 bg-white p-8 text-center transition-all hover:border-blue-300 hover:shadow-lg"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                {category.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {category.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Chỗ nghỉ nổi bật
              </h2>
              <p className="mt-3 text-lg text-gray-500">
                Những lựa chọn được đánh giá cao nhất từ khách hàng
              </p>
            </div>
            <Link
              href="/listings"
              className="hidden rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:block"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} id={listing.id} title={listing.title} city={listing.city} type={listing.type} pricePerNight={listing.pricePerNight} rating={listing.rating} reviewCount={listing.reviewCount} images={listing.images} maxGuests={listing.maxGuests} bedrooms={listing.bedrooms} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/listings"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Xem tất cả
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Điểm đến phổ biến
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            Khám phá những thành phố du lịch hàng đầu Việt Nam
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cityCounts.map((city) => (
            <Link
              key={city.slug}
              href={`/listings?city=${encodeURIComponent(city.name)}`}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className="aspect-[4/3] w-full bg-gradient-to-br from-gray-300 to-gray-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={city.image}
                  alt={city.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-xl font-bold text-white">{city.name}</h3>
                <p className="mt-1 text-sm text-gray-200">
                  {city.count} chỗ nghỉ
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
