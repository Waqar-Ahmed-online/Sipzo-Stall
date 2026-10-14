import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    await dbConnect();
    const result = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Failed to fetch yearly sales" }, { status: 500 });
  }
}
