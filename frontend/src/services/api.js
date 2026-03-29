const BASE_URL = 'http://localhost:5000/api';

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
    }
};
