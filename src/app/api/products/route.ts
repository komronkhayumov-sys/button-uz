import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, getProducts, saveProduct, verifyPin } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q")?.toLowerCase();

    let products = await getProducts();

    if (category && category !== "all") {
      products = products.filter((p) => p.category === category);
    }

    if (query) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          (p.nameRu && p.nameRu.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ success: true, products });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const pinHeader = req.headers.get("x-admin-pin") || "";
  if (!(await verifyPin(pinHeader))) {
    return NextResponse.json({ success: false, error: "Noto'g'ri PIN kod (Unauthorized)" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ success: false, error: "Mahsulot nomi va narxi kiritilishi shart" }, { status: 400 });
    }

    const saved = await saveProduct(body);
    return NextResponse.json({ success: true, product: saved });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const pinHeader = req.headers.get("x-admin-pin") || "";
  if (!(await verifyPin(pinHeader))) {
    return NextResponse.json({ success: false, error: "Noto'g'ri PIN kod (Unauthorized)" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Mahsulot IDsi ko'rsatilmagan" }, { status: 400 });
    }

    const updated = await saveProduct(body);
    return NextResponse.json({ success: true, product: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const pinHeader = req.headers.get("x-admin-pin") || "";
  if (!(await verifyPin(pinHeader))) {
    return NextResponse.json({ success: false, error: "Noto'g'ri PIN kod (Unauthorized)" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Mahsulot IDsi ko'rsatilmagan" }, { status: 400 });
    }

    const deleted = await deleteProduct(id);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
