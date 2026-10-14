import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: "Product deleted" });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to delete product", error: (err as Error).message },
      { status: 500 }
    );
  }
}
