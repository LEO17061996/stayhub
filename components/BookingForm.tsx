"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { differenceInDays } from "date-fns";

interface BookingFormProps {
  listingId: string;
  pricePerNight: number;
  maxGuests: number;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function BookingForm({
  listingId,
  pricePerNight,
  maxGuests,
}: BookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const { totalNights, totalPrice } = useMemo(() => {
    if (!checkIn || !checkOut) return { totalNights: 0, totalPrice: 0 };
    const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
    if (nights <= 0) return { totalNights: 0, totalPrice: 0 };
    return { totalNights: nights, totalPrice: nights * pricePerNight };
  }, [checkIn, checkOut, pricePerNight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Vui lòng đăng nhập để đặt phòng");
      router.push("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("Vui lòng chọn ngày nhận và trả phòng");
      return;
    }

    if (totalNights <= 0) {
      toast.error("Ngày trả phòng phải sau ngày nhận phòng");
      return;
    }

    if (guests > maxGuests) {
      toast.error(`Số khách tối đa là ${maxGuests}`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          checkIn,
          checkOut,
          guests,
          note,
          totalPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đặt phòng thất bại");
      }

      toast.success("Đặt phòng thành công!");
      router.push("/bookings");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Đã xảy ra lỗi, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-24">
      {/* Price header */}
      <div className="mb-6">
        <span className="text-2xl font-bold text-gray-800">
          {formatPrice(pricePerNight)}
        </span>
        <span className="text-gray-500"> / đêm</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhận phòng
            </label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trả phòng
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số khách
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} khách
              </option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú <span className="text-gray-400 font-normal">(tùy chọn)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Yêu cầu đặc biệt, giờ nhận phòng..."
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Price breakdown */}
        {totalNights > 0 && (
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {formatPrice(pricePerNight)} x {totalNights} đêm
              </span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-100">
              <span>Tổng cộng</span>
              <span className="text-blue-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || totalNights <= 0}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Đang xử lý...
            </>
          ) : (
            "Đặt phòng"
          )}
        </button>
      </form>

      {/* Info */}
      <p className="text-xs text-gray-400 text-center mt-3">
        Bạn chưa bị trừ tiền cho đến khi chủ nhà xác nhận
      </p>
    </div>
  );
}
