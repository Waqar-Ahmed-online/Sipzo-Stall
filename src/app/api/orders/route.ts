import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";
import Counter from "@/models/Counter";

const ORDER_TYPES = ["dine-in", "takeaway", "home-delivery"];
const PAYMENT_TYPES = ["cash", "card", "online"];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function nextOrderNumber() {
  const key = todayKey();
  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

export async function GET() {
  try {
    await dbConnect();
    // .lean() + the createdAt index on the model keep this fast even as
    // order history grows.
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch orders", error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
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

    const orderNumber = await nextOrderNumber();

    const order = await Order.create({
      orderNumber,
      orderType,
      table: orderType === "dine-in" ? table : null,
      paymentType: paymentType || "cash",
      deliveryDetails: orderType === "home-delivery" ? deliveryDetails : undefined,
      deliveryCharges: orderType === "home-delivery" ? Number(deliveryCharges) || 0 : 0,
      items,
      total,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to save order", error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await dbConnect();
    await Order.deleteMany({});
    return NextResponse.json({ message: "Order history cleared" });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to clear history", error: (err as Error).message },
      { status: 500 }
    );
  }
}
