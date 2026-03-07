import nodemailer from "nodemailer";

/**
 * Standard Node.js compatible email handler.
 * For use in the Astro/Store environment.
 */

const GMAIL_USER = process.env.GMAIL_USER || "panchasarastore@gmail.com";
const GMAIL_PASS = process.env.GMAIL_PASS || "jxgk zhnf grzj ygez";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
    },
});

function buildItemsHTML(items: any[]) {
    return items
        .map(
            (item) => `
      <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee">
        <span>${item.product_name || item.name} x ${item.quantity}</span>
        <span>₹${item.item_total || item.total}</span>
      </div>
    `
        )
        .join("");
}

export async function sendOrderConfirmation(toEmail: string, order: any, items: any[]) {
    const itemsHTML = buildItemsHTML(items);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background:#f8fafc; padding:20px }
    .container { max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; border: 1px solid #e2e8f0; }
    .header { background:#f59e0b; padding:24px; text-align:center; color:white }
    .content { padding:24px }
    .totals { margin-top:16px; background:#f8fafc; padding:12px; border-radius:8px }
    .total-row { display:flex; justify-content:space-between; margin-bottom: 4px; }
    .grand { font-weight:bold; font-size:18px; margin-top:8px; border-top: 1px solid #cbd5e1; padding-top: 8px; }
  </style>
</head>

<body>
<div class="container">
  <div class="header">
    <h2 style="margin:0">Panchasara 🍯</h2>
    <p style="margin:5px 0 0">Order Confirmed</p>
  </div>

  <div class="content">
    <p><b>Order ID:</b> #${order.order_number || order.id}</p>
    <p><b>Date:</b> ${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>

    <h3 style="border-bottom: 2px solid #f59e0b; padding-bottom: 5px; display: inline-block;">Items</h3>
    <div style="margin-top: 10px;">
      ${itemsHTML}
    </div>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>₹${order.subtotal}</span>
      </div>

      <div class="total-row">
        <span>Delivery</span>
        <span>₹${(order.total_amount || 0) - (order.subtotal || 0)}</span>
      </div>

      <div class="total-row grand">
        <span>Total</span>
        <span>₹${order.total_amount}</span>
      </div>
    </div>

    <h3 style="border-bottom: 2px solid #f59e0b; padding-bottom: 5px; display: inline-block; margin-top: 24px;">Delivery to</h3>
    <div style="margin-top: 10px;">
      <p style="margin: 4px 0;"><b>${order.customer_name}</b></p>
      <p style="margin: 4px 0;">${order.delivery_address}</p>
      <p style="margin: 4px 0;">${order.customer_phone}</p>
    </div>

    <p style="margin-top:30px; text-align: center; color: #64748b; font-size: 14px;">
      Thank you for shopping with us!<br>
      We’ll contact you shortly to confirm delivery.
    </p>
  </div>
</div>
</body>
</html>
`;

    try {
        const info = await transporter.sendMail({
            from: "Panchasara <panchasarastore@gmail.com>",
            to: toEmail,
            subject: `Order Confirmation #${order.order_number || order.id}`,
            text: `Order confirmed. Total ₹${order.total_amount}`,
            html,
        });

        console.log("Order email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (err: any) {
        console.error("Error sending email:", err);
        return { success: false, error: err.message };
    }
}
