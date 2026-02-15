import { cartItems } from "../cartStore";
import { syncUI, attachStepperLogic } from "./cart-sync";

export function setupModalLogic(productsData: any[], toggleCart: (open: boolean) => void) {
    const modal = document.getElementById("product-modal") as HTMLDialogElement;
    const modalWrapper = document.getElementById("modal-add-wrapper");

    const mImg = document.getElementById("modal-img") as HTMLImageElement;
    const mThumbList = document.getElementById("modal-thumbnails");
    const mTitle = document.getElementById("modal-title");
    const mPriceTag = document.getElementById("modal-price-tag");
    const mDesc = document.getElementById("modal-desc");
    const mNotice = document.getElementById("modal-notice-box") as HTMLElement;
    const mNoticeText = document.getElementById("modal-notice-text");
    const mCustom = document.getElementById("modal-custom-input") as HTMLElement;
    const mCustomText = document.getElementById("custom-note-text") as HTMLTextAreaElement;

    let currentImageIndex = 0;
    let currentImages: string[] = [];

    const prevBtn = document.getElementById("modal-prev-btn");
    const nextBtn = document.getElementById("modal-next-btn");

    function updateModalImage(index: number) {
        currentImageIndex = index;
        if (mImg && currentImages[index]) {
            mImg.src = currentImages[index];
        }

        // Update active thumbnail
        if (mThumbList) {
            const thumbs = mThumbList.querySelectorAll(".modal-thumb");
            thumbs.forEach((t, i) => {
                if (i === index) t.classList.add("active");
                else t.classList.remove("active");
            });

            // Scroll thumbnail into view if needed
            const activeThumb = thumbs[index] as HTMLElement;
            if (activeThumb) {
                activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }

        // Update nav buttons visibility/state
        if (prevBtn) (prevBtn as HTMLButtonElement).disabled = index === 0;
        if (nextBtn) (nextBtn as HTMLButtonElement).disabled = index === currentImages.length - 1;

        if (currentImages.length <= 1) {
            if (prevBtn) prevBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
        } else {
            if (prevBtn) prevBtn.style.display = "flex";
            if (nextBtn) nextBtn.style.display = "flex";
        }
    }

    if (prevBtn) prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentImageIndex > 0) updateModalImage(currentImageIndex - 1);
    });

    if (nextBtn) nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentImageIndex < currentImages.length - 1) updateModalImage(currentImageIndex + 1);
    });

    document.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            if ((e.target as Element).closest(".add-action-wrapper")) return;

            const data = JSON.parse((card as HTMLElement).dataset.product || "{}");
            const pid = (card as HTMLElement).dataset.id;
            if (!pid) return;

            // Fill Data
            currentImages = data.images || [data.image];
            currentImageIndex = 0;
            updateModalImage(0);

            // Populate Thumbnails
            if (mThumbList) {
                mThumbList.innerHTML = "";
                if (currentImages.length > 1) {
                    currentImages.forEach((url: string, idx: number) => {
                        const thumb = document.createElement("img");
                        thumb.src = url;
                        thumb.classList.add("modal-thumb");
                        if (idx === 0) thumb.classList.add("active");

                        thumb.addEventListener("click", (ev) => {
                            ev.stopPropagation();
                            updateModalImage(idx);
                        });
                        mThumbList.appendChild(thumb);
                    });
                }
            }
            if (mTitle) mTitle.textContent = data.name;
            if (mPriceTag) mPriceTag.textContent = `₹${data.price.toFixed(2)}`;
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
