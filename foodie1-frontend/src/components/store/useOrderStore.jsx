import { create } from 'zustand';

const useOrderStore = create((set) => ({
    orders: [],
    unreadCount: 0,
    setOrders: (orders) => {
        const unpaid = orders.filter(o => o.paymentStatus === 'NOT_PAID');
        set({ orders: unpaid, unreadCount: unpaid.length });
    },
    addOrder: (newOrder) => set((state) => {
        const updated = [...state.orders, newOrder];
        const unpaid = updated.filter(o => o.paymentStatus === 'NOT_PAID');
        return {
            orders: unpaid,
            unreadCount: unpaid.length
        };
    }),
}));

export default useOrderStore;