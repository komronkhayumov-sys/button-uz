import fs from "fs";
import path from "path";
import os from "os";
import { Customer, Order, Product, StoreSettings } from "@/types";
import { DEFAULT_SETTINGS, INITIAL_PRODUCTS } from "@/constants";

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
    // Test write access to avoid EROFS if local directory is read-only
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

  // Fallback to bundled seed in process.cwd()/data/
  if (seedFilename) {
    try {
      const seedPath = path.join(SEED_DIR, seedFilename);
      if (fs.existsSync(seedPath)) {
        const raw = fs.readFileSync(seedPath, "utf-8");
        const parsed = JSON.parse(raw);
        // Attempt to cache in writable path
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
  if (memorySettings) {
    return memorySettings;
  }

  const initialSettings: StoreSettings = {
    ...DEFAULT_SETTINGS,
    adminPin: process.env.ADMIN_PIN || DEFAULT_SETTINGS.adminPin,
  };

  const stored = safeReadFile<StoreSettings>(SETTINGS_FILE, "settings.json", initialSettings);
  memorySettings = {
    ...initialSettings,
    ...(stored || {}),
  };
  return memorySettings;
}

export async function saveSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getSettings();
  memorySettings = {
    ...current,
    ...updates,
  };
  safeWriteFile(SETTINGS_FILE, memorySettings);
  return memorySettings;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const settings = await getSettings();
  return Boolean(pin && (pin === settings.adminPin || pin === process.env.ADMIN_PIN));
}

// ------------------- CUSTOMERS STORAGE -------------------
export async function getCustomers(): Promise<Customer[]> {
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

  if (existingIdx !== -1) {
    customers[existingIdx] = {
      ...customers[existingIdx],
      name: data.name || customers[existingIdx].name,
      address: data.address || customers[existingIdx].address,
      preferredSize: data.preferredSize || customers[existingIdx].preferredSize,
    };
    memoryCustomers = customers;
    safeWriteFile(CUSTOMERS_FILE, memoryCustomers);
    return customers[existingIdx];
  }

  const newCustomer: Customer = {
    id: `cust-${Date.now().toString(36)}`,
    name: data.name,
    phone: data.phone,
    address: data.address || "",
    preferredSize: data.preferredSize || "L",
    ordersCount: 0,
    totalSpent: 0,
    registeredAt: new Date().toISOString(),
  };

  customers.unshift(newCustomer);
  memoryCustomers = customers;
  safeWriteFile(CUSTOMERS_FILE, memoryCustomers);
  return newCustomer;
}

export async function recordCustomerOrder(phone: string, name: string, amount: number, address?: string) {
  const customers = await getCustomers();
  const cleanPhone = phone.replace(/\s+/g, "");
  const existing = customers.find((c) => c.phone.replace(/\s+/g, "") === cleanPhone);

  if (existing) {
    existing.ordersCount = (existing.ordersCount || 0) + 1;
    existing.totalSpent = (existing.totalSpent || 0) + amount;
    if (address && !existing.address) existing.address = address;
  } else {
    const newCust: Customer = {
      id: `cust-${Date.now().toString(36)}`,
      name,
      phone,
      address: address || "",
      preferredSize: "L",
      ordersCount: 1,
      totalSpent: amount,
      registeredAt: new Date().toISOString(),
    };
    customers.unshift(newCust);
  }

  memoryCustomers = customers;
  safeWriteFile(CUSTOMERS_FILE, memoryCustomers);
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  const customers = await getCustomers();
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  customers[idx] = { ...customers[idx], ...updates };
  memoryCustomers = customers;
  safeWriteFile(CUSTOMERS_FILE, memoryCustomers);
  return customers[idx];
}

// ------------------- PRODUCTS STORAGE -------------------
export async function getProducts(): Promise<Product[]> {
  if (memoryProducts !== null) {
    return memoryProducts;
  }

  const loaded = safeReadFile<Product[]>(PRODUCTS_FILE, "products.json", []);
  memoryProducts = Array.isArray(loaded) ? loaded : [];
  return memoryProducts;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

export async function saveProduct(productData: Partial<Product> & { name: string; price: number }): Promise<Product> {
  const products = await getProducts();
  let savedProduct: Product;

  if (productData.id) {
    const index = products.findIndex((p) => p.id === productData.id);
    if (index !== -1) {
      savedProduct = {
        ...products[index],
        ...productData,
      } as Product;
      products[index] = savedProduct;
    } else {
      savedProduct = {
        id: productData.id,
        name: productData.name,
        nameRu: productData.nameRu || productData.name,
        description: productData.description || "",
        descriptionRu: productData.descriptionRu || productData.description || "",
        price: Number(productData.price) || 0,
        oldPrice: productData.oldPrice ? Number(productData.oldPrice) : undefined,
        category: productData.category || "suits",
        image: productData.image || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
        sizes: productData.sizes && productData.sizes.length > 0 ? productData.sizes : ["M", "L", "XL"],
        isAvailable: productData.isAvailable ?? true,
        isFeatured: productData.isFeatured ?? false,
        badge: productData.badge,
        createdAt: productData.createdAt || new Date().toISOString(),
      };
      products.unshift(savedProduct);
    }
  } else {
    savedProduct = {
      id: `btn-${Date.now().toString(36)}`,
      name: productData.name,
      nameRu: productData.nameRu || productData.name,
      description: productData.description || "",
      descriptionRu: productData.descriptionRu || productData.description || "",
      price: Number(productData.price) || 0,
      oldPrice: productData.oldPrice ? Number(productData.oldPrice) : undefined,
      category: productData.category || "suits",
      image: productData.image || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
      sizes: productData.sizes && productData.sizes.length > 0 ? productData.sizes : ["M", "L", "XL"],
      isAvailable: productData.isAvailable ?? true,
      isFeatured: productData.isFeatured ?? false,
      badge: productData.badge,
      createdAt: new Date().toISOString(),
    };
    products.unshift(savedProduct);
  }

  memoryProducts = products;
  safeWriteFile(PRODUCTS_FILE, memoryProducts);
  return savedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  memoryProducts = filtered;
  safeWriteFile(PRODUCTS_FILE, memoryProducts);
  return true;
}

// ------------------- ORDERS STORAGE -------------------
export async function getOrders(): Promise<Order[]> {
  if (memoryOrders !== null) {
    return memoryOrders;
  }

  const loaded = safeReadFile<Order[]>(ORDERS_FILE, "orders.json", []);
  memoryOrders = Array.isArray(loaded) ? loaded : [];
  return memoryOrders;
}

export async function saveOrder(order: Order): Promise<Order> {
  const orders = await getOrders();
  orders.unshift(order);
  memoryOrders = orders;
  safeWriteFile(ORDERS_FILE, memoryOrders);

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
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...updates };
  memoryOrders = orders;
  safeWriteFile(ORDERS_FILE, memoryOrders);
  return orders[index];
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order | null> {
  return updateOrder(id, { status });
}
