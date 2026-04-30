import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import ProductDetailsPage from './pages/ProductDetailsPage.jsx';
import BuyingOptionsPage from './pages/BuyingOptionsPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import CashfreeReturnPage from './pages/CashfreeReturnPage.jsx';
import HdfcMockGatewayPage from './pages/HdfcMockGatewayPage.jsx';
import HdfcReturnPage from './pages/HdfcReturnPage.jsx';
import MobilePaymentBridgePage from './pages/MobilePaymentBridgePage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import PaymentLinkCreatePage from './pages/PaymentLinkCreatePage.jsx';
import PublicPaymentStatusPage from './pages/PublicPaymentStatusPage.jsx';
import AdminPaymentsPage from './pages/AdminPaymentsPage.jsx';
import ProductForm from './pages/ProductForm.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyOtp from './pages/VerifyOtp.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Cart from './pages/Cart.jsx';
import Chat from './pages/Chat.jsx';
import Admin from './pages/Admin.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminOrderDetails from './pages/AdminOrderDetails.jsx';
import AdminUserDetails from './pages/AdminUserDetails.jsx';
import Wishlist from './pages/Wishlist.jsx';
import PaymentHistory from './pages/PaymentHistory.jsx';
import Invoices from './pages/Invoices.jsx';
import InvoiceDetails from './pages/InvoiceDetails.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/mobile-payment-bridge" element={<MobilePaymentBridgePage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/product/:id/buy" element={<BuyingOptionsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/cashfree/return" element={<CashfreeReturnPage />} />
        <Route path="/payment/hdfc/mock-gateway" element={<HdfcMockGatewayPage />} />
        <Route path="/payment/hdfc/return" element={<HdfcReturnPage />} />
        <Route path="/payment/:paymentId" element={<PublicPaymentStatusPage />} />
        <Route path="/payment-links/create" element={<PaymentLinkCreatePage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route element={<ProtectedRoute roles={['seller', 'admin']} />}>
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:invoiceIdOrNumber" element={<InvoiceDetails />} />
          <Route path="/chat" element={<Chat />} />
        </Route>
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/users/:userId" element={<AdminUserDetails />} />
          <Route path="/admin/orders/:orderId" element={<AdminOrderDetails />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
