export const groceryCategories = [
  {
    label: 'Fresh Fruits',
    value: 'Fresh Fruits',
    image:
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80',
    accent: 'from-rose-100 via-orange-50 to-white',
    description: 'Bananas, apples, mangoes, grapes and daily-cut seasonal fruit.',
    searchTerms: ['fruits', 'fruit', 'apple', 'banana', 'mango', 'orange', 'grapes', 'papaya', 'pineapple', 'pomegranate', 'guava', 'chikoo', 'custard apple', 'amla', 'jamun', 'ber', 'bael', 'lemon', 'mosambi', 'watermelon', 'muskmelon', 'coconut', 'dates', 'fig']
  },
  {
    label: 'Fresh Vegetables',
    value: 'Fresh Vegetables',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    accent: 'from-emerald-100 via-lime-50 to-white',
    description: 'Tomatoes, onions, cauliflower, capsicum and everyday staples.',
    searchTerms: ['vegetables', 'vegetable', 'tomato', 'onion', 'cauliflower', 'capsicum', 'brinjal', 'bhindi', 'ladyfinger', 'cabbage', 'peas', 'lauki', 'bottle gourd', 'tori', 'ridge gourd', 'karela', 'pumpkin', 'beans', 'drumstick', 'broccoli', 'zucchini', 'mushroom', 'baby corn']
  },
  {
    label: 'Leafy Greens',
    value: 'Leafy Greens',
    image:
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80',
    accent: 'from-lime-100 via-green-50 to-white',
    description: 'Spinach, coriander, mint, lettuce and tender greens.',
    searchTerms: ['leafy', 'greens', 'spinach', 'palak', 'methi', 'fenugreek', 'sarson', 'mustard leaves', 'coriander', 'mint', 'lettuce']
  },
  {
    label: 'Root Vegetables',
    value: 'Root Vegetables',
    image:
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80',
    accent: 'from-amber-100 via-orange-50 to-white',
    description: 'Potatoes, carrots, beetroot, radish and earthy kitchen basics.',
    searchTerms: ['root vegetables', 'potato', 'potatoes', 'carrot', 'beetroot', 'radish', 'turnip', 'sweet potato', 'yam', 'suran']
  },
  {
    label: 'Exotic Fruits',
    value: 'Exotic Fruits',
    image:
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=80',
    accent: 'from-fuchsia-100 via-pink-50 to-white',
    description: 'Dragon fruit, kiwi, avocado, blueberries and premium imports.',
    searchTerms: ['exotic fruits', 'kiwi', 'dragon fruit', 'strawberry', 'blueberry', 'berries']
  },
  {
    label: 'Herbs & Seasonings',
    value: 'Herbs & Seasonings',
    image:
      'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=900&q=80',
    accent: 'from-teal-100 via-cyan-50 to-white',
    description: 'Curry leaves, basil, ginger, garlic, green chilli and fresh herbs.',
    searchTerms: ['herbs', 'seasonings', 'ginger', 'garlic', 'green chilli', 'chilli', 'spring onion', 'basil']
  },
  {
    label: 'Salads & Sprouts',
    value: 'Salads & Sprouts',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    accent: 'from-cyan-100 via-sky-50 to-white',
    description: 'Salad bowls, cucumber, cherry tomato and ready-to-serve sprouts.',
    searchTerms: ['salads', 'sprouts', 'cucumber', 'salad', 'ready salad']
  },
  {
    label: 'Organic Produce',
    value: 'Organic Produce',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
    accent: 'from-green-100 via-emerald-50 to-white',
    description: 'Certified organic fruits and vegetables from trusted local growers.',
    searchTerms: ['organic', 'organic produce', 'organic fruits', 'organic vegetables']
  }
];

export const groceryCategoryValues = groceryCategories.map((category) => category.value);

export const groceryCategoryMap = groceryCategories.reduce((map, category) => {
  map[category.value] = category;
  return map;
}, {});

export const groceryBudgetOptions = [
  { label: 'Under Rs. 100', value: 100 },
  { label: 'Under Rs. 250', value: 250 },
  { label: 'Under Rs. 500', value: 500 },
  { label: 'Under Rs. 1000', value: 1000 }
];
