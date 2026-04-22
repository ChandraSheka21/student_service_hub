const BASE_URL = 'http://localhost:5000/api';

const getAuthHeader = (token = null) => {
    const adminToken = token || localStorage.getItem('admin_token');
    return {
        'Content-Type': 'application/json',
        ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
    };
};

export const api = {
    // --- Student ---
    loginStudent: async (roll_number) => {
        const res = await fetch(`${BASE_URL}/student/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roll_number })
        });
        return res.json();
    },
    getStudentProducts: async () => {
        const res = await fetch(`${BASE_URL}/student/products`);
        return res.json();
    },
    placeOrder: async (roll_number, items) => {
        const res = await fetch(`${BASE_URL}/student/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roll_number, items })
        });
        return res.json();
    },
    getStudentOrders: async (roll_number) => {
        const res = await fetch(`${BASE_URL}/student/orders/${roll_number}`);
        return res.json();
    },
    getStudentNotifications: async (studentId) => {
        const res = await fetch(`${BASE_URL}/notifications?recipientId=${studentId}&recipientType=Student`, {
            headers: getAuthHeader()
        });
        return res.json();
    },
    markNotificationAsRead: async (notificationId) => {
        const res = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: getAuthHeader()
        });
        return res.json();
    },

    // --- Manager ---
    getManagerOrders: async () => {
        const res = await fetch(`${BASE_URL}/manager/orders`);
        return res.json();
    },
    updateOrderStatus: async (id, status) => {
        const res = await fetch(`${BASE_URL}/manager/order/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return res.json();
    },
    getManagerProducts: async () => {
        const res = await fetch(`${BASE_URL}/manager/products`);
        return res.json();
    },
    addManagerProduct: async (product) => {
        const res = await fetch(`${BASE_URL}/manager/product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return res.json();
    },
    updateManagerProduct: async (id, product) => {
        const res = await fetch(`${BASE_URL}/manager/product/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return res.json();
    },
    deleteManagerProduct: async (id) => {
        const res = await fetch(`${BASE_URL}/manager/product/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },
    getManagerAnalytics: async () => {
        const res = await fetch(`${BASE_URL}/manager/analytics`);
        return res.json();
    },

    // --- Admin ---
    // Dashboard
    getAdminStats: async () => {
        const res = await fetch(`${BASE_URL}/admin/stats`, {
            headers: getAuthHeader()
        });
        return res.json();
    },

    // Orders
    getAdminOrders: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.studentName) params.append('studentName', filters.studentName);
        if (filters.studentId) params.append('studentId', filters.studentId);
        if (filters.orderId) params.append('orderId', filters.orderId);
        if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`${BASE_URL}/admin/orders${query}`, {
            headers: getAuthHeader()
        });
        return res.json();
    },
    getAdminOrderDetail: async (orderId) => {
        const res = await fetch(`${BASE_URL}/admin/orders/${orderId}`, {
            headers: getAuthHeader()
        });
        return res.json();
    },
    updateAdminOrderStatus: async (orderId, status, remarks = '') => {
        const res = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ status, remarks })
        });
        return res.json();
    },
    updateAdminPaymentStatus: async (orderId, paymentStatus) => {
        const res = await fetch(`${BASE_URL}/admin/orders/${orderId}/payment-status`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ paymentStatus })
        });
        return res.json();
    },

    // Inventory/Stock
    getAdminInventory: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`${BASE_URL}/admin/inventory${query}`, {
            headers: getAuthHeader()
        });
        return res.json();
    },
    getStockAnalytics: async () => {
        const res = await fetch(`${BASE_URL}/admin/inventory/analytics`, {
            headers: getAuthHeader()
        });
        return res.json();
    },
    updateAdminStock: async (productId, quantity, action = 'set') => {
        const res = await fetch(`${BASE_URL}/admin/inventory/${productId}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ quantity, action })
        });
        return res.json();
    },

    // Notifications
    getAdminNotifications: async () => {
        const res = await fetch(`${BASE_URL}/admin/notifications?recipientType=Admin`, {
            headers: getAuthHeader()
        });
        return res.json();
    },
    markNotificationRead: async (notificationId) => {
        const res = await fetch(`${BASE_URL}/admin/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: getAuthHeader()
        });
        return res.json();
    },
    markAllNotificationsRead: async () => {
        const res = await fetch(`${BASE_URL}/admin/notifications/mark-all-read`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ recipientType: 'Admin' })
        });
        return res.json();
    },
    getUnreadCount: async () => {
        const res = await fetch(`${BASE_URL}/admin/notifications/unread-count?recipientType=Admin`, {
            headers: getAuthHeader()
        });
        return res.json();
    },
    deleteNotification: async (notificationId) => {
        const res = await fetch(`${BASE_URL}/admin/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        return res.json();
    },

    // Products (Admin)
    getAdminProducts: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.sort) params.append('sort', filters.sort);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`${BASE_URL}/products${query}`);
        return res.json();
    },
    createAdminProduct: async (productData) => {
        const res = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(productData)
        });
        return res.json();
    },
    updateAdminProduct: async (productId, productData) => {
        const res = await fetch(`${BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(productData)
        });
        return res.json();
    },
    deleteAdminProduct: async (productId) => {
        const res = await fetch(`${BASE_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        return res.json();
    },

    // Reports
    getDailySalesData: async (dateRange = 'month') => {
        const res = await fetch(`${BASE_URL}/admin/reports/daily-sales?dateRange=${dateRange}`, {
            headers: getAuthHeader()
        });
        return res.json();
    },
    getTopSellingItems: async (limit = 5) => {
        const res = await fetch(`${BASE_URL}/admin/reports/top-items?limit=${limit}`, {
            headers: getAuthHeader()
        });
        return res.json();
    }
};
