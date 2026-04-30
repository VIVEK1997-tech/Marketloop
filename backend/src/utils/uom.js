export const UOM = Object.freeze({
  KG: 'Kg',
  QUINTAL: 'Quintal',
  CRATE: 'Crate',
  TRUCK: 'Truck'
});

export const UOM_VALUES = Object.freeze(Object.values(UOM));

const DEFAULT_TRUCK_WEIGHT_KG = 12000;
const MIN_TRUCK_WEIGHT_KG = 8000;
const MAX_TRUCK_WEIGHT_KG = 20000;

const DEFAULT_CRATE_WEIGHTS_KG = Object.freeze({
  apple: 18,
  banana: 20,
  mango: 20,
  orange: 15,
  grapes: 10,
  papaya: 20,
  pineapple: 18,
  pomegranate: 18,
  guava: 20,
  watermelon: 25,
  muskmelon: 20,
  kiwi: 10,
  strawberry: 5,
  blueberry: 5,
  'dragon fruit': 10
});

const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeText = (value = '') => String(value).toLowerCase();

export const getDefaultUnitForCategory = (category = '') => {
  const normalized = normalizeText(category);
  if (normalized.includes('fruit')) return UOM.CRATE;
  return UOM.KG;
};

export const getSuggestedUnit = ({ category, quantity } = {}) => {
  const safeQuantity = Number(quantity);
  if (Number.isFinite(safeQuantity) && safeQuantity >= MIN_TRUCK_WEIGHT_KG) return UOM.TRUCK;
  return getDefaultUnitForCategory(category);
};

export const getCrateWeightKg = ({ title = '', category = '', crateWeightKg } = {}) => {
  const explicitWeight = toPositiveNumber(crateWeightKg, undefined);
  if (explicitWeight) return explicitWeight;

  const haystack = normalizeText(`${title} ${category}`);
  const match = Object.entries(DEFAULT_CRATE_WEIGHTS_KG).find(([keyword]) => haystack.includes(keyword));
  return match ? match[1] : 20;
};

export const getUnitWeightKg = ({ unit = UOM.KG, title, category, crateWeightKg, truckWeightKg } = {}) => {
  if (!UOM_VALUES.includes(unit)) {
    const error = new Error(`Invalid unit. Supported units: ${UOM_VALUES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (unit === UOM.KG) return 1;
  if (unit === UOM.QUINTAL) return 100;
  if (unit === UOM.CRATE) return getCrateWeightKg({ title, category, crateWeightKg });
  if (unit === UOM.TRUCK) {
    const weight = toPositiveNumber(truckWeightKg, DEFAULT_TRUCK_WEIGHT_KG);
    if (weight < MIN_TRUCK_WEIGHT_KG || weight > MAX_TRUCK_WEIGHT_KG) {
      const error = new Error(`Truck weight must be between ${MIN_TRUCK_WEIGHT_KG} Kg and ${MAX_TRUCK_WEIGHT_KG} Kg`);
      error.statusCode = 400;
      throw error;
    }
    return weight;
  }

  return 1;
};

export const convertToKg = ({ quantity = 1, unit = UOM.KG, title, category, crateWeightKg, truckWeightKg } = {}) => {
  const safeQuantity = toPositiveNumber(quantity, 1);
  return safeQuantity * getUnitWeightKg({ unit, title, category, crateWeightKg, truckWeightKg });
};

export const convertFromKg = ({ kg, unit = UOM.KG, title, category, crateWeightKg, truckWeightKg } = {}) => {
  const safeKg = toPositiveNumber(kg, 0);
  const unitWeight = getUnitWeightKg({ unit, title, category, crateWeightKg, truckWeightKg });
  return unitWeight ? safeKg / unitWeight : 0;
};

export const getNormalizedPricePerKg = ({ price, unit = UOM.KG, title, category, crateWeightKg, truckWeightKg } = {}) => {
  const safePrice = toPositiveNumber(price, 0);
  const unitWeight = getUnitWeightKg({ unit, title, category, crateWeightKg, truckWeightKg });
  return unitWeight ? Number((safePrice / unitWeight).toFixed(2)) : safePrice;
};

export const getConversionMeta = ({ unit = UOM.KG, title, category, crateWeightKg, truckWeightKg } = {}) => {
  const unitWeightKg = getUnitWeightKg({ unit, title, category, crateWeightKg, truckWeightKg });
  return {
    unitWeightKg,
    note: unit === UOM.KG ? 'Base mandi unit' : `1 ${unit} = ${unitWeightKg.toLocaleString('en-IN')} Kg`
  };
};
