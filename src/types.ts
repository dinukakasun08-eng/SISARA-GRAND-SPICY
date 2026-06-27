export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Appetizers' | 'Mains' | 'Desserts' | 'Drinks';
  imageUrl: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  isPopular?: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'on_way' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryGuyNumber?: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}
