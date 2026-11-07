import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyPin } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const pinHeader = req.headers.get("x-admin-pin") || "";
  const uploadTypeHeader = req.headers.get("x-upload-type") || "";
  const isAdmin = await verifyPin(pinHeader);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const formUploadType = formData.get("type") as string | null;

    const isReceipt = uploadTypeHeader === "receipt" || formUploadType === "receipt";

    if (!isAdmin && !isReceipt) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ success: false, error: "Fayl topilmadi" }, { status: 400 });
    }

    // Check file size (max 10MB for receipts)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Fayl hajmi 10MB dan oshmasligi kerak" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name) || ".jpg";
    const prefix = isReceipt ? "receipt" : "btn";
    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
