export function setupStoreUI() {
    // ==========================================
    // 1. UI POINTERS & TOGGLES
    // ==========================================
    const cartDrawer = document.querySelector(".cart-drawer");
    const cartOverlay = document.querySelector(".cart-overlay");
    const cartBtn = document.querySelector(".cart-btn");
    const cartCloseBtn = document.querySelector(".cart-close-btn");
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const mobileMenuOverlay = document.querySelector(
        ".mobile-menu-overlay",
    ) as HTMLElement;
    const mobileCloseBtn = document.querySelector(".mobile-close-btn");

    function toggleCart(open: boolean) {
        if (!cartDrawer || !cartOverlay) return;
        if (open) {
            cartDrawer.classList.add("open");
            cartOverlay.classList.add("open");
        } else {
            cartDrawer.classList.remove("open");
            cartOverlay.classList.remove("open");
        }
    }
    (window as any).toggleCart = toggleCart;

    if (cartBtn) cartBtn.addEventListener("click", () => toggleCart(true));
    if (cartCloseBtn)
        cartCloseBtn.addEventListener("click", () => toggleCart(false));
    if (cartOverlay)
        cartOverlay.addEventListener("click", () => toggleCart(false));

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", () => {
            if (mobileMenuOverlay) {
                mobileMenuOverlay.style.display = "flex";
                setTimeout(() => mobileMenuOverlay.classList.add("open"), 10);
            }
        });
    }
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener("click", () => {
            if (mobileMenuOverlay) {
                mobileMenuOverlay.classList.remove("open");
                setTimeout(() => (mobileMenuOverlay.style.display = "none"), 300);
            }
        });
    }
}
