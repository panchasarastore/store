import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    custom_note?: string;
}

/**
 * Hydration Guard: Nanostores persistent handles browser check internally,
 * but we export a flag for UI components.
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Persistent Cart Store (v1)
 * Using persistentAtom for simple JSON-serialized array of items.
 */
export const cartItems = persistentAtom<CartItem[]>('cart:v1', [], {
    encode: JSON.stringify,
    decode: (value) => {
        try {
            return JSON.parse(value);
        } catch (e) {
            return [];
        }
    },
});

// --- Computed Stores ---

export const totalItemsCount = computed(cartItems, (items) =>
    items.reduce((total, item) => total + item.quantity, 0)
);

export const cartSubtotal = computed(cartItems, (items) =>
    items.reduce((total, item) => total + item.price * item.quantity, 0)
);

// --- Actions ---

export function addItem(product: Omit<CartItem, 'quantity' | 'custom_note'>, note?: string) {
    const items = cartItems.get();
    const existingIndex = items.findIndex((i) => i.id === product.id);

    if (existingIndex > -1) {
        const newItems = [...items];
        newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + 1,
            custom_note: note || newItems[existingIndex].custom_note
        };
        cartItems.set(newItems);
    } else {
        cartItems.set([...items, { ...product, quantity: 1, custom_note: note }]);
    }
}

export function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
        removeItem(id);
        return;
    }
    const items = cartItems.get();
    cartItems.set(
        items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
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
