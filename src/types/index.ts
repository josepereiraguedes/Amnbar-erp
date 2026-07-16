export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Collection {
  id: string;
  name: string;
}

export interface SockType {
  id: string;
  name: string;
}

export interface Warehouse {
  id: string;
  name: string;
}

export interface StockItem {
  id: string;
  warehouseId: string;
  quantity: number;
  warehouse: Warehouse;
}

export interface Product {
  id: string;
  sku: string;
  internalCode?: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: Category;
  brand?: string;
  collectionId?: string;
  collection?: Collection;
  model?: string;
  typeId: string;
  sockType?: SockType;
  color?: string;
  size?: string;
  imageUrl?: string;
  supplierId?: string;
  supplier?: any;
  costPrice: number;
  salePrice: number;
  margin: number;
  weight?: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  location?: string;
  status: string;
  observations?: string;
  stockItems?: StockItem[];
  recipeItems?: ProductRecipeItem[];
}

export interface RawMaterial {
  id: string;
  sku?: string;
  name: string;
  type: string;
  supplierId?: string;
  supplier?: any;
  unit: string;
  costPerUnit: number;
  currentStock: number;
  minStock: number;
}

export interface ProductionOrderItem {
  id: string;
  productionOrderId: string;
  rawMaterialId: string;
  rawMaterial?: RawMaterial;
  quantity: number;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  productId: string;
  product?: Product;
  quantity: number;
  status: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  userId: string;
  user?: { name: string };
  items?: ProductionOrderItem[];
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  type: string;
}

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  status: string;
  totalAmount: number;
  discount: number;
  netAmount: number;
  paymentMethod?: string;
  paymentStatus: string;
  notes?: string;
  userId: string;
  user?: { name: string };
  items?: SalesOrderItem[];
  createdAt: string;
}

export interface ProductRecipeItem {
  id: string;
  productId: string;
  rawMaterialId: string;
  rawMaterial?: RawMaterial;
  quantity: number;
}
