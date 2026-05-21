"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function BookingActions({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(status === "CONFIRMED" ? "Đã xác nhận đơn" : "Đã từ chối đơn");
        window.location.reload();
      } else {
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => updateStatus("CONFIRMED")}
        disabled={loading}
        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        Xác nhận
      </button>
      <button
        onClick={() => updateStatus("CANCELLED")}
        disabled={loading}
        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
      >
        Từ chối
      </button>
    </div>
  );
}
