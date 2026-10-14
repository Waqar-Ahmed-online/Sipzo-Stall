import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await dbConnect();
    // .lean() skips hydrating full Mongoose documents for a read-only list —
    // meaningfully faster for admin panel + POS product loads.
    const products = await Product.find().lean();
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch products", error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, category, variants } = await req.json();
    if (!name || !category) {
      return NextResponse.json({ message: "name and category are required" }, { status: 400 });
    }
    const product = await Product.create({ name, category, variants: variants || [] });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to create product", error: (err as Error).message },
      { status: 500 }
    );
  }
}
