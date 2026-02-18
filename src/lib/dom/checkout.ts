import { cartItems } from "../cartStore";

let maxStepReached = 1;

export function setupCheckoutLogic(renderCheckoutSummary: () => void, toggleCart: (open: boolean) => void) {
    const checkoutTriggerBtn = document.querySelector(".checkout-btn");
    const checkoutPage = document.getElementById("checkout-page") as HTMLElement;
    const checkoutBackBtn = document.getElementById("close-checkout-btn");

    if (checkoutTriggerBtn) {
        checkoutTriggerBtn.addEventListener("click", () => {
            const items = cartItems.get();
            const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);
            if (totalQty === 0) {
                alert("Your bag is empty!");
                return;
            }
            toggleCart(false);
            checkoutPage.classList.add("open");
            document.body.style.overflow = "hidden";

            window.scrollTo(0, 0);
            checkoutPage.scrollTop = 0;

            (window as any).toggleDeliveryFields?.();

            setTimeout(() => {
                checkoutPage.scrollTop = 0;
                window.scrollTo(0, 0);
            }, 500);
            renderCheckoutSummary();

            maxStepReached = 1;
            document.getElementById("step-2")?.classList.add("locked");
            document.getElementById("step-3")?.classList.add("locked");
            document.getElementById("p-step-2")?.classList.add("locked");
            document.getElementById("p-step-3")?.classList.add("locked");
            forceGoToStep(1);
        });
    }

    if (checkoutBackBtn) {
        checkoutBackBtn.addEventListener("click", () => {
            checkoutPage.classList.remove("open");
            document.body.style.overflow = "";
            toggleCart(true);
        });
    }

    (window as any).attemptGoToStep = function (step: number) {
        if (step > maxStepReached) return;
        forceGoToStep(step);
    };

    (window as any).validateAndNext = function (step: number) {
        let isValid = true;
        if (step === 1) {
            const name = document.getElementById("input-name") as HTMLInputElement;
            const email = document.getElementById("input-email") as HTMLInputElement;
            const phone = document.getElementById("input-phone") as HTMLInputElement;

            if (!name.value.trim()) {
                isValid = false;
                name.classList.add("input-error");
            }
            if (!email.value.trim()) {
                isValid = false;
                email.classList.add("input-error");
            }
            if (!phone.value.trim()) {
                isValid = false;
                phone.classList.add("input-error");
            }

            const mode = (document.querySelector('input[name="delivery-mode"]:checked') as HTMLInputElement).value;
            let locationText = "Pickup";

            if (mode === "delivery") {
                const addr = document.getElementById("fullAddress") as HTMLTextAreaElement;
                const pin = document.getElementById("pincode") as HTMLInputElement;

                if (!addr.value.trim()) {
                    isValid = false;
                    addr.classList.add("input-error");
                }
                if (!pin.value.trim()) {
                    isValid = false;
                    pin.classList.add("input-error");
                }

                // RELAXED VALIDATION: If address is manually entered, don't block if map pin is missing
                // We still prefer coordinates, but if the user typed an address, let them proceed.
                if (!(window as any).checkoutLocation && !addr.value.trim()) {
                    isValid = false;
                    alert("Please select your delivery location on the map or enter your full address.");
                }

                if (isValid) locationText = "Delivery";
            }

            if (isValid) {
                const summary1 = document.getElementById("summary-1");
                if (summary1) summary1.textContent = `${name.value}, ${locationText}`;
                maxStepReached = Math.max(maxStepReached, 2);
                document.getElementById("step-2")?.classList.remove("locked");
                document.getElementById("p-step-2")?.classList.remove("locked");
                forceGoToStep(2);
            }
        }
        if (step === 2) {
            const date = document.getElementById("input-date") as HTMLInputElement;
            const time = document.getElementById("input-time") as HTMLSelectElement;
            if (!date.value) {
                isValid = false;
                date.classList.add("input-error");
            }
            if (isValid) {
                const summary2 = document.getElementById("summary-2");
                if (summary2) summary2.textContent = `${date.value} @ ${time.value}`;
                maxStepReached = Math.max(maxStepReached, 3);
                document.getElementById("step-3")?.classList.remove("locked");
                document.getElementById("p-step-3")?.classList.remove("locked");
                forceGoToStep(3);
            }
        }
        setTimeout(() => document.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error")), 500);
    };

    (window as any).toggleDeliveryFields = function () {
        const inputs = document.querySelectorAll('input[name="delivery-mode"]');
        let mode = "pickup";

        inputs.forEach((input) => {
            const label = input.closest(".delivery-option");
            if ((input as HTMLInputElement).checked) {
                mode = (input as HTMLInputElement).value;
                if (label) label.classList.add("selected");
            } else {
                if (label) label.classList.remove("selected");
            }
        });

        const addrFields = document.getElementById("address-fields");
        const pickupNote = document.getElementById("pickup-note");
        if (mode === "delivery") {
            if (addrFields) addrFields.style.display = "block";
            if (pickupNote) pickupNote.style.display = "none";
            if ((window as any).refreshMapLocationPicker) (window as any).refreshMapLocationPicker();
        } else {
            if (addrFields) addrFields.style.display = "none";
            if (pickupNote) pickupNote.style.display = "flex";
        }
        renderCheckoutSummary();
    };
}

function forceGoToStep(step: number) {
    document.querySelectorAll(".checkout-step").forEach((el) => {
        el.classList.add("collapsed");
        el.classList.remove("active");
    });
    const activeStep = document.getElementById(`step-${step}`);
    if (activeStep) {
        activeStep.classList.remove("collapsed");
        activeStep.classList.add("active");
    }

    for (let i = 1; i <= 3; i++) {
        const pStep = document.getElementById(`p-step-${i}`);
        if (pStep) {
            pStep.classList.remove("active", "completed");
            if (i < step) pStep.classList.add("completed");
            if (i === step) pStep.classList.add("active");
        }
    }

    const fill = document.getElementById("progress-line-fill");
    if (fill) {
        const percentage = ((step - 1) / 2) * 100;
        fill.style.width = `${percentage}%`;
    }
}

export function renderCheckoutSummary() {
    const list = document.getElementById("checkout-items-list");
    const subtotalEl = document.getElementById("checkout-subtotal");
    const deliveryEl = document.getElementById("checkout-delivery-fee");
    const totalEl = document.getElementById("checkout-total");
    const payBtnAmt = document.getElementById("pay-btn-amount");

    if (!list) return;
    const items = cartItems.get();
    list.innerHTML = "";
    let subtotal = 0;

    items.forEach((item) => {
        if (item.quantity > 0) {
            subtotal += item.price * item.quantity;

            list.insertAdjacentHTML("beforeend", `
          <div class="summary-item">
            <img src="${item.image}" class="s-item-img">
            <div class="s-item-info">
              <span class="s-item-name">${item.name} (x${item.quantity})</span>
              <span class="s-item-meta">${item.custom_note || "Standard"}</span>
            </div>
            <span class="s-item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `);
        }
    });

    const checkedDelivery = document.querySelector('input[name="delivery-mode"]:checked') as HTMLInputElement;
    const mode = checkedDelivery ? checkedDelivery.value : "pickup";

    // TODO: Ideally fetch this from store settings
    const deliveryFee = mode === "delivery" ? 50 : 0;
    const total = subtotal + deliveryFee;

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (deliveryEl) deliveryEl.textContent = `₹${deliveryFee.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
    if (payBtnAmt) payBtnAmt.textContent = `₹${total.toFixed(2)}`;
}
