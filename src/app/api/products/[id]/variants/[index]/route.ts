import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";

type Params = { params: Promise<{ id: string; index: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id, index: indexParam } = await params;
    const { name, size, family, image, price } = await req.json();

    if (!name || !family || !size || price === undefined || price === null || Number.isNaN(Number(price))) {
      return NextResponse.json(
        { message: "name, family, size and price are required" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    const index = Number(indexParam);
    if (Number.isNaN(index) || index < 0 || index >= product.variants.length) {
      return NextResponse.json({ message: "Variant not found" }, { status: 404 });
    }

    product.variants[index] = { name, size, price: Number(price), family, image: image || "" };
    await product.save();
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to update variant", error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id, index: indexParam } = await params;

    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    const index = Number(indexParam);
    if (Number.isNaN(index) || index < 0 || index >= product.variants.length) {
      return NextResponse.json({ message: "Variant not found" }, { status: 404 });
    }

    product.variants.splice(index, 1);
    await product.save();
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to delete variant", error: (err as Error).message },
      { status: 500 }
    );
  }
}
