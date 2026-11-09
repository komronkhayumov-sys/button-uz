import fs from "fs";
import path from "path";
import os from "os";
import { Customer, Order, Product, StoreSettings } from "@/types";
import { DEFAULT_SETTINGS, INITIAL_PRODUCTS } from "@/constants";
import { getSupabase } from "@/lib/supabase";

// Detect serverless environment (Vercel, AWS Lambda, Netlify, etc.)
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.NOW_REGION ||
  (typeof process.cwd === "function" && (process.cwd().startsWith("/var/task") || process.cwd().startsWith("/var/runtime") || process.cwd().startsWith("/tmp")))
);

// Determine writable data directory safely
function getWritableDirectory(): string {
  if (isServerless) {
    return path.join(os.tmpdir(), "button-data");
  }

  const cwd = process.cwd();
  if (cwd.startsWith("/var/task") || cwd.startsWith("/var/runtime")) {
    return path.join(os.tmpdir(), "button-data");
  }

  const localDir = path.join(cwd, "data");
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, `.test_probe_${Date.now()}`);
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    return localDir;
  } catch {
    return path.join(os.tmpdir(), "button-data");
  }
}

const DATA_DIR = getWritableDirectory();
const SEED_DIR = path.join(process.cwd(), "data");

const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");

// In-memory singletons to guarantee instant consistency and fallback if disk is locked
let memorySettings: StoreSettings | null = null;
let memoryProducts: Product[] | null = null;
let memoryOrders: Order[] | null = null;
let memoryCustomers: Customer[] | null = null;

function ensureDirectoryExists(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch (err) {
    console.warn(`[storage] Could not create directory ${DATA_DIR}:`, err);
    return false;
  }
}

function safeWriteFile(filePath: string, data: unknown): void {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn(`[storage] Write failed for ${filePath} (kept safely in memory):`, err);
  }
}

function safeReadFile<T>(filePath: string, seedFilename?: string, fallbackValue?: T): T | null {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`[storage] Read failed for ${filePath}:`, err);
  }

  if (seedFilename) {
    try {
      const seedPath = path.join(SEED_DIR, seedFilename);
      if (fs.existsSync(seedPath)) {
        const raw = fs.readFileSync(seedPath, "utf-8");
        const parsed = JSON.parse(raw);
        safeWriteFile(filePath, parsed);
        return parsed;
      }
    } catch (err) {
      console.warn(`[storage] Seed read failed for ${seedFilename}:`, err);
    }
  }

  return fallbackValue ?? null;
}

// ------------------- SETTINGS STORAGE -------------------
export async function getSettings(): Promise<StoreSettings> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("data")
        .eq("id", "store_settings")
        .single();

      if (!error && data?.data) {
        const loaded: StoreSettings = {
          ...DEFAULT_SETTINGS,
          adminPin: process.env.ADMIN_PIN || DEFAULT_SETTINGS.adminPin,
          ...data.data,
        };
        memorySettings = loaded;
        return loaded;
      }
    } catch (err) {
      console.warn("[storage] Supabase getSettings error:", err);
    }
  }

  if (memorySettings) {
    return memorySettings;
  }

  const initialSettings: StoreSettings = {
    ...DEFAULT_SETTINGS,
    adminPin: process.env.ADMIN_PIN || DEFAULT_SETTINGS.adminPin,
  };

  const stored = safeReadFile<StoreSettings>(SETTINGS_FILE, "settings.json", initialSettings);
  const result: StoreSettings = {
    ...initialSettings,
    ...(stored || {}),
  };
  memorySettings = result;
  return result;
}

export async function saveSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getSettings();
  memorySettings = {
    ...current,
    ...updates,
  };
  safeWriteFile(SETTINGS_FILE, memorySettings);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("settings").upsert({
        id: "store_settings",
        data: memorySettings,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("[storage] Supabase saveSettings error:", err);
    }
  }

  return memorySettings;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const settings = await getSettings();
  return Boolean(pin && (pin === settings.adminPin || pin === process.env.ADMIN_PIN));
}

