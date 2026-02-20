import { atom, computed } from 'nanostores';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    custom_note?: string;
    stock_quantity: number | null;
}

export const isBrowser = typeof window !== 'undefined';

// --- State ---
// We use a simple atom. Persistence is handled manually via subscribers.
export const cartItems = atom<CartItem[]>([]);
let activeStoreId: string | null = null;
let isInitialized = false;

// --- Initialization ---

/**
 * Initialize the cart for a specific store.
 * This MUST be called when the store page loads.
 */
export function initCart(storeId: string) {
    if (!isBrowser || !storeId) return;

    // If we are already initialized for this store, do nothing
    if (isInitialized && activeStoreId === storeId) return;

    activeStoreId = storeId;
    isInitialized = true;

    const key = `cart_${storeId}`;

    // 1. Load initial state
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            cartItems.set(JSON.parse(stored));
        } else {
            cartItems.set([]);
        }
    } catch (e) {
        console.warn("Failed to load cart", e);
        cartItems.set([]);
    }

    // 2. Subscribe to changes and save to specific key
    cartItems.subscribe((items) => {
        if (activeStoreId) {
            try {
                localStorage.setItem(`cart_${activeStoreId}`, JSON.stringify(items));
            } catch (e) {
                console.error("Failed to save cart", e);
            }
        }
    });
}

// --- Computed Stores ---

export const totalItemsCount = computed(cartItems, (items) =>
    items.reduce((total, item) => total + item.quantity, 0)
);

export const cartSubtotal = computed(cartItems, (items) =>
    items.reduce((total, item) => total + item.price * item.quantity, 0)
);

// --- Actions ---

export function addItem(product: Omit<CartItem, 'quantity' | 'custom_note'>, note?: string) {
    if (!activeStoreId) {
        console.warn("Cart not initialized with a Store ID!");
        // Optional: fallback or throw
    }

    const items = cartItems.get();
    const existingIndex = items.findIndex((i) => i.id === product.id);
    const maxStock = product.stock_quantity;

    if (existingIndex > -1) {
        const currentQty = items[existingIndex].quantity;
        if (maxStock !== null && maxStock !== undefined && currentQty >= maxStock) {
            return false; // Limit reached
        }

        const newItems = [...items];
        newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: currentQty + 1,
            custom_note: note || newItems[existingIndex].custom_note
        };
        cartItems.set(newItems);
    } else {
        if (maxStock !== null && maxStock !== undefined && maxStock <= 0) {
            return false; // Out of stock
        }
        cartItems.set([...items, { ...product, quantity: 1, custom_note: note }]);
    }
    return true;
}

export function updateQuantity(id: string, quantity: number, maxStock?: number | null) {
    if (quantity <= 0) {
        removeItem(id);
        return true;
    }

    const items = cartItems.get();
    const item = items.find(i => i.id === id);

    // Use provided maxStock or fall back to stored stock_quantity
    const effectiveMax = (maxStock !== undefined) ? maxStock : (item?.stock_quantity ?? null);

    if (effectiveMax !== null && quantity > effectiveMax) {
        return false; // Limit reached
    }

    cartItems.set(
        items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
    return true;
}

export function removeItem(id: string) {
    const items = cartItems.get();
    cartItems.set(items.filter((item) => item.id !== id));
}

export function setNote(id: string, note: string) {
    const items = cartItems.get();
    cartItems.set(
        items.map((item) => (item.id === id ? { ...item, custom_note: note } : item))
    );
}

export function clearCart() {
    cartItems.set([]);
}
