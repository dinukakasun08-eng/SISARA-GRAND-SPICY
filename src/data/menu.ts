import { MenuItem } from '../types';

export const MENU_ITEMS: MenuItem[] = [
  // Appetizers
  {
    id: 'app-1',
    name: 'Crispy Vegetable Spring Rolls',
    description: 'Crispy fried pastries filled with a savory mixture of shredded vegetables, glass noodles, and wood ear mushrooms. Served with sweet chili dipping sauce.',
    price: 8.50,
    category: 'Appetizers',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    isVegetarian: true,
    isPopular: true
  },
  {
    id: 'app-2',
    name: 'Spicy Garlic Chili Calamari',
    description: 'Tender calamari lightly dusted with seasoned flour, wok-tossed with fresh red chilies, spring onions, and golden garlic. Served with a citrus lime aioli.',
    price: 13.90,
    category: 'Appetizers',
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80',
    isSpicy: true,
    isPopular: false
  },
  {
    id: 'app-3',
    name: 'Signature Chicken Satay',
    description: 'Skewers of tender chicken breast marinated in traditional spices and lemongrass, grilled to perfection over charcoal. Served with a rich peanut dip.',
    price: 10.50,
    category: 'Appetizers',
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=80',
    isSpicy: false,
    isPopular: true
  },

  // Mains
  {
    id: 'main-1',
    name: 'Aromatic Thai Green Curry',
    description: 'A traditional rich, coconut milk-based green curry infused with lemongrass, fresh sweet basil, bamboo shoots, and kaffir lime leaves. Served with steamed jasmine rice.',
    price: 18.90,
    category: 'Mains',
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop&q=80',
    isSpicy: true,
    isVegetarian: false,
    isPopular: true
  },
  {
    id: 'main-2',
    name: 'Slow-Cooked Massaman Lamb Shank',
    description: 'A masterpiece of slow-roasted, fall-off-the-bone tender lamb shank simmered in a mild, sweet, and nutty Massaman curry with potatoes, pearl onions, and toasted peanuts.',
    price: 24.50,
    category: 'Mains',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    isSpicy: false,
    isPopular: true
  },
  {
    id: 'main-3',
    name: 'Classic Pad Thai Noodles',
    description: 'Stir-fried thin rice noodles in our authentic tamarind sauce with pressed tofu, bean sprouts, Chinese chives, crushed roasted peanuts, and choice of fresh prawns or chicken.',
    price: 16.50,
    category: 'Mains',
    imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop&q=80',
    isVegetarian: true,
    isPopular: false
  },
  {
    id: 'main-4',
    name: 'Wok-Fired Basil Beef (Pad Kra Prow)',
    description: 'Minced flank steak stir-fried with hot holy basil, fiery bird\'s eye chilies, green beans, and garlic. Crowned with a crispy-edged fried egg and served with jasmine rice.',
    price: 19.50,
    category: 'Mains',
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    isSpicy: true,
    isPopular: true
  },

  // Desserts
  {
    id: 'des-1',
    name: 'Sweet Mango Sticky Rice',
    description: 'Perfectly ripe, sweet honey mango slices served alongside warm sweet glutinous rice, drizzled with a rich salted coconut cream sauce and toasted mung beans.',
    price: 9.50,
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    isVegetarian: true,
    isPopular: true
  },
  {
    id: 'des-2',
    name: 'Coconut Crème Caramel',
    description: 'Silky smooth coconut custard baked with an organic palm sugar caramel sauce, served cold with fresh seasonal berries and a hint of mint.',
    price: 8.90,
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80',
    isVegetarian: true,
    isPopular: false
  },

  // Drinks
  {
    id: 'dri-1',
    name: 'Authentic Thai Iced Tea',
    description: 'A traditional strongly-brewed black tea sweetened with sugar and condensed milk, poured over crushed ice and topped with evaporated milk.',
    price: 5.50,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
    isVegetarian: true,
    isPopular: true
  },
  {
    id: 'dri-2',
    name: 'Fresh Young Coconut Water',
    description: 'Served chilled in its original shell, direct from young organic green coconuts. Refreshing, naturally sweet, and rich in natural electrolytes.',
    price: 6.50,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1525385133336-254847243d97?w=600&auto=format&fit=crop&q=80',
    isVegetarian: true,
    isPopular: false
  },
  {
    id: 'dri-3',
    name: 'Lyree Lemongrass Infusion',
    description: 'A house-made cold infusion of fresh lemongrass stalks, sweet lychee fruit syrup, fresh lime juice, and sparkling mineral water.',
    price: 6.00,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    isVegetarian: true,
    isPopular: true
  }
];