// ------------------- CUSTOMERS STORAGE -------------------
export async function getCustomers(): Promise<Customer[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("registered_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped: Customer[] = data.map((row) => ({
          id: row.id,
          name: row.name,
          phone: row.phone,
          address: row.address || "",
          preferredSize: row.preferred_size || "L",
          measurements: row.measurements || undefined,
          ordersCount: Number(row.orders_count) || 0,
          totalSpent: Number(row.total_spent) || 0,
          registeredAt: row.registered_at,
        }));
        memoryCustomers = mapped;
        return mapped;
      }
    } catch (err) {
      console.warn("[storage] Supabase getCustomers error:", err);
    }
  }

  if (memoryCustomers !== null) {
    return memoryCustomers;
  }

  const loaded = safeReadFile<Customer[]>(CUSTOMERS_FILE, "customers.json", []);
  memoryCustomers = Array.isArray(loaded) ? loaded : [];
  return memoryCustomers;
}

export async function saveCustomer(data: {
  name: string;
  phone: string;
  address?: string;
  preferredSize?: string;
}): Promise<Customer> {
  const customers = await getCustomers();
  const cleanPhone = data.phone.replace(/\s+/g, "");

  const existingIdx = customers.findIndex(
    (c) => c.phone.replace(/\s+/g, "") === cleanPhone
  );

  let targetCustomer: Customer;

  if (existingIdx !== -1) {
    customers[existingIdx] = {
      ...customers[existingIdx],
      name: data.name || customers[existingIdx].name,
      address: data.address || customers[existingIdx].address,
      preferredSize: data.preferredSize || customers[existingIdx].preferredSize,
    };
    targetCustomer = customers[existingIdx];
  } else {
    targetCustomer = {
      id: `cust-${Date.now().toString(36)}`,
      name: data.name,
      phone: data.phone,
      address: data.address || "",
      preferredSize: data.preferredSize || "L",
      ordersCount: 0,
      totalSpent: 0,
      registeredAt: new Date().toISOString(),
    };
    customers.unshift(targetCustomer);
  }

  memoryCustomers = customers;
  safeWriteFile(CUSTOMERS_FILE, memoryCustomers);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("customers").upsert({
        id: targetCustomer.id,
        name: targetCustomer.name,
        phone: targetCustomer.phone,
        address: targetCustomer.address || "",
        preferred_size: targetCustomer.preferredSize || "L",
        orders_count: targetCustomer.ordersCount,
        total_spent: targetCustomer.totalSpent,
        registered_at: targetCustomer.registeredAt,
      });
    } catch (err) {
      console.warn("[storage] Supabase saveCustomer error:", err);
    }
  }

  return targetCustomer;
}

export async function recordCustomerOrder(phone: string, name: string, amount: number, address?: string) {
  const customers = await getCustomers();
  const cleanPhone = phone.replace(/\s+/g, "");
  const existing = customers.find((c) => c.phone.replace(/\s+/g, "") === cleanPhone);

  let targetCustomer: Customer;
  if (existing) {
    existing.ordersCount = (existing.ordersCount || 0) + 1;
    existing.totalSpent = (existing.totalSpent || 0) + amount;
    if (address && !existing.address) existing.address = address;
    targetCustomer = existing;
  } else {
    targetCustomer = {
      id: `cust-${Date.now().toString(36)}`,
      name,
      phone,
      address: address || "",
      preferredSize: "L",
      ordersCount: 1,
      totalSpent: amount,
      registeredAt: new Date().toISOString(),
    };
    customers.unshift(targetCustomer);
  }

  memoryCustomers = customers;
  safeWriteFile(CUSTOMERS_FILE, memoryCustomers);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("customers").upsert({
        id: targetCustomer.id,
        name: targetCustomer.name,
        phone: targetCustomer.phone,
        address: targetCustomer.address || "",
        preferred_size: targetCustomer.preferredSize || "L",
        orders_count: targetCustomer.ordersCount,
        total_spent: targetCustomer.totalSpent,
        registered_at: targetCustomer.registeredAt,
      });
    } catch (err) {
      console.warn("[storage] Supabase recordCustomerOrder error:", err);
    }
  }
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  const customers = await getCustomers();
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  customers[idx] = { ...customers[idx], ...updates };
  memoryCustomers = customers;
  safeWriteFile(CUSTOMERS_FILE, memoryCustomers);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("customers").update({
        name: customers[idx].name,
        address: customers[idx].address,
        preferred_size: customers[idx].preferredSize,
        measurements: customers[idx].measurements || {},
      }).eq("id", id);
    } catch (err) {
      console.warn("[storage] Supabase updateCustomer error:", err);
    }
  }

  return customers[idx];
}

