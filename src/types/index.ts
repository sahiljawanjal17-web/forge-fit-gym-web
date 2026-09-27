export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "TRAINER" | "MEMBER";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  features: string[];
  facilities: string[];
}

export interface UserMembership {
  id: string;
  userId: string;
  planId: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";
  startDate: Date;
  endDate: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  inventory: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  priceAdjustment: number;
  inventory: number;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
}

export interface PaymentTransaction {
  id: string;
  orderId?: string;
  membershipId?: string;
  amount: number;
  currency: string;
  provider: string;
  providerTransactionId: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  createdAt: Date;
}

export interface EMIPlan {
  id: string;
  months: number;
  interestRate: number;
  minimumAmount: number;
}

export interface ChatConversation {
  id: string;
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  read: boolean;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardKPIs {
  totalRevenue: number;
  activeMembers: number;
  newMembersThisMonth: number;
  totalOrders: number;
  revenueGrowth: number;
  memberRetentionRate: number;
}
