import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { name, size, family, image, price } = await req.json();

    if (!name || !family || !size || price === undefined || price === null || Number.isNaN(Number(price))) {
      return NextResponse.json(
        { message: "name, family, size and price are required" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    product.variants.push({ name, size, price: Number(price), family, image: image || "" });
    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to add variant", error: (err as Error).message },
      { status: 500 }
    );
  }
}
