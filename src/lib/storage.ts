import fs from "fs";
import path from "path";
import { Customer, Order, Product, StoreSettings } from "@/types";
import { DEFAULT_SETTINGS, INITIAL_PRODUCTS } from "@/constants";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ------------------- SETTINGS STORAGE -------------------
export async function getSettings(): Promise<StoreSettings> {
  ensureDirectoryExists();

  if (!fs.existsSync(SETTINGS_FILE)) {
    const initial = {
      ...DEFAULT_SETTINGS,
      adminPin: process.env.ADMIN_PIN || DEFAULT_SETTINGS.adminPin,
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }

  try {
    const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.error("Failed to read settings file:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  ensureDirectoryExists();
  const current = await getSettings();
  const updated: StoreSettings = {
    ...current,
    ...updates,
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const settings = await getSettings();
  return Boolean(pin && (pin === settings.adminPin || pin === process.env.ADMIN_PIN));
}

// ------------------- CUSTOMERS STORAGE -------------------
export async function getCustomers(): Promise<Customer[]> {
  ensureDirectoryExists();

  if (!fs.existsSync(CUSTOMERS_FILE)) {
    // Seed initial demo customers
    const initialCustomers: Customer[] = [
      {
        id: "cust-1",
        name: "Jasur Aliyev",
        phone: "+998 90 123 45 67",
        address: "Toshkent sh., Chilonzor 9, 15-uy",
        preferredSize: "L / 50",
        ordersCount: 2,
        totalSpent: 1470000,
        registeredAt: "2026-11-02T10:30:00Z",
      },
      {
        id: "cust-2",
        name: "Sardor Rustamov",
        phone: "+998 90 999 88 77",
        address: "Toshkent sh., Yunusobod 11, 44-uy",
        preferredSize: "XL",
        ordersCount: 1,
        totalSpent: 490000,
        registeredAt: "2026-11-04T14:15:00Z",
      },
    ];
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(initialCustomers, null, 2), "utf-8");
    return initialCustomers;
  }

  try {
    const raw = fs.readFileSync(CUSTOMERS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read customers file:", error);
    return [];
  }
}

export async function saveCustomer(data: {
  name: string;
  phone: string;
  address?: string;
  preferredSize?: string;
}): Promise<Customer> {
  ensureDirectoryExists();
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
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf-8");
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
  fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf-8");
  return newCustomer;
}

export async function recordCustomerOrder(phone: string, name: string, amount: number, address?: string) {
  ensureDirectoryExists();
  const customers = await getCustomers();
  const cleanPhone = phone.replace(/\s+/g, "");
  const existing = customers.find((c) => c.phone.replace(/\s+/g, "") === cleanPhone);

  if (existing) {
    existing.ordersCount = (existing.ordersCount || 0) + 1;
    existing.totalSpent = (existing.totalSpent || 0) + amount;
    if (address && !existing.address) existing.address = address;
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf-8");
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
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf-8");
  }
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  ensureDirectoryExists();
  const customers = await getCustomers();
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  customers[idx] = { ...customers[idx], ...updates };
  fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf-8");
  return customers[idx];
}

// ------------------- PRODUCTS STORAGE -------------------
export async function getProducts(): Promise<Product[]> {
  ensureDirectoryExists();

  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), "utf-8");
    return INITIAL_PRODUCTS;
  }

  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), "utf-8");
      return INITIAL_PRODUCTS;
    }
    return parsed;
  } catch (error) {
    console.error("Failed to read products file, falling back to initial products:", error);
    return INITIAL_PRODUCTS;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

export async function saveProduct(productData: Partial<Product> & { name: string; price: number }): Promise<Product> {
  ensureDirectoryExists();
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

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
  return savedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  ensureDirectoryExists();
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

// ------------------- ORDERS STORAGE -------------------
export async function getOrders(): Promise<Order[]> {
  ensureDirectoryExists();

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), "utf-8");
    return [];
  }

  try {
    const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read orders file:", error);
    return [];
  }
}

export async function saveOrder(order: Order): Promise<Order> {
  ensureDirectoryExists();
  const orders = await getOrders();
  orders.unshift(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");

  // Record into customer database
  await recordCustomerOrder(
    order.customerPhone,
    order.customerName,
    order.totalAmount,
    order.address
  );

  return order;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  ensureDirectoryExists();
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...updates };
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  return orders[index];
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order | null> {
  return updateOrder(id, { status });
}
