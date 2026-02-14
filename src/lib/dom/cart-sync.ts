import { cartItems, updateQuantity, addItem } from "../cartStore";

export function syncUI(id: string, qty: number) {
    const wrappers = document.querySelectorAll(
        `[data-id="${id}"] .add-action-wrapper, #modal-add-wrapper[data-id="${id}"]`,
    );

    wrappers.forEach((wrapper) => {
        const bigBtn = wrapper.querySelector(".big-add-btn") as HTMLElement;
        const stepper = wrapper.querySelector(".stepper-controls") as HTMLElement;
        const display = wrapper.querySelector(".qty-display") as HTMLElement;

        if (qty > 0) {
            if (bigBtn) bigBtn.style.display = "none";
            if (stepper) stepper.style.display = "flex";
            if (display) display.textContent = qty.toString();
        } else {
            if (stepper) stepper.style.display = "none";
            if (bigBtn) bigBtn.style.display = "flex";
        }
    });
}

export function renderCart() {
    const container = document.querySelector(".cart-items-container");
    const totalPriceEl = document.querySelector(".cart-total-price");
    if (!container) return;

    const items = cartItems.get();
    container.innerHTML = "";
    let total = 0;
    let hasItems = false;

    items.forEach((item) => {
        if (item.quantity > 0) {
            hasItems = true;
            total += item.price * item.quantity;

            const itemHTML = `
                <div class="cart-item">
                    <img src="${item.image}" class="cart-item-img" alt="${item.name}">
                    <div class="cart-item-details">
                        <div class="cart-item-top">
                            <h4 class="cart-item-title">${item.name}</h4>
                        </div>
                        <div class="cart-item-variant">Standard</div>
                        <div class="cart-item-bottom">
                            <span class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
                            <div class="mini-stepper">
                                <button class="mini-step-btn" onclick="updateCartItem('${item.id}', ${item.quantity - 1})">-</button>
                                <span class="mini-step-qty">${item.quantity}</span>
                                <button class="mini-step-btn" onclick="updateCartItem('${item.id}', ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                    </div>
                    <button class="cart-remove-btn" onclick="updateCartItem('${item.id}', 0)" title="Remove Product">
                        <span class="material-symbols-rounded">close</span>
                    </button>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", itemHTML);
        }
    });

    if (!hasItems) container.innerHTML = '<div class="cart-empty-state">Your bag is empty</div>';
    if (totalPriceEl) totalPriceEl.textContent = `₹${total.toFixed(2)}`;
}

export function attachStepperLogic(wrapper: Element, productId: string, productsData: any[], toggleCart: (open: boolean) => void) {
    const bigBtn = wrapper.querySelector(".big-add-btn");
    const plus = wrapper.querySelector(".plus");
    const minus = wrapper.querySelector(".minus");
    if (!bigBtn || !plus || !minus) return;

    // Clone to strip old listeners
    const newBig = bigBtn.cloneNode(true);
    const newPlus = plus.cloneNode(true);
    const newMinus = minus.cloneNode(true);
    bigBtn.parentNode?.replaceChild(newBig, bigBtn);
    plus.parentNode?.replaceChild(newPlus, plus);
    minus.parentNode?.replaceChild(newMinus, minus);

    newBig.addEventListener("click", (e) => {
        e.stopPropagation();
        const product = productsData.find((p: any) => p.id == productId);
        if (!product) return;

        const noteInput = document.getElementById("custom-note-text") as HTMLTextAreaElement;
        const modalWrapper = document.getElementById("modal-add-wrapper");
        let note = undefined;
        if (wrapper === modalWrapper && noteInput && noteInput.value.trim() !== "") {
            note = noteInput.value.trim();
            noteInput.value = "";
        }

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
        }, note);

        toggleCart(true);

        const modal = document.getElementById("product-modal") as HTMLDialogElement;
        if (modal && modal.open) modal.close();
    });

    newPlus.addEventListener("click", (e) => {
        e.stopPropagation();
        const items = cartItems.get();
        const item = items.find((i) => i.id === productId);
        updateQuantity(productId, (item?.quantity || 0) + 1);
    });

    newMinus.addEventListener("click", (e) => {
        e.stopPropagation();
        const items = cartItems.get();
        const item = items.find((i) => i.id === productId);
        updateQuantity(productId, Math.max(0, (item?.quantity || 0) - 1));
    });
}
