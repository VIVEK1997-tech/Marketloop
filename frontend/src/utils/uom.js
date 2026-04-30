export const UOM = Object.freeze({
  KG: 'Kg',
  QUINTAL: 'Quintal',
  CRATE: 'Crate',
  TRUCK: 'Truck'
});

export const UOM_OPTIONS = Object.freeze([
  { value: UOM.KG, label: 'Kg', helper: 'Standard mandi rate' },
  { value: UOM.QUINTAL, label: 'Quintal', helper: 'Bulk rate, 1 Quintal = 100 Kg' },
  { value: UOM.CRATE, label: 'Crate', helper: 'Common for fruit trades' },
  { value: UOM.TRUCK, label: 'Truck', helper: 'Large deal, usually 8-20 tons' }
]);

export const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export const formatPriceUnit = (product = {}) => `${formatCurrency(product.price)} / ${product.unit || UOM.KG}`;

export const formatNormalizedPrice = (product = {}) => {
  if (!product.normalizedPricePerKg || product.unit === UOM.KG) return `${formatCurrency(product.price)} / Kg`;
  return `${formatCurrency(product.normalizedPricePerKg)} / Kg equivalent`;
};

export const getUnitHelper = (unit) => UOM_OPTIONS.find((option) => option.value === unit)?.helper || 'Select pricing unit';
