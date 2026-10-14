import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const year = parseInt(req.nextUrl.searchParams.get("year") || "") || new Date().getFullYear();
    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Failed to fetch monthly sales" }, { status: 500 });
  }
}