// ------------------- PRODUCTS STORAGE -------------------
export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: Product[] = data.map((row) => ({
          id: row.id,
          name: row.name,
          nameRu: row.name_ru || row.name,
          description: row.description || "",
          descriptionRu: row.description_ru || row.description || "",
          price: Number(row.price) || 0,
          oldPrice: row.old_price ? Number(row.old_price) : undefined,
          category: row.category || "suits",
          image: row.image,
          images: Array.isArray(row.images) ? row.images : undefined,
          sizes: Array.isArray(row.sizes) ? row.sizes : ["M", "L", "XL"],
          colors: Array.isArray(row.colors) ? row.colors : undefined,
          isAvailable: row.is_available ?? true,
          isFeatured: row.is_featured ?? false,
          badge: row.badge || undefined,
          createdAt: row.created_at,
        }));
        memoryProducts = mapped;
        return mapped;
      }

      // If Supabase products table is completely empty, auto-seed with INITIAL_PRODUCTS
      if (!error && Array.isArray(data) && data.length === 0) {
        console.log("[storage] Supabase products empty, auto-seeding with INITIAL_PRODUCTS...");
        const seedRows = INITIAL_PRODUCTS.map((p) => ({
          id: p.id,
          name: p.name,
          name_ru: p.nameRu,
          description: p.description,
          description_ru: p.descriptionRu,
          price: p.price,
          old_price: p.oldPrice,
          category: p.category,
          image: p.image,
          images: p.images || [],
          sizes: p.sizes,
          colors: p.colors || [],
          is_available: p.isAvailable,
          is_featured: p.isFeatured,
          badge: p.badge,
          created_at: p.createdAt || new Date().toISOString(),
        }));
        await supabase.from("products").insert(seedRows);
        memoryProducts = INITIAL_PRODUCTS;
        return INITIAL_PRODUCTS;
      }
    } catch (err) {
      console.warn("[storage] Supabase getProducts error, falling back to local:", err);
    }
  }

  if (memoryProducts !== null) {
    return memoryProducts;
  }

  const loaded = safeReadFile<Product[]>(PRODUCTS_FILE, "products.json", INITIAL_PRODUCTS);
  memoryProducts = Array.isArray(loaded) ? loaded : INITIAL_PRODUCTS;
  return memoryProducts;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

export async function saveProduct(productData: Partial<Product> & { name: string; price: number }): Promise<Product> {
  const products = await getProducts();
  const id = productData.id || `btn-${Date.now().toString(36)}`;

  const savedProduct: Product = {
    id,
    name: productData.name,
    nameRu: productData.nameRu || productData.name,
    description: productData.description || "",
    descriptionRu: productData.descriptionRu || productData.description || "",
    price: Number(productData.price) || 0,
    oldPrice: productData.oldPrice ? Number(productData.oldPrice) : undefined,
    category: productData.category || "suits",
    image: productData.image || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    sizes: productData.sizes && productData.sizes.length > 0 ? productData.sizes : ["M", "L", "XL"],
    colors: productData.colors || [],
    isAvailable: productData.isAvailable ?? true,
    isFeatured: productData.isFeatured ?? false,
    badge: productData.badge,
    createdAt: productData.createdAt || new Date().toISOString(),
  };

  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products[index] = savedProduct;
  } else {
    products.unshift(savedProduct);
  }

  memoryProducts = products;
  safeWriteFile(PRODUCTS_FILE, memoryProducts);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("products").upsert({
        id: savedProduct.id,
        name: savedProduct.name,
        name_ru: savedProduct.nameRu,
        description: savedProduct.description,
        description_ru: savedProduct.descriptionRu,
        price: savedProduct.price,
        old_price: savedProduct.oldPrice,
        category: savedProduct.category,
        image: savedProduct.image,
        images: savedProduct.images || [],
        sizes: savedProduct.sizes,
        colors: savedProduct.colors || [],
        is_available: savedProduct.isAvailable,
        is_featured: savedProduct.isFeatured,
        badge: savedProduct.badge,
        created_at: savedProduct.createdAt,
      });
    } catch (err) {
      console.warn("[storage] Supabase saveProduct error:", err);
    }
  }

  return savedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  memoryProducts = filtered;
  safeWriteFile(PRODUCTS_FILE, memoryProducts);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("products").delete().eq("id", id);
    } catch (err) {
      console.warn("[storage] Supabase deleteProduct error:", err);
    }
  }

  return true;
}

declare global {
  var __BUTTON_ORDERS__: Order[] | undefined;
}

