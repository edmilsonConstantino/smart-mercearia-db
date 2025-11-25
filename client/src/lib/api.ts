// API client for backend communication
const API_BASE = '/api';

interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'manager' | 'seller';
  avatar?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string | null;
  price: string;
  costPrice: string;
  stock: string;
  minStock: string;
  unit: 'un' | 'kg' | 'g' | 'pack' | 'box';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Sale {
  id: string;
  userId: string;
  total: string;
  amountReceived?: string;
  change?: string;
  paymentMethod: 'cash' | 'card' | 'pix' | 'mpesa' | 'emola' | 'pos' | 'bank';
  items: Array<{
    productId: string;
    quantity: number;
    priceAtSale: number;
  }>;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId?: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: Date;
}

export interface AuditLog {
  id: number;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  createdAt: Date;
}

export interface EditCount {
  count: number;
  limit: number;
  canEdit: boolean;
}

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao fazer login');
    }
    return res.json();
  },

  logout: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Erro ao fazer logout');
  },

  getMe: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  }
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/users`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao buscar usuários');
    return res.json();
  },

  create: async (data: Omit<User, 'id'>): Promise<User> => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao criar usuário');
    }
    return res.json();
  }
};

// Products API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const res = await fetch(`${API_BASE}/products`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao buscar produtos');
    return res.json();
  },

  create: async (data: any): Promise<Product> => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao criar produto');
    }
    return res.json();
  },

  update: async (id: string, data: any): Promise<Product> => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao atualizar produto');
    }
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao deletar produto');
    }
  }
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await fetch(`${API_BASE}/categories`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao buscar categorias');
    return res.json();
  },

  create: async (data: { name: string; color: string }): Promise<Category> => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao criar categoria');
    }
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao deletar categoria');
    }
  }
};

// Sales API
export const salesApi = {
  getAll: async (): Promise<Sale[]> => {
    const res = await fetch(`${API_BASE}/sales`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao buscar vendas');
    return res.json();
  },

  create: async (data: any): Promise<Sale> => {
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao criar venda');
    }
    return res.json();
  }
};

// Notifications API
export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const res = await fetch(`${API_BASE}/notifications`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao buscar notificações');
    return res.json();
  },

  markAsRead: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Erro ao marcar notificação como lida');
  }
};

// Audit Logs API
export const auditLogsApi = {
  getAll: async (): Promise<AuditLog[]> => {
    const res = await fetch(`${API_BASE}/audit-logs`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao buscar logs de auditoria');
    return res.json();
  }
};

// System API
export const systemApi = {
  getEditCount: async (): Promise<EditCount> => {
    const res = await fetch(`${API_BASE}/system/edit-count`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao buscar contagem de edições');
    return res.json();
  }
};
