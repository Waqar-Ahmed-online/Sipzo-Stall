import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";
import type { SalesRow } from "@/types";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    if (!from || !to) {
      return NextResponse.json({ message: "from and to query params are required" }, { status: 400 });
    }

    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    const days: SalesRow[] = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const grandTotal = days.reduce((sum, d) => sum + d.totalSales, 0);
    const orderCount = days.reduce((sum, d) => sum + d.orderCount, 0);

    return NextResponse.json({ days, grandTotal, orderCount });
  } catch {
    return NextResponse.json({ message: "Failed to fetch sales for range" }, { status: 500 });
  }
}
