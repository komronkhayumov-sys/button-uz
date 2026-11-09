import { NextRequest, NextResponse } from "next/server";
import { getOrders, saveOrder, updateOrder, updateOrderStatus, verifyPin } from "@/lib/storage";
import { sendTelegramOrderNotification, sendTelegramReceiptNotification } from "@/lib/telegram";
import { Order } from "@/types";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  const orderId = req.nextUrl.searchParams.get("id");

  // If phone query provided, return orders for this phone number (Customer Orders Portal)
  if (phone) {
    try {
      const cleanSearchPhone = phone.replace(/\D/g, "");
      const allOrders = await getOrders();
      const filtered = allOrders.filter((o) => {
        const cleanOrderPhone = (o.customerPhone || "").replace(/\D/g, "");
        return cleanOrderPhone.endsWith(cleanSearchPhone.slice(-9)) || cleanSearchPhone.endsWith(cleanOrderPhone.slice(-9));
      });
      return NextResponse.json({ success: true, orders: filtered });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
  }

  // If specific order ID query provided
  if (orderId) {
    try {
      const allOrders = await getOrders();
      const found = allOrders.find((o) => o.id === orderId);
      if (!found) {
        return NextResponse.json({ success: false, error: "Buyurtma topilmadi" }, { status: 404 });
      }
      return NextResponse.json({ success: true, order: found });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
  }

  // Otherwise, require Admin PIN
  const pinHeader = req.headers.get("x-admin-pin") || "";
  if (!(await verifyPin(pinHeader))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.customerName || !body.customerPhone || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Ism, telefon raqami va tanlangan mahsulot talab qilinadi" },
        { status: 400 }
      );
    }

    const orderId = `BTN-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone.trim(),
      deliveryType: body.deliveryType || "delivery",
      branchId: body.branchId,
      branchName: body.branchName,
      address: body.address?.trim(),
      comment: body.comment?.trim(),
      paymentMethod: body.paymentMethod || "click",
      paymentStatus: body.paymentStatus || "pending",
      items: body.items,
      totalAmount: Number(body.totalAmount) || 0,
      status: "new",
      createdAt: new Date().toISOString(),
      telegramSent: false,
    };

    // Send Telegram Notification (async safe)
    const tgResult = await sendTelegramOrderNotification(newOrder);
    newOrder.telegramSent = tgResult.success;

    // Save order locally (crash-proof with in-memory persistence guarantee)
    try {
      await saveOrder(newOrder);
    } catch (saveErr) {
      console.warn("[orders] saveOrder disk write fallback warning:", saveErr);
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      telegramNotification: tgResult,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Buyurtma ID kiritilishi shart" }, { status: 400 });
    }

    const pinHeader = req.headers.get("x-admin-pin") || "";
    const isAdmin = await verifyPin(pinHeader);

    // If uploading payment receipt (customer or test)
    if (body.paymentReceipt) {
      const updated = await updateOrder(body.id, {
        paymentReceipt: body.paymentReceipt,
        paymentReceiptTime: new Date().toISOString(),
        paymentStatus: "verifying",
      });

      // Send Telegram Notification async
      try {
        await sendTelegramReceiptNotification(body.id, body.paymentReceipt);
      } catch (tgErr) {
        console.warn("[orders] Telegram receipt notify warning:", tgErr);
      }

      return NextResponse.json({ success: true, order: updated });
    }

    // Otherwise, admin action requires valid PIN
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const updates: Partial<Order> = {};
    if (body.status) updates.status = body.status;
    if (body.paymentStatus) updates.paymentStatus = body.paymentStatus;
    if (body.paymentReceipt !== undefined) updates.paymentReceipt = body.paymentReceipt;
    if (body.paymentRejectReason !== undefined) updates.paymentRejectReason = body.paymentRejectReason;

    const updated = await updateOrder(body.id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Buyurtma topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * PUT /api/orders
 * Resilient multi-tier client-server sync endpoint.
 * Allows client (Customer or Admin) to restore locally cached orders
 * to serverless instance storage so orders are NEVER lost across restarts.
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const syncOrders: Order[] = body.syncOrders;
    if (!Array.isArray(syncOrders) || syncOrders.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    let savedCount = 0;
    for (const order of syncOrders) {
      if (order && order.id && order.customerName) {
        await saveOrder(order);
        savedCount++;
      }
    }

    return NextResponse.json({ success: true, count: savedCount });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
