import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "panchasarastore@gmail.com",
    pass: "jxgk zhnf grzj ygez",
  },
});

function buildItemsHTML(items) {
  return items
    .map(
      (item) => `
      <div class="item-row">
        <span>${item.name} x ${item.quantity}</span>
        <span>₹${item.total}</span>
      </div>
    `
    )
    .join("");
}

async function sendCustomerEmail(toEmail, order) {
  const itemsHTML = buildItemsHTML(order.items);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background:#f8fafc; padding:20px }
    .container { max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden }
    .header { background:#f59e0b; padding:24px; text-align:center; color:white }
    .content { padding:24px }
    .item-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee }
    .totals { margin-top:16px; background:#f8fafc; padding:12px; border-radius:8px }
    .total-row { display:flex; justify-content:space-between }
    .grand { font-weight:bold; font-size:18px; margin-top:8px }
  </style>
</head>

<body>
<div class="container">
  <div class="header">
    <h2>Panchasara 🍯</h2>
    <p>Order Confirmed</p>
  </div>

  <div class="content">
    <p><b>Order:</b> #${order.id}</p>
    <p><b>Date:</b> ${order.date}</p>

    <h3>Items</h3>
    ${itemsHTML}

    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>₹${order.subtotal}</span>
      </div>

      <div class="total-row">
        <span>Delivery</span>
        <span>₹${order.delivery}</span>
      </div>

      <div class="total-row grand">
        <span>Total</span>
        <span>₹${order.total}</span>
      </div>
    </div>

    <h3>Delivery to</h3>
    <p>${order.customerName}</p>
    <p>${order.address}</p>
    <p>${order.phone}</p>

    <p style="margin-top:20px">
      We’ll contact you shortly to confirm delivery.
    </p>
  </div>
</div>
</body>
</html>
`;

  try {
    await transporter.sendMail({
      from: "Panchasara <panchasarastore@gmail.com>",
      to: toEmail,
      subject: `Order Confirmation #${order.id}`,
      text: `Order confirmed. Total ₹${order.total}`,
      html,
    });

    console.log("Order email sent");
  } catch (err) {
    console.error(err);
  }
}

export default sendCustomerEmail;
