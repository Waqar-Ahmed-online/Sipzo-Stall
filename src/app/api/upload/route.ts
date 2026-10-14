import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: "Image too large (max 5MB)" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || "";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    // Served directly by Next.js from /public — no express.static hop needed.
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    return NextResponse.json(
      { message: "Upload failed", error: (err as Error).message },
      { status: 500 }
    );
  }
}
