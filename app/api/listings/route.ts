import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const guests = searchParams.get("guests");
    const amenities = searchParams.get("amenities");
    const sort = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const where: Record<string, unknown> = {
      status: "ACTIVE",
    };

    if (city) {
      where.city = { contains: city };
    }

    if (type) {
      where.type = type;
    }

    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice)
        (where.pricePerNight as Record<string, number>).gte = parseInt(minPrice, 10);
      if (maxPrice)
        (where.pricePerNight as Record<string, number>).lte = parseInt(maxPrice, 10);
    }

    if (guests) {
      where.maxGuests = { gte: parseInt(guests, 10) };
    }

    if (amenities) {
      const amenityList = amenities.split(",");
      where.AND = amenityList.map((amenity) => ({
        amenities: { contains: amenity.trim() },
      }));
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { pricePerNight: "asc" };
    else if (sort === "price_desc") orderBy = { pricePerNight: "desc" };
    else if (sort === "rating") orderBy = { rating: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          host: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Listings GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id: string; role: string };

    if (user.role !== "HOST" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only hosts can create listings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      address,
      city,
      district,
      latitude,
      longitude,
      pricePerNight,
      maxGuests,
      bedrooms,
      bathrooms,
      amenities,
      images,
    } = body;

    if (!title || !description || !address || !city || !pricePerNight) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, address, city, pricePerNight" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        hostId: user.id,
        title,
        description,
        type: type || "HOMESTAY",
        address,
        city,
        district: district || null,
        latitude: latitude || 0,
        longitude: longitude || 0,
        pricePerNight: parseInt(pricePerNight, 10),
        maxGuests: maxGuests || 2,
        bedrooms: bedrooms || 1,
        bathrooms: bathrooms || 1,
        amenities: amenities ? JSON.stringify(amenities) : "[]",
        images: images ? JSON.stringify(images) : "[]",
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Listings POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
