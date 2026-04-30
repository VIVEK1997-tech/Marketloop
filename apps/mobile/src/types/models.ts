export type Role = 'buyer' | 'seller' | 'admin';

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  roles: Role[];
  activeRole: Role;
  profileImage?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    address?: string;
  };
  isVerified?: boolean;
}

export interface MarketplaceProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  unit?: string;
  quantity?: number;
  normalizedPricePerKg?: number;
  category: string;
  location: string;
  images?: string[];
  status?: string;
  seller?: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    profileImage?: string;
  };
}

export interface CartEntry {
  productId: string;
  quantity: number;
  product: MarketplaceProduct;
}

export interface OrderSummary {
  _id: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  failureReason?: string;
  createdAt: string;
  product: MarketplaceProduct;
  seller?: UserProfile;
  buyer?: UserProfile;
  receipt?: string;
  invoice?: {
    invoiceNumber: string;
    detailPath?: string;
  } | null;
}

export interface OrderDetail extends OrderSummary {
  tracking?: {
    deliveryStatus?: string;
    estimatedDelivery?: string | null;
  };
}

export interface PaymentRecord {
  _id?: string;
  status?: string;
  method?: string;
  amount?: number;
  currency?: string;
  paymentGateway?: string;
  gatewayVariant?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  payuTxnId?: string;
  payuMihpayId?: string;
  createdAt?: string;
}

export interface OrderDetailResponse {
  order: OrderDetail;
  payment?: PaymentRecord | null;
}

export interface PaymentSession {
  order: {
    id: string;
    receipt: string;
    amount: string | number;
    currency: string;
    gateway?: string;
    gatewayVariant?: string;
    razorpayOrderId?: string;
    payuTxnId?: string;
  };
  checkout: {
    provider?: string;
    url?: string;
    paymentUrl?: string;
    paymentSessionId?: string;
    launchUrl?: string;
    mode?: string;
    [key: string]: unknown;
  };
}

export interface PaymentStatusResponse {
  order: OrderSummary;
  payment?: PaymentRecord | null;
  status?: {
    status?: string;
    gatewayPaymentId?: string;
    method?: string;
  } | null;
}

export interface CheckoutGateway {
  id: string;
  company: string;
  type: string;
  enabled: boolean;
  runtimeAvailable?: boolean;
  ready?: boolean;
  status?: string;
  configReasons?: string[];
}

export interface CheckoutGatewaysResponse {
  mode: string;
  paymentMode: string;
  defaultGateway: string;
  gateways: CheckoutGateway[];
}

export interface InvoiceSummary {
  id?: string;
  _id?: string;
  invoiceNumber: string;
  invoiceType: string;
  linkedReference?: string;
  partyName: string;
  total: number;
  formattedTotal?: string;
  issueDate: string;
  dueDate?: string;
  status: string;
  detailPath?: string;
}

export interface InvoiceDetail {
  _id?: string;
  invoiceNumber: string;
  invoiceType?: string;
  status: string;
  partyName?: string;
  total?: number;
  issueDate?: string;
  dueDate?: string;
  buyer?: {
    name?: string;
    gstin?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  seller?: {
    name?: string;
    gstin?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items?: Array<{
    itemName?: string;
    quantity?: number;
    unit?: string;
    grossAmount?: number;
    discount?: number;
    offerLabel?: string;
    hsnCode?: string;
    taxableAmount?: number;
    taxRate?: number;
    taxAmount?: number;
    lineTotal?: number;
  }>;
  taxSummary?: {
    taxableAmount?: number;
    grossAmount?: number;
    discountTotal?: number;
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
    additionalCharges?: number;
    deliveryCharges?: number;
    grandTotal?: number;
  };
  meta?: {
    linkedOrderId?: string;
    linkedPurchaseId?: string;
    placeOfSupply?: string;
    pdfGeneratedAt?: string;
  };
}

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  module: string;
  linkedRecordId?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupportComplaint {
  complaintId: string;
  complaintType: string;
  against: string;
  status: 'open' | 'resolved' | 'investigating';
  note: string;
  raisedByName?: string;
  raisedByRole?: string;
  linkedOrderId?: string;
  linkedPaymentId?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary {
  _id: string;
  participants: Array<Pick<UserProfile, 'id' | 'name' | 'profileImage'> & { _id?: string; online?: boolean }>;
  product?: Pick<MarketplaceProduct, '_id' | 'title' | 'price' | 'images'>;
  lastMessage?: MessageItem;
  updatedAt: string;
}

export interface MessageItem {
  _id: string;
  conversation?: string;
  message: string;
  createdAt: string;
  sender?: Pick<UserProfile, 'id' | 'name' | 'profileImage'> & { _id?: string };
  receiver?: Pick<UserProfile, 'id' | 'name' | 'profileImage'> & { _id?: string };
}

export interface SellerDashboardSummary {
  listingsCount: number;
  soldCount: number;
  buyerChatsCount: number;
  pendingInvoices: number;
  paidInvoices: number;
  recentListings: Array<{
    _id: string;
    title: string;
    status: string;
    price: number;
    unit?: string;
    updatedAt: string;
  }>;
  recentOrders: OrderSummary[];
}

export interface ReviewAuthor {
  _id?: string;
  name?: string;
  profileImage?: string;
}

export interface ProductReview {
  _id: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  verifiedBuyer?: boolean;
  helpfulBy?: string[];
  notHelpfulBy?: string[];
  reviewer?: ReviewAuthor;
  product?: {
    title?: string;
  };
}

export interface ReviewSummary {
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
  breakdown: Record<string, number>;
  topRated?: boolean;
}
