import { cartItems } from "../cartStore";
import { syncUI, attachStepperLogic } from "./cart-sync";

export function setupModalLogic(productsData: any[], toggleCart: (open: boolean) => void) {
    const modal = document.getElementById("product-modal") as HTMLDialogElement;
    const modalWrapper = document.getElementById("modal-add-wrapper");

    const mImg = document.getElementById("modal-img") as HTMLImageElement;
    const mTitle = document.getElementById("modal-title");
    const mPrice = document.getElementById("modal-price");
    const mDesc = document.getElementById("modal-desc");
    const mNotice = document.getElementById("modal-notice-box") as HTMLElement;
    const mNoticeText = document.getElementById("modal-notice-text");
    const mCustom = document.getElementById("modal-custom-input") as HTMLElement;
    const mCustomText = document.getElementById("custom-note-text") as HTMLTextAreaElement;

    document.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            if ((e.target as Element).closest(".add-action-wrapper")) return;

            const data = JSON.parse((card as HTMLElement).dataset.product || "{}");
            const pid = (card as HTMLElement).dataset.id;
            if (!pid) return;

            // Fill Data
            if (mImg) mImg.src = data.image;
            if (mTitle) mTitle.textContent = data.name;
            if (mPrice) mPrice.textContent = `₹${data.price.toFixed(2)}`;
            if (mDesc) mDesc.textContent = data.full_details || data.description;

            if (data.product_notice) {
                if (mNotice) mNotice.style.display = "flex";
                if (mNoticeText) mNoticeText.textContent = data.product_notice;
            } else {
                if (mNotice) mNotice.style.display = "none";
            }

            if (data.accepts_custom_note) {
                if (mCustom) mCustom.style.display = "block";
                const items = cartItems.get();
                const item = items.find((i) => i.id === pid);
                if (mCustomText) mCustomText.value = item?.custom_note || "";
            } else {
                if (mCustom) mCustom.style.display = "none";
                if (mCustomText) mCustomText.value = "";
            }

            if (modalWrapper) {
                modalWrapper.setAttribute("data-id", pid);
                attachStepperLogic(modalWrapper, pid, productsData, toggleCart);
                const items = cartItems.get();
                const item = items.find((i) => i.id === pid);
                syncUI(pid, item?.quantity || 0);
            }
            if (modal) modal.showModal();
        });
    });

    const productModalClose = document.querySelector(".modal-close-btn");
    if (productModalClose) productModalClose.addEventListener("click", () => modal.close());
    if (modal) modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.close();
    });
}
