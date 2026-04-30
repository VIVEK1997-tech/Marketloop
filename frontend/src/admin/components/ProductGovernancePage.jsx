import { useEffect, useMemo, useState } from 'react';
import { Download, FileArchive, RefreshCcw } from 'lucide-react';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import BuyerSummaryCards from './BuyerSummaryCards.jsx';
import ToastStack from './ToastStack.jsx';
import ProductFilters from './ProductFilters.jsx';
import ProductPagination from './ProductPagination.jsx';
import BulkActionToolbar from './BulkActionToolbar.jsx';
import ProductTable from './ProductTable.jsx';
import ProductDetailDrawer from './ProductDetailDrawer.jsx';
import { generateDummyProducts } from '../products/mockProducts.js';
import { filterProducts, formatMoney, getPaginationMeta, paginateRows, sortProducts } from '../products/productUtils.js';

const initialFilters = {
  search: '',
  approval: 'all',
  stock: 'all',
  organic: 'all',
  quality: 'all',
  category: 'all',
  vendor: 'all',
  lifecycle: 'all'
};

export default function ProductGovernancePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('updated');
  const [sortDirection, setSortDirection] = useState('desc');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeProduct, setActiveProduct] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(generateDummyProducts(1000));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const pushToast = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };

  const filteredProducts = useMemo(() => filterProducts(products, filters), [products, filters]);
  const sortedProducts = useMemo(() => sortProducts(filteredProducts, sortBy, sortDirection), [filteredProducts, sortBy, sortDirection]);
  const pagedProducts = useMemo(() => paginateRows(sortedProducts, currentPage, rowsPerPage), [sortedProducts, currentPage, rowsPerPage]);
  const { start, end, totalPages } = useMemo(() => getPaginationMeta(sortedProducts.length, currentPage, rowsPerPage), [sortedProducts.length, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection, rowsPerPage]);

  const categoryOptions = useMemo(() => [...new Set(products.map((product) => product.category))].sort(), [products]);
  const vendorOptions = useMemo(() => [...new Set(products.map((product) => product.vendorName))].sort(), [products]);

  const metrics = useMemo(() => {
    const approved = products.filter((product) => product.approvalStatus === 'Approved').length;
    const pending = products.filter((product) => product.approvalStatus === 'Pending Review').length;
    const outOfStock = products.filter((product) => product.stock === 0).length;
    const organic = products.filter((product) => product.organic).length;
    const watchlisted = products.filter((product) => product.vendorTrustLevel === 'Watchlist').length;
    const needsReview = products.filter((product) => ['Needs Review', 'Critical'].includes(product.healthBand)).length;
    return [
      { label: 'Total Listings', value: products.length.toLocaleString('en-IN'), helper: 'Seeded product governance records' },
      { label: 'Approved Listings', value: approved.toLocaleString('en-IN'), helper: 'Products live or cleared for sale' },
      { label: 'Pending Review', value: pending.toLocaleString('en-IN'), helper: 'Listings waiting for moderation' },
      { label: 'Out of Stock', value: outOfStock.toLocaleString('en-IN'), helper: 'Zero-stock products needing action' },
      { label: 'Organic Claims', value: organic.toLocaleString('en-IN'), helper: 'Listings with organic verification flow' },
      { label: 'Needs Review Queue', value: `${needsReview} / ${watchlisted}`, helper: 'Health-critical and watchlist-vendor listings' }
    ];
  }, [products]);

  const updateProducts = (predicate, updater) => {
    setProducts((current) => current.map((product) => (predicate(product) ? updater(product) : product)));
  };

  const handleAction = (action, product) => {
    if (action === 'archive') {
      setConfirmState({
        title: `Archive ${product.productName}?`,
        message: 'This is a destructive moderation action and should stay explicit.',
        onConfirm: () => {
          updateProducts((item) => item.id === product.id, (item) => ({ ...item, lifecycleStatus: 'Archived' }));
          setConfirmState(null);
          pushToast('Product archived', `${product.productName} moved to archived lifecycle.`);
        }
      });
      return;
    }

    const patch =
      action === 'approve' ? { approvalStatus: 'Approved', lifecycleStatus: product.stock === 0 ? 'Out of Stock' : 'Approved' } :
      action === 'reject' ? { approvalStatus: 'Rejected', lifecycleStatus: 'Rejected' } :
      action === 'out_of_stock' ? { stock: 0, lifecycleStatus: 'Out of Stock' } :
      action === 'feature' ? { featured: !product.featured } :
      action === 'restock' ? { adminNote: `${product.adminNote} Restock request sent to vendor.` } :
      action === 'verify_organic' ? { organic: true, adminNote: `${product.adminNote} Organic status verified.` } :
      action === 'quality' ? { quality: product.quality === 'Average' ? 'Fresh' : 'Premium' } :
      action === 'note' ? { adminNote: `${product.adminNote} Admin added moderation note.` } :
      action === 'flag' ? { suspiciousFlags: [...new Set([...product.suspiciousFlags, 'Suspicious pricing'])] } :
      action === 'edit' ? { adminNote: `${product.adminNote} Listing opened for edit workflow.` } :
      null;

    if (action === 'export') {
      downloadCsv(`${product.productName}-listing`, [product]);
      pushToast('Product exported', `${product.productName} exported as CSV.`);
      return;
    }

    if (patch) {
      updateProducts((item) => item.id === product.id, (item) => ({ ...item, ...patch }));
    }
    pushToast('Product action completed', `${product.productName}: ${action.replace(/_/g, ' ')} applied.`);
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    if (action === 'export') {
      downloadCsv('selected-products', products.filter((product) => selectedIds.has(product.id)));
      pushToast('Bulk export ready', `${ids.length} products exported.`);
      return;
    }

    updateProducts(
      (product) => selectedIds.has(product.id),
      (product) => ({
        ...product,
        approvalStatus: action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : product.approvalStatus,
        lifecycleStatus:
          action === 'approve' ? (product.stock === 0 ? 'Out of Stock' : 'Approved') :
          action === 'reject' ? 'Rejected' :
          action === 'archive' ? 'Archived' :
          action === 'out_of_stock' ? 'Out of Stock' :
          product.lifecycleStatus,
        stock: action === 'out_of_stock' ? 0 : product.stock,
        suspiciousFlags: action === 'flag' ? [...new Set([...product.suspiciousFlags, 'Duplicate product'])] : product.suspiciousFlags
      })
    );
    pushToast('Bulk moderation completed', `${ids.length} products updated.`);
  };

  const handleTopAction = (key) => {
    if (key === 'generate') {
      setLoading(true);
      setTimeout(() => {
        setProducts(generateDummyProducts(1000));
        setLoading(false);
        pushToast('Product governance regenerated', '1000 seeded listings were refreshed.');
      }, 350);
      return;
    }
    if (key === 'csv') {
      downloadCsv('product-governance', sortedProducts);
      pushToast('CSV downloaded', 'Filtered product dataset exported.');
      return;
    }
    downloadZip(
      'product-governance',
      sortedProducts.slice(0, 50).map((product) => ({
        name: product.sku,
        extension: 'txt',
        content: JSON.stringify(product, null, 2)
      }))
    );
    pushToast('ZIP downloaded', 'Product governance bundle generated.');
  };

  const toggleSelect = (productId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleSelectPage = (rows) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = rows.every((row) => next.has(row.id));
      rows.forEach((row) => {
        if (allSelected) next.delete(row.id);
        else next.add(row.id);
      });
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <BuyerSummaryCards metrics={metrics} />

      <div className="flex flex-wrap items-center gap-3">
        {[
          ['generate', 'Generate Product Governance', RefreshCcw, 'primary'],
          ['csv', 'Download CSV', Download],
          ['zip', 'Download ZIP', FileArchive]
        ].map(([key, label, Icon, tone]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTopAction(key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tone === 'primary'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Product governance</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Moderate listings, review metadata completeness, vendor trust, and product health.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sort by</span>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
            <option value="health">Health score</option>
            <option value="updated">Date updated</option>
            <option value="approval">Approval status</option>
          </select>
          <button type="button" onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200">
            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
      </div>

      <ProductFilters filters={filters} categoryOptions={categoryOptions} vendorOptions={vendorOptions} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onReset={() => setFilters(initialFilters)} />
      <BulkActionToolbar selectedCount={selectedIds.size} onAction={handleBulkAction} />

      {loading ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            <div className="h-5 w-48 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
          </div>
        </div>
      ) : !sortedProducts.length ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">No products match the current filters.</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try resetting filters or widening the category/vendor scope.</p>
        </div>
      ) : (
        <>
          <ProductTable rows={pagedProducts} selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleSelectPage={toggleSelectPage} onOpenProduct={setActiveProduct} onAction={handleAction} activeId={activeProduct?.id} />
          <ProductPagination start={start} end={end} total={sortedProducts.length} rowsPerPage={rowsPerPage} currentPage={currentPage} totalPages={totalPages} onRowsPerPageChange={setRowsPerPage} onPageChange={setCurrentPage} />
        </>
      )}

      <ProductDetailDrawer product={activeProduct} open={Boolean(activeProduct)} onClose={() => setActiveProduct(null)} onAction={handleAction} />

      {confirmState && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{confirmState.title}</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{confirmState.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmState(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Cancel</button>
              <button type="button" onClick={confirmState.onConfirm} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
