import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const days = parseInt(req.nextUrl.searchParams.get("days") || "30") || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Failed to fetch daily sales" }, { status: 500 });
  }
}
