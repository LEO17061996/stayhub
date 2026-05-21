import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string };

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            host: {
              select: { id: true, name: true, phone: true, avatar: true },
            },
          },
        },
        guest: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (
      booking.guestId !== user.id &&
      booking.hostId !== user.id &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Booking GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string };
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Host can confirm or reject (cancel) pending bookings
    if (booking.hostId === user.id) {
      if (booking.status !== "PENDING") {
        return NextResponse.json(
          { error: "Only pending bookings can be confirmed or rejected" },
          { status: 400 }
        );
      }
      if (status !== "CONFIRMED" && status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Host can only confirm or cancel bookings" },
          { status: 400 }
        );
      }
    }
    // Guest can cancel their own bookings
    else if (booking.guestId === user.id) {
      if (status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Guest can only cancel bookings" },
          { status: 400 }
        );
      }
      if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
        return NextResponse.json(
          { error: "Cannot cancel this booking" },
          { status: 400 }
        );
      }
    }
    // Admin can update any status
    else if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Booking PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