// ------------------- ORDERS STORAGE -------------------
export async function getOrders(): Promise<Order[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped: Order[] = data.map((row) => ({
          id: row.id,
          customerId: row.customer_id,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          deliveryType: row.delivery_type,
          branchId: row.branch_id,
          branchName: row.branch_name,
          address: row.address,
          comment: row.comment,
          paymentMethod: row.payment_method,
          paymentStatus: row.payment_status,
          paymentReceipt: row.payment_receipt,
          paymentReceiptTime: row.payment_receipt_time,
          paymentRejectReason: row.payment_reject_reason,
          items: Array.isArray(row.items) ? row.items : [],
          totalAmount: Number(row.total_amount) || 0,
          status: row.status,
          telegramSent: row.telegram_sent ?? false,
          createdAt: row.created_at,
        }));
        memoryOrders = mapped;
        globalThis.__BUTTON_ORDERS__ = mapped;
        return mapped;
      }
    } catch (err) {
      console.warn("[storage] Supabase getOrders error:", err);
    }
  }

  if (globalThis.__BUTTON_ORDERS__ && globalThis.__BUTTON_ORDERS__.length > 0) {
    memoryOrders = globalThis.__BUTTON_ORDERS__;
    return memoryOrders;
  }

  if (memoryOrders !== null) {
    return memoryOrders;
  }

  const loaded = safeReadFile<Order[]>(ORDERS_FILE, "orders.json", []);
  memoryOrders = Array.isArray(loaded) ? loaded : [];
  globalThis.__BUTTON_ORDERS__ = memoryOrders;
  return memoryOrders;
}

export async function saveOrder(order: Order): Promise<Order> {
  const orders = await getOrders();
  const existingIdx = orders.findIndex((o) => o.id === order.id);
  if (existingIdx !== -1) {
    orders[existingIdx] = { ...orders[existingIdx], ...order };
  } else {
    orders.unshift(order);
  }

  memoryOrders = orders;
  globalThis.__BUTTON_ORDERS__ = orders;
  safeWriteFile(ORDERS_FILE, memoryOrders);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("orders").upsert({
        id: order.id,
        customer_id: order.customerId,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        delivery_type: order.deliveryType,
        branch_id: order.branchId,
        branch_name: order.branchName,
        address: order.address,
        comment: order.comment,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        payment_receipt: order.paymentReceipt,
        payment_receipt_time: order.paymentReceiptTime,
        payment_reject_reason: order.paymentRejectReason,
        items: order.items,
        total_amount: order.totalAmount,
        status: order.status,
        telegram_sent: order.telegramSent ?? false,
        created_at: order.createdAt,
      });
    } catch (err) {
      console.warn("[storage] Supabase saveOrder error:", err);
    }
  }

  // Record into customer database safely
  try {
    await recordCustomerOrder(
      order.customerPhone,
      order.customerName,
      order.totalAmount,
      order.address
    );
  } catch (err) {
    console.warn("[storage] Failed to record customer order:", err);
  }

  return order;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === id);
  let updatedOrder: Order;
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    updatedOrder = orders[index];
  } else {
    // Resilient fallback for serverless container isolation:
    updatedOrder = {
      id,
      customerName: "Mijoz",
      customerPhone: "",
      deliveryType: "delivery",
      paymentMethod: "click",
      paymentStatus: (updates.paymentStatus as any) || "verifying",
      items: [],
      totalAmount: 0,
      status: "new",
      createdAt: new Date().toISOString(),
      ...updates,
    };
    orders.unshift(updatedOrder);
  }

  memoryOrders = orders;
  safeWriteFile(ORDERS_FILE, memoryOrders);

  const supabase = getSupabase();
  if (supabase) {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.paymentReceipt !== undefined) dbUpdates.payment_receipt = updates.paymentReceipt;
      if (updates.paymentReceiptTime !== undefined) dbUpdates.payment_receipt_time = updates.paymentReceiptTime;
      if (updates.paymentRejectReason !== undefined) dbUpdates.payment_reject_reason = updates.paymentRejectReason;
      if (updates.telegramSent !== undefined) dbUpdates.telegram_sent = updates.telegramSent;

      await supabase.from("orders").update(dbUpdates).eq("id", id);
    } catch (err) {
      console.warn("[storage] Supabase updateOrder error:", err);
    }
  }

  return updatedOrder;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order | null> {
  return updateOrder(id, { status });
}
