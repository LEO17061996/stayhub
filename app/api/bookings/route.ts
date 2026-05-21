import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id: string; role: string };

    let bookings;

    if (user.role === "HOST") {
      bookings = await prisma.booking.findMany({
        where: { hostId: user.id },
        include: {
          listing: {
            select: { id: true, title: true, images: true, city: true },
          },
          guest: {
            select: { id: true, name: true, email: true, avatar: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      bookings = await prisma.booking.findMany({
        where: { guestId: user.id },
        include: {
          listing: {
            select: { id: true, title: true, images: true, city: true, address: true },
          },
          host: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Bookings GET error:", error);
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

    const user = session.user as { id: string };
    const body = await request.json();
    const { listingId, checkIn, checkOut, guests, note } = body;

    if (!listingId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "listingId, checkIn, and checkOut are required" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Listing is not available" },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: "Check-out must be after check-in" },
        { status: 400 }
      );
    }

    if (guests && guests > listing.maxGuests) {
      return NextResponse.json(
        { error: `Maximum guests allowed: ${listing.maxGuests}` },
        { status: 400 }
      );
    }

    // Check availability - no overlapping confirmed/pending bookings
    const overlapping = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ["PENDING", "CONFIRMED"] },
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: "Listing is not available for the selected dates" },
        { status: 409 }
      );
    }

    const totalNights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = totalNights * listing.pricePerNight;

    const booking = await prisma.booking.create({
      data: {
        listingId,
        guestId: user.id,
        hostId: listing.hostId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guests || 1,
        totalNights,
        totalPrice,
        status: "PENDING",
        note: note || null,
      },
      include: {
        listing: {
          select: { id: true, title: true, city: true },
        },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Bookings POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
