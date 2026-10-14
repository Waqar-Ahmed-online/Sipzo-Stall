import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Expense from "@/models/Expense";

const PERIOD_TYPES = ["daily", "monthly", "yearly"];

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const periodType = req.nextUrl.searchParams.get("periodType");
    const periodKey = req.nextUrl.searchParams.get("periodKey");

    if (!periodType || !periodKey || !PERIOD_TYPES.includes(periodType)) {
      return NextResponse.json({ message: "periodType and periodKey are required" }, { status: 400 });
    }

    const record = await Expense.findOne({ periodType, periodKey }).lean();
    return NextResponse.json(record || { periodType, periodKey, expense: 0, rent: 0 });
  } catch {
    return NextResponse.json({ message: "Failed to load expense" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { periodType, periodKey, expense, rent } = await req.json();

    if (!periodType || !periodKey || !PERIOD_TYPES.includes(periodType)) {
      return NextResponse.json({ message: "periodType and periodKey are required" }, { status: 400 });
    }

    const record = await Expense.findOneAndUpdate(
      { periodType, periodKey },
      { expense: Number(expense) || 0, rent: Number(rent) || 0 },
      { new: true, upsert: true }
    );

    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ message: "Failed to save expense" }, { status: 500 });
  }
}