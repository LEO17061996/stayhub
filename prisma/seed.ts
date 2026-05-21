import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const hash = bcrypt.hashSync("123456", 10);

  // Users
  const admin = await prisma.user.create({
    data: { name: "Admin", email: "admin@stayhub.com", password: hash, role: "ADMIN", phone: "0900000000" },
  });
  const host = await prisma.user.create({
    data: { name: "Nguyễn Văn Host", email: "host@stayhub.com", password: hash, role: "HOST", phone: "0901111111" },
  });
  const host2 = await prisma.user.create({
    data: { name: "Trần Thị Lan", email: "host2@stayhub.com", password: hash, role: "HOST", phone: "0902222222" },
  });
  const guest = await prisma.user.create({
    data: { name: "Lê Minh Khách", email: "guest@stayhub.com", password: hash, role: "GUEST", phone: "0903333333" },
  });
  const guest2 = await prisma.user.create({
    data: { name: "Phạm Anh Thư", email: "guest2@stayhub.com", password: hash, role: "GUEST", phone: "0904444444" },
  });

  console.log("Users created");

  // Listings
  const listings = await Promise.all([
    prisma.listing.create({ data: {
      hostId: host.id, title: "Homestay Đà Lạt View Đồi Thông", description: "Căn homestay xinh xắn nằm giữa đồi thông, view núi tuyệt đẹp. Phòng ấm cúng, có lò sưởi, bếp đầy đủ. Cách trung tâm 5km, yên tĩnh và lãng mạn.",
      type: "HOMESTAY", address: "123 Đường Hoa Hồng", city: "Đà Lạt", district: "Phường 10",
      latitude: 11.9404, longitude: 108.4583, pricePerNight: 650000, maxGuests: 4, bedrooms: 2, bathrooms: 1,
      amenities: JSON.stringify(["wifi","kitchen","garden","parking","ac"]),
      images: JSON.stringify([]), rating: 4.8, reviewCount: 12,
    }}),
    prisma.listing.create({ data: {
      hostId: host.id, title: "Villa Biển Nha Trang Luxury", description: "Villa sang trọng ngay bãi biển Nha Trang, hồ bơi riêng, sân vườn rộng. Phù hợp gia đình và nhóm bạn. View biển 180 độ từ ban công.",
      type: "VILLA", address: "45 Trần Phú", city: "Nha Trang", district: "Lộc Thọ",
      latitude: 12.2388, longitude: 109.1967, pricePerNight: 3500000, maxGuests: 10, bedrooms: 4, bathrooms: 3,
      amenities: JSON.stringify(["wifi","pool","kitchen","parking","ac","bbq","garden","tv"]),
      images: JSON.stringify([]), rating: 4.9, reviewCount: 8,
    }}),
    prisma.listing.create({ data: {
      hostId: host.id, title: "Căn hộ Studio Sài Gòn Central", description: "Căn hộ studio hiện đại ngay trung tâm Q1, đầy đủ nội thất cao cấp. Gần chợ Bến Thành, phố đi bộ Nguyễn Huệ. Tiện di chuyển.",
      type: "APARTMENT", address: "78 Nguyễn Trãi", city: "TP. Hồ Chí Minh", district: "Quận 1",
      latitude: 10.7769, longitude: 106.7009, pricePerNight: 800000, maxGuests: 2, bedrooms: 1, bathrooms: 1,
      amenities: JSON.stringify(["wifi","ac","tv","washer","gym"]),
      images: JSON.stringify([]), rating: 4.5, reviewCount: 20,
    }}),
    prisma.listing.create({ data: {
      hostId: host2.id, title: "Khách sạn Boutique Hội An", description: "Khách sạn boutique phong cách Indochine giữa phố cổ Hội An. Bữa sáng miễn phí, xe đạp miễn phí. Cách biển An Bàng 3km.",
      type: "HOTEL", address: "12 Trần Hưng Đạo", city: "Hội An", district: "Minh An",
      latitude: 15.8801, longitude: 108.3380, pricePerNight: 1200000, maxGuests: 2, bedrooms: 1, bathrooms: 1,
      amenities: JSON.stringify(["wifi","ac","tv","parking"]),
      images: JSON.stringify([]), rating: 4.7, reviewCount: 15,
    }}),
    prisma.listing.create({ data: {
      hostId: host2.id, title: "Homestay Phú Quốc Beachfront", description: "Homestay ngay bãi biển Phú Quốc, bungalow gỗ ấm áp. Ngắm hoàng hôn mỗi chiều, tắm biển mỗi sáng. Chủ nhà thân thiện.",
      type: "HOMESTAY", address: "Bãi Trường", city: "Phú Quốc", district: "Dương Tơ",
      latitude: 10.2899, longitude: 103.8600, pricePerNight: 900000, maxGuests: 3, bedrooms: 1, bathrooms: 1,
      amenities: JSON.stringify(["wifi","ac","garden","bbq"]),
      images: JSON.stringify([]), rating: 4.6, reviewCount: 18,
    }}),
    prisma.listing.create({ data: {
      hostId: host.id, title: "Penthouse Hà Nội Old Quarter", description: "Penthouse tầng thượng giữa phố cổ Hà Nội, view Hồ Hoàn Kiếm. Nội thất hiện đại, ban công rộng. Trải nghiệm Hà Nội từ trên cao.",
      type: "APARTMENT", address: "15 Hàng Bông", city: "Hà Nội", district: "Hoàn Kiếm",
      latitude: 21.0285, longitude: 105.8542, pricePerNight: 1500000, maxGuests: 4, bedrooms: 2, bathrooms: 2,
      amenities: JSON.stringify(["wifi","ac","tv","kitchen","washer"]),
      images: JSON.stringify([]), rating: 4.4, reviewCount: 10,
    }}),
    prisma.listing.create({ data: {
      hostId: host2.id, title: "Bungalow Đà Nẵng Sơn Trà", description: "Bungalow yên bình trên bán đảo Sơn Trà, giữa rừng nguyên sinh. Thức dậy với tiếng chim hót, không khí trong lành. Gần bãi biển Mỹ Khê.",
      type: "HOMESTAY", address: "Sơn Trà", city: "Đà Nẵng", district: "Sơn Trà",
      latitude: 16.1174, longitude: 108.2772, pricePerNight: 750000, maxGuests: 2, bedrooms: 1, bathrooms: 1,
      amenities: JSON.stringify(["wifi","ac","garden","parking"]),
      images: JSON.stringify([]), rating: 4.3, reviewCount: 7,
    }}),
    prisma.listing.create({ data: {
      hostId: host.id, title: "Resort Vũng Tàu Oceanview", description: "Phòng resort cao cấp view trực diện biển Vũng Tàu. Hồ bơi vô cực, spa, nhà hàng buffet. Ideal cho kỳ nghỉ gia đình.",
      type: "HOTEL", address: "1 Thuỳ Vân", city: "Vũng Tàu", district: "Thắng Tam",
      latitude: 10.3460, longitude: 107.0843, pricePerNight: 2200000, maxGuests: 4, bedrooms: 2, bathrooms: 2,
      amenities: JSON.stringify(["wifi","pool","ac","tv","gym","parking","kitchen"]),
      images: JSON.stringify([]), rating: 4.7, reviewCount: 25,
    }}),
    prisma.listing.create({ data: {
      hostId: host2.id, title: "Villa Đà Lạt Hồ Tuyền Lâm", description: "Villa rộng rãi bên hồ Tuyền Lâm, sân vườn 500m2. BBQ ngoài trời, lò sưởi, phòng khách lớn. Perfect cho team building và tiệc nhóm.",
      type: "VILLA", address: "Hồ Tuyền Lâm", city: "Đà Lạt", district: "Phường 4",
      latitude: 11.8910, longitude: 108.4327, pricePerNight: 4500000, maxGuests: 12, bedrooms: 5, bathrooms: 3,
      amenities: JSON.stringify(["wifi","kitchen","garden","parking","bbq","tv","washer"]),
      images: JSON.stringify([]), rating: 4.9, reviewCount: 6,
    }}),
    prisma.listing.create({ data: {
      hostId: host.id, title: "Studio Thảo Điền Quận 2", description: "Studio nhỏ xinh tại Thảo Điền, khu vực quốc tế sầm uất. Gần nhiều quán cafe, nhà hàng. Metro line 1 ngay cạnh.",
      type: "APARTMENT", address: "Thảo Điền", city: "TP. Hồ Chí Minh", district: "Thủ Đức",
      latitude: 10.8018, longitude: 106.7345, pricePerNight: 550000, maxGuests: 2, bedrooms: 1, bathrooms: 1,
      amenities: JSON.stringify(["wifi","ac","tv","washer","gym","pool"]),
      images: JSON.stringify([]), rating: 4.2, reviewCount: 14,
    }}),
    prisma.listing.create({ data: {
      hostId: host2.id, title: "Khách sạn 4 sao Nha Trang", description: "Khách sạn 4 sao ngay trung tâm Nha Trang, bãi biển cách 200m. Phòng rộng, view biển hoặc núi. Buffet sáng đa dạng.",
      type: "HOTEL", address: "20 Trần Phú", city: "Nha Trang", district: "Lộc Thọ",
      latitude: 12.2450, longitude: 109.1950, pricePerNight: 1800000, maxGuests: 3, bedrooms: 1, bathrooms: 1,
      amenities: JSON.stringify(["wifi","pool","ac","tv","gym","parking"]),
      images: JSON.stringify([]), rating: 4.5, reviewCount: 30,
    }}),
    prisma.listing.create({ data: {
      hostId: host.id, title: "Homestay Sapa View Ruộng Bậc Thang", description: "Homestay gỗ truyền thống tại Sapa, view ruộng bậc thang tuyệt đẹp. Trải nghiệm văn hóa bản địa, trekking, chợ phiên.",
      type: "HOMESTAY", address: "Tả Phìn", city: "Hà Nội", district: "Sapa",
      latitude: 22.3364, longitude: 103.8438, pricePerNight: 450000, maxGuests: 4, bedrooms: 2, bathrooms: 1,
      amenities: JSON.stringify(["wifi","kitchen","garden"]),
      images: JSON.stringify([]), rating: 4.8, reviewCount: 22,
    }}),
  ]);

  console.log(`${listings.length} listings created`);

  // Bookings
  const now = new Date();
  const bookings = await Promise.all([
    prisma.booking.create({ data: {
      listingId: listings[0].id, guestId: guest.id, hostId: host.id,
      checkIn: new Date(now.getTime() - 7 * 86400000), checkOut: new Date(now.getTime() - 4 * 86400000),
      guests: 2, totalNights: 3, totalPrice: 1950000, status: "COMPLETED",
    }}),
    prisma.booking.create({ data: {
      listingId: listings[2].id, guestId: guest.id, hostId: host.id,
      checkIn: new Date(now.getTime() - 14 * 86400000), checkOut: new Date(now.getTime() - 12 * 86400000),
      guests: 1, totalNights: 2, totalPrice: 1600000, status: "COMPLETED",
    }}),
    prisma.booking.create({ data: {
      listingId: listings[1].id, guestId: guest2.id, hostId: host.id,
      checkIn: new Date(now.getTime() + 3 * 86400000), checkOut: new Date(now.getTime() + 6 * 86400000),
      guests: 6, totalNights: 3, totalPrice: 10500000, status: "CONFIRMED",
    }}),
    prisma.booking.create({ data: {
      listingId: listings[3].id, guestId: guest.id, hostId: host2.id,
      checkIn: new Date(now.getTime() + 1 * 86400000), checkOut: new Date(now.getTime() + 4 * 86400000),
      guests: 2, totalNights: 3, totalPrice: 3600000, status: "PENDING",
    }}),
    prisma.booking.create({ data: {
      listingId: listings[4].id, guestId: guest2.id, hostId: host2.id,
      checkIn: new Date(now.getTime() - 5 * 86400000), checkOut: new Date(now.getTime() - 3 * 86400000),
      guests: 2, totalNights: 2, totalPrice: 1800000, status: "COMPLETED",
    }}),
    prisma.booking.create({ data: {
      listingId: listings[5].id, guestId: guest.id, hostId: host.id,
      checkIn: new Date(now.getTime() + 7 * 86400000), checkOut: new Date(now.getTime() + 10 * 86400000),
      guests: 3, totalNights: 3, totalPrice: 4500000, status: "PENDING",
    }}),
    prisma.booking.create({ data: {
      listingId: listings[7].id, guestId: guest2.id, hostId: host.id,
      checkIn: new Date(now.getTime() - 20 * 86400000), checkOut: new Date(now.getTime() - 17 * 86400000),
      guests: 4, totalNights: 3, totalPrice: 6600000, status: "COMPLETED",
    }}),
    prisma.booking.create({ data: {
      listingId: listings[8].id, guestId: guest.id, hostId: host2.id,
      checkIn: new Date(now.getTime() - 10 * 86400000), checkOut: new Date(now.getTime() - 8 * 86400000),
      guests: 8, totalNights: 2, totalPrice: 9000000, status: "COMPLETED",
    }}),
  ]);

  console.log(`${bookings.length} bookings created`);

  // Reviews (for completed bookings)
  await Promise.all([
    prisma.review.create({ data: {
      listingId: listings[0].id, bookingId: bookings[0].id, guestId: guest.id,
      rating: 5, comment: "Homestay tuyệt vời! View đồi thông đẹp lắm, phòng sạch sẽ ấm cúng. Chủ nhà rất thân thiện, nhiệt tình hướng dẫn. Chắc chắn sẽ quay lại!",
    }}),
    prisma.review.create({ data: {
      listingId: listings[2].id, bookingId: bookings[1].id, guestId: guest.id,
      rating: 4, comment: "Vị trí trung tâm rất thuận tiện, căn hộ sạch sẽ đầy đủ tiện nghi. Hơi ồn vào ban đêm do gần đường lớn nhưng tổng thể rất ổn.",
    }}),
    prisma.review.create({ data: {
      listingId: listings[4].id, bookingId: bookings[4].id, guestId: guest2.id,
      rating: 5, comment: "Bungalow rất đẹp, ngay bãi biển! Hoàng hôn tuyệt đẹp. Chủ nhà chuẩn bị cả BBQ hải sản buổi tối. 10/10 recommend!",
    }}),
    prisma.review.create({ data: {
      listingId: listings[7].id, bookingId: bookings[6].id, guestId: guest2.id,
      rating: 5, comment: "Resort đẳng cấp, dịch vụ hoàn hảo. Hồ bơi vô cực view biển Vũng Tàu siêu đẹp. Buffet sáng đa dạng. Worth every penny!",
    }}),
    prisma.review.create({ data: {
      listingId: listings[8].id, bookingId: bookings[7].id, guestId: guest.id,
      rating: 5, comment: "Villa Đà Lạt siêu rộng, sân vườn đẹp, BBQ ngoài trời cực chill. Nhóm 10 người ở thoải mái. Bên hồ Tuyền Lâm thơ mộng.",
    }}),
  ]);

  console.log("Reviews created");
  console.log("\n=== SEED COMPLETE ===");
  console.log("Accounts (password: 123456):");
  console.log("  Admin: admin@stayhub.com");
  console.log("  Host:  host@stayhub.com / host2@stayhub.com");
  console.log("  Guest: guest@stayhub.com / guest2@stayhub.com");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
