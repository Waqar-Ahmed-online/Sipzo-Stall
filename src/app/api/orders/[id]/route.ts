import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";

const ORDER_TYPES = ["dine-in", "takeaway", "home-delivery"];
const PAYMENT_TYPES = ["cash", "card", "online"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { orderType, table, paymentType, deliveryDetails, deliveryCharges, items, total } =
      await req.json();

    if (!orderType || !ORDER_TYPES.includes(orderType)) {
      return NextResponse.json(
        { message: "orderType must be 'dine-in', 'takeaway' or 'home-delivery'" },
        { status: 400 }
      );
    }
    if (paymentType && !PAYMENT_TYPES.includes(paymentType)) {
      return NextResponse.json(
        { message: "paymentType must be 'cash', 'card' or 'online'" },
        { status: 400 }
      );
    }

    const updated = await Order.findByIdAndUpdate(
      id,
      {
        orderType,
        table: orderType === "dine-in" ? table : null,
        paymentType: paymentType || "cash",
        deliveryDetails: orderType === "home-delivery" ? deliveryDetails : undefined,
        deliveryCharges: orderType === "home-delivery" ? Number(deliveryCharges) || 0 : 0,
        items,
        total,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to update order", error: (err as Error).message },
      { status: 500 }
    );
  }
}
